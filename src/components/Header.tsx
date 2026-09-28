/**
 * @file Header.tsx
 * @description Cabeçalho padrão mobile-first com botão de voltar, título e status de prontidão.
 */

import React from 'react';
import { ArrowLeft, Radio, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onBack?: () => void;
  onReset?: () => void;
  isDirty?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onBack, onReset, isDirty }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-5 py-4 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Botão de Voltar com feedback tátil */}
        <button
          type="button"
          id="btn-header-back"
          onClick={onBack}
          aria-label="Voltar para a tela anterior"
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Título Centralizado com Status */}
        <div className="flex-1 min-w-0 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">
              Reportar Novo Evento
            </h1>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1 mt-0.5">
            <Radio className="w-3 h-3 text-blue-500 inline" />
            Central de Monitoramento
          </p>
        </div>

        {/* Ação secundária: Limpar/Resetar se houver alterações */}
        <div className="w-10 flex justify-end">
          {isDirty ? (
            <button
              type="button"
              id="btn-header-reset"
              onClick={onReset}
              title="Limpar formulário"
              aria-label="Limpar formulário"
              className="flex items-center justify-center w-9 h-9 rounded-full text-slate-400 hover:text-amber-600 hover:bg-slate-50 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <span className="w-9 h-9" />
          )}
        </div>
      </div>
    </header>
  );
};
