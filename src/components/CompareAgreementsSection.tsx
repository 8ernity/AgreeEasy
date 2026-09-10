import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Scale,
  DollarSign,
  PlusCircle,
  MinusCircle,
  Clock,
  Loader2,
  X,
} from 'lucide-react';
import { SAMPLE_AGREEMENTS } from '../data/sampleAgreements';
import { CompareResult } from '../types';

interface CompareAgreementsSectionProps {
  currentDocumentText: string;
  currentDocumentName: string;
  onClose: () => void;
  onAskQuestion: (question: string) => void;
}

export const CompareAgreementsSection: React.FC<CompareAgreementsSectionProps> = ({
  currentDocumentText,
  currentDocumentName,
  onClose,
  onAskQuestion,
}) => {
  const [docAName, setDocAName] = useState(currentDocumentName || 'Document A (Current)');
  const [docAText, setDocAText] = useState(currentDocumentText || '');

  const [docBName, setDocBName] = useState('Document B (Revised / Alternate)');
  const [docBText, setDocBText] = useState('');

  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectSampleB = (sampleId: string) => {
    const sample = SAMPLE_AGREEMENTS.find((s) => s.id === sampleId);
    if (sample) {
      setDocBName(sample.title);
      setDocBText(sample.content);
    }
  };

  const handleRunComparison = async () => {
    if (!docAText.trim() || !docBText.trim()) {
      setError('Please provide text for both agreements to compare.');
      return;
    }
    setError(null);
    setIsComparing(true);

    try {
      const res = await fetch('/api/compare-agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc1Name: docAName,
          doc1Text: docAText,
          doc2Name: docBName,
          doc2Text: docBText,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setError('Failed to compare documents. Please try again.');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 tracking-tight">Compare Two Agreements / Drafts</h2>
            <p className="text-xs text-stone-500">
              Inspect what changed between two revisions, terms, or competing counter-offers.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Two-Column Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document A */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wide">
              Document A (Original / Current)
            </label>
            <span className="text-[10px] text-stone-400 font-mono">Baseline</span>
          </div>
          <input
            type="text"
            value={docAName}
            onChange={(e) => setDocAName(e.target.value)}
            placeholder="Document A Name"
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          />
          <textarea
            rows={6}
            value={docAText}
            onChange={(e) => setDocAText(e.target.value)}
            placeholder="Paste text of Document A..."
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          ></textarea>
        </div>

        {/* Document B */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wide">
              Document B (Revision / Counterpart)
            </label>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-stone-400">Sample:</span>
              <button
                type="button"
                onClick={() => handleSelectSampleB('tech-employment')}
                className="text-[10px] text-amber-700 underline"
              >
                Sample 1
              </button>
              <span className="text-stone-300">|</span>
              <button
                type="button"
                onClick={() => handleSelectSampleB('freelance-design')}
                className="text-[10px] text-amber-700 underline"
              >
                Sample 2
              </button>
            </div>
          </div>
          <input
            type="text"
            value={docBName}
            onChange={(e) => setDocBName(e.target.value)}
            placeholder="Document B Name"
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          />
          <textarea
            rows={6}
            value={docBText}
            onChange={(e) => setDocBText(e.target.value)}
            placeholder="Paste text of Document B or select a sample..."
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleRunComparison}
          disabled={isComparing || !docAText.trim() || !docBText.trim()}
          className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center space-x-2 transition disabled:opacity-50"
        >
          {isComparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
          <span>{isComparing ? 'Comparing Agreements...' : 'Run Side-by-Side Comparison'}</span>
        </button>
      </div>

      {/* Comparison Results */}
      {result && (
        <div className="border-t border-stone-200 pt-6 space-y-6">
          {/* Executive Summary & Favorability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <span className="font-bold text-stone-900 block mb-1">What Changed Overall:</span>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">{result.summary}</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-800 block mb-1">
                  Overall Favorability Assessment
                </span>
                <p className="text-stone-800 leading-relaxed text-xs">{result.overallAssessment}</p>
              </div>
            </div>
          </div>

          {/* Payment & Obligation & Termination Changes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
              <h4 className="font-bold text-emerald-900 mb-1 flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span>Payment & Fees</span>
              </h4>
              <p className="text-stone-700 leading-relaxed">{result.paymentChanges}</p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/60">
              <h4 className="font-bold text-blue-900 mb-1 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-blue-700" />
                <span>Dates & Timelines</span>
              </h4>
              <p className="text-stone-700 leading-relaxed">{result.dateChanges}</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/60">
              <h4 className="font-bold text-rose-900 mb-1 flex items-center space-x-1.5">
                <Scale className="w-4 h-4 text-rose-700" />
                <span>Termination & Rights</span>
              </h4>
              <p className="text-stone-700 leading-relaxed">{result.terminationChanges}</p>
            </div>
          </div>

          {/* Added & Removed Clauses Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-200">
              <h4 className="font-bold text-emerald-900 mb-2 flex items-center space-x-1.5">
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                <span>Added Clauses in Document 2 ({result.addedClauses?.length || 0})</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-stone-700">
                {result.addedClauses && result.addedClauses.length > 0 ? (
                  result.addedClauses.map((c, idx) => <li key={idx}>{c}</li>)
                ) : (
                  <li className="list-none text-stone-400">None</li>
                )}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/30 border border-rose-200">
              <h4 className="font-bold text-rose-900 mb-2 flex items-center space-x-1.5">
                <MinusCircle className="w-4 h-4 text-rose-700" />
                <span>Removed Clauses in Document 2 ({result.removedClauses?.length || 0})</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-stone-700">
                {result.removedClauses && result.removedClauses.length > 0 ? (
                  result.removedClauses.map((c, idx) => <li key={idx}>{c}</li>)
                ) : (
                  <li className="list-none text-stone-400">None</li>
                )}
              </ul>
            </div>
          </div>

          {/* Clause-by-Clause Differences */}
          <div>
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-3">
              Modified Clauses Detail ({result.modifiedClauses?.length || 0})
            </h3>
            <div className="space-y-3">
              {result.modifiedClauses && result.modifiedClauses.length > 0 ? (
                result.modifiedClauses.map((diff, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-white text-xs shadow-2xs">
                    <div className="font-bold text-stone-900 text-sm mb-2">{diff.clause}</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 font-serif-legal italic text-stone-700">
                        <span className="text-[10px] font-sans font-bold uppercase text-stone-400 not-italic block mb-0.5">
                          In {docAName}:
                        </span>
                        {diff.doc1Text || '(Not present)'}
                      </div>
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 font-serif-legal italic text-stone-700">
                        <span className="text-[10px] font-sans font-bold uppercase text-stone-400 not-italic block mb-0.5">
                          In {docBName}:
                        </span>
                        {diff.doc2Text || '(Not present)'}
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg">
                      <span className="font-semibold text-stone-800">Impact on you: </span>
                      {diff.impact}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500">No specific clause modifications listed.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
