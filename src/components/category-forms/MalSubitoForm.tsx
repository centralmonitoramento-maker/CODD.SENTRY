import React from 'react';
import { HeartPulse, CheckCircle2, AlertTriangle, PhoneCall } from 'lucide-react';
import { MalSubitoFormData } from '../../types';

interface MalSubitoFormProps {
  data: MalSubitoFormData;
  onChange: (updated: MalSubitoFormData) => void;
  errors?: Record<string, string>;
}

const VICTIM_PROFILES = [
  'Cliente',
  'Colaborador Interno da Loja',
  'Promotor de Vendas / Terceirizado',
  'Idoso / Preferencial',
  'Criança / Menor de Idade',
  'Prestador de Serviço de Manutenção',
];

const SYMPTOM_OPTIONS = [
  'Desmaio / Síncope com perda transitória de consciência',
  'Dor intensa no peito / Suspeita de infarto',
  'Crise convulsiva / Espasmos musculares',
  'Queda abrupta de pressão arterial / Tontura severa',
  'Crise respiratória / Falta de ar / Choque anafilático',
  'Crise de ansiedade aguda / Pânico',
  'Hipoglicemia / Mal-estar súbito',
];

const EMERGENCY_SERVICES = [
  'SAMU 192 acionado',
  'Corpo de Bombeiros 193 acionado',
  'Socorrido por familiares / Meios próprios',
  'Atendimento inicial por brigadistas internos',
  'Recusa de socorro médico pelo indivíduo',
];

const COMPANION_STATUS = [
  'Acompanhado por familiar no local',
  'Acompanhado por colega de trabalho',
  'Desacompanhado (Identificado por documentos)',
  'Desacompanhado (Não identificado)',
];

export const MalSubitoForm: React.FC<MalSubitoFormProps> = ({ data, onChange, errors }) => {
  const updateField = <K extends keyof MalSubitoFormData>(field: K, val: MalSubitoFormData[K]) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 animate-fadeIn" id="form-category-mal-subito">
      {/* Header Informativo */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Formulário de Ocorrência: Mal Súbito</h3>
            <p className="text-[11px] text-slate-500 font-medium">Emergência médica e socorro a pessoas na unidade</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Urgência Médica
        </span>
      </div>

      {/* 1. Perfil da Pessoa Atendida */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Perfil da Vítima / Pessoa Atendida</span>
          <span className="text-emerald-600 font-bold">*</span>
        </label>
        <select
          id="mal-select-profile"
          value={data.victimProfile}
          onChange={(e) => updateField('victimProfile', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
        >
          {VICTIM_PROFILES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Sintoma Observado */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Sintoma Primário Observado</span>
          <span className="text-emerald-600 font-bold">*</span>
        </label>
        <select
          id="mal-select-symptom"
          value={data.symptomObserved}
          onChange={(e) => updateField('symptomObserved', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
        >
          {SYMPTOM_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Acionamento de Resgate */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Acionamento de Emergência / Resgate</span>
          <span className="text-emerald-600 font-bold">*</span>
        </label>
        <select
          id="mal-select-emergency"
          value={data.emergencyServiceContacted}
          onChange={(e) => updateField('emergencyServiceContacted', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
        >
          {EMERGENCY_SERVICES.map((em) => (
            <option key={em} value={em}>
              {em}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Estado Atual da Vítima */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
          Estado Clínico Atual
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'consciente', label: 'Consciente' },
            { id: 'inconsciente', label: 'Inconsciente' },
            { id: 'atendimento_medico', label: 'Em Atendimento' },
            { id: 'removido_hospital', label: 'Para Hospital' },
          ].map((st) => {
            const isSelected = data.victimState === st.id;
            return (
              <button
                key={st.id}
                type="button"
                id={`mal-st-${st.id}`}
                onClick={() => updateField('victimState', st.id as any)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Acompanhamento */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Acompanhante / Testemunha</span>
          <span className="text-emerald-600 font-bold">*</span>
        </label>
        <select
          id="mal-select-companion"
          value={data.companionStatus}
          onChange={(e) => updateField('companionStatus', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
        >
          {COMPANION_STATUS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
