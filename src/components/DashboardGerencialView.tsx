/**
 * @file DashboardGerencialView.tsx
 * @description Tela de relatórios gerenciais e inteligência de segurança corporativa exibindo:
 * 1. KPIs executivos (Total ocorrências, Perdas vs. Recuperação, Taxa de sucesso)
 * 2. Indicadores de Perfil Suspeito por Loja e Produto:
 *    - Distribuição por Gênero & Cor da Pele
 *    - Cruzamento de Faixa Etária vs. Estatura vs. Vestimentas e Acessórios
 *    - Ranking dos Setores e Produtos Mais Visados
 * 3. Gráficos de monitoramento:
 *    - Ocorrências por Filial
 *    - Total de Perdas vs. Recuperação Financeira
 *    - Distribuição por Categoria de Ocorrência
 *    - Evolução Temporal de Eventos
 * 4. Histórico completo em formato de tabela com visualização detalhada do perfil suspeito e exportação CSV.
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  Building2,
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Smartphone,
  MonitorPlay,
  AlertTriangle,
  X,
  Layers,
  ArrowUpDown,
  UserCheck,
  Palette,
  Shirt,
  Ruler,
  Briefcase,
  Sparkles,
  ShoppingBag,
  Store,
  Tv
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { UnifiedEventRecord, EventCategoryKey, SuspectProfile, RoutineTask } from '../types';
import { BRANCH_OPTIONS, EVENT_TYPE_OPTIONS } from '../services/eventService';
import { CATEGORY_COLORS, CATEGORY_NAMES, formatBRL, formatDateTimeBR } from '../services/dashboardData';
import {
  GENDER_OPTIONS,
  SKIN_TONE_OPTIONS,
  AGE_RANGE_OPTIONS,
  HEIGHT_RANGE_OPTIONS,
  CLOTHING_STYLE_OPTIONS
} from './category-forms/SuspectProfileFields';
import { VideoWallMode } from './VideoWallMode';
import { DispatchQueueMonitor } from './DispatchQueueMonitor';
import { RoutineSupervisionView } from './RoutineSupervisionView';
import { getStoredRoutineTasks, subscribeToRoutineTasks } from '../services/routineService';
import { Trophy, Users } from 'lucide-react';

interface DashboardGerencialViewProps {
  records: UnifiedEventRecord[];
}

export const DashboardGerencialView: React.FC<DashboardGerencialViewProps> = ({ records }) => {
  // Aba Ativa do Dashboard
  const [dashboardTab, setDashboardTab] = useState<'BI' | 'SUPERVISION'>('BI');

  // Estado e sincronização em tempo real das Tarefas de Rotina Preventiva
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>(() => getStoredRoutineTasks());

  React.useEffect(() => {
    const unsubscribe = subscribeToRoutineTasks((updated) => {
      setRoutineTasks(updated);
    });
    return () => unsubscribe();
  }, []);

  const refreshRoutineTasks = () => {
    setRoutineTasks(getStoredRoutineTasks());
  };

  // Modo Video Wall / TV Mode
  const [isVideoWallActive, setIsVideoWallActive] = useState<boolean>(false);

  // Filtros
  const [selectedBranch, setSelectedBranch] = useState<string>('TODAS');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedSource, setSelectedSource] = useState<string>('TODAS');
  const [selectedProductSector, setSelectedProductSector] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal de Detalhes
  const [selectedRecord, setSelectedRecord] = useState<UnifiedEventRecord | null>(null);

  // Filtragem dos registros
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Filtro por Filial
      if (selectedBranch !== 'TODAS' && rec.branch !== selectedBranch) {
        return false;
      }
      // Filtro por Categoria
      if (selectedCategory !== 'TODAS' && rec.category !== selectedCategory) {
        return false;
      }
      // Filtro por Origem
      if (selectedSource !== 'TODAS' && rec.source !== selectedSource) {
        return false;
      }
      // Filtro por Setor/Produto
      if (selectedProductSector !== 'TODOS' && rec.productSector !== selectedProductSector) {
        return false;
      }
      // Filtro por Busca Textual
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProto = rec.protocol.toLowerCase().includes(q);
        const matchesBranch = rec.branch.toLowerCase().includes(q);
        const matchesSummary = rec.summary.toLowerCase().includes(q);
        const matchesOperator = rec.operatorOrAgent.toLowerCase().includes(q);
        const matchesLoc = rec.cameraOrLocation.toLowerCase().includes(q);
        const matchesSector = (rec.productSector || '').toLowerCase().includes(q);
        if (!matchesProto && !matchesBranch && !matchesSummary && !matchesOperator && !matchesLoc && !matchesSector) {
          return false;
        }
      }
      return true;
    });
  }, [records, selectedBranch, selectedCategory, selectedSource, selectedProductSector, searchQuery]);

  // Setores de produto presentes na base
  const availableSectors = useMemo(() => {
    const sectors = new Set<string>();
    records.forEach((r) => {
      if (r.productSector) sectors.add(r.productSector);
    });
    return Array.from(sectors);
  }, [records]);

  // ==========================================
  // CÁLCULO DE KPIS EXECUTIVOS
  // ==========================================
  const kpis = useMemo(() => {
    const totalCount = filteredRecords.length;
    const totalLoss = filteredRecords.reduce((acc, r) => acc + (r.lossValue || 0), 0);
    const totalRecovered = filteredRecords.reduce((acc, r) => acc + (r.recoveredValue || 0), 0);
    const recoveryRate = (totalLoss + totalRecovered) > 0 
      ? Math.min(100, Math.round((totalRecovered / (totalLoss + totalRecovered)) * 100)) 
      : 100;
    const resolvedCount = filteredRecords.filter((r) => r.status === 'CONCLUIDO').length;
    const recordsWithProfile = filteredRecords.filter((r) => r.suspectProfile).length;

    return {
      totalCount,
      totalLoss,
      totalRecovered,
      recoveryRate,
      resolvedCount,
      recordsWithProfile,
    };
  }, [filteredRecords]);

  // ==========================================
  // INDICADORES BI: PERFIL SUSPEITO
  // ==========================================
  const suspectBI = useMemo(() => {
    const profileRecords = filteredRecords.filter((r) => r.suspectProfile);

    // 1. Distribuição de Gênero
    const genderMap: Record<string, number> = {};
    // 2. Distribuição de Cor da Pele
    const skinToneMap: Record<string, number> = {};
    // 3. Distribuição de Faixa Etária
    const ageMap: Record<string, number> = {};
    // 4. Distribuição de Estatura
    const heightMap: Record<string, number> = {};
    // 5. Padrão de Vestimenta
    const clothingMap: Record<string, number> = {};
    // 6. Acessórios de Ocultação
    const accessoriesMap: Record<string, number> = {};
    // 7. Cruzamento: Setores Mais Visados
    const sectorMap: Record<string, { sector: string; count: number; loss: number }> = {};

    profileRecords.forEach((rec) => {
      const p = rec.suspectProfile!;

      // Gênero
      const genderLabel = GENDER_OPTIONS.find((g) => g.id === p.gender)?.label || p.gender;
      genderMap[genderLabel] = (genderMap[genderLabel] || 0) + 1;

      // Pele
      const skinLabel = SKIN_TONE_OPTIONS.find((s) => s.id === p.skinTone)?.label || p.skinTone;
      skinToneMap[skinLabel] = (skinToneMap[skinLabel] || 0) + 1;

      // Idade
      const ageLabel = AGE_RANGE_OPTIONS.find((a) => a.id === p.ageRange)?.label || p.ageRange;
      ageMap[ageLabel] = (ageMap[ageLabel] || 0) + 1;

      // Estatura
      const heightLabel = HEIGHT_RANGE_OPTIONS.find((h) => h.id === p.heightRange)?.label || p.heightRange;
      heightMap[heightLabel] = (heightMap[heightLabel] || 0) + 1;

      // Vestimenta
      const clothLabel = CLOTHING_STYLE_OPTIONS.find((c) => c.id === p.clothingStyle)?.label || p.clothingStyle;
      clothingMap[clothLabel] = (clothingMap[clothLabel] || 0) + 1;

      // Acessórios
      if (Array.isArray(p.carryingAccessories)) {
        p.carryingAccessories.forEach((acc) => {
          accessoriesMap[acc] = (accessoriesMap[acc] || 0) + 1;
        });
      }

      // Setor
      const sector = rec.productSector || 'Geral';
      if (!sectorMap[sector]) {
        sectorMap[sector] = { sector, count: 0, loss: 0 };
      }
      sectorMap[sector].count += 1;
      sectorMap[sector].loss += rec.lossValue || 0;
    });

    const genderChart = Object.keys(genderMap).map((k) => ({ name: k, value: genderMap[k] }));
    const skinToneChart = Object.keys(skinToneMap).map((k) => ({ name: k, value: skinToneMap[k] }));
    const ageChart = Object.keys(ageMap).map((k) => ({ name: k, value: ageMap[k] }));
    const clothingChart = Object.keys(clothingMap).map((k) => ({ name: k, value: clothingMap[k] })).sort((a, b) => b.value - a.value);
    const accessoriesChart = Object.keys(accessoriesMap).map((k) => ({ name: k, value: accessoriesMap[k] })).sort((a, b) => b.value - a.value).slice(0, 6);
    const topSectors = Object.values(sectorMap).sort((a, b) => b.count - a.count);

    return {
      totalProfiles: profileRecords.length,
      genderChart,
      skinToneChart,
      ageChart,
      clothingChart,
      accessoriesChart,
      topSectors,
    };
  }, [filteredRecords]);

  // ==========================================
  // DADOS PARA GRÁFICO 1: OCORRÊNCIAS POR FILIAL
  // ==========================================
  const branchChartData = useMemo(() => {
    const branchMap: Record<string, { branch: string; total: number; perda: number; recuperado: number }> = {};

    filteredRecords.forEach((rec) => {
      const shortName = rec.branch.replace(/^\d+\s*-\s*/, '').slice(0, 16);
      if (!branchMap[shortName]) {
        branchMap[shortName] = { branch: shortName, total: 0, perda: 0, recuperado: 0 };
      }
      branchMap[shortName].total += 1;
      branchMap[shortName].perda += rec.lossValue || 0;
      branchMap[shortName].recuperado += rec.recoveredValue || 0;
    });

    return Object.values(branchMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 7);
  }, [filteredRecords]);

  // ==========================================
  // DADOS PARA GRÁFICO 2: PERDAS VS RECUPERAÇÃO POR CATEGORIA
  // ==========================================
  const financialComparisonData = useMemo(() => {
    const catMap: Record<string, { categoryName: string; Perdas: number; Recuperado: number }> = {};

    filteredRecords.forEach((rec) => {
      const name = rec.categoryLabel || CATEGORY_NAMES[rec.category] || rec.category;
      if (!catMap[name]) {
        catMap[name] = { categoryName: name, Perdas: 0, Recuperado: 0 };
      }
      catMap[name].Perdas += rec.lossValue || 0;
      catMap[name].Recuperado += rec.recoveredValue || 0;
    });

    return Object.values(catMap).sort((a, b) => (b.Perdas + b.Recuperado) - (a.Perdas + a.Recuperado));
  }, [filteredRecords]);

  // ==========================================
  // DADOS PARA GRÁFICO 3: DISTRIBUIÇÃO POR CATEGORIA (PIE)
  // ==========================================
  const categoryDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach((rec) => {
      counts[rec.category] = (counts[rec.category] || 0) + 1;
    });

    return Object.keys(counts).map((key) => {
      const catKey = key as EventCategoryKey;
      return {
        name: CATEGORY_NAMES[catKey] || key,
        key: catKey,
        value: counts[key],
        color: CATEGORY_COLORS[catKey] || '#3B82F6',
      };
    });
  }, [filteredRecords]);

  // ==========================================
  // DADOS PARA GRÁFICO 4: EVOLUÇÃO TEMPORAL
  // ==========================================
  const timelineData = useMemo(() => {
    const dayMap: Record<string, { date: string; total: number; cftv: number; ronda: number }> = {};

    filteredRecords.forEach((rec) => {
      const datePart = rec.timestamp.slice(0, 10);
      const formatted = datePart.split('-').reverse().slice(0, 2).join('/');
      if (!dayMap[formatted]) {
        dayMap[formatted] = { date: formatted, total: 0, cftv: 0, ronda: 0 };
      }
      dayMap[formatted].total += 1;
      if (rec.source === 'CENTRAL_CFTV') dayMap[formatted].cftv += 1;
      if (rec.source === 'RONDA_MOBILE') dayMap[formatted].ronda += 1;
    });

    return Object.values(dayMap).slice(-8);
  }, [filteredRecords]);

  // Exportar Tabela para CSV
  const handleExportCSV = () => {
    const headers = [
      'Protocolo',
      'Data_Hora',
      'Origem',
      'Filial',
      'Categoria',
      'Setor_Produto',
      'Genero_Suspeito',
      'Cor_Pele_Suspeito',
      'Faixa_Etaria',
      'Estatura',
      'Vestimenta',
      'Acessorios',
      'Perda_Estimada_R$',
      'Recuperado_R$',
      'Status',
      'Operador',
      'Local_Camera',
      'Resumo'
    ];
    const rows = filteredRecords.map((r) => {
      const sp = r.suspectProfile;
      return [
        `"${r.protocol}"`,
        `"${r.timestamp}"`,
        `"${r.source}"`,
        `"${r.branch.replace(/"/g, '""')}"`,
        `"${r.categoryLabel}"`,
        `"${(r.productSector || '-').replace(/"/g, '""')}"`,
        `"${sp?.gender || '-'}"`,
        `"${sp?.skinTone || '-'}"`,
        `"${sp?.ageRange || '-'}"`,
        `"${sp?.heightRange || '-'}"`,
        `"${sp?.clothingStyle || '-'}"`,
        `"${(sp?.carryingAccessories || []).join('; ').replace(/"/g, '""')}"`,
        r.lossValue.toFixed(2),
        r.recoveredValue.toFixed(2),
        `"${r.status}"`,
        `"${r.operatorOrAgent.replace(/"/g, '""')}"`,
        `"${r.cameraOrLocation.replace(/"/g, '""')}"`,
        `"${r.summary.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_gerencial_ocorrencias_perfil_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS_PALETTE = ['#2563EB', '#E11D48', '#059669', '#D97706', '#9333EA', '#0891B2', '#CA8A04'];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header do Dashboard com Ação de Exportação */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Dashboard Gerencial & BI de Segurança</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold">
                  Indicador de Perfil Ativo
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Cruzamento analítico de perdas, produtos visados e características físicas dos suspeitos por loja.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            id="btn-open-tv-mode"
            onClick={() => setIsVideoWallActive(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 border border-indigo-400/30"
          >
            <Tv className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Modo Video Wall / TV Mode</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            Exportar CSV / Excel
          </button>
        </div>
      </div>

      {/* Video Wall / TV Mode (Centro de Comando Fullscreen) */}
      {isVideoWallActive && (
        <VideoWallMode
          records={records}
          onClose={() => setIsVideoWallActive(false)}
        />
      )}

      {/* SELETOR DE MÓDULOS GERENCIAIS: BI & RELATÓRIO vs SUPERVISÃO DE ROTINA & RANKING */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            id="btn-tab-dashboard-bi"
            onClick={() => setDashboardTab('BI')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              dashboardTab === 'BI'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>BI & Inteligência de Ocorrências</span>
          </button>

          <button
            type="button"
            id="btn-tab-dashboard-supervision"
            onClick={() => setDashboardTab('SUPERVISION')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              dashboardTab === 'SUPERVISION'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-900" />
            <span>Supervisão da Equipe & Gamificação</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950 text-amber-300 font-mono font-bold">
              Leaderboard Ativo
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium px-3 hidden md:block">
          {dashboardTab === 'BI' && '📊 KPIs executivos, perfil de perdas e histórico.'}
          {dashboardTab === 'SUPERVISION' && '🏆 Ranking de operadores, taxa de checklists e conversão de tempo ocioso.'}
        </div>
      </div>

      {/* RENDERIZAÇÃO: ABA DE SUPERVISÃO E GAMIFICAÇÃO */}
      {dashboardTab === 'SUPERVISION' && (
        <RoutineSupervisionView
          tasks={routineTasks}
          onTaskUpdated={refreshRoutineTasks}
        />
      )}

      {/* RENDERIZAÇÃO: ABA DE BI & INTELIGÊNCIA */}
      {dashboardTab === 'BI' && (
        <>
      {/* Barra de Filtros Globais */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filtros do Relatório Corporativo</span>
          </div>
          <span className="text-slate-400 font-normal">
            Exibindo <b className="text-slate-800">{filteredRecords.length}</b> de <b>{records.length}</b> ocorrências
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* 1. Filial */}
          <div className="space-y-1">
            <label className="font-bold text-slate-500">Filial / Loja:</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODAS">Todas as Filiais (Rede)</option>
              {BRANCH_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* 2. Categoria */}
          <div className="space-y-1">
            <label className="font-bold text-slate-500">Tipo de Ocorrência:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODAS">Todas as 7 Categorias</option>
              {EVENT_TYPE_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* 3. Setor / Produto */}
          <div className="space-y-1">
            <label className="font-bold text-slate-500">Setor / Produto Visado:</label>
            <select
              value={selectedProductSector}
              onChange={(e) => setSelectedProductSector(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODOS">Todos os Setores</option>
              {availableSectors.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* 4. Origem do Registro */}
          <div className="space-y-1">
            <label className="font-bold text-slate-500">Canal / Origem:</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODAS">Todos os Canais</option>
              <option value="RONDA_MOBILE">📱 Ronda Mobile (Solo)</option>
              <option value="CENTRAL_CFTV">🖥️ Central CFTV (Câmeras)</option>
            </select>
          </div>

          {/* 5. Busca */}
          <div className="space-y-1">
            <label className="font-bold text-slate-500">Busca Textual:</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Protocolo, operador..."
                className="w-full h-10 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

        </div>
      </div>

      {/* Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Volume de Ocorrências</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{kpis.totalCount}</div>
          <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {kpis.resolvedCount} concluídas ({kpis.recordsWithProfile} com perfil mapeado)
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Perda Bruta Estimada</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{formatBRL(kpis.totalLoss)}</div>
          <div className="text-[11px] font-medium text-slate-400">
            Itens furtados ou avariados
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Valor Recuperado / Preservado</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{formatBRL(kpis.totalRecovered)}</div>
          <div className="text-[11px] font-medium text-slate-400">
            Ações de flagrante e inibição
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Taxa de Recuperação</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">{kpis.recoveryRate}%</div>
          <div className="text-[11px] font-semibold text-indigo-600">
            Eficiência da fiscalização & CFTV
          </div>
        </div>

      </div>
      {/* ========================================================================= */}
      {/* SEÇÃO DEDICADA: FILA DE DESPACHO DE OCORRÊNCIAS COM SLA DE 20 MINUTOS      */}
      {/* ========================================================================= */}
      <DispatchQueueMonitor
        records={records}
        onSelectRecord={(rec) => setSelectedRecord(rec)}
      />

      {/* ========================================================================= */}
      {/* SEÇÃO DEDICADA: INDICADOR DE PERFIL SUSPEITO POR LOJA E PRODUTO (NOVO)     */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white shadow-xl space-y-6 border border-slate-700">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">Indicador de Perfil Suspeito por Loja e Produto</h3>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase">
                  BI Segurança
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Padrões biométricos, comportamentais e vestuário cruzados com categorias de mercadorias.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 self-start sm:self-auto">
            {suspectBI.totalProfiles} indivíduos mapeados
          </div>
        </div>

        {/* Grid de Métricas de Perfil Suspeito */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Gênero Identificado */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                Gênero / Formação
              </span>
            </div>
            <div className="space-y-2">
              {suspectBI.genderChart.map((g) => {
                const pct = suspectBI.totalProfiles > 0 ? Math.round((g.value / suspectBI.totalProfiles) * 100) : 0;
                return (
                  <div key={g.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{g.name}</span>
                      <span className="text-blue-400 font-mono">{pct}% ({g.value})</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Cor da Pele / Etnia */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Cor da Pele / Etnia
              </span>
            </div>
            <div className="space-y-2">
              {suspectBI.skinToneChart.map((st) => {
                const pct = suspectBI.totalProfiles > 0 ? Math.round((st.value / suspectBI.totalProfiles) * 100) : 0;
                return (
                  <div key={st.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{st.name}</span>
                      <span className="text-amber-400 font-mono">{pct}% ({st.value})</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Faixa Etária */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Faixa Etária Estimada
              </span>
            </div>
            <div className="space-y-2">
              {suspectBI.ageChart.map((age) => {
                const pct = suspectBI.totalProfiles > 0 ? Math.round((age.value / suspectBI.totalProfiles) * 100) : 0;
                return (
                  <div key={age.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{age.name}</span>
                      <span className="text-emerald-400 font-mono">{pct}% ({age.value})</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Padrão de Traje / Vestimenta */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-rose-400" />
                Traje Mais Frequente
              </span>
            </div>
            <div className="space-y-2">
              {suspectBI.clothingChart.slice(0, 4).map((c) => {
                const pct = suspectBI.totalProfiles > 0 ? Math.round((c.value / suspectBI.totalProfiles) * 100) : 0;
                return (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300 truncate max-w-[130px]">{c.name}</span>
                      <span className="text-rose-400 font-mono">{pct}% ({c.value})</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Cruzamento: Setores & Produtos Mais Visados vs. Meios de Ocultação */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          
          {/* Top Setores & Produtos */}
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                Produtos / Setores com Maior Incidência de Perfil Suspeito
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Ranking de Risco</span>
            </div>

            <div className="space-y-2.5">
              {suspectBI.topSectors.slice(0, 5).map((sec, idx) => (
                <div key={sec.sector} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-200">{sec.sector}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-slate-300 font-bold block">{sec.count} ocorrências</span>
                    <span className="text-[10px] text-rose-400">{formatBRL(sec.loss)} em risco</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acessórios de Ocultação Mais Utilizados */}
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                Acessórios de Ocultação & Disfarces Mais Identificados
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Modus Operandi</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {suspectBI.accessoriesChart.map((acc) => (
                <div key={acc.name} className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs flex items-center gap-2">
                  <span className="font-bold text-slate-200">{acc.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-extrabold">
                    {acc.value} ocorrências
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Grid de Gráficos Tradicionais (2x2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Ocorrências por Filial */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Top Filiais com Maior Incidência</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">Volume Total</span>
          </div>

          <div className="flex-1 w-full h-72 sm:h-80 min-h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" key={`branch-chart-${branchChartData.length}`}>
              <BarChart data={branchChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="branch" tick={{ fontSize: 11, fill: '#64748B' }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} ocorrências`, 'Total']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Total de Perdas vs Recuperação */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Perdas vs. Recuperação por Categoria</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">Em Reais (R$)</span>
          </div>

          <div className="flex-1 w-full h-72 sm:h-80 min-h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" key={`fin-chart-${financialComparisonData.length}`}>
              <BarChart data={financialComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="categoryName" tick={{ fontSize: 11, fill: '#64748B' }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `R$${val}`} />
                <Tooltip
                  formatter={(value: any, name: any) => [formatBRL(value), name]}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Perdas" fill="#E11D48" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="Recuperado" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Distribuição por Categoria (Pizza) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Distribuição por Categoria</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">7 Categorias</span>
          </div>

          <div className="flex-1 w-full h-72 sm:h-80 min-h-[280px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" key={`cat-pie-${kpis.totalCount}`}>
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="45%"
                  innerRadius="56%"
                  outerRadius="82%"
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {categoryDistributionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} ocorrências`, name]}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none text-center">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-800">{kpis.totalCount}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">TOTAL</span>
            </div>
          </div>
        </div>

        {/* Gráfico 4: Evolução Temporal */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Evolução por Canal (CFTV vs. Ronda)</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">Últimos Registros</span>
          </div>

          <div className="flex-1 w-full h-72 sm:h-80 min-h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" key={`time-chart-${timelineData.length}`}>
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="cftv" name="🖥️ Central CFTV" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.2} isAnimationActive={false} />
                <Area type="monotone" dataKey="ronda" name="📱 Ronda Mobile" stroke="#10B981" fill="#10B981" fillOpacity={0.2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* HISTÓRICO COMPLETO EM TABELA COM PERFIL   */}
      {/* ========================================== */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Histórico Detalhado & Registro de Inteligência</h3>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            {filteredRecords.length} registros no filtro
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Protocolo</th>
                <th className="py-3 px-3">Data / Hora</th>
                <th className="py-3 px-3">Origem</th>
                <th className="py-3 px-3">Filial</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3">Setor / Produto</th>
                <th className="py-3 px-3">Perfil Suspeito (BI)</th>
                <th className="py-3 px-3 text-right">Perda</th>
                <th className="py-3 px-3 text-right">Recuperado</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const sp = rec.suspectProfile;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Protocolo */}
                      <td className="py-3 px-3 font-mono font-bold text-blue-600">
                        {rec.protocol}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {formatDateTimeBR(rec.timestamp)}
                      </td>

                      {/* Origem */}
                      <td className="py-3 px-3">
                        {rec.source === 'CENTRAL_CFTV' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[10px]">
                            <MonitorPlay className="w-3 h-3" /> CFTV
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                            <Smartphone className="w-3 h-3" /> Ronda
                          </span>
                        )}
                      </td>

                      {/* Filial */}
                      <td className="py-3 px-3 font-semibold text-slate-900 max-w-[140px] truncate" title={rec.branch}>
                        {rec.branch}
                      </td>

                      {/* Categoria */}
                      <td className="py-3 px-3">
                        <span 
                          className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase inline-block"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[rec.category]}15`,
                            color: CATEGORY_COLORS[rec.category],
                          }}
                        >
                          {rec.categoryLabel}
                        </span>
                      </td>

                      {/* Setor / Produto */}
                      <td className="py-3 px-3 text-slate-600 font-medium max-w-[120px] truncate">
                        {rec.productSector || '-'}
                      </td>

                      {/* Perfil Suspeito Resumido */}
                      <td className="py-3 px-3">
                        {sp ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {sp.gender === 'masculino' ? 'Masc' : sp.gender === 'feminino' ? 'Fem' : 'Grupo'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                              {sp.skinTone}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                              {sp.clothingStyle.split('_')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Perda */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                        {formatBRL(rec.lossValue)}
                      </td>

                      {/* Recuperado */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                        {formatBRL(rec.recoveredValue)}
                      </td>

                      {/* Botão Ver Detalhes */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(rec)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* ========================================== */}
      {/* MODAL DE DETALHES DO EVENTO SELECIONADO   */}
      {/* ========================================== */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                  {selectedRecord.protocol}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {selectedRecord.source === 'CENTRAL_CFTV' ? '🖥️ Registro de CFTV' : '📱 Registro de Ronda Mobile'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Filial / Unidade:</span>
                <span className="font-bold text-slate-800">{selectedRecord.branch}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Categoria da Ocorrência:</span>
                <span className="font-bold text-slate-800">{selectedRecord.categoryLabel}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Setor / Produto Visado:</span>
                <span className="font-bold text-slate-800">{selectedRecord.productSector || 'Não especificado'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Data / Hora de Registro:</span>
                <span className="font-mono font-semibold text-slate-800">{formatDateTimeBR(selectedRecord.timestamp)}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Operador / Agente:</span>
                <span className="font-semibold text-slate-800">{selectedRecord.assignedOperator || selectedRecord.operatorOrAgent}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Local / Câmera:</span>
                <span className="font-semibold text-slate-800">{selectedRecord.cameraOrLocation}</span>
              </div>

              {selectedRecord.slaFormatted && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl sm:col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800">
                    <span className="text-sm">⏱️</span>
                    <span className="text-xs font-bold">Tempo de Tratamento (SLA):</span>
                  </div>
                  <span className="font-mono font-extrabold text-amber-900 text-sm">{selectedRecord.slaFormatted}</span>
                </div>
              )}

              <div className="bg-slate-50 p-3.5 rounded-2xl flex items-center justify-between sm:col-span-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Perda Estimada:</span>
                  <span className="font-mono font-bold text-rose-600 text-sm">{formatBRL(selectedRecord.lossValue)}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Recuperado / Preservado:</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">{formatBRL(selectedRecord.recoveredValue)}</span>
                </div>
              </div>
            </div>

            {/* MÓDULO DE PERFIL DO SUSPEITO (SE HOUVER) */}
            {selectedRecord.suspectProfile && (
              <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-rose-800 font-bold border-b border-rose-200 pb-2">
                  <UserCheck className="w-4 h-4" />
                  <span>Perfil Suspeito Registrado (BI de Prevenção de Perdas)</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                    <span className="text-[10px] text-slate-400 block">Gênero:</span>
                    <span className="font-bold text-slate-800 capitalize">{selectedRecord.suspectProfile.gender}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                    <span className="text-[10px] text-slate-400 block">Cor da Pele:</span>
                    <span className="font-bold text-slate-800 capitalize">{selectedRecord.suspectProfile.skinTone}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                    <span className="text-[10px] text-slate-400 block">Faixa Etária:</span>
                    <span className="font-bold text-slate-800">{selectedRecord.suspectProfile.ageRange}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                    <span className="text-[10px] text-slate-400 block">Estatura:</span>
                    <span className="font-bold text-slate-800 capitalize">{selectedRecord.suspectProfile.heightRange}</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-rose-100 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Padrão de Vestimenta & Detalhes:</span>
                  <p className="text-slate-800 font-medium">
                    <b className="capitalize">{selectedRecord.suspectProfile.clothingStyle.replace(/_/g, ' ')}</b>
                    {selectedRecord.suspectProfile.clothingDetails ? ` — ${selectedRecord.suspectProfile.clothingDetails}` : ''}
                  </p>
                </div>

                {selectedRecord.suspectProfile.carryingAccessories?.length > 0 && (
                  <div className="bg-white p-2.5 rounded-xl border border-rose-100 space-y-1">
                    <span className="text-[10px] text-slate-400 block">Acessórios / Disfarces:</span>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {selectedRecord.suspectProfile.carryingAccessories.map((acc) => (
                        <span key={acc} className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                          {acc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Relatório dos Fatos */}
            <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-slate-700 block">Descrição dos Fatos:</span>
              <p className="text-slate-600 leading-relaxed">{selectedRecord.summary}</p>
            </div>

            {/* Imagem de Evidência se houver */}
            {selectedRecord.evidenceUrl && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">Evidência Fotográfica / Frame:</span>
                <div className="aspect-video bg-black rounded-2xl overflow-hidden max-h-56">
                  <img
                    src={selectedRecord.evidenceUrl}
                    alt="Evidência"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Fechar Detalhes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
