import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Support large payloads (for PDF documents and images encoded in base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy/guarded Gemini client helper
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    service: 'AgreeEasy API',
  });
});

/**
 * Clean JSON output from model response
 */
function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Robust JSON extraction and parsing
 */
function extractAndParseJson(raw: string): any {
  const cleaned = cleanJsonText(raw);
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // Try to locate JSON object or array boundaries if surrounded by commentary
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const slice = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(slice);
      } catch (e) {
        // continue
      }
    }

    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      const slice = cleaned.substring(firstBracket, lastBracket + 1);
      try {
        return JSON.parse(slice);
      } catch (e) {
        // continue
      }
    }

    throw new Error(`Unable to parse model JSON: ${initialErr?.message || initialErr}`);
  }
}

const APPROVED_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
];

/**
 * Executes Gemini generateContent with automatic retry and model fallback
 * to handle temporary 503 high-demand or capacity spikes seamlessly.
 */
async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  requestParams: {
    contents: any;
    config?: any;
  }
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  for (const model of APPROVED_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini API] Requesting ${model} (attempt ${attempt})...`);
        const response = await ai.models.generateContent({
          model,
          contents: requestParams.contents,
          config: requestParams.config,
        });

        if (response && response.text) {
          console.log(`[Gemini API] Success with ${model}`);
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`[Gemini API] Failed with ${model} (attempt ${attempt}): ${errMsg}`);

        const isTemporary =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (isTemporary && attempt === 1) {
          // Brief pause before retry
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        // Move to next fallback model immediately if attempt 2 or non-retryable
        break;
      }
    }
  }

  throw lastError || new Error('All model attempts failed.');
}

/**
 * POST /api/analyze-document
 * Analyzes uploaded PDF, image, or text agreement using Gemini 3.8 Flash
 */
app.post('/api/analyze-document', async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName, textContent } = req.body;

    if (!fileBase64 && (!textContent || textContent.trim().length === 0)) {
      return res.status(400).json({
        error: 'No document content provided. Please upload a file (PDF, TXT, or image) or provide text.',
      });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are "AgreeEasy", an intelligent, highly reliable agreement analysis assistant powered by Gemini.
Your core purpose is to help ordinary users thoroughly understand agreements and contracts before signing them, without pretending to be a lawyer or providing definitive legal advice.
Preserve the original meaning of the agreement. Never hallucinate clauses, amounts, dates, obligations, penalties, or parties.
If information is missing, ambiguous, or unstated, clearly identify it as such.

Analyze the provided agreement and output a comprehensive JSON object strictly adhering to this structure:
{
  "metadata": {
    "agreementType": "E.g., Rental Agreement, Employment Contract, Freelance Contract, Non-Disclosure Agreement, Loan Agreement, Terms & Conditions, Vendor Agreement, or General Contract",
    "confidence": "high" | "moderate" | "tentative",
    "documentTitle": "Descriptive title of agreement",
    "parties": [
      { "name": "Party A", "role": "e.g., Landlord / Employer / Client / Disclosing Party", "description": "Brief description of their role" },
      { "name": "Party B", "role": "e.g., Tenant / Employee / Contractor / Receiving Party", "description": "Brief description of their role" }
    ],
    "purpose": "Primary objective of this agreement in plain English",
    "effectiveDate": "e.g., November 1, 2024 or 'Not specified'",
    "expirationDate": "e.g., October 31, 2025 or 'Not specified'",
    "duration": "e.g., 12 months, At-will, Indefinite, etc.",
    "governingLaw": "e.g., State of Illinois, State of Delaware, or 'Not specified'",
    "scannedOrImageBased": false
  },
  "fiveThingsToKnow": [
    {
      "id": "item-1",
      "title": "Concise headline (e.g., Automatic 8% Rent Increase on Renewal)",
      "explanation": "Plain language explanation prioritizing financial commitments, penalties, renewal restrictions, IP ownership, liability, or material impact.",
      "category": "financial" | "penalty" | "termination" | "restriction" | "liability" | "auto_renewal" | "ip" | "other",
      "importance": "critical" | "high",
      "sourceClause": "Section 3 (Automatic Renewal)",
      "pageOrSection": "Section 3"
    }
  ],
  "plainLanguageSummary": {
    "whatIsThis": "Clear 2-3 sentence explanation of the contract",
    "partiesInvolved": "Plain summary of who is signing and their identities",
    "purposeAndScope": "What this deal accomplishes",
    "userAgreesTo": "Main commitments the user agrees to fulfill",
    "otherPartyAgreesTo": "Main commitments the other party agrees to fulfill",
    "durationAndTimeline": "How long it lasts and key timeline milestones",
    "howItCanEnd": "Summary of termination pathways",
    "paymentTerms": "Summary of all monies, fees, and payments",
    "violationConsequences": "What happens if someone defaults or violates the agreement"
  },
  "clauses": [
    {
      "id": "c1",
      "clauseNumber": "1",
      "title": "Clause Title",
      "originalText": "Exact quote or excerpt of the original clause text",
      "plainLanguageExplanation": "Plain language breakdown free of jargon",
      "whoItAffects": "user" | "other_party" | "both",
      "userObligation": "Specific duty of the user under this clause, or 'None'",
      "otherPartyObligation": "Specific duty of other party under this clause, or 'None'",
      "potentialConsequence": "Real-world consequence if ignored or breached",
      "attentionLevel": "high_attention" | "needs_attention" | "informational",
      "attentionReason": "Objective rationale for this classification (e.g., 'This clause creates a substantial financial penalty.')",
      "pageOrSection": "Section 1",
      "category": "Payment / Term / Termination / Liability / IP / Maintenance / etc."
    }
  ],
  "financialAnalysis": {
    "summary": "Overview of financial obligations",
    "items": [
      {
        "id": "f1",
        "type": "rent" | "deposit" | "fee" | "penalty" | "salary" | "interest" | "late_fee" | "refund" | "increase" | "other",
        "amount": "Exact amount stated (e.g., $2,400.00 / month)",
        "frequencyOrDue": "e.g., 1st calendar day of each month",
        "description": "What this payment is for",
        "sourceClause": "Section 4",
        "pageOrSection": "Section 4",
        "isContingent": false
      }
    ],
    "depositConditions": "Explanation of deposit return or withholding conditions",
    "priceIncreaseTerms": "Explanation of any escalation or fee increase clauses",
    "penaltiesSummary": "Summary of late fees, liquidated damages, or breach penalties"
  },
  "datesAndDeadlines": {
    "summary": "Overview of timelines and critical deadlines",
    "items": [
      {
        "id": "d1",
        "label": "Notice of Non-Renewal",
        "dateOrPeriod": "60 days prior to Expiration Date",
        "plainExplanation": "You generally need to notify the other party in writing at least 60 days before ending the agreement.",
        "sourceClause": "Section 3",
        "type": "notice" | "start" | "end" | "renewal" | "payment" | "grace_period" | "other"
      }
    ],
    "noticePeriodExplanation": "Clear summary of all notice requirements",
    "renewalExplanation": "Clear summary of renewal terms"
  },
  "obligations": {
    "userObligations": [
      { "id": "u1", "description": "What user must do", "sourceClause": "Section X", "importance": "mandatory" | "conditional" }
    ],
    "otherPartyObligations": [
      { "id": "o1", "description": "What other party must do", "sourceClause": "Section Y", "importance": "mandatory" | "conditional" }
    ],
    "sharedObligations": [
      { "id": "s1", "description": "What both parties must do", "sourceClause": "Section Z", "importance": "mandatory" | "conditional" }
    ]
  },
  "restrictions": [
    {
      "id": "r1",
      "title": "Restriction Title",
      "type": "confidentiality" | "ip" | "non_compete" | "non_solicit" | "usage" | "transfer" | "assignment" | "other",
      "plainExplanation": "Clear explanation of what is forbidden or restricted",
      "originalReference": "Section reference and excerpt",
      "whoItAppliesTo": "e.g., Tenant / Employee / Contractor",
      "durationOrScope": "e.g., 24 months post-termination / During term"
    }
  ],
  "terminationAnalysis": {
    "whoCanTerminate": "Who has the power to cancel or terminate",
    "conditions": "Circumstances required for termination (cause vs without cause)",
    "noticeRequired": "How much advance notice is required",
    "penaltiesOrFees": "Early termination fees, forfeit of deposit, or kill fees",
    "postTerminationObligations": "What covenants survive termination (confidentiality, non-compete, return of assets)",
    "autoRenewalConditions": "Whether it renews automatically and how to stop it",
    "keyTakeaways": ["Bullet point 1", "Bullet point 2"]
  },
  "whatHappensIfScenarios": [
    {
      "id": "sc1",
      "scenario": "What happens if I want to leave or cancel early?",
      "whatDocumentStates": "Direct statement from document",
      "whatCanBeInferred": "Reasonable inference based strictly on contract terms",
      "whatIsNotSpecified": "Aspects left unaddressed or silent in document",
      "sourceClause": "Section 10"
    },
    {
      "id": "sc2",
      "scenario": "What happens if I don't pay on time?",
      "whatDocumentStates": "Direct statement from document",
      "whatCanBeInferred": "Reasonable inference",
      "whatIsNotSpecified": "Aspects not specified",
      "sourceClause": "Section 4"
    },
    {
      "id": "sc3",
      "scenario": "What happens if the other party breaches their obligations?",
      "whatDocumentStates": "Direct statement",
      "whatCanBeInferred": "Reasonable inference",
      "whatIsNotSpecified": "Aspects not specified",
      "sourceClause": "Section 11"
    },
    {
      "id": "sc4",
      "scenario": "What happens to my deposit or initial payment?",
      "whatDocumentStates": "Direct statement",
      "whatCanBeInferred": "Reasonable inference",
      "whatIsNotSpecified": "Aspects not specified",
      "sourceClause": "Section 5"
    }
  ],
  "questionsToAsk": [
    {
      "id": "q1",
      "question": "Can the 60-day notice requirement for non-renewal be reduced to 30 days?",
      "whyItMatters": "60 days is a long lead time and failing to give timely notice locks you into another term.",
      "targetParty": "Landlord / Counterparty",
      "relatedClause": "Section 3"
    }
  ],
  "negotiationSuggestions": [
    {
      "id": "n1",
      "clause": "Section 10 (Early Termination Penalty)",
      "currentCondition": "Requires payment of 2 full months' rent ($4,800) plus total forfeiture of security deposit.",
      "whyItMayMatter": "Double penalty is unusually punitive if you need to relocate for family or job reasons.",
      "possibleQuestionToAsk": "Would you consider a flat 1-month early termination fee if I provide 45 days written notice?",
      "suggestedAlternativeOrConcession": "Discuss capping the fee at 1 month's rent without forfeiting the deposit if the unit is left in good condition."
    }
  ],
  "missingInformation": [
    {
      "id": "m1",
      "item": "Detailed condition inspection timeline",
      "whyItIsImportant": "Without an agreed move-in condition checklist, deposit deductions could be disputed.",
      "status": "completely_absent" | "ambiguous" | "unclear",
      "recommendation": "Ask the other party to attach a joint inspection checklist before signing."
    }
  ]
}

Ensure "fiveThingsToKnow" contains at least 5 meaningful, high-priority points.
Ensure "clauses" analyzes at least 6-12 important clauses from the agreement with original quotes.
Do not use hyperbolic or alarming words; use measured, professional phrasing such as "This clause deserves careful review."`;

    let parts: any[] = [];

    if (fileBase64 && mimeType) {
      // Multimodal document upload (PDF, PNG, JPEG, etc.)
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: fileBase64,
        },
      });
      parts.push({
        text: `Please analyze this uploaded document "${fileName || 'Agreement'}" according to the instructions and return the full JSON structure.`,
      });
    } else {
      // Text document
      parts.push({
        text: `Document Name: ${fileName || 'Agreement'}\n\nDocument Text:\n"""\n${textContent}\n"""\n\nPlease analyze this document according to the instructions and return the full JSON structure.`,
      });
    }

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsedData = extractAndParseJson(response.text || '{}');

    // Attach raw text snippet or preview for reference
    const fullText = textContent || (parsedData.metadata?.documentTitle || fileName);

    const result = {
      id: 'doc_' + Date.now(),
      documentName: fileName || parsedData.metadata?.documentTitle || 'Uploaded Agreement',
      extractedTextPreview: fullText.slice(0, 500) + (fullText.length > 500 ? '...' : ''),
      fullDocumentText: textContent || '',
      ...parsedData,
    };

    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/analyze-document:', error);
    return res.status(500).json({
      error: 'Failed to analyze agreement.',
      message: error?.message || 'An unexpected error occurred during document analysis.',
    });
  }
});

/**
 * POST /api/chat
 * Persistent contextual chatbot for the uploaded agreement
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, documentText, metadata, clauses } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are "AgreeEasy Assistant", a dedicated conversational agreement assistant.
You answer user questions about the agreement they have uploaded.

CRITICAL RULES:
1. Ground every answer strictly in the uploaded agreement. Never hallucinate clauses, obligations, financial values, or penalties.
2. If the agreement does NOT contain the requested information, explicitly say:
   "I couldn't find this information in the uploaded agreement."
   Do NOT guess or fabricate terms.
3. Distinguish certainty:
   - If clearly stated: "The agreement states..."
   - If interpreted: "This appears to mean..."
   - If absent: "The agreement does not specify..."
   - If ambiguous: "This wording is unclear and may require clarification."
4. Traceability: Whenever referring to a specific provision, cite the clause number, section name, page number (if known), and include a short verbatim quote.
5. Scenario questions ("What happens if..."): Break your answer into:
   - What the document explicitly states
   - What can reasonably be inferred
   - What the document does not specify
6. Do NOT provide formal legal advice or say "You should sign/not sign". Recommend consulting a qualified legal professional for high stakes.

Return a JSON object with this exact structure:
{
  "text": "Your helpful, formatted plain-language answer in Markdown.",
  "uncertaintyLevel": "stated_in_document" | "reasonable_inference" | "not_specified" | "ambiguous",
  "sourceReferences": [
    {
      "clauseNumber": "e.g., Section 4",
      "sectionName": "e.g., Rent and Payment Schedule",
      "pageNumber": "e.g., Page 1",
      "quote": "Short exact excerpt from the agreement"
    }
  ]
}`;

    // Construct conversation context
    const conversationContext = [
      {
        text: `AGREEMENT CONTEXT:
Document Title: ${metadata?.documentTitle || 'Agreement'}
Agreement Type: ${metadata?.agreementType || 'Contract'}
Parties: ${JSON.stringify(metadata?.parties || [])}
Summary: ${JSON.stringify(metadata?.purpose || '')}
Key Clauses: ${JSON.stringify(clauses?.map((c: any) => ({ title: c.title, section: c.pageOrSection, original: c.originalText })) || [])}

DOCUMENT FULL TEXT (if available):
${documentText ? documentText.slice(0, 15000) : 'Full text extracted directly via multimodal upload.'}`,
      },
    ];

    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        conversationContext.push({
          text: `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`,
        });
      }
    }

    conversationContext.push({
      text: `User question: "${message}"\n\nPlease answer based strictly on the uploaded agreement as requested in JSON format.`,
    });

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: { parts: conversationContext },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    let parsed: any = {};
    try {
      parsed = extractAndParseJson(response.text || '{}');
    } catch (e) {
      parsed = { text: response.text };
    }

    return res.json({
      text: parsed.text || response.text || "I couldn't find this information in the uploaded agreement.",
      uncertaintyLevel: parsed.uncertaintyLevel || 'reasonable_inference',
      sourceReferences: parsed.sourceReferences || [],
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: 'Chat response failed.',
      message: error?.message || 'Failed to generate chat response.',
    });
  }
});

/**
 * POST /api/explain-clause
 * Explain any specific clause in different user-selectable styles
 */
app.post('/api/explain-clause', async (req, res) => {
  try {
    const { clauseTitle, clauseText, style, documentContext } = req.body;

    if (!clauseText && !clauseTitle) {
      return res.status(400).json({ error: 'Clause text or title is required.' });
    }

    const ai = getGeminiClient();

    const styleInstructions: Record<string, string> = {
      simple: 'Provide a simple, crystal-clear plain language explanation for an everyday person.',
      detailed: 'Provide a thorough, comprehensive breakdown including legal nuances, rights, and potential liabilities.',
      example: 'Provide a realistic real-world scenario/example demonstrating how this clause plays out in practice.',
      consequence: 'Highlight the practical and financial consequences if the user breaches or follows this clause.',
      questions: 'Generate 3-5 sharp, practical questions the user should ask the other party about this specific clause.',
      explain_like_15: 'Explain this like the user is a 15-year-old high school student using relatable analogies.',
      one_sentence: 'Summarize the entire clause into exactly ONE clear, impactful sentence.',
    };

    const targetStylePrompt = styleInstructions[style] || styleInstructions.simple;

    const systemPrompt = `You are an expert contract explainer.
Explain the provided clause following this style requirement: ${targetStylePrompt}
Never invent fake terms. Explain what the clause means honestly and objectively.

Return a JSON object:
{
  "clauseTitle": "${clauseTitle || 'Contract Clause'}",
  "style": "${style || 'simple'}",
  "explanation": "Your explanation in Markdown",
  "keyTakeaway": "A 1-sentence key takeaway",
  "practicalExample": "A realistic scenario (if applicable)",
  "questionsToAsk": ["Question 1", "Question 2"]
}`;

    const prompt = `Clause Title: ${clauseTitle || 'Clause'}
Clause Text:
"""
${clauseText}
"""
${documentContext ? `Agreement Context: ${documentContext.slice(0, 1000)}` : ''}`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = extractAndParseJson(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/explain-clause:', error);
    return res.status(500).json({ error: error?.message || 'Failed to explain clause.' });
  }
});

/**
 * POST /api/search-document
 * Natural-language semantic search across agreement
 */
app.post('/api/search-document', async (req, res) => {
  try {
    const { query, documentText, clauses } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are an agreement search engine.
Search the agreement for concepts matching the user's natural language query (e.g. "Find every mention of termination", "Where does it talk about payment?", "Show all penalties").
Extract all relevant clauses or sections with exact snippets and explain why each is relevant.

Return a JSON array of matching items:
[
  {
    "clauseTitle": "Clause or Section Name",
    "sectionOrPage": "e.g., Section 4, Page 1",
    "snippet": "Verbatim excerpt from the document",
    "relevanceExplanation": "Why this matches the user's query"
  }
]`;

    const prompt = `User Search Query: "${query}"

Available Clauses:
${JSON.stringify(clauses?.map((c: any) => ({ title: c.title, section: c.pageOrSection, text: c.originalText })) || [])}

Document Text Excerpt:
${documentText ? documentText.slice(0, 10000) : 'Full text extracted from multimodal upload.'}`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsed = extractAndParseJson(response.text || '[]');
    return res.json({ results: Array.isArray(parsed) ? parsed : [] });
  } catch (error: any) {
    console.error('Error in /api/search-document:', error);
    return res.status(500).json({ error: error?.message || 'Failed to search document.' });
  }
});

/**
 * POST /api/compare-agreements
 * Compares two agreements (e.g. first draft vs revised draft, or standard vs customized)
 */
app.post('/api/compare-agreements', async (req, res) => {
  try {
    const { doc1Text, doc1Name, doc2Text, doc2Base64, doc2MimeType, doc2Name } = req.body;

    if (!doc1Text) {
      return res.status(400).json({ error: 'Original agreement text is required for comparison.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are an expert contract comparison assistant.
Compare the two provided agreements:
Document 1: "${doc1Name || 'Original Agreement'}"
Document 2: "${doc2Name || 'Comparison / Revised Agreement'}"

Identify:
1. Added clauses in Document 2
2. Removed clauses in Document 2
3. Modified clauses (with text from both documents and practical impact)
4. Changed payment or financial terms
5. Changed dates and deadlines
6. Changed obligations (what either party must do)
7. Changed termination conditions
8. A concise, plain-language "What changed?" executive summary and overall assessment of whether Document 2 is more or less favorable to the user.

Return JSON adhering to:
{
  "summary": "Concise high-level overview of the differences in Markdown",
  "addedClauses": ["Clause X (Title) - description of what is added"],
  "removedClauses": ["Clause Y (Title) - description of what was dropped"],
  "modifiedClauses": [
    {
      "clause": "Clause Title or Section",
      "doc1Text": "Original phrasing",
      "doc2Text": "Revised phrasing",
      "impact": "Plain-language impact of this change"
    }
  ],
  "paymentChanges": "Summary of financial differences or 'No changes in payment terms'",
  "dateChanges": "Summary of date/timeline differences or 'No changes in dates'",
  "obligationChanges": "Summary of changes to user/counterparty duties",
  "terminationChanges": "Summary of changes to cancellation/termination rules",
  "overallAssessment": "Objective assessment of whether the new version is more favorable, less favorable, or neutral to the user."
}`;

    let parts: any[] = [];

    if (doc2Base64 && doc2MimeType) {
      parts.push({
        inlineData: {
          mimeType: doc2MimeType,
          data: doc2Base64,
        },
      });
      parts.push({
        text: `Document 1 ("${doc1Name}") text:\n"""\n${doc1Text.slice(0, 15000)}\n"""\n\nCompare Document 1 above with the uploaded Document 2 ("${doc2Name}") and return the comparison JSON.`,
      });
    } else {
      parts.push({
        text: `DOCUMENT 1 ("${doc1Name}"):
"""
${doc1Text.slice(0, 15000)}
"""

DOCUMENT 2 ("${doc2Name}"):
"""
${(doc2Text || '').slice(0, 15000)}
"""

Please compare these two agreements and return the comparison JSON.`,
      });
    }

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = extractAndParseJson(response.text || '{}');

    return res.json({
      doc1Name: doc1Name || 'Original Agreement',
      doc2Name: doc2Name || 'Comparison Agreement',
      ...parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/compare-agreements:', error);
    return res.status(500).json({ error: error?.message || 'Failed to compare agreements.' });
  }
});

async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(indexHtmlPath);

  if (isProduction) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(indexHtmlPath);
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
