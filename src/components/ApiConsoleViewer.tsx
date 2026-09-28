/**
 * @file ApiConsoleViewer.tsx
 * @description Drawer/Modal de inspeção do Payload JSON para facilitar a integração dos desenvolvedores de Backend.
 */

import React, { useState } from 'react';
import { Terminal, Copy, Check, X, Code2, Send } from 'lucide-react';
import { EventReportPayload } from '../types';

interface ApiConsoleViewerProps {
  payload: EventReportPayload | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConsoleViewer: React.FC<ApiConsoleViewerProps> = ({
  payload,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payload) return null;

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="modal-api-inspector"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white font-mono flex items-center gap-2">
                <span>POST /api/v1/events</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-sans font-bold">
                  201 Created
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Payload JSON gerado para integração</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-copy-json"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar JSON'}</span>
            </button>
            <button
              type="button"
              id="btn-close-inspector"
              onClick={onClose}
              className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-5 overflow-y-auto font-mono text-xs text-slate-300 bg-[#0B1120] space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-400" /> Content-Type: application/json
            </span>
            <span className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-slate-500" /> Latência: 2.0s
            </span>
          </div>

          <pre className="text-emerald-300 overflow-x-auto p-4 rounded-2xl bg-slate-900 border border-slate-800/80 text-[11px] leading-relaxed">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Tamanho: ~{Math.round(jsonString.length / 1024 * 10) / 10} KB</span>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-400 hover:underline font-semibold"
          >
            Fechar Inspetor
          </button>
        </div>
      </div>
    </div>
  );
};
