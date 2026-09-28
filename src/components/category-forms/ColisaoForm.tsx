import React from 'react';
import { Car, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { ColisaoFormData } from '../../types';

interface ColisaoFormProps {
  data: ColisaoFormData;
  onChange: (updated: ColisaoFormData) => void;
  errors?: Record<string, string>;
}

const COLLISION_LOCATIONS = [
  'Estacionamento de Clientes (Vaga / Corredor)',
  'Doca de Carga / Descarga de Fornecedores',
  'Pátio de Manobras / Acesso de Caminhões',
  'Cancela de Entrada / Saída de Veículos',
  'Via Perimetral da Loja / Posto de Combustível',
];

const VEHICLE_OPTIONS = [
  'Veículo de Passeio (Cliente)',
  'Caminhão de Fornecedor / Logística',
  'Empilhadeira / Transpaleteira Elétrica',
  'Motocicleta / Entregador',
  'Van / Utilitário de Entrega',
  'Estrutura Fixa (Poste / Cancela / Mureta)',
  'Carrinho Hidráulico / Plataforma',
];

const RESOLUTION_OPTIONS = [
  'Acordo amigável formalizado no local',
  'Acionamento de Seguradora Privada',
  'Averiguação interna com Gerência / Jurídico',
  'Boletim de Ocorrência de Trânsito solicitado',
  'Condutor evadiu-se do local (placa registrada)',
];

export const ColisaoForm: React.FC<ColisaoFormProps> = ({ data, onChange, errors }) => {
  const updateField = <K extends keyof ColisaoFormData>(field: K, val: ColisaoFormData[K]) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 animate-fadeIn" id="form-category-colisao">
      {/* Header Informativo */}
      <div className="flex items-center justify-between pb-2 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Formulário de Ocorrência: Colisão</h3>
            <p className="text-[11px] text-slate-500 font-medium">Acidente veicular, empilhadeiras ou danos no pátio</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          Pátio & Trânsito
        </span>
      </div>

      {/* 1. Local da Colisão */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Local Exato da Colisão</span>
          <span className="text-amber-600 font-bold">*</span>
        </label>
        <select
          id="colisao-select-location"
          value={data.collisionLocation}
          onChange={(e) => updateField('collisionLocation', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
        >
          {COLLISION_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Veículos Envolvidos (Grid 2 Colunas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
            <span>Elemento 1 (Causador / Atingido)</span>
            <span className="text-amber-600 font-bold">*</span>
          </label>
          <select
            id="colisao-select-v1"
            value={data.vehicleTypeA}
            onChange={(e) => updateField('vehicleTypeA', e.target.value)}
            className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:bg-white focus:border-amber-500 outline-none"
          >
            {VEHICLE_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
            <span>Elemento 2 (Segundo Envolvido)</span>
            <span className="text-amber-600 font-bold">*</span>
          </label>
          <select
            id="colisao-select-v2"
            value={data.vehicleTypeB}
            onChange={(e) => updateField('vehicleTypeB', e.target.value)}
            className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:bg-white focus:border-amber-500 outline-none"
          >
            {VEHICLE_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Placas / Identificação */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Placas dos Veículos / Prefixo de Equipamento</span>
          <span className="text-amber-600 font-bold">*</span>
        </label>
        <input
          type="text"
          id="colisao-input-plates"
          value={data.platesOrIds}
          onChange={(e) => updateField('platesOrIds', e.target.value)}
          placeholder="Ex: ABC-1234 / Empilhadeira 03 / Caminhão Scania"
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all uppercase"
        />
      </div>

      {/* 4. Gravidade dos Danos Materiais */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
          Severidade dos Danos
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'leve', label: 'Leve (Apenas Arranhão/Estética)' },
            { id: 'moderada', label: 'Média (Lataria / Farol)' },
            { id: 'grave', label: 'Grave (Estrutural)' },
          ].map((sev) => {
            const isSelected = data.damageSeverity === sev.id;
            return (
              <button
                key={sev.id}
                type="button"
                id={`colisao-sev-${sev.id}`}
                onClick={() => updateField('damageSeverity', sev.id as any)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                  isSelected
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sev.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Encaminhamento / Resolução */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Acordo / Encaminhamento</span>
          <span className="text-amber-600 font-bold">*</span>
        </label>
        <select
          id="colisao-select-resolution"
          value={data.insuranceOrAgreement}
          onChange={(e) => updateField('insuranceOrAgreement', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
        >
          {RESOLUTION_OPTIONS.map((res) => (
            <option key={res} value={res}>
              {res}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
