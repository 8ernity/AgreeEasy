import React, { useState } from 'react';
import {
  AlertOctagon,
  Clock,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  Send,
  FileCheck,
  Compass,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { TerminationAnalysis, ScenarioItem } from '../types';

interface TerminationAndScenariosSectionProps {
  termination: TerminationAnalysis;
  scenarios: ScenarioItem[];
  onAskCustomScenario: (scenario: string) => void;
  onAskQuestion: (question: string) => void;
}

export const TerminationAndScenariosSection: React.FC<TerminationAndScenariosSectionProps> = ({
  termination,
  scenarios,
  onAskCustomScenario,
  onAskQuestion,
}) => {
  const [customInput, setCustomInput] = useState('');

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onAskCustomScenario(customInput.trim());
    setCustomInput('');
  };

  return (
    <div className="space-y-8">
      {/* Dedicated Termination Analysis */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
              Exit Strategy & Cancellation
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Termination & Exit Conditions</h2>
            <p className="text-xs text-stone-500 mt-1">
              How you can end the contract, required notice, early termination penalties, and surviving covenants.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            Exit Protection Audit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Who Can Terminate?</span>
            <p className="font-semibold text-stone-900 mb-1">{termination.whoCanTerminate || 'Both or specified party'}</p>
            <p className="text-stone-600 leading-relaxed">{termination.conditions}</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Required Notice</span>
            <p className="font-semibold text-stone-900 mb-1">{termination.noticeRequired || 'Not specified'}</p>
            <p className="text-stone-600 leading-relaxed">Ensure notice is submitted via the method required in the contract.</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 text-xs">
            <span className="text-[10px] font-bold uppercase text-rose-500 block mb-1">Early Exit Penalties</span>
            <p className="font-semibold text-rose-900 mb-1">{termination.penaltiesOrFees || 'None stated'}</p>
            <p className="text-rose-800/80 leading-relaxed">Carefully check for liquidated damages or fee forfeiture.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/60 text-xs">
            <h4 className="font-bold text-amber-900 mb-1 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Post-Termination Obligations (Survival Clauses)</span>
            </h4>
            <p className="text-stone-700 leading-relaxed">
              {termination.postTerminationObligations || 'Confidentiality or non-compete clauses often remain active after the contract ends.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-200/60 text-xs">
            <h4 className="font-bold text-orange-900 mb-1 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-orange-700" />
              <span>Automatic Renewal Warnings</span>
            </h4>
            <p className="text-stone-700 leading-relaxed">
              {termination.autoRenewalConditions || 'No automatic renewal clauses found.'}
            </p>
          </div>
        </div>
      </section>

      {/* "What Happens If...?" Scenarios */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Scenario Stress-Testing
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">"What Happens If...?" Answers</h2>
            <p className="text-xs text-stone-500 mt-1">
              Real-world situations analyzed with strict distinction between explicit text, inference, and unaddressed gaps.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-stone-100 text-stone-700">
            3-Tier Certainty Grounding
          </span>
        </div>

        {/* Custom Scenario Input Form */}
        <form onSubmit={handleSubmitCustom} className="mb-8 p-4 rounded-xl bg-stone-50 border border-stone-200">
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Test a Custom "What Happens If...?" Question</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. What happens if my company gets acquired? or What happens if I get sick?"
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center space-x-1.5 transition shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask Scenario</span>
            </button>
          </div>
        </form>

        {/* Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios && scenarios.length > 0 ? (
            scenarios.map((sc, idx) => (
              <div
                key={sc.id || idx}
                className="p-5 rounded-xl border border-stone-200 bg-white hover:border-amber-300 transition flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                      Scenario {idx + 1}
                    </span>
                    {sc.sourceClause && (
                      <span className="text-[10px] text-stone-400 font-mono">{sc.sourceClause}</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 mb-3">{sc.scenario}</h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                      <div className="text-[10px] font-bold uppercase text-emerald-800 flex items-center space-x-1 mb-0.5">
                        <FileCheck className="w-3 h-3" />
                        <span>The agreement explicitly states:</span>
                      </div>
                      <p className="text-stone-800 leading-relaxed">{sc.whatDocumentStates}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
                      <div className="text-[10px] font-bold uppercase text-blue-800 flex items-center space-x-1 mb-0.5">
                        <Compass className="w-3 h-3" />
                        <span>Reasonable inference:</span>
                      </div>
                      <p className="text-stone-800 leading-relaxed">{sc.whatCanBeInferred}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <div className="text-[10px] font-bold uppercase text-stone-500 flex items-center space-x-1 mb-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>What the document does NOT specify:</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">{sc.whatIsNotSpecified}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={() => onAskQuestion(`In this agreement: "${sc.scenario}" — explain options and risks in detail.`)}
                    className="text-xs text-amber-700 hover:text-amber-900 font-medium inline-flex items-center space-x-1"
                  >
                    <span>Explore with Assistant</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-500 col-span-2">No pre-computed scenarios available.</p>
          )}
        </div>
      </section>
    </div>
  );
};
