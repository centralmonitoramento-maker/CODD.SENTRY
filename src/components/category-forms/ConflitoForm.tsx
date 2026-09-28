import React from 'react';
import { Users, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { ConflitoFormData } from '../../types';

interface ConflitoFormProps {
  data: ConflitoFormData;
  onChange: (updated: ConflitoFormData) => void;
  errors?: Record<string, string>;
}

const PARTIES_OPTIONS = [
  'Cliente x Colaborador (Frente de Caixa)',
  'Cliente x Cliente (Fila / Estacionamento)',
  'Colaborador x Colaborador (Interno)',
  'Terceirizado / Promotor x Colaborador',
  'Cliente x Equipe de Prevenção / Segurança',
  'Visitante / Fornecedor x Funcionário',
];

const TRIGGER_REASONS = [
  'Divergência de preço no PDV / Cupom fiscal',
  'Fiscalização / Abordagem orientativa de segurança',
  'Disputa de preferência na fila / carrinho',
  'Desentendimento no estacionamento / vaga',
  'Reclamação severa de atendimento / demora',
  'Embriaguez / Estado alterado de cliente',
];

const RESOLUTION_ACTIONS = [
  'Mediação pacífica realizada pela Gerência',
  'Condução das partes para sala reservada / Ouvidoria',
  'Evasão pacífica de uma das partes do estabelecimento',
  'Polícia Militar acionada para registro formal',
  'Apoio do SAMU / Resgate para contenção',
];

export const ConflitoForm: React.FC<ConflitoFormProps> = ({ data, onChange, errors }) => {
  const updateField = <K extends keyof ConflitoFormData>(field: K, val: ConflitoFormData[K]) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 animate-fadeIn" id="form-category-conflito">
      {/* Header Informativo */}
      <div className="flex items-center justify-between pb-2 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Formulário de Ocorrência: Conflito</h3>
            <p className="text-[11px] text-slate-500 font-medium">Desentendimento, agressão verbal ou física</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
          Ordem & Conduta
        </span>
      </div>

      {/* 1. Partes Envolvidas */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Partes Envolvidas</span>
          <span className="text-purple-600 font-bold">*</span>
        </label>
        <select
          id="conflito-select-parties"
          value={data.involvedParties}
          onChange={(e) => updateField('involvedParties', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
        >
          {PARTIES_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Motivo Desencadeador */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Motivo / Causa Primária</span>
          <span className="text-purple-600 font-bold">*</span>
        </label>
        <select
          id="conflito-select-reason"
          value={data.triggerReason}
          onChange={(e) => updateField('triggerReason', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
        >
          {TRIGGER_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Intensidade do Conflito */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
          Nível de Escalada / Intensidade
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'verbal', label: 'Verbal / Insultos' },
            { id: 'ameaca', label: 'Ameaça' },
            { id: 'fisica', label: 'Vias de Fato' },
            { id: 'arma_ou_objeto', label: 'Objeto / Arma' },
          ].map((int) => {
            const isSelected = data.conflictIntensity === int.id;
            return (
              <button
                key={int.id}
                type="button"
                id={`conflito-int-${int.id}`}
                onClick={() => updateField('conflictIntensity', int.id as any)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                  isSelected
                    ? 'bg-purple-50 text-purple-800 border-purple-300 ring-2 ring-purple-500/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {int.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Desfecho / Mediação */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Intervenção / Desfecho Adotado</span>
          <span className="text-purple-600 font-bold">*</span>
        </label>
        <select
          id="conflito-select-action"
          value={data.resolutionAction}
          onChange={(e) => updateField('resolutionAction', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
        >
          {RESOLUTION_ACTIONS.map((res) => (
            <option key={res} value={res}>
              {res}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Toggles Rápidos (Polícia & Médico) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          id="conflito-toggle-police"
          onClick={() => updateField('policeCalled', !data.policeCalled)}
          className={`h-11 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
            data.policeCalled
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>{data.policeCalled ? 'Polícia Militar Acionada' : 'Sem Acionamento Policial'}</span>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${data.policeCalled ? 'bg-white text-purple-600' : 'bg-slate-200 text-slate-500'}`}>
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        </button>

        <button
          type="button"
          id="conflito-toggle-medical"
          onClick={() => updateField('medicalSupportNeeded', !data.medicalSupportNeeded)}
          className={`h-11 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
            data.medicalSupportNeeded
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>{data.medicalSupportNeeded ? 'Atendimento Médico Requerido' : 'Sem Lesão / Socorro Médico'}</span>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${data.medicalSupportNeeded ? 'bg-white text-rose-600' : 'bg-slate-200 text-slate-500'}`}>
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        </button>
      </div>
    </div>
  );
};
