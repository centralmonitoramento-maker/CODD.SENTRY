/**
 * @file DispatchQueueMonitor.tsx
 * @description Módulo de Visualização e Monitoramento da Fila de Despacho de Ocorrências em Tempo Real.
 * Mensura ocorrências em tempo real, em andamento e em atraso considerando a regra de SLA de 20 minutos por despacho.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  Activity,
  CheckCircle2,
  AlertCircle,
  Radio,
  Search,
  Filter,
  Eye,
  Smartphone,
  MonitorPlay,
  ArrowUpDown,
  LayoutGrid,
  ListFilter,
  Flame,
  ShieldAlert,
  UserCheck,
  Building2,
  Layers,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { UnifiedEventRecord, EventCategoryKey } from '../types';
import { CATEGORY_COLORS, CATEGORY_NAMES, formatBRL, formatDateTimeBR } from '../services/dashboardData';
import { BRANCH_OPTIONS } from '../services/eventService';

interface DispatchQueueMonitorProps {
  records: UnifiedEventRecord[];
  onSelectRecord?: (record: UnifiedEventRecord) => void;
}

const SLA_TARGET_SECONDS = 20 * 60; // 20 minutos = 1200 segundos

/**
 * Formata segundos no formato MM:SS ou HH:MM:SS
 */
function formatDuration(totalSeconds: number): string {
  const isNegative = totalSeconds < 0;
  const absSec = Math.abs(Math.round(totalSeconds));
  const hrs = Math.floor(absSec / 3600);
  const mins = Math.floor((absSec % 3600) / 60);
  const secs = absSec % 60;

  if (hrs > 0) {
    return `${isNegative ? '-' : ''}${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${isNegative ? '-' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const DispatchQueueMonitor: React.FC<DispatchQueueMonitorProps> = ({
  records,
  onSelectRecord,
}) => {
  // Relógio ao vivo atualizado a cada 1 segundo para manter contadores em tempo real
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [statusFilter, setStatusFilter] = useState<'TODAS' | 'ATRASADAS' | 'EM_ANDAMENTO' | 'PENDENTES' | 'CONCLUIDAS'>('TODAS');
  const [selectedBranch, setSelectedBranch] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'sla_critical' | 'recent' | 'value'>('sla_critical');

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // =========================================================================
  // ENRIQUECIMENTO DOS REGISTROS COM DADOS DE SLA DE 20 MINUTOS EM TEMPO REAL
  // =========================================================================
  const enrichedRecords = useMemo(() => {
    return records.map((rec) => {
      const createdMs = new Date(rec.timestamp).getTime();
      let elapsedSeconds = 0;
      let isCompleted = rec.status === 'CONCLUIDO';
      let isClaimed = rec.status === 'EM_ANALISE';
      let isPending = rec.status === 'PENDENTE';

      if (isCompleted) {
        if (rec.slaDurationSeconds !== undefined && rec.slaDurationSeconds > 0) {
          elapsedSeconds = rec.slaDurationSeconds;
        } else if (rec.concludedAt) {
          elapsedSeconds = Math.max(0, Math.floor((new Date(rec.concludedAt).getTime() - createdMs) / 1000));
        } else {
          elapsedSeconds = 12 * 60; // Fallback realista para concluídas
        }
      } else {
        // Para registros abertos (Pendente ou Em Análise), calcula tempo desde a abertura
        elapsedSeconds = Math.max(0, Math.floor((nowMs - createdMs) / 1000));
      }

      // Regra de SLA de 20 minutos
      const isDelayed = elapsedSeconds > SLA_TARGET_SECONDS && !isCompleted;
      const remainingSeconds = Math.max(0, SLA_TARGET_SECONDS - elapsedSeconds);
      const overtimeSeconds = isDelayed ? elapsedSeconds - SLA_TARGET_SECONDS : 0;
      const slaProgressPct = Math.min(100, Math.round((elapsedSeconds / SLA_TARGET_SECONDS) * 100));

      // Classificação de criticidade do SLA
      let slaUrgency: 'normal' | 'warning' | 'critical' | 'completed';
      if (isCompleted) {
        slaUrgency = elapsedSeconds <= SLA_TARGET_SECONDS ? 'completed' : 'critical';
      } else if (isDelayed) {
        slaUrgency = 'critical';
      } else if (elapsedSeconds >= 14 * 60) {
        slaUrgency = 'warning'; // Acima de 14 minutos (faltando menos de 6 min)
      } else {
        slaUrgency = 'normal';
      }

      return {
        ...rec,
        elapsedSeconds,
        remainingSeconds,
        overtimeSeconds,
        isDelayed,
        slaProgressPct,
        slaUrgency,
        isCompleted,
        isClaimed,
        isPending,
      };
    });
  }, [records, nowMs]);

  // =========================================================================
  // CÁLCULO DE KPIS DA FILA DE DESPACHO COM SLA DE 20 MIN
  // =========================================================================
  const dispatchKpis = useMemo(() => {
    const totalActive = enrichedRecords.filter((r) => !r.isCompleted).length;
    const pendingCount = enrichedRecords.filter((r) => r.isPending).length;
    const inProgressCount = enrichedRecords.filter((r) => r.isClaimed).length;
    const delayedCount = enrichedRecords.filter((r) => r.isDelayed).length;
    const completedCount = enrichedRecords.filter((r) => r.isCompleted).length;
    const completedOnTimeCount = enrichedRecords.filter((r) => r.isCompleted && r.elapsedSeconds <= SLA_TARGET_SECONDS).length;

    const totalCalculated = completedCount + totalActive;
    const complianceRate = totalCalculated > 0
      ? Math.round(((completedOnTimeCount + (totalActive - delayedCount)) / totalCalculated) * 100)
      : 100;

    // Tempo médio de atendimento em segundos
    const totalSecondsSample = enrichedRecords.reduce((acc, r) => acc + r.elapsedSeconds, 0);
    const avgSeconds = enrichedRecords.length > 0 ? Math.round(totalSecondsSample / enrichedRecords.length) : 0;

    return {
      totalRealtime: enrichedRecords.length,
      totalActive,
      pendingCount,
      inProgressCount,
      delayedCount,
      completedCount,
      completedOnTimeCount,
      complianceRate,
      avgSeconds,
    };
  }, [enrichedRecords]);

  // =========================================================================
  // FILTRAGEM E ORDENAÇÃO DOS REGISTROS DA FILA
  // =========================================================================
  const filteredAndSortedRecords = useMemo(() => {
    let result = enrichedRecords.filter((rec) => {
      // Filtro de Status
      if (statusFilter === 'ATRASADAS' && !rec.isDelayed) return false;
      if (statusFilter === 'EM_ANDAMENTO' && !rec.isClaimed) return false;
      if (statusFilter === 'PENDENTES' && !rec.isPending) return false;
      if (statusFilter === 'CONCLUIDAS' && !rec.isCompleted) return false;

      // Filtro de Filial
      if (selectedBranch !== 'TODAS' && rec.branch !== selectedBranch) return false;

      // Busca Textual
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProto = rec.protocol.toLowerCase().includes(q);
        const matchesBranch = rec.branch.toLowerCase().includes(q);
        const matchesOperator = (rec.assignedOperator || rec.operatorOrAgent).toLowerCase().includes(q);
        const matchesSummary = rec.summary.toLowerCase().includes(q);
        const matchesLocation = rec.cameraOrLocation.toLowerCase().includes(q);
        const matchesSector = (rec.productSector || '').toLowerCase().includes(q);
        if (!matchesProto && !matchesBranch && !matchesOperator && !matchesSummary && !matchesLocation && !matchesSector) {
          return false;
        }
      }

      return true;
    });

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === 'sla_critical') {
        // Prioriza as atrasadas não concluídas primeiro, depois as mais próximas de estourar
        if (a.isDelayed !== b.isDelayed) return a.isDelayed ? -1 : 1;
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return b.elapsedSeconds - a.elapsedSeconds;
      }
      if (sortBy === 'recent') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === 'value') {
        return (b.lossValue + b.recoveredValue) - (a.lossValue + a.recoveredValue);
      }
      return 0;
    });

    return result;
  }, [enrichedRecords, statusFilter, selectedBranch, searchQuery, sortBy]);

  return (
    <div id="dispatch-queue-monitor-container" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. CABEÇALHO DO MONITOR DE FILA DE DESPACHO & STATUS CCO AO VIVO          */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-950/40">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                Fila de Despacho de Ocorrências em Tempo Real
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                LIVE CCO
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-mono font-bold">
                ⏱️ SLA Alvo: 20 min / despacho
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Centro de triagem e controle de tempo de atendimento para as equipes de Ronda Mobile e Central CFTV.
            </p>
          </div>
        </div>

        {/* Status de Alerta Global do SLA */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          {dispatchKpis.delayedCount > 0 ? (
            <div className="bg-rose-950/80 border border-rose-500/50 px-4 py-2 rounded-2xl flex items-center gap-3 animate-pulse shadow-lg shadow-rose-950/40">
              <Flame className="w-5 h-5 text-rose-400" />
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-rose-300 block">Atenção Crítica</span>
                <span className="text-xs font-black text-white font-mono">
                  {dispatchKpis.delayedCount} {dispatchKpis.delayedCount === 1 ? 'ocorrência' : 'ocorrências'} em atraso (&gt;20m)
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/60 border border-emerald-500/40 px-4 py-2 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-300 block">SLA 100% Controlado</span>
                <span className="text-xs font-bold text-white">Nenhum despacho em atraso</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. GRID DE MÉTRICAS OPERACIONAIS EM TEMPO REAL (MENSURAÇÃO DO SLA)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: Fila em Tempo Real (Total) */}
        <button
          type="button"
          onClick={() => setStatusFilter('TODAS')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            statusFilter === 'TODAS'
              ? 'bg-slate-800/90 border-cyan-500/80 ring-2 ring-cyan-500/30'
              : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-mono text-cyan-400">
            <span>TOTAL NA FILA</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white my-1 tracking-tight">
            {dispatchKpis.totalRealtime}
          </div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>{dispatchKpis.totalActive} ativas agora</span>
            <span className="text-cyan-400 font-mono text-[10px]">100%</span>
          </div>
        </button>

        {/* KPI 2: Aguardando Despacho / Pendentes */}
        <button
          type="button"
          onClick={() => setStatusFilter('PENDENTES')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            statusFilter === 'PENDENTES'
              ? 'bg-slate-800/90 border-blue-500/80 ring-2 ring-blue-500/30'
              : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-mono text-blue-400">
            <span>AGUARDANDO DESPACHO</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black font-mono text-blue-300 my-1 tracking-tight">
            {dispatchKpis.pendingCount}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Triagem pendente na Central
          </div>
        </button>

        {/* KPI 3: Em Andamento / Em Atendimento */}
        <button
          type="button"
          onClick={() => setStatusFilter('EM_ANDAMENTO')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            statusFilter === 'EM_ANDAMENTO'
              ? 'bg-slate-800/90 border-amber-500/80 ring-2 ring-amber-500/30'
              : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-mono text-amber-400">
            <span>EM ANDAMENTO</span>
            <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-300 my-1 tracking-tight">
            {dispatchKpis.inProgressCount}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Operador / Fiscal em ação
          </div>
        </button>

        {/* KPI 4: Em Atraso / SLA Estourado (> 20 min) */}
        <button
          type="button"
          onClick={() => setStatusFilter('ATRASADAS')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            statusFilter === 'ATRASADAS'
              ? 'bg-rose-950/90 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/50'
              : dispatchKpis.delayedCount > 0
              ? 'bg-rose-950/40 border-rose-500/50 hover:bg-rose-950/60'
              : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-mono text-rose-400">
            <span>EM ATRASO (&gt;20M)</span>
            <AlertTriangle className={`w-4 h-4 text-rose-400 ${dispatchKpis.delayedCount > 0 ? 'animate-bounce' : ''}`} />
          </div>
          <div className="text-3xl font-black font-mono text-rose-400 my-1 tracking-tight flex items-baseline gap-2">
            <span>{dispatchKpis.delayedCount}</span>
            {dispatchKpis.delayedCount > 0 && (
              <span className="text-[10px] font-sans font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500 text-white">
                CRÍTICO
              </span>
            )}
          </div>
          <div className="text-[11px] font-semibold text-rose-300/90">
            {dispatchKpis.delayedCount > 0 ? 'SLA estourado (>20 min)' : 'Zero atrasos ativos'}
          </div>
        </button>

        {/* KPI 5: Taxa de Conformidade do SLA de 20 min */}
        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/30 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs font-bold font-mono text-indigo-300">
            <span>CONFORMIDADE SLA</span>
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black font-mono text-indigo-300 my-1 tracking-tight">
            {dispatchKpis.complianceRate}%
          </div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>TMD Médio:</span>
            <span className="font-mono font-bold text-white">{formatDuration(dispatchKpis.avgSeconds)}</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. BARRA DE STATUS VISUAL DO SLA (DISTRIBUIÇÃO DA OPERAÇÃO)                */}
      {/* ========================================================================= */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-300 gap-2">
          <span className="font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Distribuição de Ocorrências por Faixa de SLA (Meta: 20m)
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>&lt; 14 min (No Prazo): <b>{enrichedRecords.filter((r) => r.elapsedSeconds < 14 * 60).length}</b></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>14-20 min (Atenção): <b>{enrichedRecords.filter((r) => r.elapsedSeconds >= 14 * 60 && r.elapsedSeconds <= 20 * 60).length}</b></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>&gt; 20 min (Atraso): <b>{dispatchKpis.delayedCount}</b></span>
            </span>
          </div>
        </div>

        {/* Barra de Progresso Visual Segmentada */}
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          {enrichedRecords.length > 0 && (
            <>
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${(enrichedRecords.filter((r) => r.elapsedSeconds < 14 * 60).length / enrichedRecords.length) * 100}%`
                }}
                title="No Prazo (< 14 min)"
              />
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{
                  width: `${(enrichedRecords.filter((r) => r.elapsedSeconds >= 14 * 60 && r.elapsedSeconds <= 20 * 60).length / enrichedRecords.length) * 100}%`
                }}
                title="Atenção (14 a 20 min)"
              />
              <div
                className="h-full bg-rose-500 transition-all duration-500 animate-pulse"
                style={{
                  width: `${(dispatchKpis.delayedCount / enrichedRecords.length) * 100}%`
                }}
                title="Em Atraso (> 20 min)"
              />
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CONTROLES E FILTROS RÁPIDOS DA FILA DE DESPACHO                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        
        {/* Abas Rápidas de Status */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setStatusFilter('TODAS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              statusFilter === 'TODAS'
                ? 'bg-cyan-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todas ({enrichedRecords.length})
          </button>
          
          <button
            type="button"
            onClick={() => setStatusFilter('ATRASADAS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'ATRASADAS'
                ? 'bg-rose-500 text-white font-black ring-2 ring-rose-400/50'
                : dispatchKpis.delayedCount > 0
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 hover:bg-rose-900'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Em Atraso &gt;20m ({dispatchKpis.delayedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('EM_ANDAMENTO')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'EM_ANDAMENTO'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Em Andamento ({dispatchKpis.inProgressCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('PENDENTES')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'PENDENTES'
                ? 'bg-blue-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Aguardando ({dispatchKpis.pendingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('CONCLUIDAS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'CONCLUIDAS'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Concluídas ({dispatchKpis.completedCount})</span>
          </button>
        </div>

        {/* Ferramentas de Visualização e Filtro Secundário */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Filtro por Filial */}
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="h-9 px-2.5 bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="TODAS">Todas as Filiais</option>
              {BRANCH_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 px-2.5 bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="sla_critical">Prioridade: SLA Crítico</option>
            <option value="recent">Mais Recentes</option>
            <option value="value">Maior Valor Financeiro</option>
          </select>

          {/* Campo de Busca Rápida */}
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ocorrência..."
              className="w-full h-9 pl-8 pr-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </div>

          {/* Alternador de Layout Cards vs Tabela */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Modo Cards Táticos"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Modo Tabela CCO"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. LISTA DE OCORRÊNCIAS DA FILA DE DESPACHO (CARDS OU TABELA)              */}
      {/* ========================================================================= */}
      {filteredAndSortedRecords.length === 0 ? (
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl py-12 px-4 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-slate-200">
            Nenhuma ocorrência encontrada com os filtros selecionados.
          </p>
          <p className="text-xs text-slate-400">
            Todos os despachos estão atualizados ou não há registros com este critério.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        
        /* MODO CARDS TÁTICOS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedRecords.map((rec) => {
            const isCritical = rec.slaUrgency === 'critical';
            const isWarning = rec.slaUrgency === 'warning';
            const isDone = rec.isCompleted;

            return (
              <div
                key={rec.id}
                className={`rounded-2xl p-4 transition-all border flex flex-col justify-between gap-3 relative overflow-hidden shadow-lg ${
                  isCritical
                    ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-900 border-rose-500/60 ring-1 ring-rose-500/40 shadow-rose-950/30'
                    : isWarning
                    ? 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border-amber-500/50 shadow-amber-950/20'
                    : isDone
                    ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-850/80 border-slate-700/80 hover:border-cyan-500/60'
                }`}
              >
                {/* Faixa superior de Urgência de SLA */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-white bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-700">
                      {rec.protocol}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase font-mono"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[rec.category]}25`,
                        color: CATEGORY_COLORS[rec.category],
                      }}
                    >
                      {rec.categoryLabel}
                    </span>
                  </div>

                  {/* Badge de SLA com Cronômetro Dinâmico */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isCritical ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-mono font-black flex items-center gap-1 animate-pulse">
                        <Flame className="w-3 h-3" />
                        <span>ATRASO (+{formatDuration(rec.overtimeSeconds)})</span>
                      </span>
                    ) : isWarning ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Resta {formatDuration(rec.remainingSeconds)}</span>
                      </span>
                    ) : isDone ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SLA {formatDuration(rec.elapsedSeconds)}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(rec.elapsedSeconds)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Dados da Ocorrência e Local */}
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between text-slate-300 font-bold">
                      <span className="truncate max-w-[200px]" title={rec.branch}>{rec.branch}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatDateTimeBR(rec.timestamp).slice(11, 16)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      <span className="truncate">{rec.cameraOrLocation}</span>
                    </div>
                  </div>

                  {/* Resumo da Ocorrência */}
                  <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                    {rec.summary}
                  </p>

                  {/* Operador Designado & Origem */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <UserCheck className="w-3 h-3 text-cyan-400" />
                      <span className="truncate max-w-[150px]">{rec.assignedOperator || rec.operatorOrAgent}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {rec.source === 'CENTRAL_CFTV' ? '🖥️ CFTV' : '📱 Ronda'}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso do SLA de 20 Minutos */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Tempo Decorrido / SLA 20m</span>
                    <span className={isCritical ? 'text-rose-400 font-bold' : isWarning ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      {formatDuration(rec.elapsedSeconds)} / 20:00 ({rec.slaProgressPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCritical
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : isDone
                          ? 'bg-emerald-500'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${rec.slaProgressPct}%` }}
                    />
                  </div>
                </div>

                {/* Rodapé do Card com Ação de Detalhes */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <div className="font-mono text-xs">
                    {rec.lossValue > 0 ? (
                      <span className="text-rose-400 font-bold">Perda: {formatBRL(rec.lossValue)}</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">Recup: {formatBRL(rec.recoveredValue)}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectRecord?.(rec)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Despacho</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        
        /* MODO TABELA CCO */
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
          <table className="w-full text-left text-xs text-slate-300 font-sans">
            <thead className="bg-slate-900 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Protocolo</th>
                <th className="py-3 px-3">Status Fila</th>
                <th className="py-3 px-3">SLA (Meta: 20m)</th>
                <th className="py-3 px-3">Filial / Local</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3">Operador / Agente</th>
                <th className="py-3 px-3 text-right">Risco / Perda</th>
                <th className="py-3 px-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAndSortedRecords.map((rec) => {
                const isCritical = rec.slaUrgency === 'critical';
                const isWarning = rec.slaUrgency === 'warning';

                return (
                  <tr
                    key={rec.id}
                    className={`hover:bg-slate-850/80 transition-colors ${
                      isCritical ? 'bg-rose-950/20' : isWarning ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    {/* Protocolo */}
                    <td className="py-3 px-3.5 font-mono font-bold text-cyan-400">
                      {rec.protocol}
                    </td>

                    {/* Status da Fila */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                        rec.isPending
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : rec.isClaimed
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {rec.status === 'PENDENTE' ? 'Aguardando' : rec.status === 'EM_ANALISE' ? 'Em Atendimento' : 'Concluído'}
                      </span>
                    </td>

                    {/* Cronômetro e SLA */}
                    <td className="py-3 px-3">
                      <div className="space-y-1 min-w-[140px]">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className={isCritical ? 'text-rose-400 font-extrabold flex items-center gap-1' : isWarning ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                            {isCritical && <Flame className="w-3 h-3 text-rose-500 animate-pulse" />}
                            {formatDuration(rec.elapsedSeconds)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {isCritical ? `+${formatDuration(rec.overtimeSeconds)} ATRASO` : `Restam ${formatDuration(rec.remainingSeconds)}`}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : rec.isCompleted ? 'bg-emerald-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${rec.slaProgressPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Filial */}
                    <td className="py-3 px-3 font-semibold text-white max-w-[150px] truncate" title={rec.branch}>
                      <div>{rec.branch}</div>
                      <div className="text-[10px] text-slate-400 font-normal truncate">{rec.cameraOrLocation}</div>
                    </td>

                    {/* Categoria */}
                    <td className="py-3 px-3">
                      <span 
                        className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase font-mono inline-block"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[rec.category]}20`,
                          color: CATEGORY_COLORS[rec.category],
                        }}
                      >
                        {rec.categoryLabel}
                      </span>
                    </td>

                    {/* Operador */}
                    <td className="py-3 px-3 text-slate-300 text-xs">
                      {rec.assignedOperator || rec.operatorOrAgent}
                    </td>

                    {/* Perda / Risco */}
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {rec.lossValue > 0 ? (
                        <span className="text-rose-400">{formatBRL(rec.lossValue)}</span>
                      ) : (
                        <span className="text-emerald-400">{formatBRL(rec.recoveredValue)}</span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectRecord?.(rec)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
