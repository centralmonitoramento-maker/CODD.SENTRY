/**
 * @file DescriptionField.tsx
 * @description Campo de texto para observações adicionais com contagem de caracteres e tags de inserção rápida contextuais por categoria.
 */

import React from 'react';
import { AlignLeft, Sparkles } from 'lucide-react';
import { EventCategoryKey } from '../types';

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  category?: EventCategoryKey | '';
  maxLength?: number;
}

const CATEGORY_TAGS: Record<string, string[]> = {
  furto: [
    'Imagens de CFTV salvas',
    'Suspeito reincidente',
    'Mercadoria danificada',
    'Lacre rompido',
    'Aguardando Gerência',
  ],
  inibicao: [
    'Ação 100% pacífica',
    'Produto recolocado',
    'Ronda preventiva reforçada',
    'Suspeito evadiu-se a pé',
  ],
  colisao: [
    'Vaga do estacionamento',
    'Sem vítimas / Apenas danos',
    'Danos leves na pintura',
    'Fotos do local registradas',
  ],
  conflito: [
    'Sem agressão física',
    'Cliente acalmado',
    'Atendimento transferido',
    'Testemunhas presentes',
  ],
  mau_procedimento: [
    'Reincidência no posto',
    'Orientação imediata dada',
    'Relatório enviado ao supervisor',
    'Ajuste de conduta realizado',
  ],
  mal_subito: [
    'Vítima consciente',
    'Socorro no local',
    'Familiar informado',
    'Sinais estáveis',
  ],
  acidente: [
    'Piso sinalizado',
    'Primeiros socorros prestados',
    'Área isolada',
    'Sem fratura aparente',
  ],
};

const DEFAULT_TAGS = [
  'Aguardando equipe',
  'Área isolada',
  'Imagens gravadas',
  'Gerência notificada',
  'Ocorrência prioritária',
];

export const DescriptionField: React.FC<DescriptionFieldProps> = ({
  value,
  onChange,
  category,
  maxLength = 500,
}) => {
  const activeTags = (category && CATEGORY_TAGS[category]) ? CATEGORY_TAGS[category] : DEFAULT_TAGS;

  /**
   * Adiciona uma tag rápida ao texto existente sem substituir
   */
  const handleAddTag = (tag: string) => {
    if (!value.trim()) {
      onChange(tag);
    } else if (!value.includes(tag)) {
      onChange(`${value.trim()} • ${tag}`);
    }
  };

  return (
    <div className="space-y-2">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="textarea-description"
          className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1.5"
        >
          <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Observações Adicionais</span>
          <span className="text-[11px] text-slate-400 font-normal lowercase">(opcional)</span>
        </label>
        <span className="text-[11px] font-mono font-medium text-slate-400">
          {value.length}/{maxLength}
        </span>
      </div>

      {/* Textarea estilizado Sleek */}
      <div className="relative">
        <textarea
          id="textarea-description"
          rows={3}
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Descreva detalhes específicos ou observações da central de monitoramento..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none min-h-[84px] font-normal"
        />
      </div>

      {/* Tags de Preenchimento Rápido */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-blue-500" />
          Atalhos:
        </span>
        {activeTags.map((tag) => (
          <button
            key={tag}
            type="button"
            id={`btn-tag-${tag.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            onClick={() => handleAddTag(tag)}
            className="text-[11px] font-semibold bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-2.5 py-1 rounded-xl border border-slate-200 hover:border-blue-200 transition-all active:scale-95"
          >
            + {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
