/**
 * @file BranchSelector.tsx
 * @description Caixa de seleção da Filial / Unidade da ocorrência.
 * Posicionada como primeira opção no formulário de registro de eventos.
 */

import React, { useState, useMemo } from 'react';
import { Building2, ChevronDown, Check, Search, AlertCircle, MapPin } from 'lucide-react';
import { BRANCH_OPTIONS } from '../services/eventService';

interface BranchSelectorProps {
  value: string;
  onChange: (branch: string) => void;
  error?: string;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpenModal, setIsOpenModal] = useState(false);

  // Filtragem inteligente de filiais
  const filteredBranches = useMemo(() => {
    if (!searchTerm.trim()) return BRANCH_OPTIONS;
    const term = searchTerm.toLowerCase();
    return BRANCH_OPTIONS.filter((b) => b.toLowerCase().includes(term));
  }, [searchTerm]);

  const selectedCode = value ? value.split(' - ')[0] : null;
  const selectedName = value ? (value.includes(' - ') ? value.split(' - ')[1] : value) : null;

  return (
    <div className="space-y-2.5" id="section-branch-selector">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="select-branch-native"
          className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Filial / Unidade</span>
          <span className="text-blue-600 font-bold">*</span>
        </label>
        {value && (
          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 animate-fadeIn">
            {selectedCode || 'UNIDADE'}
          </span>
        )}
      </div>

      {/* Select Principal */}
      <div className="relative">
        <select
          id="select-branch-native"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none h-[52px] px-4 pl-11 pr-10 rounded-2xl font-semibold text-sm transition-all outline-none cursor-pointer ${
            error
              ? 'bg-rose-50 border-2 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-500/20'
              : value
              ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              : 'bg-slate-50 border border-slate-200 text-slate-500 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          }`}
        >
          <option value="" disabled className="text-slate-400 font-normal">
            Selecione a filial da ocorrência...
          </option>
          {BRANCH_OPTIONS.map((branch) => (
            <option key={branch} value={branch} className="text-slate-900 py-2 font-medium">
              {branch}
            </option>
          ))}
        </select>

        {/* Ícone de Prédio à Esquerda */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <Building2 className={`w-4 h-4 ${value ? 'text-blue-600' : 'text-slate-400'}`} />
        </div>

        {/* Ícone Chevron à Direita */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Botão de Busca Rápida / Modal para Mobile */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          id="btn-search-branch-modal"
          onClick={() => setIsOpenModal(true)}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
        >
          <Search className="w-3 h-3" />
          Pesquisar por nome ou número ({BRANCH_OPTIONS.length} filiais)
        </button>

        {value && (
          <span className="text-[10px] text-slate-400 truncate max-w-[170px]">
            {selectedName}
          </span>
        )}
      </div>

      {/* Modal / Dialog de Pesquisa Rápida de Filiais */}
      {isOpenModal && (
        <div 
          id="modal-branch-search"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
        >
          <div className="bg-white border border-slate-100 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
            {/* Header do Modal */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Selecionar Filial</h3>
                  <p className="text-[11px] text-slate-500">Escolha a unidade de monitoramento</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpenModal(false);
                  setSearchTerm('');
                }}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>

            {/* Input de Busca */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  id="input-search-branch"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por código ou cidade (ex: 01, Ceilândia, SIA)..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de Filiais */}
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100">
              {filteredBranches.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhuma filial encontrada para &ldquo;{searchTerm}&rdquo;.
                </div>
              ) : (
                filteredBranches.map((branch) => {
                  const isSelected = value === branch;
                  const [code, ...rest] = branch.split(' - ');
                  const name = rest.join(' - ') || branch;

                  return (
                    <button
                      key={branch}
                      type="button"
                      id={`btn-branch-opt-${code.replace(/\s+/g, '-')}`}
                      onClick={() => {
                        onChange(branch);
                        setIsOpenModal(false);
                        setSearchTerm('');
                      }}
                      className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                          : 'hover:bg-slate-50 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {code}
                        </span>
                        <div>
                          <span className="text-xs block">{name}</span>
                          <span className="text-[10px] text-slate-400">{branch}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Erro de Validação */}
      {error && (
        <div
          id="error-branch-selector"
          role="alert"
          className="flex items-center gap-1.5 text-xs text-rose-600 font-medium px-3.5 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 animate-shake"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
