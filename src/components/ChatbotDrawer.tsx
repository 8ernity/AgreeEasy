import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Sparkles,
  Loader2,
  FileText,
  HelpCircle,
  ShieldCheck,
  Compass,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AgreementMetadata, ChatMessage, ClauseAnalysisItem, SourceReference } from '../types';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentText: string;
  documentName: string;
  metadata?: AgreementMetadata;
  clauses?: ClauseAnalysisItem[];
  initialQuestion?: string | null;
  onClearInitialQuestion?: () => void;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  documentText,
  documentName,
  metadata,
  clauses,
  initialQuestion,
  onClearInitialQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your agreement assistant for "${documentName || 'this agreement'}". I can explain any clause in plain language, verify deadlines and fees, stress-test "what happens if" scenarios, and cite the exact sections. How can I help you review this contract?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'What am I responsible for?',
    'How much do I have to pay, and are there penalties?',
    'Can I terminate early and what notice is required?',
    'Who owns the intellectual property or work?',
    'Does this agreement renew automatically?',
    'Summarize this agreement in 5 bullet points.',
    'What clauses should I consider negotiating?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle incoming initial question triggered from other components
  useEffect(() => {
    if (initialQuestion && isOpen) {
      handleSendMessage(initialQuestion);
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
  }, [initialQuestion, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsSending(true);

    try {
      // Build conversation history for API
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          sender: m.sender,
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          documentText: documentText,
          documentName: documentName,
          metadata: metadata,
          clauses: clauses,
          history: history,
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text || "I couldn't process this query.",
        sourceReferences: data.sourceReferences || [],
        uncertaintyLevel: data.uncertaintyLevel,
        certaintyBreakdown: data.certaintyBreakdown,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an error connecting to the assistant. Please try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: `Chat reset. I am ready to answer any questions about "${documentName}". What would you like to know?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      id="chatbot-drawer"
      className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white border-l border-stone-300 shadow-2xl z-50 flex flex-col transition-all duration-300"
    >
      {/* Drawer Header */}
      <div className="p-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight">Agreement Assistant</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                Grounding Active
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate max-w-[260px]">{documentName || 'Active Agreement'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleResetChat}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="p-2.5 bg-stone-100 border-b border-stone-200 flex items-center space-x-2 overflow-x-auto text-[11px]">
        <span className="text-stone-400 shrink-0 font-medium ml-1">Prompts:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-stone-300 hover:border-amber-400 text-stone-700 hover:text-stone-900 transition shadow-2xs whitespace-nowrap"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-stone-900 text-stone-100 rounded-tr-xs shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line mb-2">{msg.text}</div>

                {/* 3-Tier Certainty breakdown if provided */}
                {msg.certaintyBreakdown && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-2 text-[11px]">
                    {msg.certaintyBreakdown.explicitText && (
                      <div className="p-2 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                        <strong className="block text-[10px] uppercase text-emerald-800">
                          Document Explicitly States:
                        </strong>
                        {msg.certaintyBreakdown.explicitText}
                      </div>
                    )}
                    {msg.certaintyBreakdown.inference && (
                      <div className="p-2 rounded bg-blue-50 text-blue-900 border border-blue-200">
                        <strong className="block text-[10px] uppercase text-blue-800">Reasonable Inference:</strong>
                        {msg.certaintyBreakdown.inference}
                      </div>
                    )}
                    {msg.certaintyBreakdown.notSpecified && (
                      <div className="p-2 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        <strong className="block text-[10px] uppercase text-stone-500">Not Specified in Text:</strong>
                        {msg.certaintyBreakdown.notSpecified}
                      </div>
                    )}
                  </div>
                )}

                {/* Source Citing Badges */}
                {msg.sourceReferences && msg.sourceReferences.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-stone-100">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">
                      Cited Sources / Clauses:
                    </span>
                    <div className="space-y-1.5">
                      {msg.sourceReferences.map((src, sIdx) => (
                        <div key={sIdx} className="p-2 rounded bg-stone-50 border border-stone-200 text-[11px]">
                          <div className="flex items-center justify-between font-semibold text-stone-900">
                            <span>{src.sectionName || src.clauseNumber || 'Section Citation'}</span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              {src.pageNumber || src.clauseNumber || 'Section'}
                            </span>
                          </div>
                          {src.quote && (
                            <blockquote className="mt-1 font-serif-legal italic text-stone-600 text-[10px]">
                              "{src.quote}"
                            </blockquote>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 flex justify-end ${
                    isUser ? 'text-stone-400' : 'text-stone-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-xs p-3.5 text-xs text-stone-600 flex items-center space-x-2 shadow-2xs">
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Reviewing agreement clauses and drafting response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-white border-t border-stone-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this agreement..."
            disabled={isSending}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition disabled:opacity-40 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-stone-400 text-center mt-1.5">
          Answers cite exact contract clauses. Informational only, not legal advice.
        </p>
      </div>
    </div>
  );
};
