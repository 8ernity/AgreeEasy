import React from 'react';
import {
  HelpCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Sliders,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { QuestionToAskItem, NegotiationSuggestionItem } from '../types';

interface AskBeforeSigningSectionProps {
  questions: QuestionToAskItem[];
  negotiations: NegotiationSuggestionItem[];
  onAskQuestion: (question: string) => void;
}

export const AskBeforeSigningSection: React.FC<AskBeforeSigningSectionProps> = ({
  questions,
  negotiations,
  onAskQuestion,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Ask Before Signing */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Pre-Signing Due Diligence
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Questions to Ask the Other Party Before Signing
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Derived directly from ambiguous or high-impact clauses in this agreement.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-700">
            {questions?.length || 0} Key Questions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions && questions.length > 0 ? (
            questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 hover:border-stone-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-stone-500 border border-stone-200">
                      {q.relatedClause || 'Contract Clause'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">To: {q.targetParty}</span>
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 mb-2 leading-snug">"{q.question}"</h4>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    <span className="font-semibold text-stone-800">Why this matters: </span>
                    {q.whyItMatters}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                  <button
                    onClick={() => copyToClipboard(q.question, q.id || String(idx))}
                    className="text-stone-600 hover:text-stone-900 font-medium inline-flex items-center space-x-1"
                  >
                    {copiedId === (q.id || String(idx)) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Question</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onAskQuestion(`Help me draft a friendly email asking: "${q.question}"`)}
                    className="text-amber-700 hover:text-amber-900 font-medium inline-flex items-center space-x-1"
                  >
                    <span>Draft Email in Chat</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-500 col-span-2">No specific pre-signing questions generated.</p>
          )}
        </div>
      </section>

      {/* Negotiation Assistant */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Tactical Discussion Ideas
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Negotiation Assistant</h2>
            <p className="text-xs text-stone-500 mt-1">
              Clauses with room for fair balance, proposed counter-offers, and alternative wording.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Educational Compromise Proposals
          </span>
        </div>

        <div className="space-y-4">
          {negotiations && negotiations.length > 0 ? (
            negotiations.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-5 rounded-xl border border-stone-200 bg-white hover:border-amber-300 transition shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <span>{item.clause}</span>
                  </h3>
                  <button
                    onClick={() =>
                      onAskQuestion(
                        `How can I effectively negotiate ${item.clause}? The current condition is "${item.currentCondition}". Give me 2 polite phrasing options.`
                      )
                    }
                    className="text-xs font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Counter-Proposal Email</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                      Current Agreement Condition:
                    </span>
                    <p className="text-stone-800 leading-relaxed">{item.currentCondition}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/60">
                    <span className="text-[10px] font-bold uppercase text-amber-800 block mb-1">
                      Why It Matters To You:
                    </span>
                    <p className="text-stone-800 leading-relaxed">{item.whyItMayMatter}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-stone-900 text-stone-200 text-xs font-mono mb-3">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">
                    Suggested Alternative Wording / Compromise:
                  </span>
                  <p className="font-serif-legal italic text-stone-100 text-sm">
                    "{item.suggestedAlternativeOrConcession}"
                  </p>
                </div>

                <p className="text-xs text-stone-500 italic">
                  Note: Suggested language is educational and provided to assist constructive negotiation. It does not
                  guarantee concession or constitute legal drafting.
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-500">No negotiation suggestions identified for this agreement.</p>
          )}
        </div>
      </section>
    </div>
  );
};
