import React from 'react';
import { FileText, ShieldAlert, Sparkles, MessageSquare, Trash2, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { AgreementMetadata } from '../types';

interface HeaderProps {
  metadata?: AgreementMetadata;
  documentName?: string;
  hasDocument: boolean;
  onClearDocument: () => void;
  onOpenChat: () => void;
  isChatOpen: boolean;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenCompare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metadata,
  documentName,
  hasDocument,
  onClearDocument,
  onOpenChat,
  isChatOpen,
  activeTab,
  onSelectTab,
  onOpenCompare,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and App Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">AgreeEasy</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-3 h-3 mr-1" /> Gemini 3.6 Intelligence
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">Plain-Language Agreement Analysis & Assistant</p>
            </div>
          </div>

          {/* Document Status & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {hasDocument && metadata ? (
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-stone-200 truncate max-w-[180px]">
                    {metadata.agreementType || documentName}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-700 text-stone-300">
                    {metadata.confidence} confidence
                  </span>
                </div>

                <button
                  id="compare-agreements-btn"
                  onClick={onOpenCompare}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition"
                  title="Compare with another document or draft"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Compare Drafts</span>
                </button>

                <button
                  id="toggle-chat-header-btn"
                  onClick={onOpenChat}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    isChatOpen
                      ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                      : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30'
                  }`}
                  title="Open Chat Assistant"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Assistant</span>
                </button>

                <button
                  id="clear-document-btn"
                  onClick={onClearDocument}
                  className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition"
                  title="Clear document & reset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="text-xs text-stone-400 flex items-center">
                <ShieldAlert className="w-4 h-4 text-amber-400 mr-1.5" />
                No agreement loaded
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
