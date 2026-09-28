/**
 * @file EventTypeSelector.tsx
 * @description Componente de seleção das 7 categorias operacionais:
 * Furto, Inibição, Colisão, Conflito, Mau Procedimento, Mal Súbito e Acidente.
 */

import React from 'react';
import {
  ShieldAlert,
  Eye,
  Car,
  Users,
  FileWarning,
  HeartPulse,
  AlertTriangle,
  Check,
  ChevronDown,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { EventCategoryKey, EventTypeOption } from '../types';
import { EVENT_TYPE_OPTIONS } from '../services/eventService';

interface EventTypeSelectorProps {
  value: EventCategoryKey | '';
  onChange: (value: EventCategoryKey) => void;
  error?: string;
}

// Mapeamento dinâmico de ícones
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'ShieldAlert':
      return ShieldAlert;
    case 'Eye':
      return Eye;
    case 'Car':
      return Car;
    case 'Users':
      return Users;
    case 'FileWarning':
      return FileWarning;
    case 'HeartPulse':
      return HeartPulse;
    case 'AlertTriangle':
      return AlertTriangle;
    default:
      return HelpCircle;
  }
};

export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const selectedOption = EVENT_TYPE_OPTIONS.find((opt) => opt.id === value);

  return (
    <div className="space-y-3">
      {/* Rótulo e Badges */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="select-event-type"
          className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1"
        >
          <span>Categoria do Evento</span>
          <span className="text-blue-600 font-bold">*</span>
        </label>
        {selectedOption && (
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 animate-fadeIn">
            <Check className="w-3 h-3 stroke-[3]" /> Form Específico Aberto
          </span>
        )}
      </div>

      {/* Dropdown Principal */}
      <div className="relative">
        <select
          id="select-event-type"
          value={value}
          onChange={(e) => onChange(e.target.value as EventCategoryKey)}
          className={`w-full appearance-none h-[52px] px-4 pr-10 rounded-2xl font-medium text-sm transition-all outline-none ${
            error
              ? 'bg-rose-50 border-2 border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-500/20'
              : value
              ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              : 'bg-slate-50 border border-slate-200 text-slate-500 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          }`}
        >
          <option value="" disabled className="text-slate-400">
            Selecione uma categoria...
          </option>
          {EVENT_TYPE_OPTIONS.map((opt: EventTypeOption) => (
            <option key={opt.id} value={opt.id} className="text-slate-800 py-2 font-medium">
              {opt.label.toUpperCase()} — {opt.description}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Grid de Seleção Rápida Mobile-First das 7 Categorias (Touch-Friendly) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {EVENT_TYPE_OPTIONS.map((opt) => {
          const Icon = getIconComponent(opt.iconName);
          const isSelected = value === opt.id;

          // Cores dinâmicas por categoria com alto contraste tático
          const getThemeStyles = () => {
            if (!isSelected) {
              return 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300';
            }
            switch (opt.themeColor) {
              case 'rose':
                return 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/30 shadow-md shadow-rose-500/10';
              case 'blue':
                return 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/10';
              case 'amber':
                return 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/30 shadow-md shadow-amber-500/10';
              case 'purple':
                return 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-500/30 shadow-md shadow-purple-500/10';
              case 'orange':
                return 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-500/30 shadow-md shadow-orange-500/10';
              case 'emerald':
                return 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10';
              case 'red':
                return 'bg-red-50 border-red-500 text-red-950 ring-2 ring-red-500/30 shadow-md shadow-red-500/10';
              default:
                return 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/10';
            }
          };

          const getIconBadgeStyles = () => {
            if (!isSelected) return 'bg-white text-slate-700 border border-slate-200 shadow-xs';
            switch (opt.themeColor) {
              case 'rose':
                return 'bg-rose-600 text-white shadow-md shadow-rose-600/30';
              case 'blue':
                return 'bg-blue-600 text-white shadow-md shadow-blue-600/30';
              case 'amber':
                return 'bg-amber-600 text-white shadow-md shadow-amber-600/30';
              case 'purple':
                return 'bg-purple-600 text-white shadow-md shadow-purple-600/30';
              case 'orange':
                return 'bg-orange-600 text-white shadow-md shadow-orange-600/30';
              case 'emerald':
                return 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30';
              case 'red':
                return 'bg-red-600 text-white shadow-md shadow-red-600/30';
              default:
                return 'bg-blue-600 text-white shadow-md shadow-blue-600/30';
            }
          };

          return (
            <button
              key={opt.id}
              type="button"
              id={`btn-event-cat-${opt.id}`}
              onClick={() => onChange(opt.id)}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between min-h-[92px] active:scale-[0.97] cursor-pointer ${getThemeStyles()}`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${getIconBadgeStyles()}`}>
                  <Icon className="w-4 h-4 stroke-[2.3]" />
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold block leading-tight">
                  {opt.label}
                </span>
                <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                  {opt.shortLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mensagem de Erro de Validação */}
      {error && (
        <div
          id="error-event-type"
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
