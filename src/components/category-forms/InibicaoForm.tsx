import React from 'react';
import { Eye, ShieldCheck, Sparkles, DollarSign } from 'lucide-react';
import { InibicaoFormData } from '../../types';
import { SuspectProfileFields } from './SuspectProfileFields';

interface InibicaoFormProps {
  data: InibicaoFormData;
  onChange: (updated: InibicaoFormData) => void;
  errors?: Record<string, string>;
  hideProfileSection?: boolean;
}

const PREVENTION_METHODS = [
  'Posicionamento ostensivo do fiscal no corredor',
  'Monitoramento por CFTV com alerta na equipe via rádio',
  'Abordagem orientativa de boas-vindas na entrada/setor',
  'Acompanhamento discreto de atitude suspeita',
  'Conferência visual preventiva de mercadoria no carrinho',
  'Fechamento visual de pontos cegos / ronda preventiva',
];

const SECTOR_OPTIONS = [
  'Bebidas Quentes / Destilados',
  'Carnes Nobres / Açougue',
  'Perfumaria / Higiene & Beleza',
  'Eletrônicos / Telefonia & Bazar',
  'Mercearia de Alto Valor / Bomboniere',
  'Frente de Caixa / Linha de Pagamento',
  'Pátio / Estacionamento de Veículos',
  'Doca / Área de Descarga & Estoque',
  'Entrada Principal / Portaria',
];

const PREVENTED_ACTIONS = [
  'Tentativa de ocultação sob vestimentas / bolsa',
  'Tentativa de romper etiqueta / dispositivo de segurança',
  'Tentativa de evasão sem passar pelo operador de caixa',
  'Consumo não autorizado de produtos no interior da loja',
  'Troca de código de barras ou violação de embalagem',
];

const OUTCOME_OPTIONS = [
  'Mercadoria abandonada na gôndola e evasão pacífica',
  'Suspeito devolveu o produto e retirou-se sem conflito',
  'Suspeito optou por passar no caixa e efetuar o pagamento',
  'Averiguação concluída sem constatação de dolo',
];

const INIBICAO_VALUE_SHORTCUTS = ['50,00', '150,00', '350,00', '800,00', '1.500,00'];

export const InibicaoForm: React.FC<InibicaoFormProps> = ({ 
  data, 
  onChange, 
  errors,
  hideProfileSection = false,
}) => {
  const updateField = <K extends keyof InibicaoFormData>(field: K, val: InibicaoFormData[K]) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 animate-fadeIn" id="form-category-inibicao">
      {/* Header Informativo */}
      <div className="flex items-center justify-between pb-2 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Formulário de Ocorrência: Inibição</h3>
            <p className="text-[11px] text-slate-500 font-medium">Ação preventiva de segurança e preservação de perdas</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          Prevenção de Perdas
        </span>
      </div>

      {/* 1. Ação Preventiva Utilizada */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Método de Inibição / Ação Preventiva</span>
          <span className="text-blue-600 font-bold">*</span>
        </label>
        <select
          id="inibicao-select-method"
          value={data.preventionMethod}
          onChange={(e) => updateField('preventionMethod', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        >
          {PREVENTION_METHODS.map((met) => (
            <option key={met} value={met}>
              {met}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Setor Protegido / Categoria de Produto */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Setor / Produto Preservado</span>
          <span className="text-blue-600 font-bold">*</span>
        </label>
        <select
          id="inibicao-select-sector"
          value={data.sectorProtected}
          onChange={(e) => updateField('sectorProtected', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        >
          {SECTOR_OPTIONS.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Comportamento Evitado */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Ato Irregular Inibido</span>
          <span className="text-blue-600 font-bold">*</span>
        </label>
        <select
          id="inibicao-select-behavior"
          value={data.preventedBehavior}
          onChange={(e) => updateField('preventedBehavior', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        >
          {PREVENTED_ACTIONS.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Desfecho / Resultado da Inibição */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Resultado da Abordagem / Desfecho</span>
          <span className="text-blue-600 font-bold">*</span>
        </label>
        <select
          id="inibicao-select-outcome"
          value={data.outcomeResult}
          onChange={(e) => updateField('outcomeResult', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        >
          {OUTCOME_OPTIONS.map((out) => (
            <option key={out} value={out}>
              {out}
            </option>
          ))}
        </select>
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
              clothingStyle: 'moletom_capuz',
              clothingDetails: '',
              carryingAccessories: ['Boné / Chapéu / Gorro', 'Mochila Convencional'],
            }}
            onChange={(newProfile) => updateField('suspectProfile', newProfile)}
            accentColor="blue"
            title="Perfil do Suspeito Inibido (Indicador de BI e Prevenção)"
          />
        </div>
      )}

      {/* 6. Valor Estimado Protegido */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
            Valor Estimado de Mercadoria Preservada (R$)
          </label>
          <span className="text-[11px] text-slate-400 font-medium">Opcional</span>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
            R$
          </div>
          <input
            type="text"
            id="inibicao-input-value"
            value={data.estimatedProtectedValue || ''}
            onChange={(e) => updateField('estimatedProtectedValue', e.target.value)}
            placeholder="Ex: 350,00"
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
        {/* Atalhos rápidos de valor */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Atalhos:
          </span>
          {INIBICAO_VALUE_SHORTCUTS.map((val) => (
            <button
              key={val}
              type="button"
              id={`inibicao-btn-val-${val.replace(',', '-')}`}
              onClick={() => updateField('estimatedProtectedValue', val)}
              className="text-xs font-bold font-mono bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 py-2 px-3 rounded-xl border border-slate-200 hover:border-blue-300 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              R$ {val}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
