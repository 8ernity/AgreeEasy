import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Sparkles, Check, AlertCircle, ArrowRight, BookOpen, Layers, Clock, RotateCcw, X } from 'lucide-react';
import { SAMPLE_AGREEMENTS } from '../data/sampleAgreements';
import { SampleAgreement } from '../types';

interface DocumentUploadSectionProps {
  onAnalyze: (payload: { fileBase64?: string; mimeType?: string; fileName: string; textContent?: string }) => void;
  isLoading: boolean;
  analysisStep: string;
  analysisError?: string | null;
  onRetry?: () => void;
  onClearError?: () => void;
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  onAnalyze,
  isLoading,
  analysisStep,
  analysisError,
  onRetry,
  onClearError,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndProcessFile = (file: File) => {
    setUploadError(null);
    // 25MB max size limit
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File exceeds 25MB limit. Please upload a smaller document.');
      return;
    }

    const validTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'image/png',
      'image/jpeg',
      'image/webp',
    ];

    const extension = file.name.split('.').pop()?.toLowerCase();
    const isTxtOrPdf = extension === 'pdf' || extension === 'txt' || extension === 'md';

    if (!validTypes.includes(file.type) && !isTxtOrPdf) {
      setUploadError('Unsupported file type. Please upload a PDF, TXT, MD, or scanned image (PNG/JPEG).');
      return;
    }

    setSelectedFile(file);

    // Read file
    const reader = new FileReader();

    if (file.type === 'text/plain' || extension === 'txt' || extension === 'md') {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text || text.trim().length < 20) {
          setUploadError('The document appears empty or too short to analyze.');
          return;
        }
        onAnalyze({
          fileName: file.name,
          textContent: text,
        });
      };
      reader.readAsText(file);
    } else {
      // PDF or Image -> Convert to Base64 for multimodal Gemini processing
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) {
          setUploadError('Unable to read document content.');
          return;
        }
        const base64Data = result.split(',')[1];
        const mimeType = file.type || 'application/pdf';
        onAnalyze({
          fileBase64: base64Data,
          mimeType: mimeType,
          fileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleAgreement) => {
    setUploadError(null);
    onAnalyze({
      fileName: sample.filename,
      textContent: sample.content,
    });
  };

  const handleAnalyzePasted = () => {
    if (!pastedText.trim() || pastedText.trim().length < 30) {
      setUploadError('Please enter sufficient agreement text to analyze (at least a few clauses).');
      return;
    }
    setUploadError(null);
    onAnalyze({
      fileName: pastedTitle.trim() || 'Pasted Agreement',
      textContent: pastedText,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Introduction */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 mb-3">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
          Powered by Gemini 3.6 Flash
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 mb-3">
          Understand Contracts AgreeEasy
        </h1>
        <p className="text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Upload any contract or lease. We break down hidden obligations, automatic renewals, penalties, and payment
          terms into crystal-clear plain English.
        </p>
      </div>

      {uploadError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Document Upload Error</p>
            <p className="text-xs text-rose-700 mt-0.5">{uploadError}</p>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-rose-500 hover:text-rose-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {analysisError && (
        <div className="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-sm shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Agreement Analysis Notice</h4>
                <p className="text-xs text-stone-700 mt-1 leading-relaxed">{analysisError}</p>
                <p className="text-[11px] text-stone-500 mt-2">
                  Our system automatically leverages multiple Gemini models with automatic retries. You can click <strong>Retry Analysis</strong> or try one of the ready-to-test sample agreements below.
                </p>
              </div>
            </div>
            {onClearError && (
              <button
                onClick={onClearError}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {onRetry && (
            <div className="mt-3.5 pt-3 border-t border-amber-200/60 flex items-center justify-end space-x-2">
              <button
                onClick={onRetry}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs flex items-center space-x-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Analysis</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-10 text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin"></div>
            <FileText className="w-7 h-7 text-amber-600 absolute inset-0 m-auto animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-stone-900 mb-2">Analyzing Your Agreement</h3>
          <p className="text-sm text-stone-600 max-w-md mx-auto mb-6">
            Gemini is extracting clauses, identifying key parties, mapping monetary obligations, and detecting potential
            attention points...
          </p>

          <div className="max-w-md mx-auto bg-stone-50 rounded-xl p-4 border border-stone-200 text-left space-y-2.5">
            <div className="flex items-center space-x-2 text-xs text-stone-600">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
              <span className="font-medium text-stone-800">{analysisStep || 'Extracting clauses and sections...'}</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full animate-pulse w-3/4"></div>
            </div>
            <p className="text-[11px] text-stone-400 text-center">Typically takes 5-10 seconds for multi-page documents</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Upload / Drag-and-Drop Box */}
          {!pasteMode ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-white hover:bg-stone-50/80 ${
                dragActive
                  ? 'border-amber-500 bg-amber-50/50 shadow-lg scale-[1.01]'
                  : 'border-stone-300 hover:border-stone-400 shadow-sm'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt,.md,.png,.jpg,.jpeg"
                onChange={handleFileInputChange}
              />

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-semibold text-stone-900 mb-1">
                Drag and drop your agreement here, or{' '}
                <span className="text-amber-600 hover:text-amber-700 underline underline-offset-2">browse files</span>
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                Supports multi-page <strong>PDF</strong>, scanned contracts (PNG/JPG), and plain text agreements up to 25MB.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-stone-500">
                <span className="px-2.5 py-1 rounded-md bg-stone-100 font-medium">Rental Leases</span>
                <span className="px-2.5 py-1 rounded-md bg-stone-100 font-medium">Employment Contracts</span>
                <span className="px-2.5 py-1 rounded-md bg-stone-100 font-medium">NDAs</span>
                <span className="px-2.5 py-1 rounded-md bg-stone-100 font-medium">Freelance SOWs</span>
                <span className="px-2.5 py-1 rounded-md bg-stone-100 font-medium">Loan Agreements</span>
              </div>
            </div>
          ) : (
            /* Direct Text Paste Box */
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-900">Paste Agreement Text Directly</h3>
                <button
                  onClick={() => setPasteMode(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  Switch to file upload
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Agreement Title (Optional)</label>
                <input
                  type="text"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  placeholder="e.g. Consulting Agreement with Acme Corp"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Contract Text / Clauses</label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste contract text, sections, or terms here..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setPasteMode(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAnalyzePasted}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center space-x-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Contract Text</span>
                </button>
              </div>
            </div>
          )}

          {/* Toggle between File and Paste */}
          {!pasteMode && (
            <div className="text-center">
              <button
                id="switch-to-paste-btn"
                onClick={() => setPasteMode(true)}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium inline-flex items-center space-x-1 underline underline-offset-2"
              >
                <span>Or click here to paste raw agreement text directly</span>
              </button>
            </div>
          )}

          {/* Live Hackathon Demonstration Section: 1-Click Realistic Sample Contracts */}
          <div className="border-t border-stone-200 pt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Try Sample Realistic Agreements (Instant 1-Click Demo)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Select a realistic sample contract to immediately test the analysis, clauses, and conversational assistant:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SAMPLE_AGREEMENTS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="group bg-white p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {sample.badge}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">1-Click Test</span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition mb-1">
                      {sample.title}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
                      {sample.description}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-medium text-amber-700 group-hover:text-amber-800 pt-2 border-t border-stone-100">
                    <span>Analyze this agreement</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
