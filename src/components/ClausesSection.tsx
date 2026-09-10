import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Info,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Sparkles,
  HelpCircle,
  Scale,
  ExternalLink,
} from 'lucide-react';
import { ClauseAnalysisItem, AttentionLevel } from '../types';

interface ClausesSectionProps {
  clauses: ClauseAnalysisItem[];
  onExplainClauseModal: (clause: ClauseAnalysisItem) => void;
  onAskAboutClause: (clauseTitle: string) => void;
}

export const ClausesSection: React.FC<ClausesSectionProps> = ({
  clauses,
  onExplainClauseModal,
  onAskAboutClause,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClauses, setExpandedClauses] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedClauses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getAttentionBadge = (level: AttentionLevel) => {
    switch (level) {
      case 'high_attention':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3 h-3 mr-1 text-rose-600" />
            High Attention
          </span>
        );
      case 'needs_attention':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
            Needs Attention
          </span>
        );
      case 'informational':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <Info className="w-3 h-3 mr-1 text-stone-500" />
            Informational
          </span>
        );
    }
  };

  const filteredClauses = clauses.filter((c) => {
    const matchesLevel = filterLevel === 'all' || c.attentionLevel === filterLevel;
    const matchesQuery =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.plainLanguageExplanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.pageOrSection && c.pageOrSection.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLevel && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              In-Depth Clause Analysis
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Important Clauses & Attention Classification
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Examine each provision in plain language alongside the verbatim contract language.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clauses..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-48 bg-stone-50"
              />
            </div>

            <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
              <button
                onClick={() => setFilterLevel('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                  filterLevel === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({clauses.length})
              </button>
              <button
                onClick={() => setFilterLevel('high_attention')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                  filterLevel === 'high_attention'
                    ? 'bg-rose-50 text-rose-800 shadow-2xs'
                    : 'text-stone-600 hover:text-rose-800'
                }`}
              >
                High
              </button>
              <button
                onClick={() => setFilterLevel('needs_attention')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                  filterLevel === 'needs_attention'
                    ? 'bg-amber-50 text-amber-800 shadow-2xs'
                    : 'text-stone-600 hover:text-amber-800'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setFilterLevel('informational')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                  filterLevel === 'informational'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Info
              </button>
            </div>
          </div>
        </div>

        {/* Clause Cards List */}
        <div className="space-y-4">
          {filteredClauses.length === 0 ? (
            <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-300">
              <FileText className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs text-stone-600">No clauses match the current filter.</p>
            </div>
          ) : (
            filteredClauses.map((clause) => {
              const isExpanded = expandedClauses[clause.id] ?? false;

              return (
                <div
                  key={clause.id}
                  className={`rounded-xl border transition p-5 ${
                    clause.attentionLevel === 'high_attention'
                      ? 'border-rose-200 bg-rose-50/20'
                      : clause.attentionLevel === 'needs_attention'
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getAttentionBadge(clause.attentionLevel)}
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                          {clause.pageOrSection || 'Section Reference'}
                        </span>
                        {clause.whoItAffects && (
                          <span className="text-[11px] text-stone-500 font-medium">
                            Affects: {clause.whoItAffects === 'user' ? 'You' : clause.whoItAffects === 'other_party' ? 'Other Party' : 'Both Parties'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-stone-900 tracking-tight">{clause.title}</h3>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => onExplainClauseModal(clause)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center space-x-1 transition"
                        title="Explain in different styles (e.g. explain like 15, one sentence, practical examples)"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Explain in Style</span>
                      </button>

                      <button
                        onClick={() => onAskAboutClause(clause.title)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1 transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Ask Assistant</span>
                      </button>
                    </div>
                  </div>

                  {/* Why this got flagged / attention rationale */}
                  <div className="mb-4 text-xs font-medium text-amber-900/90 bg-amber-100/50 px-3 py-1.5 rounded-lg border border-amber-200/60">
                    <span className="font-semibold">Review Guidance: </span>
                    {clause.attentionReason || 'This clause defines substantial contractual rights and obligations.'}
                  </div>

                  {/* Plain Language Explanation */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                      Plain-Language Meaning
                    </h4>
                    <p className="text-xs text-stone-700 leading-relaxed bg-white/80 p-3 rounded-lg border border-stone-200/80">
                      {clause.plainLanguageExplanation}
                    </p>
                  </div>

                  {/* Obligations & Consequences Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70">
                      <span className="text-[10px] font-bold uppercase text-stone-400 block mb-0.5">Your Obligation</span>
                      <p className="text-stone-800">{clause.userObligation || 'None'}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70">
                      <span className="text-[10px] font-bold uppercase text-stone-400 block mb-0.5">Other Party Obligation</span>
                      <p className="text-stone-800">{clause.otherPartyObligation || 'None'}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70">
                      <span className="text-[10px] font-bold uppercase text-stone-400 block mb-0.5">Potential Consequence</span>
                      <p className="text-stone-800">{clause.potentialConsequence || 'Standard compliance'}</p>
                    </div>
                  </div>

                  {/* Collapsible Original Clause Text */}
                  <div className="pt-2 border-t border-stone-200/60">
                    <button
                      onClick={() => toggleExpand(clause.id)}
                      className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center space-x-1"
                    >
                      <span>{isExpanded ? 'Hide Original Contract Language' : 'View Original Contract Language'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-3.5 rounded-lg bg-stone-900 text-stone-200 text-xs font-serif-legal leading-relaxed border border-stone-800">
                        <div className="text-[10px] uppercase font-mono text-stone-400 mb-1">
                          Verbatim Clause Quote:
                        </div>
                        <blockquote className="italic">{clause.originalText}</blockquote>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
