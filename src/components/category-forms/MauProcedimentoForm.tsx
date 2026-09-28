import React from 'react';
import { FileWarning, CheckCircle, ShieldAlert } from 'lucide-react';
import { MauProcedimentoFormData } from '../../types';

interface MauProcedimentoFormProps {
  data: MauProcedimentoFormData;
  onChange: (updated: MauProcedimentoFormData) => void;
  errors?: Record<string, string>;
}

const DEPARTMENTS = [
  'Frente de Caixa / Operadores de PDV',
  'Recebimento de Mercadorias / Doca',
  'Estoque & Reposição de Mercadorias',
  'Açougue / Frios / Padaria (Manipulação)',
  'Prevenção de Perdas & Portaria',
  'Limpeza & Serviços Gerais',
  'Manutenção Predial / Infraestrutura',
];

const VIOLATIONS = [
  'Não cancelamento de item com conferência do fiscal',
  'Violação ou não utilização de EPI obrigatório',
  'Descarte / Avaria de mercadoria fora do protocolo padrão',
  'Falha no controle de acesso de funcionários / portas abertas',
  'Abandono de posto de trabalho em horário crítico',
  'Manuseio inadequado de maquinário / empilhadeira',
  'Consumo de alimentos em área proibida',
];

const ROLES = [
  'Operador de Caixa',
  'Repositor / Estoquista',
  'Fiscal de Prevenção de Perdas',
  'Auxiliar de Açougue / Perecíveis',
  'Operador de Empilhadeira',
  'Promotor de Vendas Externo',
  'Prestador de Serviço Terceirizado',
];

const IMMEDIATE_ACTIONS = [
  'Orientação técnica e recontagem de lote realizada',
  'Relatório de desvio encaminhado ao RH e Gerência',
  'Interrupção imediata da atividade por risco de segurança',
  'Correção do processo no momento pelo encarregado',
];

export const MauProcedimentoForm: React.FC<MauProcedimentoFormProps> = ({ data, onChange, errors }) => {
  const updateField = <K extends keyof MauProcedimentoFormData>(field: K, val: MauProcedimentoFormData[K]) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 animate-fadeIn" id="form-category-mau-procedimento">
      {/* Header Informativo */}
      <div className="flex items-center justify-between pb-2 border-b border-orange-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
            <FileWarning className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Formulário: Mau Procedimento</h3>
            <p className="text-[11px] text-slate-500 font-medium">Não conformidades operacionais e desvios de processo</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
          Auditoria Interna
        </span>
      </div>

      {/* 1. Departamento / Setor */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Setor / Departamento Envolvido</span>
          <span className="text-orange-600 font-bold">*</span>
        </label>
        <select
          id="mau-select-dept"
          value={data.department}
          onChange={(e) => updateField('department', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
        >
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Tipo de Desvio / Não Conformidade */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Tipo de Não Conformidade / Falha</span>
          <span className="text-orange-600 font-bold">*</span>
        </label>
        <select
          id="mau-select-violation"
          value={data.violationType}
          onChange={(e) => updateField('violationType', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
        >
          {VIOLATIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Função do Colaborador Envolvido */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Função / Cargo do Envolvido</span>
          <span className="text-orange-600 font-bold">*</span>
        </label>
        <select
          id="mau-select-role"
          value={data.collaboratorRole}
          onChange={(e) => updateField('collaboratorRole', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Impacto Operacional */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
          Impacto Operacional / Risco de Perda
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'baixo', label: 'Baixo (Procedimental)' },
            { id: 'medio', label: 'Médio (Risco de Perda)' },
            { id: 'critico', label: 'Crítico (Norma Grave)' },
          ].map((imp) => {
            const isSelected = data.operationalImpact === imp.id;
            return (
              <button
                key={imp.id}
                type="button"
                id={`mau-imp-${imp.id}`}
                onClick={() => updateField('operationalImpact', imp.id as any)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                  isSelected
                    ? 'bg-orange-50 text-orange-800 border-orange-300 ring-2 ring-orange-500/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {imp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Ação Imediata Adotada */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
          <span>Medida Imediata Adotada</span>
          <span className="text-orange-600 font-bold">*</span>
        </label>
        <select
          id="mau-select-action"
          value={data.immediateActionTaken}
          onChange={(e) => updateField('immediateActionTaken', e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
        >
          {IMMEDIATE_ACTIONS.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
