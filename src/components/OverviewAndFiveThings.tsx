import React from 'react';
import {
  FileText,
  Users,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  Scale,
  Sparkles,
  ArrowRight,
  DollarSign,
  Clock,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { AgreementAnalysis } from '../types';

interface OverviewAndFiveThingsProps {
  analysis: AgreementAnalysis;
  onSelectClause: (clauseNumberOrTitle: string) => void;
  onAskQuestion: (question: string) => void;
}

export const OverviewAndFiveThings: React.FC<OverviewAndFiveThingsProps> = ({
  analysis,
  onSelectClause,
  onAskQuestion,
}) => {
  const { metadata, fiveThingsToKnow, plainLanguageSummary } = analysis;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
      case 'penalty':
        return <DollarSign className="w-4 h-4 text-amber-600" />;
      case 'auto_renewal':
      case 'termination':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'restriction':
      case 'liability':
        return <Shield className="w-4 h-4 text-rose-600" />;
      case 'ip':
        return <Scale className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* 5 Things You Should Know Before Signing */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                5 Things You Should Know Before Signing
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              The highest-priority clauses affecting your finances, rights, and potential liabilities.
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 w-fit">
            Prioritized by Actual Consequence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fiveThingsToKnow.map((item, index) => (
            <div
              key={item.id || index}
              className={`p-5 rounded-xl border transition flex flex-col justify-between ${
                item.importance === 'critical'
                  ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400'
                  : 'bg-stone-50/60 border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-stone-100 font-mono text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="p-1 rounded bg-white shadow-2xs">
                      {getCategoryIcon(item.category)}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      item.importance === 'critical'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {item.importance === 'critical' ? 'High Impact' : 'Careful Review'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-900 mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  {item.explanation}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                <span className="text-stone-500 font-mono">
                  {item.sourceClause || item.pageOrSection || 'Source Section'}
                </span>
                <button
                  onClick={() => onAskQuestion(`Explain more about "${item.title}" in this agreement.`)}
                  className="text-amber-700 hover:text-amber-900 font-medium inline-flex items-center space-x-1"
                >
                  <span>Ask about this</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Automatic Agreement Detection Card */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Contract Intelligence
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Agreement Profile & Key Parties</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
              {metadata.agreementType}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono text-stone-600 bg-stone-100">
              Confidence: {metadata.confidence}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Parties involved */}
          <div className="lg:col-span-2 bg-stone-50 rounded-xl p-5 border border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-stone-700" />
              <span>Identified Parties</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metadata.parties && metadata.parties.length > 0 ? (
                metadata.parties.map((party, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {party.role}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">Party {idx + 1}</span>
                    </div>
                    <p className="text-sm font-bold text-stone-900">{party.name}</p>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">{party.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500">Parties not explicitly designated.</p>
              )}
            </div>
          </div>

          {/* Key Dates & Law Metadata */}
          <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-stone-700" />
                <span>Timeline & Jurisdiction</span>
              </h3>
              <dl className="space-y-2.5 text-xs">
                <div>
                  <dt className="text-stone-400 text-[11px]">Effective Date:</dt>
                  <dd className="font-semibold text-stone-800">{metadata.effectiveDate || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-stone-400 text-[11px]">Expiration / Term:</dt>
                  <dd className="font-semibold text-stone-800">{metadata.expirationDate || metadata.duration || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-stone-400 text-[11px]">Governing Law:</dt>
                  <dd className="font-semibold text-stone-800">{metadata.governingLaw || 'Not specified'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Purpose Statement */}
        <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200 text-xs">
          <span className="font-bold text-stone-800">Primary Objective: </span>
          <span className="text-stone-600 leading-relaxed">{metadata.purpose}</span>
        </div>
      </section>

      {/* Comprehensive Plain-Language Summary */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Zero-Legalese Breakdown
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Plain-Language Summary</h2>
          </div>
          <button
            onClick={() => onAskQuestion('Summarize this entire agreement in 5 concise bullet points.')}
            className="text-xs font-medium text-amber-700 hover:text-amber-900 flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate 5-Bullet Summary</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-1.5 flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-stone-600" />
                <span>What is this agreement?</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">{plainLanguageSummary.whatIsThis}</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-1.5 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>What do you agree to do?</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">{plainLanguageSummary.userAgreesTo}</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-1.5 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>What does the other party agree to do?</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">{plainLanguageSummary.otherPartyAgreesTo}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-1.5 flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                <span>What payments are involved?</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">{plainLanguageSummary.paymentTerms}</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-1.5 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>How can this agreement end?</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">{plainLanguageSummary.howItCanEnd}</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-1.5 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>What happens if someone violates the agreement?</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">{plainLanguageSummary.violationConsequences}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
