import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  HelpCircle,
  FileQuestion,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';
import { ClauseAnalysisItem, MissingInformationItem, SearchResultItem, ClauseExplanationResult } from '../types';

interface DocumentSearchAndExplainerProps {
  documentText?: string;
  clauses: ClauseAnalysisItem[];
  missingInfo: MissingInformationItem[];
  activeClauseToExplain?: ClauseAnalysisItem | null;
  onClearActiveClauseToExplain?: () => void;
  onAskQuestion: (question: string) => void;
}

export const DocumentSearchAndExplainer: React.FC<DocumentSearchAndExplainerProps> = ({
  documentText,
  clauses,
  missingInfo,
  activeClauseToExplain,
  onClearActiveClauseToExplain,
  onAskQuestion,
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Clause Explainer state
  const [selectedClauseId, setSelectedClauseId] = useState<string>(activeClauseToExplain?.id || clauses[0]?.id || '');
  const [customClauseText, setCustomClauseText] = useState<string>(activeClauseToExplain?.originalText || '');
  const [clauseTitle, setClauseTitle] = useState<string>(activeClauseToExplain?.title || '');
  const [selectedStyle, setSelectedStyle] = useState<string>('simple');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationResult, setExplanationResult] = useState<ClauseExplanationResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Update when external active clause changes
  React.useEffect(() => {
    if (activeClauseToExplain) {
      setSelectedClauseId(activeClauseToExplain.id);
      setCustomClauseText(activeClauseToExplain.originalText);
      setClauseTitle(activeClauseToExplain.title);
    }
  }, [activeClauseToExplain]);

  const handleSelectPredefinedClause = (id: string) => {
    setSelectedClauseId(id);
    const found = clauses.find((c) => c.id === id);
    if (found) {
      setCustomClauseText(found.originalText);
      setClauseTitle(found.title);
    }
  };

  const handleRunSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch('/api/search-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          documentText: documentText || '',
          clauses: clauses,
        }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExplainClause = async () => {
    if (!customClauseText.trim() && !clauseTitle.trim()) return;

    setIsExplaining(true);
    try {
      const res = await fetch('/api/explain-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseTitle: clauseTitle || 'Clause',
          clauseText: customClauseText,
          style: selectedStyle,
          documentContext: documentText?.slice(0, 1000) || '',
        }),
      });
      const data = await res.json();
      setExplanationResult(data);
    } catch (err) {
      console.error('Explain error:', err);
    } finally {
      setIsExplaining(false);
    }
  };

  const sampleSearchQueries = [
    'Find every mention of termination and notice',
    'Where does it talk about payment and late fees?',
    'Find clauses related to confidentiality and secrets',
    'Show me all penalties and liabilities',
  ];

  const stylesList = [
    { id: 'simple', label: 'Simple', desc: 'Clear everyday language' },
    { id: 'detailed', label: 'Detailed', desc: 'In-depth legal nuance' },
    { id: 'example', label: 'Real-World Example', desc: 'Practical scenario' },
    { id: 'consequence', label: 'Consequences', desc: 'Risk & breach impact' },
    { id: 'explain_like_15', label: 'Explain like I’m 15', desc: 'Easy analogies' },
    { id: 'one_sentence', label: 'One Sentence', desc: 'Single punchy summary' },
    { id: 'questions', label: 'Questions to Ask', desc: 'Questions for other party' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Natural Language Document Search */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Contract Navigation
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Semantic Document Search</h2>
            <p className="text-xs text-stone-500 mt-1">
              Ask questions or search themes like "penalties", "confidentiality duration", or "move-out deadlines".
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-stone-100 text-stone-700">
            Natural Language Query
          </span>
        </div>

        <form onSubmit={handleRunSearch} className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Find every mention of termination or Show me all deposit rules..."
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search Document</span>
            </button>
          </div>
        </form>

        {/* Quick query chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-[11px] text-stone-400 self-center">Try:</span>
          {sampleSearchQueries.map((query, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearchQuery(query);
                setTimeout(() => handleRunSearch(), 50);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
            >
              "{query}"
            </button>
          ))}
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="p-8 text-center bg-stone-50 rounded-xl">
            <Loader2 className="w-6 h-6 text-amber-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-stone-600">Scanning all clauses and text for matching provisions...</p>
          </div>
        )}

        {!isSearching && hasSearched && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Results Found ({searchResults.length})
            </h4>
            {searchResults.length === 0 ? (
              <p className="text-xs text-stone-500 p-4 bg-stone-50 rounded-xl">
                No matching provisions found in this agreement for "{searchQuery}".
              </p>
            ) : (
              searchResults.map((res, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-900">{res.clauseTitle}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-stone-600 border border-stone-200">
                      {res.sectionOrPage || 'Section Reference'}
                    </span>
                  </div>
                  <blockquote className="p-2.5 rounded-lg bg-white border border-stone-200 text-xs font-serif-legal italic text-stone-800 mb-2">
                    "{res.snippet}"
                  </blockquote>
                  <p className="text-xs text-amber-800 font-medium">{res.relevanceExplanation}</p>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* 2. Explain Any Clause in Custom Styles */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Interactive Stylistic Explainer
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Explain Any Clause in Your Style</h2>
            <p className="text-xs text-stone-500 mt-1">
              Select any clause from this agreement or paste custom wording, then choose your preferred explanation tone.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            7 Dynamic Explanation Styles
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column: Clause Selection & Input */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                Choose a Clause from this Agreement:
              </label>
              <select
                value={selectedClauseId}
                onChange={(e) => handleSelectPredefinedClause(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
              >
                {clauses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.pageOrSection ? `[${c.pageOrSection}] ` : ''}
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                Verbatim Clause Text (or custom text):
              </label>
              <textarea
                rows={4}
                value={customClauseText}
                onChange={(e) => setCustomClauseText(e.target.value)}
                placeholder="Verbatim text of the clause to explain..."
                className="w-full px-3 py-2 text-xs font-serif-legal rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
              ></textarea>
            </div>
          </div>

          {/* Right Column: Style Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-2">
              Select Explanation Style:
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {stylesList.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setSelectedStyle(st.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition text-xs flex items-center justify-between ${
                    selectedStyle === st.id
                      ? 'bg-amber-50 border-amber-400 text-amber-900 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div>
                    <div className="font-bold">{st.label}</div>
                    <div className="text-[10px] text-stone-500 font-normal">{st.desc}</div>
                  </div>
                  {selectedStyle === st.id && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                </div>
              ))}
            </div>

            <button
              onClick={handleExplainClause}
              disabled={isExplaining || !customClauseText.trim()}
              className="mt-4 w-full py-2.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
            >
              {isExplaining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Explanation</span>
            </button>
          </div>
        </div>

        {/* Output Area */}
        {explanationResult && (
          <div className="p-5 rounded-xl bg-stone-50 border border-amber-300 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-200">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-stone-900">{explanationResult.clauseTitle}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  {explanationResult.style} style
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(explanationResult.explanation);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs text-stone-600 hover:text-stone-900 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="mb-4 text-xs text-stone-800 leading-relaxed whitespace-pre-line">
              {explanationResult.explanation}
            </div>

            {explanationResult.keyTakeaway && (
              <div className="p-3 rounded-lg bg-amber-100/60 text-xs text-amber-950 font-medium mb-3">
                <span className="font-bold">Key Takeaway: </span>
                {explanationResult.keyTakeaway}
              </div>
            )}

            {explanationResult.practicalExample && (
              <div className="p-3 rounded-lg bg-white border border-stone-200 text-xs text-stone-700 mb-3">
                <span className="font-bold text-stone-900 block mb-1">Practical Real-World Example:</span>
                {explanationResult.practicalExample}
              </div>
            )}

            {explanationResult.questionsToAsk && explanationResult.questionsToAsk.length > 0 && (
              <div className="text-xs">
                <span className="font-bold text-stone-900 block mb-1">Questions You Should Ask:</span>
                <ul className="list-disc list-inside space-y-1 text-stone-600">
                  {explanationResult.questionsToAsk.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. Missing Information Detection */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Gap Detection
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Missing or Unclear Information</h2>
            <p className="text-xs text-stone-500 mt-1">
              Important terms, procedures, or deadlines that appear absent or ambiguous in the uploaded contract.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-stone-100 text-stone-700">
            «“The agreement does not specify...”»
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missingInfo && missingInfo.length > 0 ? (
            missingInfo.map((item, idx) => (
              <div key={item.id || idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        item.status === 'completely_absent'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 mb-1">{item.item}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    <span className="font-semibold text-stone-700">Why it matters: </span>
                    {item.whyItIsImportant}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200 text-xs">
                  <div className="text-stone-700 font-medium">
                    <span className="text-amber-800 font-bold">Recommendation: </span>
                    {item.recommendation}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-500 col-span-2">No missing information detected.</p>
          )}
        </div>
      </section>
    </div>
  );
};
