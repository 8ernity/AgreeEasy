import React from 'react';
import {
  DollarSign,
  AlertCircle,
  HelpCircle,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Percent,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { FinancialAnalysis } from '../types';

interface FinancialSectionProps {
  financial: FinancialAnalysis;
  onAskQuestion: (question: string) => void;
}

export const FinancialSection: React.FC<FinancialSectionProps> = ({
  financial,
  onAskQuestion,
}) => {
  const quickQuestions = [
    'How much do I have to pay in total or on a recurring basis?',
    'When do I have to pay, and is there a grace period?',
    'Is there a penalty or late fee if payment is delayed?',
    'Can the price or rent increase during or after this agreement?',
    'When and under what conditions do I get my deposit back?',
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'rent':
      case 'salary':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'deposit':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'penalty':
      case 'late_fee':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'increase':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Money & Monetary Terms
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Financial Obligations & Payment Terms</h2>
            <p className="text-xs text-stone-500 mt-1">
              Every fee, deposit, penalty, and schedule extracted directly from the agreement.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Strict Zero-Hallucination Money Audit
          </span>
        </div>

        {/* Quick Financial Summary */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6 text-xs text-stone-700 leading-relaxed">
          <strong className="text-stone-900 font-bold block mb-1">Financial Overview:</strong>
          {financial.summary || 'Summary of all extracted financial commitments.'}
        </div>

        {/* Financial Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {financial.items && financial.items.length > 0 ? (
            financial.items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-stone-200 hover:border-stone-300 transition flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getTypeBadge(
                        item.type
                      )}`}
                    >
                      {item.type.replace('_', ' ')}
                    </span>
                    {item.pageOrSection && (
                      <span className="text-[10px] text-stone-400 font-mono">{item.pageOrSection}</span>
                    )}
                  </div>
                  <div className="text-xl font-bold text-stone-900 mb-1">{item.amount}</div>
                  <p className="text-xs font-medium text-amber-700 mb-2">{item.frequencyOrDue}</p>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                </div>

                {item.isContingent && (
                  <div className="mt-3 pt-2 border-t border-stone-100 text-[10px] text-orange-700 font-medium">
                    * Contingent / Conditional obligation
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-500 col-span-3">No specific monetary amounts detected.</p>
          )}
        </div>

        {/* Key Policies: Deposits, Price Increases, Penalties */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/60 text-xs">
            <h4 className="font-bold text-blue-900 mb-1.5 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Deposit Return Conditions</span>
            </h4>
            <p className="text-stone-700 leading-relaxed">
              {financial.depositConditions || 'No specific deposit return conditions found.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/60 text-xs">
            <h4 className="font-bold text-amber-900 mb-1.5 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              <span>Price Escalation / Increases</span>
            </h4>
            <p className="text-stone-700 leading-relaxed">
              {financial.priceIncreaseTerms || 'No automatic price escalation clauses specified.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200/60 text-xs">
            <h4 className="font-bold text-rose-900 mb-1.5 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-rose-700" />
              <span>Late Fees & Penalties</span>
            </h4>
            <p className="text-stone-700 leading-relaxed">
              {financial.penaltiesSummary || 'Standard default terms apply.'}
            </p>
          </div>
        </div>

        {/* Interactive Clickable Financial Questions */}
        <div className="p-5 rounded-xl bg-stone-50 border border-stone-200">
          <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide mb-3 flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Ask the Agreement Assistant About Money</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onAskQuestion(q)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:border-amber-400 hover:text-amber-800 transition shadow-2xs flex items-center space-x-1.5"
              >
                <span>{q}</span>
                <ArrowRight className="w-3 h-3 text-stone-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
