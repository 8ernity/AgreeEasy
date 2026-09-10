import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw, Bell } from 'lucide-react';
import { DatesAndDeadlines } from '../types';

interface DatesAndDeadlinesSectionProps {
  dates: DatesAndDeadlines;
  onAskQuestion: (question: string) => void;
}

export const DatesAndDeadlinesSection: React.FC<DatesAndDeadlinesSectionProps> = ({
  dates,
  onAskQuestion,
}) => {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'start':
      case 'end':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'notice':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'renewal':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'grace_period':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
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
              Timelines & Deadlines
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Critical Dates, Notice Periods & Deadlines</h2>
            <p className="text-xs text-stone-500 mt-1">
              Relative timelines translated into clear, actionable calendar requirements.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
            Plain-English Time Translation
          </span>
        </div>

        {/* Notice & Renewal Highlight Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
            <h4 className="font-bold text-amber-900 mb-1.5 flex items-center space-x-1.5">
              <Bell className="w-4 h-4 text-amber-700" />
              <span>Notice Period Requirement</span>
            </h4>
            <p className="text-stone-700 leading-relaxed">
              {dates.noticePeriodExplanation || 'Notice requirements govern when and how you must notify the other party.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 text-xs">
            <h4 className="font-bold text-orange-900 mb-1.5 flex items-center space-x-1.5">
              <RefreshCw className="w-4 h-4 text-orange-700" />
              <span>Automatic Renewal Terms</span>
            </h4>
            <p className="text-stone-700 leading-relaxed">
              {dates.renewalExplanation || 'Explains whether the agreement renews automatically and how to prevent it.'}
            </p>
          </div>
        </div>

        {/* Date Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dates.items && dates.items.length > 0 ? (
            dates.items.map((item) => (
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
                    {item.sourceClause && (
                      <span className="text-[10px] text-stone-400 font-mono">{item.sourceClause}</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 mb-1">{item.label}</h4>
                  <div className="text-xs font-semibold text-amber-700 font-mono mb-2">{item.dateOrPeriod}</div>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.plainExplanation}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={() => onAskQuestion(`What are all the rules and deadlines surrounding "${item.label}"?`)}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-medium inline-flex items-center space-x-1"
                  >
                    <span>Ask details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-500 col-span-3">No specific dates or deadlines found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
