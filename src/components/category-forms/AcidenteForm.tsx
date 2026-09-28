import React from 'react';
import { AlertTriangle, Check, HeartCrack, ShieldAlert } from 'lucide-react';
import { AcidenteFormData } from '../../types';

interface AcidenteFormProps {
  data: AcidenteFormData;
  onChange: (updated: AcidenteFormData) => void;
  errors?: Record<string, string>;
}

const ACCIDENT_TYPES = [
  'Queda de mesmo nível / Escorregão em piso',
  'Queda de mercadoria / Palete desestabilizado',
  'Queda de altura / Escada / Mezanino',
  'Corte / Perfuração por ferramenta / estilete',
  'Prensamento de membro em equipamento / maquinário',
  'Impacto contra coluna / prateleira / obstáculo',
  'Queimadura térmica ou química',
];

const VICTIM_CATEGORIES = [
  'Colaborador CLT da Loja',
  'Promotor de Vendas / Terceirizado',
  'Cliente / Consumidor',
  'Prestador de Manutenção / Obra',
  'Motorista / Ajudante de Carga',
];

const BODY_PARTS = [
  'Membros Superiores (Mão / Dedo / Braço / Punho)',
  'Membros Inferiores (Pé / Tornozelo / Perna / Joelho)',
  'Cabeça / Face / Olhos',
  'Coluna / Lombar / Tronco / Costelas',
  'Múltiplas lesões / Todo o corpo',
];

export const AcidenteForm: React.FC<AcidenteFormProps> = ({ data, onChange, errors }) => {
  const updateField = <K extends keyof AcidenteFormData>(field: K, val: AcidenteFormData[K]) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 animate-fadeIn" id="form-category-acidente">
      {/* Header Informativo */}
      <div className="flex items-center justify-between pb-2 border-b border-red-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Formulário de Ocorrência: Acidente</h3>
            <p className="text-[11px] text-slate-500 font-medium">Acidente de trabalho, queda ou lesão na unidade</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
          Segurança do Trabalho
        </span>
      </div>

      {/* 1. Tipo de Acidente */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Tipo de Acidente / Ocorrência</span>
          <span className="text-red-600 font-bold">*</span>
        </label>
        <select
          id="acidente-select-type"
          value={data.accidentType}
          onChange={(e) => updateField('accidentType', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
        >
          {ACCIDENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Categoria da Pessoa Atingida */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Vítima / Categoria do Envolvido</span>
          <span className="text-red-600 font-bold">*</span>
        </label>
        <select
          id="acidente-select-victim"
          value={data.victimCategory}
          onChange={(e) => updateField('victimCategory', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
        >
          {VICTIM_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Parte do Corpo Atingida */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Região do Corpo Atingida</span>
          <span className="text-red-600 font-bold">*</span>
        </label>
        <select
          id="acidente-select-body"
          value={data.bodyPartAffected}
          onChange={(e) => updateField('bodyPartAffected', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
        >
          {BODY_PARTS.map((bp) => (
            <option key={bp} value={bp}>
              {bp}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Gravidade da Lesão */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
          Gravidade da Lesão
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'leve', label: 'Leve (Primeiros Socorros)' },
            { id: 'moderada', label: 'Moderada (Pronto-Socorro)' },
            { id: 'grave', label: 'Grave (Internação / SAMU)' },
          ].map((sev) => {
            const isSelected = data.injurySeverity === sev.id;
            return (
              <button
                key={sev.id}
                type="button"
                id={`acidente-sev-${sev.id}`}
                onClick={() => updateField('injurySeverity', sev.id as any)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                  isSelected
                    ? 'bg-red-50 text-red-800 border-red-300 ring-2 ring-red-500/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sev.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Notificação de Segurança do Trabalho / SESMT */}
      <div className="pt-1">
        <button
          type="button"
          id="acidente-toggle-sesmt"
          onClick={() => updateField('workSafetyNotified', !data.workSafetyNotified)}
          className={`w-full h-11 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
            data.workSafetyNotified
              ? 'bg-red-600 text-white border-red-600 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>{data.workSafetyNotified ? 'SESMT / Segurança do Trabalho Notificado' : 'Sem Notificação Imediata ao SESMT'}</span>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${data.workSafetyNotified ? 'bg-white text-red-600' : 'bg-slate-200 text-slate-500'}`}>
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        </button>
      </div>
    </div>
  );
};
