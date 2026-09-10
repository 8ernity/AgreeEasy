import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Lock } from 'lucide-react';

export const LegalDisclaimerBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="font-medium text-stone-700">
            <span className="font-semibold text-stone-900">Educational Assistant:</span> "AgreeEasy" translates
            complex contractual terms into plain language. It does not provide legal advice.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-stone-600 shrink-0">
          <div className="flex items-center space-x-1 text-stone-500">
            <Lock className="w-3 h-3 text-stone-400" />
            <span className="text-[11px]">Private Session</span>
          </div>
          <button
            id="toggle-disclaimer-details"
            onClick={() => setExpanded(!expanded)}
            className="text-amber-700 hover:text-amber-900 font-medium underline inline-flex items-center space-x-0.5"
          >
            <span>{expanded ? 'Hide Safety Notice' : 'Full Disclaimer & Privacy'}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 pt-1 text-stone-600 border-t border-amber-500/15 text-[11px] leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/70 p-3 rounded-lg border border-amber-500/20 mt-1">
            <div className="flex space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-800">Not Legal Advice:</strong> This application is powered by Gemini to
                help you understand contract terminology and flag points of attention. It is not an attorney, law firm,
                or substitute for qualified legal counsel. Laws vary widely across state, federal, and international
                jurisdictions. For critical, high-stakes, or life-altering contracts, always consult an attorney licensed
                in your jurisdiction.
              </div>
            </div>
            <div className="flex space-x-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-800">Privacy & Confidentiality:</strong> Your uploaded documents are
                processed securely via server-side Gemini API calls. Documents are never made public, stored in public URLs,
                or shared with other users. You can clear the document and conversation at any time.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
