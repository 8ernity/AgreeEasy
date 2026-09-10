export type AttentionLevel = 'high_attention' | 'needs_attention' | 'informational';

export interface PartyInfo {
  name: string;
  role: string;
  description: string;
}

export interface FiveThingsItem {
  id: string;
  title: string;
  explanation: string;
  category: 'financial' | 'penalty' | 'termination' | 'restriction' | 'liability' | 'auto_renewal' | 'ip' | 'other';
  importance: 'critical' | 'high';
  sourceClause?: string;
  pageOrSection?: string;
}

export interface PlainLanguageSummary {
  whatIsThis: string;
  partiesInvolved: string;
  purposeAndScope: string;
  userAgreesTo: string;
  otherPartyAgreesTo: string;
  durationAndTimeline: string;
  howItCanEnd: string;
  paymentTerms: string;
  violationConsequences: string;
}

export interface ClauseAnalysisItem {
  id: string;
  clauseNumber?: string;
  title: string;
  originalText: string;
  plainLanguageExplanation: string;
  whoItAffects: 'user' | 'other_party' | 'both';
  userObligation: string;
  otherPartyObligation: string;
  potentialConsequence: string;
  attentionLevel: AttentionLevel;
  attentionReason: string;
  pageOrSection: string;
  category: string;
}

export interface FinancialItem {
  id: string;
  type: 'fee' | 'rent' | 'deposit' | 'salary' | 'penalty' | 'interest' | 'late_fee' | 'refund' | 'increase' | 'other';
  amount: string;
  frequencyOrDue: string;
  description: string;
  sourceClause?: string;
  pageOrSection?: string;
  isContingent: boolean;
}

export interface FinancialAnalysis {
  summary: string;
  items: FinancialItem[];
  depositConditions?: string;
  priceIncreaseTerms?: string;
  penaltiesSummary?: string;
}

export interface DateItem {
  id: string;
  label: string;
  dateOrPeriod: string;
  plainExplanation: string;
  sourceClause?: string;
  type: 'start' | 'end' | 'renewal' | 'notice' | 'payment' | 'grace_period' | 'other';
}

export interface DatesAndDeadlines {
  summary: string;
  items: DateItem[];
  noticePeriodExplanation: string;
  renewalExplanation: string;
}

export interface ObligationItem {
  id: string;
  description: string;
  sourceClause: string;
  importance: 'mandatory' | 'conditional';
}

export interface ObligationsAnalysis {
  userObligations: ObligationItem[];
  otherPartyObligations: ObligationItem[];
  sharedObligations: ObligationItem[];
}

export interface RestrictionItem {
  id: string;
  title: string;
  type: 'confidentiality' | 'ip' | 'non_compete' | 'non_solicit' | 'usage' | 'transfer' | 'assignment' | 'other';
  plainExplanation: string;
  originalReference: string;
  whoItAppliesTo: string;
  durationOrScope: string;
}

export interface TerminationAnalysis {
  whoCanTerminate: string;
  conditions: string;
  noticeRequired: string;
  penaltiesOrFees: string;
  postTerminationObligations: string;
  autoRenewalConditions: string;
  keyTakeaways: string[];
}

export interface ScenarioItem {
  id: string;
  scenario: string;
  whatDocumentStates: string;
  whatCanBeInferred: string;
  whatIsNotSpecified: string;
  sourceClause?: string;
}

export interface QuestionToAskItem {
  id: string;
  question: string;
  whyItMatters: string;
  targetParty: string;
  relatedClause: string;
}

export interface NegotiationSuggestionItem {
  id: string;
  clause: string;
  currentCondition: string;
  whyItMayMatter: string;
  possibleQuestionToAsk: string;
  suggestedAlternativeOrConcession: string;
}

export interface MissingInformationItem {
  id: string;
  item: string;
  whyItIsImportant: string;
  status: 'completely_absent' | 'ambiguous' | 'unclear';
  recommendation: string;
}

export interface AgreementMetadata {
  agreementType: string;
  confidence: 'high' | 'moderate' | 'tentative';
  documentTitle: string;
  parties: PartyInfo[];
  purpose: string;
  effectiveDate: string;
  expirationDate: string;
  duration: string;
  governingLaw: string;
  scannedOrImageBased?: boolean;
}

export interface AgreementAnalysis {
  id: string;
  documentName: string;
  extractedTextPreview?: string;
  fullDocumentText?: string;
  metadata: AgreementMetadata;
  fiveThingsToKnow: FiveThingsItem[];
  plainLanguageSummary: PlainLanguageSummary;
  clauses: ClauseAnalysisItem[];
  financialAnalysis: FinancialAnalysis;
  datesAndDeadlines: DatesAndDeadlines;
  obligations: ObligationsAnalysis;
  restrictions: RestrictionItem[];
  terminationAnalysis: TerminationAnalysis;
  whatHappensIfScenarios: ScenarioItem[];
  questionsToAsk: QuestionToAskItem[];
  negotiationSuggestions: NegotiationSuggestionItem[];
  missingInformation: MissingInformationItem[];
}

export interface SourceReference {
  clauseNumber?: string;
  sectionName?: string;
  pageNumber?: string;
  quote: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sourceReferences?: SourceReference[];
  uncertaintyLevel?: 'stated_in_document' | 'reasonable_inference' | 'not_specified' | 'ambiguous';
  certaintyBreakdown?: {
    explicitText?: string;
    inference?: string;
    notSpecified?: string;
  };
}

export interface ClauseExplanationResult {
  clauseTitle: string;
  originalClause: string;
  style: string;
  explanation: string;
  keyTakeaway: string;
  practicalExample?: string;
  questionsToAsk?: string[];
}

export interface SearchResultItem {
  clauseTitle: string;
  sectionOrPage: string;
  snippet: string;
  relevanceExplanation: string;
}

export interface ModifiedClauseDiff {
  clause: string;
  doc1Text: string;
  doc2Text: string;
  impact: string;
}

export interface CompareResult {
  doc1Name: string;
  doc2Name: string;
  summary: string;
  addedClauses: string[];
  removedClauses: string[];
  modifiedClauses: ModifiedClauseDiff[];
  paymentChanges: string;
  dateChanges: string;
  obligationChanges: string;
  terminationChanges: string;
  overallAssessment: string;
}

export interface SampleAgreement {
  id: string;
  title: string;
  type: string;
  badge: string;
  description: string;
  filename: string;
  content: string;
}
