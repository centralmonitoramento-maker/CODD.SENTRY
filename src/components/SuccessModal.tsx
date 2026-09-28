/**
 * @file SuccessModal.tsx
 * @description Tela/Modal de confirmação exibida após o registro bem-sucedido do evento.
 * Apresenta o número de protocolo, resumo dos dados específicos da categoria e ação de novo registro.
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  PlusCircle, 
  MapPin, 
  FileText, 
  Clock, 
  ShieldAlert, 
  Share2,
  Tag,
  Building2
} from 'lucide-react';
import { SubmittedReportSummary } from '../types';

interface SuccessModalProps {
  summary: SubmittedReportSummary;
  onNewReport: () => void;
  onViewPayload?: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  summary,
  onNewReport,
  onViewPayload,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const { protocol, payload, submittedAt } = summary;

  const handleCopyProtocol = () => {
    navigator.clipboard.writeText(protocol);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extração amigável de detalhes específicos da categoria
  const renderCategoryHighlight = () => {
    const details = payload.categoryDetails as any;
    if (!details) return null;

    switch (payload.eventType) {
      case 'furto':
        return (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Setor / Valor</span>
            <span className="font-bold text-rose-700">
              {details.sector} (R$ {details.estimatedLossValue || '0,00'})
            </span>
          </div>
        );
      case 'inibicao':
        return (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Ação Preventiva</span>
            <span className="font-bold text-blue-700 truncate max-w-[200px]">
              {details.preventionMethod}
            </span>
          </div>
        );
      case 'colisao':
        return (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Veículos / Placa</span>
            <span className="font-bold text-amber-700">
              {details.platesOrIds}
            </span>
          </div>
        );
      case 'conflito':
        return (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Envolvidos</span>
            <span className="font-bold text-purple-700 truncate max-w-[200px]">
              {details.involvedParties}
            </span>
          </div>
        );
      case 'mau_procedimento':
        return (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Departamento</span>
            <span className="font-bold text-orange-700">
              {details.department}
            </span>
          </div>
        );
      case 'mal_subito':
        return (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Socorro / Sintoma</span>
            <span className="font-bold text-emerald-700 truncate max-w-[200px]">
              {details.emergencyServiceContacted}
            </span>
          </div>
        );
      case 'acidente':
        return (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Tipo / Vítima</span>
            <span className="font-bold text-red-700 truncate max-w-[200px]">
              {details.accidentType}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id="modal-success-screen"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div className="bg-white border border-slate-100 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Faixa decorativa superior */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500" />

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Ícone de Sucesso Animado */}
          <div className="flex flex-col items-center text-center space-y-2 pt-1">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-sm shadow-emerald-100">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Evento registrado com sucesso!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                A ocorrência e o formulário específico foram despachados para a central.
              </p>
            </div>
          </div>

          {/* Card de Protocolo */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Número de Protocolo
              </span>
              <span className="text-base font-mono font-bold text-blue-700 tracking-wide">
                {protocol}
              </span>
            </div>
            <button
              type="button"
              id="btn-copy-protocol"
              onClick={handleCopyProtocol}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span className="text-emerald-600">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Resumo dos Dados Registrados */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Resumo do Formulário Específico
            </h3>

            {/* Filial / Unidade */}
            {payload.branch && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> Filial
                </span>
                <span className="font-bold text-blue-700 px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
                  {payload.branch}
                </span>
              </div>
            )}

            {/* Categoria */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Categoria
              </span>
              <span className="font-bold text-slate-800 px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 shadow-sm uppercase tracking-wide">
                {payload.eventTypeLabel}
              </span>
            </div>

            {/* Detalhe da categoria */}
            {renderCategoryHighlight()}

            {/* Localização */}
            <div className="flex items-start justify-between text-xs gap-3">
              <span className="text-slate-500 flex items-center gap-1.5 shrink-0 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Local GPS
              </span>
              <span className="font-mono text-right text-slate-700 font-semibold truncate max-w-[200px]">
                {payload.location.latitude}°, {payload.location.longitude}°
              </span>
            </div>

            {/* Horário */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Horário
              </span>
              <span className="text-slate-700 font-semibold">
                {new Date(submittedAt).toLocaleTimeString('pt-BR')}
              </span>
            </div>

            {/* Evidência */}
            {payload.evidence && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Share2 className="w-3.5 h-3.5 text-slate-400" /> Evidência
                </span>
                <span className="text-blue-700 font-semibold truncate max-w-[180px]">
                  {payload.evidence.fileName}
                </span>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              id="btn-register-new-event"
              onClick={onNewReport}
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>Registrar novo evento</span>
            </button>

            {onViewPayload && (
              <button
                type="button"
                id="btn-inspect-payload-toggle"
                onClick={onViewPayload}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-600 font-semibold text-center transition-colors"
              >
                Inspecionar Payload JSON (Dev Tool)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
