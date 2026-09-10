import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Calendar,
  ShieldAlert,
  AlertOctagon,
  HelpCircle,
  Search,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowLeftRight,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Header } from './components/Header';
import { LegalDisclaimerBanner } from './components/LegalDisclaimerBanner';
import { DocumentUploadSection } from './components/DocumentUploadSection';
import { OverviewAndFiveThings } from './components/OverviewAndFiveThings';
import { ClausesSection } from './components/ClausesSection';
import { FinancialSection } from './components/FinancialSection';
import { DatesAndDeadlinesSection } from './components/DatesAndDeadlinesSection';
import { ObligationsAndRestrictionsSection } from './components/ObligationsAndRestrictionsSection';
import { TerminationAndScenariosSection } from './components/TerminationAndScenariosSection';
import { AskBeforeSigningSection } from './components/AskBeforeSigningSection';
import { DocumentSearchAndExplainer } from './components/DocumentSearchAndExplainer';
import { CompareAgreementsSection } from './components/CompareAgreementsSection';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { AgreementAnalysis, ClauseAnalysisItem } from './types';

export default function App() {
  const [analysis, setAnalysis] = useState<AgreementAnalysis | null>(null);
  const [documentName, setDocumentName] = useState<string>('');
  const [documentText, setDocumentText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInitialQuestion, setChatInitialQuestion] = useState<string | null>(null);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [activeClauseToExplain, setActiveClauseToExplain] = useState<ClauseAnalysisItem | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<{
    fileBase64?: string;
    mimeType?: string;
    fileName: string;
    textContent?: string;
  } | null>(null);

  // Handle document submission for analysis
  const handleAnalyzeDocument = async (payload: {
    fileBase64?: string;
    mimeType?: string;
    fileName: string;
    textContent?: string;
  }) => {
    setIsLoading(true);
    setAnalysisError(null);
    setLastPayload(payload);
    setDocumentName(payload.fileName);
    setAnalysisStep('Reading document structure...');

    try {
      if (payload.textContent) {
        setDocumentText(payload.textContent);
      }

      setAnalysisStep('Querying Gemini model to parse clauses, terms, and obligations...');

      const res = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || 'Failed to analyze document.');
      }

      setAnalysisStep('Formatting plain-language breakdown and risk levels...');
      const data: AgreementAnalysis = await res.json();
      setAnalysis(data);

      // Store reconstructed text if text was not provided directly
      if (!payload.textContent && data.clauses) {
        const reconstructed = data.clauses.map((c) => `${c.title}\n${c.originalText}`).join('\n\n');
        setDocumentText(reconstructed);
      }

      setActiveTab('overview');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(
        err.message || 'An error occurred while analyzing the document. Please try again or test with a sample agreement.'
      );
    } finally {
      setIsLoading(false);
      setAnalysisStep('');
    }
  };

  const handleRetryLast = () => {
    if (lastPayload) {
      handleAnalyzeDocument(lastPayload);
    }
  };

  const handleClearDocument = () => {
    setAnalysis(null);
    setDocumentName('');
    setDocumentText('');
    setAnalysisError(null);
    setLastPayload(null);
    setActiveTab('overview');
    setIsChatOpen(false);
    setShowCompareModal(false);
    setActiveClauseToExplain(null);
  };

  const handleOpenChatWithQuestion = (question: string) => {
    setChatInitialQuestion(question);
    setIsChatOpen(true);
  };

  const handleExplainClauseModal = (clause: ClauseAnalysisItem) => {
    setActiveClauseToExplain(clause);
    setActiveTab('search_explain');
  };

  const tabs = [
    { id: 'overview', label: 'Overview & 5 Things', icon: FileText, count: analysis?.fiveThingsToKnow?.length },
    { id: 'clauses', label: 'Clauses & Risks', icon: ShieldAlert, count: analysis?.clauses?.length },
    { id: 'financial', label: 'Financial Terms', icon: DollarSign, count: analysis?.financialAnalysis?.items?.length },
    { id: 'dates', label: 'Dates & Deadlines', icon: Calendar, count: analysis?.datesAndDeadlines?.items?.length },
    {
      id: 'obligations',
      label: 'Obligations',
      icon: Layers,
      count:
        (analysis?.obligations?.userObligations?.length || 0) +
        (analysis?.obligations?.otherPartyObligations?.length || 0),
    },
    { id: 'termination', label: 'Exit & Scenarios', icon: AlertOctagon, count: analysis?.whatHappensIfScenarios?.length },
    {
      id: 'pre_signing',
      label: 'Ask & Negotiate',
      icon: HelpCircle,
      count: (analysis?.questionsToAsk?.length || 0) + (analysis?.negotiationSuggestions?.length || 0),
    },
    { id: 'search_explain', label: 'Search & Explainer', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col antialiased">
      {/* 1. Header */}
      <Header
        metadata={analysis?.metadata}
        documentName={documentName}
        hasDocument={!!analysis}
        onClearDocument={handleClearDocument}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCompare={() => setShowCompareModal(true)}
      />

      {/* 2. Legal Disclaimer Banner */}
      <LegalDisclaimerBanner />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {!analysis ? (
          /* Document Upload & 1-Click Demo Section */
          <DocumentUploadSection
            onAnalyze={handleAnalyzeDocument}
            isLoading={isLoading}
            analysisStep={analysisStep}
            analysisError={analysisError}
            onRetry={lastPayload ? handleRetryLast : undefined}
            onClearError={() => setAnalysisError(null)}
          />
        ) : (
          /* Agreement Workspace / Navigation Dashboard */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {/* Agreement Quick Title & Document Metadata Bar */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 font-mono">
                    {analysis.metadata?.agreementType || 'Contract'}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="text-xs text-stone-500 font-mono">
                    {analysis.clauses?.length || 0} Clauses Extracted
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  {documentName || analysis.metadata?.agreementType}
                </h1>
                <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                  {analysis.metadata?.purpose || 'Agreement overview and legal clause analysis'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="tab-open-compare-btn"
                  onClick={() => setShowCompareModal(true)}
                  className="px-3.5 py-2 text-xs font-medium rounded-xl border border-stone-300 hover:border-amber-400 bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center space-x-1.5 transition"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
                  <span>Compare Revision</span>
                </button>
                <button
                  id="tab-open-chat-btn"
                  onClick={() => setIsChatOpen(true)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center space-x-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat with Agreement</span>
                </button>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="border-b border-stone-200 mb-8 overflow-x-auto">
              <nav className="flex space-x-1 sm:space-x-2 min-w-max pb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      id={`nav-tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-3 px-3.5 text-xs font-semibold rounded-t-xl transition border-b-2 ${
                        isActive
                          ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                          : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                            isActive ? 'bg-amber-200 text-amber-900 font-bold' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Modal: Compare Agreements */}
            {showCompareModal && (
              <div className="mb-8">
                <CompareAgreementsSection
                  currentDocumentText={documentText}
                  currentDocumentName={documentName}
                  onClose={() => setShowCompareModal(false)}
                  onAskQuestion={handleOpenChatWithQuestion}
                />
              </div>
            )}

            {/* Active Tab View */}
            <div>
              {activeTab === 'overview' && (
                <OverviewAndFiveThings
                  analysis={analysis}
                  onSelectClause={() => setActiveTab('clauses')}
                  onAskQuestion={handleOpenChatWithQuestion}
                />
              )}

              {activeTab === 'clauses' && (
                <ClausesSection
                  clauses={analysis.clauses}
                  onExplainClauseModal={handleExplainClauseModal}
                  onAskAboutClause={handleOpenChatWithQuestion}
                />
              )}

              {activeTab === 'financial' && (
                <FinancialSection
                  financial={analysis.financialAnalysis}
                  onAskQuestion={handleOpenChatWithQuestion}
                />
              )}

              {activeTab === 'dates' && (
                <DatesAndDeadlinesSection
                  dates={analysis.datesAndDeadlines}
                  onAskQuestion={handleOpenChatWithQuestion}
                />
              )}

              {activeTab === 'obligations' && (
                <ObligationsAndRestrictionsSection
                  obligations={analysis.obligations}
                  restrictions={analysis.restrictions}
                  onAskQuestion={handleOpenChatWithQuestion}
                />
              )}

              {activeTab === 'termination' && (
                <TerminationAndScenariosSection
                  termination={analysis.terminationAnalysis}
                  scenarios={analysis.whatHappensIfScenarios}
                  onAskCustomScenario={(sc) => handleOpenChatWithQuestion(`What happens if: "${sc}" in this agreement?`)}
                  onAskQuestion={handleOpenChatWithQuestion}
                />
              )}

              {activeTab === 'pre_signing' && (
                <AskBeforeSigningSection
                  questions={analysis.questionsToAsk}
                  negotiations={analysis.negotiationSuggestions}
                  onAskQuestion={handleOpenChatWithQuestion}
                />
              )}

              {activeTab === 'search_explain' && (
                <DocumentSearchAndExplainer
                  documentText={documentText}
                  clauses={analysis.clauses}
                  missingInfo={analysis.missingInformation}
                  activeClauseToExplain={activeClauseToExplain}
                  onClearActiveClauseToExplain={() => setActiveClauseToExplain(null)}
                  onAskQuestion={handleOpenChatWithQuestion}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for Chat (when chat is closed and document is loaded) */}
      {analysis && !isChatOpen && (
        <button
          id="floating-chat-trigger"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-stone-900 hover:bg-black text-amber-400 font-semibold rounded-2xl shadow-xl flex items-center space-x-2.5 transition border border-stone-700 group hover:scale-105"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-xs text-white">Ask Agreement Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      )}

      {/* Conversational Agreement Chatbot Drawer */}
      <ChatbotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        documentText={documentText}
        documentName={documentName}
        metadata={analysis?.metadata}
        clauses={analysis?.clauses}
        initialQuestion={chatInitialQuestion}
        onClearInitialQuestion={() => setChatInitialQuestion(null)}
      />
    </div>
  );
}
