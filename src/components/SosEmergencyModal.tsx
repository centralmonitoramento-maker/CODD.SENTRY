/**
 * @file SosEmergencyModal.tsx
 * @description Modal tático de Prioridade Máxima para acionamento de SOS / Alerta Geral.
 * Opções rápidas:
 * 1. Furto em andamento
 * 2. Quadrilha Ativa
 * 3. Mal Súbito
 */

import React, { useState } from 'react';
import {
  AlertOctagon,
  Radio,
  ShieldAlert,
  Users,
  HeartPulse,
  Send,
  X,
  MapPin,
  CheckCircle2,
  Loader2,
  Volume2,
} from 'lucide-react';
import { UnifiedEventRecord } from '../types';

interface SosEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: string;
  onTriggerSos: (sosRecord: UnifiedEventRecord) => void;
}

export type SosEmergencyType = 'furto_em_andamento' | 'quadrilha_ativa' | 'mal_subito';

interface SosOptionMeta {
  id: SosEmergencyType;
  title: string;
  subtitle: string;
  category: 'furto' | 'mal_subito';
  icon: React.ElementType;
  badge: string;
  bgGradient: string;
  borderActive: string;
  description: string;
  actionProtocol: string;
}

const SOS_OPTIONS: SosOptionMeta[] = [
  {
    id: 'furto_em_andamento',
    title: 'Furto em Andamento',
    subtitle: 'Ação flagrante em curso na área de vendas ou caixas',
    category: 'furto',
    icon: ShieldAlert,
    badge: 'PRIORIDADE VERMELHA',
    bgGradient: 'from-red-600/15 to-rose-600/10 border-red-500/30 hover:border-red-500',
    borderActive: 'border-red-600 bg-red-50 ring-2 ring-red-500/20 text-red-950',
    description: 'Despacho tático prioritário para a equipe de apoio e travamento de saídas.',
    actionProtocol: 'Alerta imediato aos fiscais de salão e operadores do CFTV.',
  },
  {
    id: 'quadrilha_ativa',
    title: 'Quadrilha Ativa',
    subtitle: 'Grupo organizado (3+ suspeitos) com risco de evasão ou ameaça',
    category: 'furto',
    icon: Users,
    badge: 'CÓDIGO VERMELHO TÁTICO',
    bgGradient: 'from-purple-600/15 to-rose-600/10 border-purple-500/30 hover:border-purple-500',
    borderActive: 'border-purple-600 bg-purple-50 ring-2 ring-purple-500/20 text-purple-950',
    description: 'Risco de fuga em comboio e possível confronto. Acionamento de reforço externo.',
    actionProtocol: 'Comando de cerco visual pelas câmeras e preparação para 190.',
  },
  {
    id: 'mal_subito',
    title: 'Mal Súbito',
    subtitle: 'Emergência médica grave (parada, desmaio ou crise aguda)',
    category: 'mal_subito',
    icon: HeartPulse,
    badge: 'URGÊNCIA MÉDICA SAMU',
    bgGradient: 'from-amber-600/15 to-emerald-600/10 border-amber-500/30 hover:border-amber-500',
    borderActive: 'border-amber-600 bg-amber-50 ring-2 ring-amber-500/20 text-amber-950',
    description: 'Cliente ou colaborador desacordado. Apoio de brigadistas e SAMU imediato.',
    actionProtocol: 'Kit de primeiros socorros e direcionamento da ambulância na portaria.',
  },
];

export const SosEmergencyModal: React.FC<SosEmergencyModalProps> = ({
  isOpen,
  onClose,
  branch,
  onTriggerSos,
}) => {
  const [selectedType, setSelectedType] = useState<SosEmergencyType>('furto_em_andamento');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [dispatchedProtocol, setDispatchedProtocol] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDispatch = async () => {
    setIsSending(true);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([200, 100, 200, 100, 300]);
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const optionMeta = SOS_OPTIONS.find((o) => o.id === selectedType)!;
      const protocolNumber = `SOS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const emergencyRecord: UnifiedEventRecord = {
        id: `sos-${Date.now()}`,
        protocol: protocolNumber,
        source: 'RONDA_MOBILE',
        branch,
        category: optionMeta.category,
        categoryLabel: `🚨 SOS: ${optionMeta.title}`,
        timestamp: new Date().toISOString(),
        lossValue: optionMeta.category === 'furto' ? 1500 : 0,
        recoveredValue: 0,
        status: 'PENDENTE',
        operatorOrAgent: 'Fiscal Ronda (SOS Mobile)',
        cameraOrLocation: 'Área de Vendas / Pátio (Acionamento SOS)',
        summary: `🚨 ALERTA GERAL SOS DISPARADO: ${optionMeta.title}. ${optionMeta.subtitle}. ${optionMeta.description}`,
        evidenceCount: 0,
        details: {
          sosEmergency: true,
          emergencyType: optionMeta.title,
          priority: 'URGENTE_MAXIMA',
          protocolInstructions: optionMeta.actionProtocol,
        } as any,
        fieldReport: {
          locationAddress: `${branch} - Setor de Vendas`,
          agentNotes: `ALERTA GERAL SOS: ${optionMeta.title}`,
          agentName: 'Fiscal Ronda de Campo',
          timestamp: new Date().toISOString(),
          initialCategory: optionMeta.category,
        },
      };

      onTriggerSos(emergencyRecord);
      setDispatchedProtocol(protocolNumber);
    } catch (err) {
      console.error('Falha no despacho de SOS:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetAndClose = () => {
    setDispatchedProtocol(null);
    onClose();
  };

  return (
    <div
      id="modal-sos-emergency-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div
        id="modal-sos-emergency-container"
        className="bg-slate-900 border-2 border-red-600/80 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(220,38,38,0.5)] overflow-hidden animate-slideUp text-white"
      >
        {/* Cabeçalho de Emergência com Sirene */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 p-4 sm:p-5 flex items-center justify-between border-b border-red-500/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center animate-pulse text-white">
              <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white uppercase">
                  🚨 SOS • Alerta Geral
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-white text-red-900 text-[10px] font-black tracking-wider uppercase animate-bounce">
                  AO VIVO
                </span>
              </div>
              <p className="text-xs text-red-100 font-semibold flex items-center gap-1.5 mt-0.5">
                <Radio className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                Despacho Imediato à Central de Segurança
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-sos-modal"
            onClick={handleResetAndClose}
            className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-[#0F1420]">
          {!dispatchedProtocol ? (
            <>
              {/* Filial Ativa */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="truncate">{branch}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                  Prioridade Máxima
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Selecione a Tipologia do Alerta</span>
                  <span className="text-red-400 font-mono text-[10px]">1 TOQUE RÁPIDO</span>
                </label>

                {/* 3 Opções de Emergência Touch-Friendly */}
                <div className="space-y-2.5">
                  {SOS_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedType === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        id={`btn-sos-option-${opt.id}`}
                        onClick={() => setSelectedType(opt.id)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.98] cursor-pointer relative flex flex-col gap-1.5 ${
                          isSelected
                            ? 'border-red-500 bg-red-950/50 shadow-lg shadow-red-900/30'
                            : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                                isSelected
                                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              <Icon className="w-5 h-5 stroke-[2.3]" />
                            </div>
                            <div>
                              <h4 className={`text-sm font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                {opt.title}
                              </h4>
                              <span className="text-[10px] font-mono font-bold text-red-400 block uppercase">
                                {opt.badge}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-red-500 bg-red-600 text-white' : 'border-slate-600 bg-slate-800'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 font-medium pl-13 leading-snug">
                          {opt.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Box de Ação Imediata */}
              <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-800/40 text-xs text-red-200 flex items-start gap-2.5">
                <Volume2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  Ao confirmar, um protocolo de <b>prioridade vermelha</b> é transmitido imediatamente para todas as estações de monitoramento CFTV e supervisão.
                </p>
              </div>
            </>
          ) : (
            /* Estado de Sucesso de Despacho */
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20 animate-pulse">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold">
                  ALERTA EMITIDO COM SUCESSO
                </span>
                <h4 className="text-lg font-black text-white pt-2">
                  Equipes Notificadas na Central
                </h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Ocorrência de prioridade máxima transmitida via rede operacional.
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Protocolo de Emergência:</span>
                  <span className="font-mono font-black text-amber-400 text-sm">{dispatchedProtocol}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Unidade / Local:</span>
                  <span className="font-semibold text-white truncate max-w-[190px]">{branch}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Tempo de Resposta:</span>
                  <span className="font-bold text-emerald-400">Imediato (1 a 3 min)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal com Botão de Confirmação */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          {!dispatchedProtocol ? (
            <>
              <button
                type="button"
                id="btn-cancel-sos"
                onClick={handleResetAndClose}
                className="w-1/3 h-14 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                id="btn-confirm-sos-dispatch"
                disabled={isSending}
                onClick={handleDispatch}
                className="w-2/3 h-14 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm tracking-wide shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Transmitindo SOS...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 stroke-[2.5]" />
                    <span>CONFIRMAR SOS AGORA</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              id="btn-finish-sos"
              onClick={handleResetAndClose}
              className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Concluir e Retornar ao Formulário</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
