/**
 * @file SuspectProfileFields.tsx
 * @description Sub-formulário padronizado de identificação do Perfil Suspeito:
 * - Gênero
 * - Cor da Pele (Autodeclaração/Estimativa visual padronizada IBGE)
 * - Faixa Etária
 * - Estatura
 * - Tipo de Vestimenta e Acessórios de Ocultação
 * 
 * Alimenta diretamente o indicador BI de Perfil Suspeito por Loja e Categoria de Produto.
 */

import React from 'react';
import { 
  UserCheck, 
  Sparkles, 
  Shirt, 
  Ruler, 
  Calendar, 
  User, 
  Palette, 
  Briefcase, 
  Check, 
  ShieldAlert 
} from 'lucide-react';
import { 
  SuspectProfile, 
  GenderOption, 
  SkinToneOption, 
  AgeRangeOption, 
  HeightRangeOption, 
  ClothingStyleOption 
} from '../../types';

interface SuspectProfileFieldsProps {
  profile: SuspectProfile;
  onChange: (updated: SuspectProfile) => void;
  accentColor?: 'rose' | 'blue';
  title?: string;
}

export const GENDER_OPTIONS: { id: GenderOption; label: string }[] = [
  { id: 'masculino', label: 'Masculino' },
  { id: 'feminino', label: 'Feminino' },
  { id: 'dupla_mista', label: 'Dupla Mista (M + F)' },
  { id: 'grupo_multiplo', label: 'Grupo / Quadrilha (3+)' },
  { id: 'nao_identificado', label: 'Não Identificado' },
];

export const SKIN_TONE_OPTIONS: { id: SkinToneOption; label: string; sampleHex: string }[] = [
  { id: 'branca', label: 'Branca', sampleHex: '#F7D4B6' },
  { id: 'parda', label: 'Parda', sampleHex: '#C58C65' },
  { id: 'preta', label: 'Preta', sampleHex: '#67412A' },
  { id: 'amarela', label: 'Amarela', sampleHex: '#F2CD86' },
  { id: 'indigena', label: 'Indígena', sampleHex: '#A25936' },
  { id: 'nao_identificada', label: 'Indeterminada', sampleHex: '#94A3B8' },
];

export const AGE_RANGE_OPTIONS: { id: AgeRangeOption; label: string }[] = [
  { id: 'menor_18', label: 'Menor de 18 anos' },
  { id: '18_25', label: '18 a 25 anos' },
  { id: '26_35', label: '26 a 35 anos' },
  { id: '36_50', label: '36 a 50 anos' },
  { id: 'acima_50', label: 'Acima de 50 anos' },
  { id: 'indeterminado', label: 'Indeterminado' },
];

export const HEIGHT_RANGE_OPTIONS: { id: HeightRangeOption; label: string; desc: string }[] = [
  { id: 'baixo', label: 'Baixa', desc: '< 1,65m' },
  { id: 'medio', label: 'Média', desc: '1,65m a 1,78m' },
  { id: 'alto', label: 'Alta', desc: '1,79m a 1,90m' },
  { id: 'muito_alto', label: 'Muito Alta', desc: '> 1,90m' },
  { id: 'indeterminado', label: 'Não Avaliado', desc: '-' },
];

export const CLOTHING_STYLE_OPTIONS: { id: ClothingStyleOption; label: string }[] = [
  { id: 'jaqueta_casaco_pesado', label: 'Jaqueta / Casaco Fechado' },
  { id: 'moletom_capuz', label: 'Moletom / Blusa com Capuz' },
  { id: 'camiseta_bermuda', label: 'Camiseta & Bermuda' },
  { id: 'camisa_social_polo', label: 'Camisa Social / Polo' },
  { id: 'vestido_saia', label: 'Vestido / Saia / Vestimenta Longa' },
  { id: 'roupa_esportiva_treino', label: 'Roupa Esportiva / Treino' },
  { id: 'uniforme_trabalho', label: 'Uniforme de Terceiro / Trabalho' },
  { id: 'outro_traje', label: 'Outro Tipo de Traje' },
];

export const ACCESSORY_SUGGESTIONS = [
  'Mochila Térmica / Forrada',
  'Mochila Convencional',
  'Bolsa Feminina Grande',
  'Sacola de Outro Estabelecimento',
  'Boné / Chapéu / Gorro',
  'Óculos Escuros / Grau',
  'Máscara de Proteção',
  'Carrinho de Bebê / Guarda-chuva',
  'Cinto / Suporte Oculto',
];

export const SuspectProfileFields: React.FC<SuspectProfileFieldsProps> = ({
  profile,
  onChange,
  accentColor = 'rose',
  title = 'Identificação de Perfil Suspeito (Indicador de Loja e Produto)'
}) => {
  const isRose = accentColor === 'rose';

  const update = <K extends keyof SuspectProfile>(field: K, val: SuspectProfile[K]) => {
    onChange({
      ...profile,
      [field]: val,
    });
  };

  const toggleAccessory = (acc: string) => {
    const exists = profile.carryingAccessories.includes(acc);
    if (exists) {
      update('carryingAccessories', profile.carryingAccessories.filter((a) => a !== acc));
    } else {
      update('carryingAccessories', [...profile.carryingAccessories, acc]);
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border ${
      isRose 
        ? 'bg-rose-50/40 border-rose-200' 
        : 'bg-blue-50/40 border-blue-200'
    } space-y-4`}>
      
      {/* Cabeçalho do Módulo de Perfil */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
            isRose ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
          }`}>
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{title}</h4>
            <p className="text-[11px] text-slate-500 font-medium">Alimenta inteligência estatística para prevenção e cruzamento com produtos</p>
          </div>
        </div>
        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
          isRose ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
        }`}>
          BI Perfil
        </span>
      </div>

      {/* Grid 1: Gênero & Cor da Pele */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* 1. Gênero */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Gênero Identificado</span>
            <span className="text-rose-500">*</span>
          </label>
          <select
            value={profile.gender}
            onChange={(e) => update('gender', e.target.value as GenderOption)}
            className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {GENDER_OPTIONS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Cor da Pele */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span>Cor da Pele / Etnia</span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={profile.skinTone}
              onChange={(e) => update('skinTone', e.target.value as SkinToneOption)}
              className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SKIN_TONE_OPTIONS.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
            <div 
              className="w-3.5 h-3.5 rounded-full absolute left-3 top-3.5 border border-black/20 shadow-xs" 
              style={{ backgroundColor: SKIN_TONE_OPTIONS.find(s => s.id === profile.skinTone)?.sampleHex || '#94A3B8' }}
            />
          </div>
        </div>

      </div>

      {/* Grid 2: Faixa Etária & Estatura */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* 3. Faixa Etária */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Faixa Etária Estimada</span>
            <span className="text-rose-500">*</span>
          </label>
          <select
            value={profile.ageRange}
            onChange={(e) => update('ageRange', e.target.value as AgeRangeOption)}
            className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AGE_RANGE_OPTIONS.map((ar) => (
              <option key={ar.id} value={ar.id}>
                {ar.label}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Estatura */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-slate-400" />
            <span>Estatura / Altura</span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {HEIGHT_RANGE_OPTIONS.filter(h => h.id !== 'indeterminado').map((h) => {
              const isSelected = profile.heightRange === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => update('heightRange', h.id)}
                  className={`py-2 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                    isSelected
                      ? isRose 
                        ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs' 
                        : 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className="block text-[11px] font-bold">{h.label}</span>
                  <span className={`block text-[9px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {h.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Grid 3: Tipo de Vestimenta & Detalhes */}
      <div className="space-y-3 pt-1">
        
        {/* 5. Tipo de Vestimenta */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5 text-slate-400" />
            <span>Padrão de Vestimenta / Traje Principal</span>
            <span className="text-rose-500">*</span>
          </label>
          <select
            value={profile.clothingStyle}
            onChange={(e) => update('clothingStyle', e.target.value as ClothingStyleOption)}
            className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CLOTHING_STYLE_OPTIONS.map((cs) => (
              <option key={cs.id} value={cs.id}>
                {cs.label}
              </option>
            ))}
          </select>
        </div>

        {/* Detalhamento dos Trajes */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Cores e Detalhes da Roupa (Ex: Jaqueta preta com listras brancas, bermuda jeans)
          </label>
          <input
            type="text"
            value={profile.clothingDetails || ''}
            onChange={(e) => update('clothingDetails', e.target.value)}
            placeholder="Ex: Jaqueta corta-vento azul marinho, calça moletom cinza..."
            className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 6. Acessórios e Meios de Ocultação */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Acessórios de Ocultação & Disfarces Identificados</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Multi-seleção</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ACCESSORY_SUGGESTIONS.map((acc) => {
              const isSelected = profile.carryingAccessories.includes(acc);
              return (
                <button
                  key={acc}
                  type="button"
                  onClick={() => toggleAccessory(acc)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? isRose
                        ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs'
                        : 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                  }`}
                >
                  {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                  <span>{acc}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
