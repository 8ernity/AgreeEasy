import React, { useState } from 'react';
import { CheckCircle2, Users, ShieldAlert, Lock, Ban, Scale, ArrowRight } from 'lucide-react';
import { ObligationsAnalysis, RestrictionItem } from '../types';

interface ObligationsAndRestrictionsSectionProps {
  obligations: ObligationsAnalysis;
  restrictions: RestrictionItem[];
  onAskQuestion: (question: string) => void;
}

export const ObligationsAndRestrictionsSection: React.FC<ObligationsAndRestrictionsSectionProps> = ({
  obligations,
  restrictions,
  onAskQuestion,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'user' | 'other' | 'shared' | 'restrictions'>('user');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Duties & Boundaries
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Obligations & Restrictive Covenants</h2>
            <p className="text-xs text-stone-500 mt-1">
              Know exactly what you must do, what you are promised in return, and what is restricted.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-stone-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveSubTab('user')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'user' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Your Obligations ({obligations.userObligations?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab('other')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'other' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Other Party's Obligations ({obligations.otherPartyObligations?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab('shared')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'shared' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Shared Obligations ({obligations.sharedObligations?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab('restrictions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'restrictions'
                ? 'bg-amber-100 text-amber-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Restrictions & Covenants ({restrictions?.length || 0})
          </button>
        </div>

        {/* Content for User Obligations */}
        {activeSubTab === 'user' && (
          <div className="space-y-3">
            {obligations.userObligations && obligations.userObligations.length > 0 ? (
              obligations.userObligations.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition flex items-start justify-between gap-4"
                >
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-stone-900 leading-relaxed">{item.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-stone-500 border border-stone-200">
                          {item.sourceClause || 'Source Clause'}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            item.importance === 'mandatory'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {item.importance}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onAskQuestion(`What happens if I fail to fulfill this obligation: "${item.description}"?`)}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-medium shrink-0 flex items-center space-x-1"
                  >
                    <span>Ask scenario</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500">No user obligations found.</p>
            )}
          </div>
        )}

        {/* Content for Other Party Obligations */}
        {activeSubTab === 'other' && (
          <div className="space-y-3">
            {obligations.otherPartyObligations && obligations.otherPartyObligations.length > 0 ? (
              obligations.otherPartyObligations.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition flex items-start justify-between gap-4"
                >
                  <div className="flex items-start space-x-3">
                    <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-stone-900 leading-relaxed">{item.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-stone-500 border border-stone-200">
                          {item.sourceClause || 'Source Clause'}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {item.importance}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onAskQuestion(`What rights do I have if the other party fails this obligation: "${item.description}"?`)}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-medium shrink-0 flex items-center space-x-1"
                  >
                    <span>Ask rights</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500">No specific other-party obligations found.</p>
            )}
          </div>
        )}

        {/* Content for Shared Obligations */}
        {activeSubTab === 'shared' && (
          <div className="space-y-3">
            {obligations.sharedObligations && obligations.sharedObligations.length > 0 ? (
              obligations.sharedObligations.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition flex items-start justify-between gap-4"
                >
                  <div className="flex items-start space-x-3">
                    <Scale className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-stone-900 leading-relaxed">{item.description}</p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-stone-500 border border-stone-200 mt-2 inline-block">
                        {item.sourceClause || 'Source Clause'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500">No mutual shared obligations listed.</p>
            )}
          </div>
        )}

        {/* Content for Restrictions & Covenants */}
        {activeSubTab === 'restrictions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restrictions && restrictions.length > 0 ? (
              restrictions.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 hover:bg-amber-50/40 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        {item.type.replace('_', ' ')}
                      </span>
                      {item.durationOrScope && (
                        <span className="text-[10px] text-stone-500 font-mono">{item.durationOrScope}</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 mb-1">{item.title}</h4>
                    <p className="text-xs text-stone-700 leading-relaxed mb-3">{item.plainExplanation}</p>
                  </div>

                  <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 truncate max-w-[200px]">
                      {item.originalReference || 'Reference clause'}
                    </span>
                    <button
                      onClick={() => onAskQuestion(`What are the limits, exceptions, and enforceability of this restriction: "${item.title}"?`)}
                      className="text-amber-700 hover:text-amber-900 font-medium inline-flex items-center space-x-1"
                    >
                      <span>Ask details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500 col-span-2">No restrictive covenants detected.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
