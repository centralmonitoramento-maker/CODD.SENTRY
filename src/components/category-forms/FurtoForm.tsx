import React from 'react';
import { ShieldAlert, DollarSign, Tag, Check, AlertCircle, Sparkles } from 'lucide-react';
import { FurtoFormData } from '../../types';
import { SuspectProfileFields } from './SuspectProfileFields';

interface FurtoFormProps {
  data: FurtoFormData;
  onChange: (updated: FurtoFormData) => void;
  errors?: Record<string, string>;
  hideProfileSection?: boolean;
}

const SECTOR_OPTIONS = [
  'Bebidas Quentes / Destilados',
  'Carnes Nobres / Açougue',
  'Perfumaria / Higiene & Beleza',
  'Eletrônicos / Telefonia & Bazar',
  'Mercearia de Alto Valor / Bomboniere',
  'Vestuário / Calçados',
  'Hortifrúti / Frios / Laticínios',
  'Outro Setor Operacional',
];

const MODUS_OPTIONS = [
  'Ocultação em bolsa / mochila / sacola',
  'Ocultação sob vestimentas / bolsos',
  'Rompimento / corte de etiqueta antifurto',
  'Consumo no interior da loja',
  'Evasão direta sem passar pelo caixa',
  'Troca de etiquetas de código de barras',
  'Ocultação no fundo do carrinho de compras',
];

const VALUE_SHORTCUTS = ['50,00', '150,00', '300,00', '600,00', '1.200,00'];

export const FurtoForm: React.FC<FurtoFormProps> = ({ 
  data, 
  onChange, 
  errors,
  hideProfileSection = false,
}) => {
  const updateField = <K extends keyof FurtoFormData>(field: K, val: FurtoFormData[K]) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 animate-fadeIn" id="form-category-furto">
      {/* Header Informativo da Categoria */}
      <div className="flex items-center justify-between pb-2 border-b border-rose-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Formulário de Ocorrência: Furto</h3>
            <p className="text-[11px] text-slate-500 font-medium">Preencha os detalhes operacionais e perfil dos envolvidos</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
          Prioridade Alta
        </span>
      </div>

      {/* 1. Setor / Categoria do Item */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Setor / Categoria do Produto</span>
          <span className="text-rose-600 font-bold">*</span>
        </label>
        <div className="relative">
          <select
            id="furto-select-sector"
            value={data.sector}
            onChange={(e) => updateField('sector', e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
          >
            {SECTOR_OPTIONS.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Valor Estimado do Prejuízo */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
            <span>Valor Estimado da Perda (R$)</span>
            <span className="text-rose-600 font-bold">*</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">Aproximado</span>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
            R$
          </div>
          <input
            type="text"
            id="furto-input-value"
            value={data.estimatedLossValue}
            onChange={(e) => updateField('estimatedLossValue', e.target.value)}
            placeholder="0,00"
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
          />
        </div>
        {/* Atalhos de valor rápido touch-friendly */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Valores:
          </span>
          {VALUE_SHORTCUTS.map((val) => (
            <button
              key={val}
              type="button"
              id={`furto-btn-val-${val.replace(',', '-')}`}
              onClick={() => updateField('estimatedLossValue', val)}
              className="text-xs font-bold font-mono bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-700 py-2 px-3 rounded-xl border border-slate-200 hover:border-rose-300 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              R$ {val}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Modus Operandi */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Modo de Ação / Modus Operandi</span>
          <span className="text-rose-600 font-bold">*</span>
        </label>
        <select
          id="furto-select-modus"
          value={data.modusOperandi}
          onChange={(e) => updateField('modusOperandi', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
        >
          {MODUS_OPTIONS.map((modus) => (
            <option key={modus} value={modus}>
              {modus}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Status de Recuperação da Mercadoria */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
          Recuperação de Mercadoria
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'recuperado_total', label: '100% Recuperado' },
            { id: 'recuperado_parcial', label: 'Parcial' },
            { id: 'nao_recuperado', label: 'Não Recuperado' },
          ].map((rec) => {
            const isSelected = data.recoveryStatus === rec.id;
            return (
              <button
                key={rec.id}
                type="button"
                id={`furto-rec-${rec.id}`}
                onClick={() => updateField('recoveryStatus', rec.id as any)}
                className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                  isSelected
                    ? 'bg-rose-50 text-rose-800 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {rec.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. FORMULÁRIO DE CARACTERÍSTICAS & PERFIL SUSPEITO (se não ocultado) */}
      {!hideProfileSection && (
        <div className="pt-2">
          <SuspectProfileFields
            profile={data.suspectProfile || {
              gender: 'masculino',
              skinTone: 'parda',
              ageRange: '26_35',
              heightRange: 'medio',
              clothingStyle: 'jaqueta_casaco_pesado',
              clothingDetails: '',
              carryingAccessories: ['Mochila Térmica / Forrada'],
            }}
            onChange={(newProfile) => updateField('suspectProfile', newProfile)}
            accentColor="rose"
            title="Perfil do Suspeito de Furto (Indicador de BI e Prevenção)"
          />
        </div>
      )}

      {/* 6. Quantidade de Suspeitos e Polícia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
            Suspeitos Envolvidos
          </label>
          <select
            value={data.suspectsCount}
            onChange={(e) => updateField('suspectsCount', e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
          >
            <option value="1 suspeito">1 suspeito (Ação individual)</option>
            <option value="2 suspeitos (dupla)">2 suspeitos (Dupla)</option>
            <option value="3 ou mais (quadrilha/grupo)">3 ou mais (Grupo organizado)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
            Acionamento Policial / PM 190
          </label>
          <button
            type="button"
            id="furto-toggle-police"
            onClick={() => updateField('policeNotified', !data.policeNotified)}
            className={`w-full h-12 px-4 rounded-2xl text-sm font-bold flex items-center justify-between border transition-all cursor-pointer ${
              data.policeNotified
                ? 'bg-rose-50 text-rose-800 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>{data.policeNotified ? 'Polícia Militar Acionada' : 'Não Acionada'}</span>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                data.policeNotified
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white border-slate-300'
              }`}
            >
              {data.policeNotified && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
