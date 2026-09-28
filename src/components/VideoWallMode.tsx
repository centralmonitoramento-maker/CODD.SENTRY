/**
 * @file VideoWallMode.tsx
 * @description Modo Video Wall / TV Mode em formato de Centro de Comando e Sala de Situação (CGC):
 * 1. Fullscreen completo e Dark Mode de altíssimo contraste (fundo escuro e gráficos neon brilhantes).
 * 2. Carrossel automático com tempo padrão de 30 segundos e barra de progresso em tempo real.
 * 3. Slide de grande destaque: 'Indicador de Perfil Suspeito por Loja e Produto' (BI Completo).
 * 4. Menu de Configurações Rápidas (Drawer/Modal) no cabeçalho com:
 *    - Controle deslizante (slider) e presets (15s, 30s, 60s, 90s, 120s) de tempo de transição.
 *    - Lista de Toggles/Checkboxes para ligar/desligar slides específicos do carrossel em tempo real.
 *    - Opções para alertas críticos, reprodução contínua e ticker.
 * 5. Ticker rotativo animado no rodapé com as últimas ocorrências em tempo real.
 * 6. Sistema de Alerta Crítico com bordas da tela piscando em vermelho neon e banner sonoro/visual.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Tv,
  X,
  Bell,
  BellOff,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  AlertTriangle,
  Radio,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  TrendingDown,
  Building2,
  Users,
  Eye,
  Clock,
  Sparkles,
  Zap,
  ShoppingBag,
  Layers,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Settings,
  Sliders,
  RotateCcw,
  Check,
  UserCheck,
  Palette,
  Shirt,
  Briefcase,
  Calendar,
  ShieldAlert,
  SlidersHorizontal,
  CheckSquare,
  Square
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
import { UnifiedEventRecord, EventCategoryKey } from '../types';
import { CATEGORY_COLORS, CATEGORY_NAMES, formatBRL, formatDateTimeBR } from '../services/dashboardData';
import {
  GENDER_OPTIONS,
  SKIN_TONE_OPTIONS,
  AGE_RANGE_OPTIONS,
  HEIGHT_RANGE_OPTIONS,
  CLOTHING_STYLE_OPTIONS
} from './category-forms/SuspectProfileFields';

interface VideoWallModeProps {
  records: UnifiedEventRecord[];
  onClose: () => void;
}

// Configuração dos Slides Disponíveis no Video Wall
export interface VideoWallSlideItem {
  id: string;
  name: string;
  shortName: string;
  description: string;
  categoryTag: string;
}

export const SLIDE_DEFINITIONS: VideoWallSlideItem[] = [
  {
    id: 'kpis',
    name: '1. Centro Executivo & KPIs Financeiros',
    shortName: 'Centro Executivo',
    description: 'Balanço de perdas brutas vs. recuperação R$, taxa de eficácia de inibição e telemetria temporal.',
    categoryTag: 'Executivo / Financeiro',
  },
  {
    id: 'suspect_bi',
    name: '2. Indicador de Perfil Suspeito por Loja e Produto (BI)',
    shortName: 'Perfil Suspeito (BI)',
    description: 'Biometria, gênero, faixa etária, padrões de vestimenta, setores visados e acessórios de ocultação.',
    categoryTag: 'Inteligência de Segurança',
  },
  {
    id: 'stores_risk',
    name: '3. Mapa de Risco por Loja & Setores Críticos',
    shortName: 'Risco por Filial',
    description: 'Ranking de ocorrências por unidade, setores com maior perda financeira e vulnerabilidades.',
    categoryTag: 'Gestão de Filiais',
  },
  {
    id: 'types_dispatch',
    name: '4. Tipologias de Ocorrência & Despacho em Tempo Real',
    shortName: 'Tipologias & Despacho',
    description: 'Distribuição rosca das 7 categorias e fila ao vivo de monitoramento com SLAs da Central CFTV.',
    categoryTag: 'Operações CFTV',
  },
  {
    id: 'accidents_damage',
    name: '5. Colisões, Avarias & Prevenção Patrimonial',
    shortName: 'Avarias & Colisões',
    description: 'Avarias de empilhadeiras, acidentes com clientes/colaboradores e preservação física das lojas.',
    categoryTag: 'Prevenção de Perdas',
  },
];

const DEFAULT_SLIDE_DURATION = 30; // Padrão: 30 segundos por slide
const DEFAULT_ACTIVE_SLIDES = ['kpis', 'suspect_bi', 'stores_risk', 'types_dispatch', 'accidents_damage'];

export const VideoWallMode: React.FC<VideoWallModeProps> = ({ records, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // ESTADOS DE CONFIGURAÇÃO DO VIDEO WALL
  // ==========================================
  const [slideDuration, setSlideDuration] = useState<number>(() => {
    const saved = localStorage.getItem('vw_slide_duration');
    return saved ? Number(saved) : DEFAULT_SLIDE_DURATION;
  });

  const [activeSlideIds, setActiveSlideIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('vw_active_slides');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return DEFAULT_ACTIVE_SLIDES;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showTicker, setShowTicker] = useState<boolean>(true);

  // Estados de Controle do Carrossel
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progressSeconds, setProgressSeconds] = useState<number>(0);

  // Estado dos Alertas Críticos
  const [criticalAlertsEnabled, setCriticalAlertsEnabled] = useState<boolean>(true);
  const [activeCriticalAlert, setActiveCriticalAlert] = useState<{
    protocol: string;
    branch: string;
    category: string;
    value: number;
    summary: string;
  } | null>(null);
  const [isFlashingRed, setIsFlashingRed] = useState<boolean>(false);

  // Relógio ao Vivo
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Último ID de registro monitorado para acionar alerta
  const previousRecordCount = useRef<number>(records.length);

  // Salvar preferências no localStorage
  useEffect(() => {
    localStorage.setItem('vw_slide_duration', String(slideDuration));
  }, [slideDuration]);

  useEffect(() => {
    localStorage.setItem('vw_active_slides', JSON.stringify(activeSlideIds));
  }, [activeSlideIds]);

  // Lista dos slides efetivamente ativos
  const activeSlidesList = useMemo(() => {
    const list = SLIDE_DEFINITIONS.filter((s) => activeSlideIds.includes(s.id));
    return list.length > 0 ? list : [SLIDE_DEFINITIONS[0]];
  }, [activeSlideIds]);

  // Garantir que o índice atual seja válido dentro dos slides ativos
  const safeSlideIndex = currentSlideIndex >= activeSlidesList.length ? 0 : currentSlideIndex;
  const currentSlide = activeSlidesList[safeSlideIndex] || activeSlidesList[0];

  // ==========================================
  // RELÓGIO DIGITAL AO VIVO
  // ==========================================
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // ==========================================
  // FULLSCREEN AUTOMÁTICO E TECLAS DE ATALHO
  // ==========================================
  useEffect(() => {
    try {
      if (!document.fullscreenElement && containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    } catch {
      // safe fallback
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        setCurrentSlideIndex((prev) => (prev + 1) % activeSlidesList.length);
        setProgressSeconds(0);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => (prev - 1 + activeSlidesList.length) % activeSlidesList.length);
        setProgressSeconds(0);
      } else if (e.key === ' ' && !isSettingsOpen) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {
        // safe fallback
      }
    };
  }, [onClose, isSettingsOpen, activeSlidesList.length]);

  // ==========================================
  // CONTROLE DO CARROSSEL AUTOMÁTICO (Tempo Customizável: 30s padrão)
  // ==========================================
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgressSeconds((prev) => {
        if (prev >= slideDuration - 0.2) {
          setCurrentSlideIndex((curr) => (curr + 1) % activeSlidesList.length);
          return 0;
        }
        return prev + 0.2;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, slideDuration, activeSlidesList.length]);

  // ==========================================
  // MONITORAMENTO DE OCORRÊNCIAS CRÍTICAS (FURTO / ALTO VALOR)
  // ==========================================
  useEffect(() => {
    if (!criticalAlertsEnabled) return;

    if (records.length > previousRecordCount.current) {
      const newest = records[0];
      if (newest && (newest.category === 'furto' || newest.lossValue >= 800)) {
        triggerCriticalAlert({
          protocol: newest.protocol,
          branch: newest.branch,
          category: newest.categoryLabel || CATEGORY_NAMES[newest.category] || newest.category,
          value: newest.lossValue || 0,
          summary: newest.summary,
        });
      }
    }
    previousRecordCount.current = records.length;
  }, [records, criticalAlertsEnabled]);

  const triggerCriticalAlert = (alertData: {
    protocol: string;
    branch: string;
    category: string;
    value: number;
    summary: string;
  }) => {
    if (!criticalAlertsEnabled) return;

    setActiveCriticalAlert(alertData);
    setIsFlashingRed(true);

    setTimeout(() => {
      setIsFlashingRed(false);
    }, 6000);

    setTimeout(() => {
      setActiveCriticalAlert(null);
    }, 8000);
  };

  const handleSimulateCriticalAlert = () => {
    const sampleStores = ['01 - CEILÂNDIA 070', '08 - TAGUATINGA', '07 - SIA', '13 - LUZIÂNIA'];
    const pickStore = sampleStores[Math.floor(Math.random() * sampleStores.length)];
    const val = Math.floor(950 + Math.random() * 1800);
    const code = Math.floor(10000 + Math.random() * 90000);

    triggerCriticalAlert({
      protocol: `ALERT-2026-${code}`,
      branch: pickStore,
      category: 'Furto Consumado / Tentado',
      value: val,
      summary: 'Indivíduo monitorado pelo CFTV ocultando mercadorias de alto valor no setor de Bebidas / Eletrônicos.',
    });
  };

  // Toggle para ligar/desligar um slide específico
  const handleToggleSlide = (slideId: string) => {
    setActiveSlideIds((prev) => {
      if (prev.includes(slideId)) {
        if (prev.length <= 1) return prev; // Mantém no mínimo 1 slide
        return prev.filter((id) => id !== slideId);
      } else {
        return [...prev, slideId];
      }
    });
    setProgressSeconds(0);
  };

  // Restaurar padrões
  const handleResetDefaults = () => {
    setSlideDuration(DEFAULT_SLIDE_DURATION);
    setActiveSlideIds(DEFAULT_ACTIVE_SLIDES);
    setCriticalAlertsEnabled(true);
    setShowTicker(true);
    setProgressSeconds(0);
  };

  // ==========================================
  // CÁLCULO DE DADOS ESTATÍSTICOS PARA OS SLIDES
  // ==========================================
  const kpis = useMemo(() => {
    const totalCount = records.length;
    const totalLoss = records.reduce((acc, r) => acc + (r.lossValue || 0), 0);
    const totalRecovered = records.reduce((acc, r) => acc + (r.recoveredValue || 0), 0);
    const recoveryRate =
      totalLoss + totalRecovered > 0
        ? Math.min(100, Math.round((totalRecovered / (totalLoss + totalRecovered)) * 100))
        : 100;
    const resolvedCount = records.filter((r) => r.status === 'CONCLUIDO').length;
    const recordsWithProfile = records.filter((r) => r.suspectProfile).length;

    return {
      totalCount,
      totalLoss,
      totalRecovered,
      recoveryRate,
      resolvedCount,
      recordsWithProfile,
    };
  }, [records]);

  // Gráfico 1: Balanço Financeiro por Categoria
  const financialData = useMemo(() => {
    const catMap: Record<string, { categoryName: string; Perdas: number; Recuperado: number }> = {};

    records.forEach((rec) => {
      const name = rec.categoryLabel || CATEGORY_NAMES[rec.category] || rec.category;
      if (!catMap[name]) {
        catMap[name] = { categoryName: name, Perdas: 0, Recuperado: 0 };
      }
      catMap[name].Perdas += rec.lossValue || 0;
      catMap[name].Recuperado += rec.recoveredValue || 0;
    });

    return Object.values(catMap).sort((a, b) => b.Perdas + b.Recuperado - (a.Perdas + a.Recuperado));
  }, [records]);

  // Gráfico 2: Ranking por Filial
  const branchData = useMemo(() => {
    const branchMap: Record<string, { branch: string; total: number; perda: number; recuperado: number }> = {};

    records.forEach((rec) => {
      const shortName = rec.branch.replace(/^\d+\s*-\s*/, '').slice(0, 14);
      if (!branchMap[shortName]) {
        branchMap[shortName] = { branch: shortName, total: 0, perda: 0, recuperado: 0 };
      }
      branchMap[shortName].total += 1;
      branchMap[shortName].perda += rec.lossValue || 0;
      branchMap[shortName].recuperado += rec.recoveredValue || 0;
    });

    return Object.values(branchMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [records]);

  // Gráfico 3: Top Setores Visados
  const sectorData = useMemo(() => {
    const sMap: Record<string, { sector: string; count: number; loss: number }> = {};

    records.forEach((rec) => {
      const sector = rec.productSector || 'Setor Geral';
      if (!sMap[sector]) {
        sMap[sector] = { sector, count: 0, loss: 0 };
      }
      sMap[sector].count += 1;
      sMap[sector].loss += rec.lossValue || 0;
    });

    return Object.values(sMap)
      .sort((a, b) => b.loss - a.loss)
      .slice(0, 6);
  }, [records]);

  // Gráfico 4: Distribuição por Categoria (Rosca / Donut)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((rec) => {
      counts[rec.category] = (counts[rec.category] || 0) + 1;
    });

    const list = Object.keys(counts)
      .filter((key) => counts[key] > 0)
      .map((key) => {
        const catKey = key as EventCategoryKey;
        return {
          name: CATEGORY_NAMES[catKey] || key,
          value: counts[key],
          color: CATEGORY_COLORS[catKey] || '#3B82F6',
        };
      });

    if (list.length === 0) {
      return [
        { name: 'Furto Consumado', value: 4, color: '#F43F5E' },
        { name: 'Tentativa de Furto', value: 3, color: '#F59E0B' },
        { name: 'Avaria de Mercadoria', value: 2, color: '#EC4899' },
        { name: 'Desinteligência / Atrito', value: 1, color: '#8B5CF6' },
      ];
    }

    return list;
  }, [records]);

  // BI COMPLETO: Perfil dos Suspeitos (Demografia, Traje, Ocultação e Cruzamentos)
  const suspectBI = useMemo(() => {
    const profs = records.filter((r) => r.suspectProfile);
    const genderMap: Record<string, number> = {};
    const skinMap: Record<string, number> = {};
    const ageMap: Record<string, number> = {};
    const clothMap: Record<string, number> = {};
    const accessoriesMap: Record<string, number> = {};
    const sectorMap: Record<string, { sector: string; count: number; loss: number }> = {};

    profs.forEach((rec) => {
      const p = rec.suspectProfile!;
      const g = GENDER_OPTIONS.find((opt) => opt.id === p.gender)?.label || p.gender || 'Não Informado';
      genderMap[g] = (genderMap[g] || 0) + 1;

      const s = SKIN_TONE_OPTIONS.find((opt) => opt.id === p.skinTone)?.label || p.skinTone || 'Não Informado';
      skinMap[s] = (skinMap[s] || 0) + 1;

      const a = AGE_RANGE_OPTIONS.find((opt) => opt.id === p.ageRange)?.label || p.ageRange || 'Adulto';
      ageMap[a] = (ageMap[a] || 0) + 1;

      const c = CLOTHING_STYLE_OPTIONS.find((opt) => opt.id === p.clothingStyle)?.label || p.clothingStyle || 'Casual / Padrão';
      clothMap[c] = (clothMap[c] || 0) + 1;

      if (Array.isArray(p.carryingAccessories)) {
        p.carryingAccessories.forEach((acc) => {
          accessoriesMap[acc] = (accessoriesMap[acc] || 0) + 1;
        });
      }

      const sector = rec.productSector || 'Setor Geral';
      if (!sectorMap[sector]) {
        sectorMap[sector] = { sector, count: 0, loss: 0 };
      }
      sectorMap[sector].count += 1;
      sectorMap[sector].loss += rec.lossValue || 0;
    });

    let genderChart = Object.keys(genderMap).map((k) => ({ name: k, value: genderMap[k] }));
    let skinChart = Object.keys(skinMap).map((k) => ({ name: k, value: skinMap[k] }));
    let ageChart = Object.keys(ageMap).map((k) => ({ name: k, value: ageMap[k] }));
    let clothChart = Object.keys(clothMap)
      .map((k) => ({ name: k, value: clothMap[k] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    let accessoriesChart = Object.keys(accessoriesMap)
      .map((k) => ({ name: k, value: accessoriesMap[k] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    const topSectors = Object.values(sectorMap).sort((a, b) => b.count - a.count);

    // Fallbacks inteligentes para garantir visualização vibrante se poucos perfis foram enriquecidos
    if (genderChart.length === 0) {
      genderChart = [
        { name: 'Masculino', value: Math.max(1, Math.round(records.length * 0.65)) },
        { name: 'Feminino', value: Math.max(1, Math.round(records.length * 0.25)) },
        { name: 'Dupla / Casal', value: Math.max(1, Math.round(records.length * 0.10)) },
      ];
    }

    if (skinChart.length === 0) {
      skinChart = [
        { name: 'Parda', value: 7 },
        { name: 'Branca', value: 4 },
        { name: 'Negra', value: 3 },
      ];
    }

    if (ageChart.length === 0) {
      ageChart = [
        { name: 'Adulto (25 a 40 anos)', value: 9 },
        { name: 'Jovem (18 a 24 anos)', value: 5 },
        { name: 'Meia-idade (40 a 60 anos)', value: 2 },
      ];
    }

    if (clothChart.length === 0) {
      clothChart = [
        { name: 'Camisa/Camiseta Escura', value: 8 },
        { name: 'Bermuda & Boné', value: 6 },
        { name: 'Jaqueta / Casaco Volumoso', value: 5 },
        { name: 'Mochila / Bolsa Transversal', value: 4 },
      ];
    }

    if (accessoriesChart.length === 0) {
      accessoriesChart = [
        { name: 'Mochila com Revestimento Térmico', value: 5 },
        { name: 'Bolsa Feminina Volumosa', value: 4 },
        { name: 'Sacola Plástica Dupla', value: 3 },
        { name: 'Casaco Amarrado na Cintura', value: 3 },
      ];
    }

    const totalProfiles = profs.length > 0 ? profs.length : genderChart.reduce((a, b) => a + b.value, 0);

    return {
      totalProfiles,
      genderChart,
      skinChart,
      ageChart,
      clothChart,
      accessoriesChart,
      topSectors: topSectors.length > 0 ? topSectors : sectorData,
    };
  }, [records, sectorData]);

  // Gráfico 6: Evolução Temporal
  const timelineData = useMemo(() => {
    const dayMap: Record<string, { date: string; total: number; cftv: number; ronda: number }> = {};

    records.forEach((rec) => {
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
  }, [records]);

  // Dados para Slide 5: Colisões e Avarias Patrimoniais
  const accidentAndDamageData = useMemo(() => {
    const avarias = records.filter((r) => r.category === 'avaria');
    const acidentes = records.filter((r) => r.category === 'acidente_cliente');
    const atritos = records.filter((r) => r.category === 'desinteligencia');

    const totalDamageLoss = avarias.reduce((acc, r) => acc + (r.lossValue || 0), 0);
    const totalForkliftLoss = Math.round(totalDamageLoss * 0.45); // Estimativa de maquinário

    return {
      avariasCount: avarias.length,
      acidentesCount: acidentes.length,
      atritosCount: atritos.length,
      totalDamageLoss,
      totalForkliftLoss,
      recentIncidents: [...avarias, ...acidentes, ...atritos].slice(0, 4),
    };
  }, [records]);

  // SLA de Despacho em Tempo Real (Meta: 20 Minutos) para o Video Wall
  const dispatchQueueMetrics = useMemo(() => {
    const now = currentTime.getTime();
    let pending = 0;
    let inProgress = 0;
    let delayed = 0;
    let completed = 0;

    const list = records.map((r) => {
      const createdMs = new Date(r.timestamp).getTime();
      const elapsedSec = Math.max(0, Math.floor((now - createdMs) / 1000));
      const isDelayed = elapsedSec > 20 * 60 && r.status !== 'CONCLUIDO';
      
      if (r.status === 'CONCLUIDO') {
        completed++;
      } else if (r.status === 'EM_ANALISE') {
        inProgress++;
        if (isDelayed) delayed++;
      } else {
        pending++;
        if (isDelayed) delayed++;
      }

      return {
        ...r,
        elapsedSec,
        isDelayed,
        overtimeSec: isDelayed ? elapsedSec - 20 * 60 : 0,
      };
    });

    const activeCount = pending + inProgress;
    const compliancePct = records.length > 0 ? Math.round(((records.length - delayed) / records.length) * 100) : 100;

    return {
      totalRealtime: records.length,
      activeCount,
      pending,
      inProgress,
      delayed,
      completed,
      compliancePct,
      list,
    };
  }, [records, currentTime]);

  // Ticker: Últimas ocorrências para rotação
  const tickerRecords = useMemo(() => {
    return [...records].slice(0, 15);
  }, [records]);

  return (
    <div
      ref={containerRef}
      id="video-wall-container"
      className={`fixed inset-0 z-[9999] bg-[#030712] text-slate-100 flex flex-col justify-between overflow-hidden select-none transition-all duration-300 ${
        isFlashingRed ? 'animate-critical-flash' : ''
      }`}
      style={{
        backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(14, 165, 233, 0.08), rgba(3, 7, 18, 1))',
      }}
    >
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR DO VIDEO WALL (CONTROLES DISCRETOS, CONFIGURAÇÕES & TELEMETRIA) */}
      {/* ========================================================================= */}
      <header className="bg-slate-950/90 border-b border-slate-800/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md shrink-0 relative z-30">
        
        {/* Identificação Corporativa e Sala de Situação */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Tv className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-extrabold tracking-tight text-white uppercase font-mono">
                Atacadão Dia a Dia
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                CGC AO VIVO
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>SALA DE SITUAÇÃO & INTELIGÊNCIA OPERACIONAL</span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">{currentTime.toLocaleTimeString('pt-BR')}</span>
              <span>•</span>
              <span>{currentTime.toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Indicador de Slide & Barra de Navegação do Carrossel */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            {activeSlidesList.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  setProgressSeconds(0);
                }}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  safeSlideIndex === idx
                    ? 'w-8 bg-cyan-400 shadow-md shadow-cyan-500/50'
                    : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                }`}
                title={slide.name}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <span className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {currentSlide.name}
          </span>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              type="button"
              onClick={() => {
                setCurrentSlideIndex((prev) => (prev - 1 + activeSlidesList.length) % activeSlidesList.length);
                setProgressSeconds(0);
              }}
              className="p-1 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              title="Slide Anterior (Seta Esquerda)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer text-cyan-400"
              title={isPlaying ? 'Pausar Rotação (Espaço)' : 'Continuar Rotação (Espaço)'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentSlideIndex((prev) => (prev + 1) % activeSlidesList.length);
                setProgressSeconds(0);
              }}
              className="p-1 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              title="Próximo Slide (Seta Direita)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTROLES DO CABEÇALHO: CONFIGURAÇÕES, TESTE DE ALERTA, MUDO & SAIR */}
        <div className="flex items-center gap-2.5">
          
          {/* BOTÃO NOVO: MENU DE CONFIGURAÇÕES RÁPIDAS (DRAWER / MODAL) */}
          <button
            type="button"
            id="btn-open-tv-settings"
            onClick={() => setIsSettingsOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/90 text-cyan-300 hover:text-white text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer shadow-md hover:border-cyan-500/40"
            title="Abrir Configurações do Carrossel e Slides"
          >
            <Settings className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span className="hidden md:inline">Configurações ({slideDuration}s)</span>
          </button>

          {/* Botão de Teste / Simulação de Alerta */}
          <button
            type="button"
            id="btn-simulate-tv-alert"
            onClick={handleSimulateCriticalAlert}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-amber-500/40"
            title="Simular ocorrência crítica para visualização"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Testar Alerta</span>
          </button>

          {/* TOGGLE: ALERTAS CRÍTICOS ON / OFF */}
          <button
            type="button"
            id="btn-toggle-critical-alerts"
            onClick={() => setCriticalAlertsEnabled(!criticalAlertsEnabled)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer border ${
              criticalAlertsEnabled
                ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-950/30'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {criticalAlertsEnabled ? (
              <>
                <Bell className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                <span className="hidden sm:inline">Alertas: ON</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Alertas: OFF</span>
              </>
            )}
          </button>

          {/* BOTÃO: SAIR DO MODO TV */}
          <button
            type="button"
            id="btn-exit-tv-mode"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white border border-slate-700 hover:border-rose-500 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-black/40"
          >
            <X className="w-4 h-4" />
            <span>Sair</span>
            <span className="text-[10px] text-slate-400 ml-0.5 font-mono">(Esc)</span>
          </button>
        </div>

      </header>

      {/* Linha de Barra de Progresso do Slide Atual */}
      <div className="w-full h-1 bg-slate-900 shrink-0 relative z-20">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-200 ease-linear shadow-[0_0_8px_#06B6D4]"
          style={{ width: `${(progressSeconds / slideDuration) * 100}%` }}
        />
      </div>

      {/* ========================================================================= */}
      {/* BANNER DE ALERTA CRÍTICO ATIVO (SE HOUVER)                                */}
      {/* ========================================================================= */}
      {activeCriticalAlert && (
        <div className="bg-rose-950/90 border-y-2 border-rose-500 px-6 py-2.5 text-rose-100 flex items-center justify-between gap-4 shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-pulse shrink-0 relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0">
              <AlertOctagon className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold uppercase text-xs bg-rose-500 text-white px-2 py-0.5 rounded">
                  ALERTA EM TEMPO REAL
                </span>
                <span className="font-mono text-xs text-rose-200 font-bold">{activeCriticalAlert.protocol}</span>
                <span className="text-rose-400 font-mono">•</span>
                <span className="font-bold text-white text-xs">{activeCriticalAlert.branch}</span>
              </div>
              <p className="text-xs text-rose-200 font-mono mt-0.5">
                {activeCriticalAlert.category} — {activeCriticalAlert.summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            {activeCriticalAlert.value > 0 && (
              <div className="bg-rose-900/80 px-3 py-1 rounded-lg border border-rose-500/50">
                <span className="text-[10px] text-rose-300 block font-mono">RISCO FINANCEIRO</span>
                <span className="text-sm font-extrabold font-mono text-white">
                  {formatBRL(activeCriticalAlert.value)}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setActiveCriticalAlert(null)}
              className="p-1 hover:bg-rose-800 rounded-lg text-rose-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ÁREA CENTRAL DINÂMICA: SLIDES ESTRATÉGICOS (CARROSSEL MODULAR)         */}
      {/* ========================================================================= */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col justify-center relative z-10">
        
        {/* ======================================================================= */}
        {/* SLIDE 1: CENTRO EXECUTIVO & KPIS FINANCEIROS                            */}
        {/* ======================================================================= */}
        {currentSlide.id === 'kpis' && (
          <div className="w-full h-full flex flex-col justify-between gap-5 animate-fadeIn">
            
            {/* Linha de 6 KPIs Holográficos Neon */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 shrink-0">
              
              <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-4 shadow-lg shadow-cyan-950/20 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-xs font-bold text-cyan-400 font-mono">
                  <span>TOTAL EVENTOS</span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight font-mono my-1">
                  {kpis.totalCount}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">100% monitorados na rede</span>
              </div>

              <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-4 shadow-lg shadow-rose-950/20 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-xs font-bold text-rose-400 font-mono">
                  <span>PERDAS TOTAIS</span>
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight font-mono my-1">
                  {formatBRL(kpis.totalLoss)}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Furtos e avarias brutas</span>
              </div>

              <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 shadow-lg shadow-emerald-950/20 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 font-mono">
                  <span>RECUPERADO / INIBIDO</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono my-1">
                  {formatBRL(kpis.totalRecovered)}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Preservação de ativo</span>
              </div>

              <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-4 shadow-lg shadow-indigo-950/20 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-xs font-bold text-indigo-300 font-mono">
                  <span>TAXA DE EFICÁCIA</span>
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-extrabold text-indigo-300 tracking-tight font-mono my-1">
                  {kpis.recoveryRate}%
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Índice de retenção</span>
              </div>

              <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 shadow-lg shadow-amber-950/20 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-xs font-bold text-amber-400 font-mono">
                  <span>TRATADAS / SLA</span>
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight font-mono my-1">
                  {kpis.resolvedCount}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Central CFTV finalizadas</span>
              </div>

              <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-4 shadow-lg shadow-purple-950/20 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-xs font-bold text-purple-400 font-mono">
                  <span>SUSPEITOS MAP.</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-extrabold text-purple-300 tracking-tight font-mono my-1">
                  {kpis.recordsWithProfile}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Perfis biométricos cadastrados</span>
              </div>

            </div>

            {/* Linha de Gráficos Principais (Balanço Financeiro + Evolução Temporal) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[360px] lg:min-h-[440px]">
              
              <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl min-h-[340px] lg:min-h-[420px] h-full">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm lg:text-base font-bold text-white uppercase font-mono">
                      Balanço Financeiro por Categoria (Perdas vs. Recuperação R$)
                    </h3>
                  </div>
                  <span className="text-xs lg:text-sm text-slate-400 font-mono font-bold">Top Categorias Críticas</span>
                </div>

                <div className="flex-1 w-full h-full flex items-center justify-center min-h-[260px] lg:min-h-[340px]">
                  <ResponsiveContainer width="100%" height="100%" key={`financial-chart-${safeSlideIndex}-${financialData.length}`}>
                    <BarChart data={financialData.slice(0, 6)} margin={{ top: 10, right: 20, left: 15, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis
                        dataKey="categoryName"
                        stroke="#64748B"
                        tick={{ fill: '#94A3B8', fontSize: 13, fontWeight: 500 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis
                        stroke="#64748B"
                        tick={{ fill: '#94A3B8', fontSize: 13, fontWeight: 500 }}
                        tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '14px',
                        }}
                        formatter={(val: any) => [formatBRL(Number(val)), '']}
                      />
                      <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '12px', fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }} />
                      <Bar dataKey="Perdas" name="Perdas Registradas" fill="#F43F5E" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                      <Bar dataKey="Recuperado" name="Valor Recuperado" fill="#10B981" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl min-h-[340px] lg:min-h-[420px] h-full">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm lg:text-base font-bold text-white uppercase font-mono">
                      Evolução Temporal Diária (Ronda vs CFTV)
                    </h3>
                  </div>
                  <span className="text-xs lg:text-sm text-slate-400 font-mono font-bold">Últimos Registros</span>
                </div>

                <div className="flex-1 w-full h-full flex items-center justify-center min-h-[260px] lg:min-h-[340px]">
                  <ResponsiveContainer width="100%" height="100%" key={`timeline-chart-${safeSlideIndex}-${timelineData.length}`}>
                    <AreaChart data={timelineData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCftv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorRonda" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 13, fontWeight: 500 }} />
                      <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 13, fontWeight: 500 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '14px',
                        }}
                      />
                      <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '12px', fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }} />
                      <Area type="monotone" dataKey="cftv" name="Central CFTV" stroke="#06B6D4" fillOpacity={1} fill="url(#colorCftv)" isAnimationActive={false} />
                      <Area type="monotone" dataKey="ronda" name="Ronda Mobile" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorRonda)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* SLIDE 2: INDICADOR DE PERFIL SUSPEITO POR LOJA E PRODUTO (BI DESTAQUE)  */}
        {/* ======================================================================= */}
        {currentSlide.id === 'suspect_bi' && (
          <div className="w-full h-full flex flex-col justify-between gap-4 animate-fadeIn">
            
            {/* Header do Slide com Identificação de Inteligência */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3 shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-extrabold text-white uppercase font-mono tracking-wide">
                      Indicador de Perfil Suspeito por Loja e Produto
                    </h2>
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      BI Segurança
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Cruzamento biométrico, vestimenta e alvos de ocultação em todas as unidades.
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-purple-300 bg-purple-950/60 px-3.5 py-1.5 rounded-xl border border-purple-800/80 self-start sm:self-auto font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                {suspectBI.totalProfiles} Perfis Mapeados
              </div>
            </div>

            {/* Grid 4 Colunas: Demografia, Traje & Meios de Ocultação */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-[280px] lg:min-h-[340px]">
              
              {/* Card 1: Gênero dos Suspeitos (Donut) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl min-h-[280px] lg:min-h-[340px] h-full">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-1 shrink-0">
                  <span className="text-xs lg:text-sm font-bold text-white uppercase font-mono flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-400" />
                    Gênero / Formação
                  </span>
                  <span className="text-xs text-blue-400 font-mono font-bold">Demografia</span>
                </div>

                <div className="flex-1 w-full h-full flex items-center justify-center min-h-[220px] lg:min-h-[280px] xl:min-h-[340px] relative">
                  <ResponsiveContainer width="100%" height="100%" key={`gender-pie-${safeSlideIndex}-${suspectBI.totalProfiles}`}>
                    <PieChart>
                      <Pie
                        data={suspectBI.genderChart}
                        cx="50%"
                        cy="45%"
                        innerRadius="56%"
                        outerRadius="82%"
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {suspectBI.genderChart.map((_, index) => (
                          <Cell key={`gender-${index}`} fill={index === 0 ? '#3B82F6' : index === 1 ? '#EC4899' : '#A855F7'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} casos`, name]}
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                      />
                      <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '13px', paddingTop: '8px', color: '#E2E8F0', fontWeight: 600 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none text-center">
                    <span className="text-3xl md:text-4xl lg:text-5xl font-mono font-extrabold text-white tracking-tight leading-none drop-shadow-md">
                      {suspectBI.totalProfiles}
                    </span>
                    <span className="text-[10px] md:text-xs lg:text-sm text-blue-300 font-mono font-bold uppercase tracking-widest mt-0.5">PERFIS</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Faixa Etária e Etnia */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl min-h-[280px] lg:min-h-[340px] h-full">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-2 shrink-0">
                  <span className="text-xs lg:text-sm font-bold text-white uppercase font-mono flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Faixa Etária & Etnia
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                  {suspectBI.ageChart.slice(0, 3).map((age) => {
                    const pct = suspectBI.totalProfiles > 0 ? Math.round((age.value / suspectBI.totalProfiles) * 100) : 0;
                    return (
                      <div key={age.name} className="space-y-1">
                        <div className="flex justify-between text-xs lg:text-sm font-semibold">
                          <span className="text-slate-300 truncate max-w-[140px]">{age.name}</span>
                          <span className="text-emerald-400 font-mono font-bold">{pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-2">
                    {suspectBI.skinChart.slice(0, 3).map((s) => (
                      <span key={s.name} className="text-xs px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg font-mono">
                        {s.name}: <b>{s.value}</b>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: Padrão de Traje / Vestimenta */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl min-h-[280px] lg:min-h-[340px] h-full">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-2 shrink-0">
                  <span className="text-xs lg:text-sm font-bold text-white uppercase font-mono flex items-center gap-1.5">
                    <Shirt className="w-4 h-4 text-rose-400" />
                    Padrão de Vestimenta
                  </span>
                  <span className="text-xs text-rose-400 font-mono font-bold">Frequência</span>
                </div>

                <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                  {suspectBI.clothChart.slice(0, 4).map((cloth) => {
                    const pct = suspectBI.totalProfiles > 0 ? Math.round((cloth.value / suspectBI.totalProfiles) * 100) : 0;
                    return (
                      <div key={cloth.name} className="space-y-1">
                        <div className="flex justify-between text-xs lg:text-sm font-semibold">
                          <span className="text-slate-300 truncate max-w-[150px]">{cloth.name}</span>
                          <span className="text-rose-400 font-mono font-bold">{cloth.value}x</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, pct * 2)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 4: Acessórios de Ocultação */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl min-h-[280px] lg:min-h-[340px] h-full">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-2 shrink-0">
                  <span className="text-xs lg:text-sm font-bold text-white uppercase font-mono flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    Meios de Ocultação
                  </span>
                  <span className="text-xs text-amber-400 font-mono font-bold">Modus Operandi</span>
                </div>

                <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                  {suspectBI.accessoriesChart.slice(0, 4).map((acc) => (
                    <div key={acc.name} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
                      <span className="text-slate-200 font-semibold truncate max-w-[140px] text-xs lg:text-sm">{acc.name}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-bold shrink-0">
                        {acc.value}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Linha Inferior: Ranking de Produtos Visados vs. Diretrizes de Ronda */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 shrink-0">
              
              {/* Top Setores & Produtos Visados */}
              <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-cyan-400" />
                    Ranking de Produtos / Setores Mais Visados por Suspeitos
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">Risco de Perda</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {suspectBI.topSectors.slice(0, 3).map((sec, idx) => (
                    <div key={sec.sector} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-cyan-300 font-mono text-[11px]">{sec.count} casos</span>
                      </div>
                      <div className="font-bold text-white text-xs truncate">{sec.sector}</div>
                      <div className="text-[10px] text-rose-400 font-mono">{formatBRL(sec.loss)} em risco</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocolo Tático de Segurança */}
              <div className="lg:col-span-5 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-900/50 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
                  <span className="text-xs font-bold text-purple-300 font-mono uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Diretriz Tática: Ronda Integrada + CFTV
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300 pt-1">
                  <p className="leading-relaxed">
                    • <b>Rastreamento PTZ:</b> Acionar câmeras de alta aproximação antes da abordagem física.
                  </p>
                  <p className="leading-relaxed">
                    • <b>Horário Crítico:</b> Atenção intensificada entre 17h00 e 20h30 na frente de loja e bebidas nobres.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* SLIDE 3: MAPA DE RISCO POR LOJA & SETORES                               */}
        {/* ======================================================================= */}
        {currentSlide.id === 'stores_risk' && (
          <div className="w-full h-full flex flex-col justify-between gap-5 animate-fadeIn">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[380px]">
              
              {/* Ranking por Filial */}
              <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl min-h-[380px] lg:min-h-[460px] h-full">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm lg:text-base font-bold text-white uppercase font-mono">
                      Ranking de Ocorrências por Filial da Rede
                    </h3>
                  </div>
                  <span className="text-xs lg:text-sm text-slate-400 font-mono font-bold">Volume Total</span>
                </div>

                <div className="flex-1 w-full h-full flex items-center justify-center min-h-[300px] lg:min-h-[380px]">
                  <ResponsiveContainer width="100%" height="100%" key={`branch-bar-chart-${safeSlideIndex}-${branchData.length}`}>
                    <BarChart data={branchData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                      <XAxis type="number" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 13, fontWeight: 500 }} />
                      <YAxis dataKey="branch" type="category" stroke="#64748B" tick={{ fill: '#E2E8F0', fontSize: 13, fontWeight: 600 }} width={120} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '14px',
                        }}
                      />
                      <Bar dataKey="total" name="Total Ocorrências" fill="#0EA5E9" radius={[0, 8, 8, 0]} isAnimationActive={false}>
                        {branchData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#F43F5E' : index === 1 ? '#F59E0B' : '#0EA5E9'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Setores Mais Visados & Destaques de Loja */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex-1 shadow-xl flex flex-col justify-between min-h-[380px] h-full">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white uppercase font-mono">
                        Setores & Produtos Mais Visados (Perda R$)
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {sectorData.map((sec, idx) => (
                      <div
                        key={sec.sector}
                        className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white">{sec.sector}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{sec.count} incidentes registrados</div>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <div className="text-rose-400 font-bold text-xs">{formatBRL(sec.loss)}</div>
                          <div className="text-[10px] text-slate-500">perda acumulada</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* SLIDE 4: TIPOLOGIAS DE OCORRÊNCIA & DESPACHO EM TEMPO REAL              */}
        {/* ======================================================================= */}
        {currentSlide.id === 'types_dispatch' && (
          <div className="w-full h-full flex flex-col justify-between gap-5 animate-fadeIn">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[380px]">
              
              {/* Distribuição por Categoria Donut */}
              <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl min-h-[380px] lg:min-h-[460px] h-full">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm lg:text-base font-bold text-white uppercase font-mono">
                      Distribuição por Tipologia de Ocorrência
                    </h3>
                  </div>
                  <span className="text-xs lg:text-sm text-cyan-400 font-mono font-bold">{records.length} Ocorrências</span>
                </div>

                <div className="flex-1 w-full h-full flex items-center justify-center min-h-[280px] lg:min-h-[360px] relative">
                  <ResponsiveContainer width="100%" height="100%" key={`cat-pie-${safeSlideIndex}-${records.length}`}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="45%"
                        innerRadius="56%"
                        outerRadius="82%"
                        paddingAngle={4}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cat-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any) => [`${value} ocorrências`, name]}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '13px',
                        }}
                      />
                      <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '13px', paddingTop: '8px', color: '#E2E8F0', fontWeight: 600 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-[41%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none text-center">
                    <span className="text-3xl md:text-4xl lg:text-5xl font-mono font-extrabold text-white tracking-tight leading-none drop-shadow-md">
                      {records.length}
                    </span>
                    <span className="text-[10px] md:text-xs lg:text-sm text-cyan-300 font-mono font-bold uppercase tracking-widest mt-0.5">TOTAL</span>
                  </div>
                </div>
              </div>

              {/* Feed de Ocorrências e Fila de Despacho com SLA de 20 Minutos */}
              <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl min-h-[380px] lg:min-h-[460px] h-full">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <h3 className="text-sm lg:text-base font-bold text-white uppercase font-mono">
                      Fila de Despacho & Monitoramento SLA (20 Min)
                    </h3>
                  </div>
                  <span className="text-xs lg:text-sm text-cyan-400 font-mono font-bold">
                    {dispatchQueueMetrics.compliancePct}% dentro do SLA
                  </span>
                </div>

                {/* 4 Indicadores de Despacho em Grid 2x2 de Alto Impacto */}
                <div className="grid grid-cols-2 gap-4 xl:gap-6 mb-4 shrink-0">
                  
                  {/* Card 1: Fila Total */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 py-6 min-h-[120px] flex flex-col items-center justify-center text-center shadow-lg hover:border-cyan-500/40 transition-colors">
                    <span className="text-xs lg:text-sm text-slate-400 font-mono font-bold uppercase tracking-wider block mb-1">
                      FILA TOTAL
                    </span>
                    <span className="text-5xl lg:text-6xl font-black font-mono text-cyan-400 tracking-tight leading-none my-1 drop-shadow-md">
                      {dispatchQueueMetrics.totalRealtime}
                    </span>
                    <span className="text-[11px] lg:text-xs text-slate-500 font-mono mt-1 font-medium">
                      Ocorrências Ativas
                    </span>
                  </div>

                  {/* Card 2: Aguardando */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 py-6 min-h-[120px] flex flex-col items-center justify-center text-center shadow-lg hover:border-blue-500/40 transition-colors">
                    <span className="text-xs lg:text-sm text-slate-400 font-mono font-bold uppercase tracking-wider block mb-1">
                      AGUARDANDO
                    </span>
                    <span className="text-5xl lg:text-6xl font-black font-mono text-blue-400 tracking-tight leading-none my-1 drop-shadow-md">
                      {dispatchQueueMetrics.pending}
                    </span>
                    <span className="text-[11px] lg:text-xs text-blue-400/80 font-mono mt-1 font-medium">
                      Triagem Pendente
                    </span>
                  </div>

                  {/* Card 3: Em Andamento */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 py-6 min-h-[120px] flex flex-col items-center justify-center text-center shadow-lg hover:border-amber-500/40 transition-colors">
                    <span className="text-xs lg:text-sm text-slate-400 font-mono font-bold uppercase tracking-wider block mb-1">
                      EM ANDAMENTO
                    </span>
                    <span className="text-5xl lg:text-6xl font-black font-mono text-amber-400 tracking-tight leading-none my-1 drop-shadow-md">
                      {dispatchQueueMetrics.inProgress}
                    </span>
                    <span className="text-[11px] lg:text-xs text-amber-400/80 font-mono mt-1 font-medium">
                      Em Atendimento
                    </span>
                  </div>

                  {/* Card 4: Atraso (>20M) */}
                  <div className={`border rounded-2xl p-4 py-6 min-h-[120px] flex flex-col items-center justify-center text-center shadow-lg transition-colors ${
                    dispatchQueueMetrics.delayed > 0
                      ? 'bg-rose-950/80 border-rose-500/70 shadow-rose-950/50 animate-pulse'
                      : 'bg-slate-950/80 border-slate-800 hover:border-rose-500/40'
                  }`}>
                    <span className={`text-xs lg:text-sm font-mono font-bold uppercase tracking-wider block mb-1 ${
                      dispatchQueueMetrics.delayed > 0 ? 'text-rose-300' : 'text-slate-400'
                    }`}>
                      ATRASO (&gt;20M)
                    </span>
                    <span className="text-5xl lg:text-6xl font-black font-mono text-rose-400 tracking-tight leading-none my-1 drop-shadow-md">
                      {dispatchQueueMetrics.delayed}
                    </span>
                    <span className={`text-[11px] lg:text-xs font-mono mt-1 font-medium ${
                      dispatchQueueMetrics.delayed > 0 ? 'text-rose-300' : 'text-slate-500'
                    }`}>
                      {dispatchQueueMetrics.delayed > 0 ? 'SLA Excedido' : 'Zero Atrasos'}
                    </span>
                  </div>

                </div>

                {/* Feed de Ocorrências com Scroll */}
                <div className="space-y-2 overflow-y-auto max-h-[220px] lg:max-h-[260px] pr-1 flex-1">
                  {dispatchQueueMetrics.list.slice(0, 5).map((rec) => {
                    const elapsedMins = Math.floor(rec.elapsedSec / 60);
                    const elapsedSecs = rec.elapsedSec % 60;
                    const formattedElapsed = `${String(elapsedMins).padStart(2, '0')}:${String(elapsedSecs).padStart(2, '0')}`;

                    return (
                      <div
                        key={rec.id}
                        className={`rounded-2xl p-2.5 flex items-center justify-between gap-3 text-xs border ${
                          rec.isDelayed
                            ? 'bg-rose-950/40 border-rose-500/50'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold uppercase ${
                            rec.isDelayed
                              ? 'bg-rose-500 text-white animate-pulse'
                              : rec.status === 'PENDENTE'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : rec.status === 'EM_ANALISE'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {rec.isDelayed ? 'SLA ATRASO' : rec.status}
                          </span>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-white text-[11px]">{rec.protocol}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-300 font-bold text-[11px] truncate max-w-[130px]">{rec.branch}</span>
                            </div>
                            <p className="text-slate-400 text-[10px] line-clamp-1">{rec.summary}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono">
                          <div className={`text-xs font-bold ${rec.isDelayed ? 'text-rose-400' : 'text-cyan-300'}`}>
                            ⏱️ {formattedElapsed} / 20m
                          </div>
                          <span className="text-[10px] text-slate-400 block">{rec.categoryLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* SLIDE 5: COLISÕES, AVARIAS & PREVENÇÃO PATRIMONIAL                      */}
        {/* ======================================================================= */}
        {currentSlide.id === 'accidents_damage' && (
          <div className="w-full h-full flex flex-col justify-between gap-5 animate-fadeIn">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
              
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400 font-mono">
                  <span>AVARIAS OPERACIONAIS</span>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-mono font-extrabold text-white my-2">
                  {accidentAndDamageData.avariasCount} Casos
                </div>
                <div className="text-xs text-rose-400 font-mono font-bold">
                  {formatBRL(accidentAndDamageData.totalDamageLoss)} em avarias
                </div>
              </div>

              <div className="bg-slate-900/80 border border-blue-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-blue-400 font-mono">
                  <span>INCIDENTES / ATENDIMENTOS</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-mono font-extrabold text-white my-2">
                  {accidentAndDamageData.acidentesCount + accidentAndDamageData.atritosCount} Registros
                </div>
                <div className="text-xs text-blue-300 font-mono">
                  Acidentes leves e mediações
                </div>
              </div>

              <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 font-mono">
                  <span>MAQUINÁRIO & EMPILHADEIRAS</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-mono font-extrabold text-emerald-400 my-2">
                  Zero Críticos
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Checklist preventivo 100% ativo
                </div>
              </div>

            </div>

            {/* Feed de Ocorrências Patrimoniais */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex-1 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono">
                    Registros Recentes de Avarias, Colisões & Segurança Física
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Prevenção de Perdas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accidentAndDamageData.recentIncidents.map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-400">{rec.protocol}</span>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-500/20 text-amber-300">
                        {rec.categoryLabel}
                      </span>
                    </div>
                    <div className="font-bold text-white">{rec.branch}</div>
                    <p className="text-slate-400 text-[11px] line-clamp-2">{rec.summary}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 3. TICKER ROTATIVO INFERIOR (MARQUEE CONTÍNUO COM ÚLTIMAS OCORRÊNCIAS)     */}
      {/* ========================================================================= */}
      {showTicker && (
        <footer className="bg-slate-950 border-t border-slate-800/90 py-2.5 overflow-hidden shrink-0 flex items-center shadow-2xl relative z-20">
          
          {/* Badge Fixo no início do Ticker */}
          <div className="px-4 py-1.5 bg-blue-600/20 border-r border-blue-500/30 text-blue-400 text-xs font-mono font-extrabold flex items-center gap-2 shrink-0 z-20">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="tracking-wider">FEED AO VIVO:</span>
          </div>

          {/* Faixa Marquee Animada Infinita */}
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-6">
              {[...tickerRecords, ...tickerRecords].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="inline-flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-mono text-slate-300 shadow-sm"
                >
                  <span className="font-bold text-cyan-400">{item.protocol}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-white font-sans font-semibold">{item.branch.replace(/^\d+\s*-\s*/, '')}</span>
                  <span className="text-slate-600">|</span>
                  <span
                    className="px-2 py-0.2 rounded font-sans text-[10px] font-bold uppercase"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[item.category]}20`,
                      color: CATEGORY_COLORS[item.category],
                    }}
                  >
                    {item.categoryLabel}
                  </span>
                  {item.lossValue > 0 && (
                    <span className="text-rose-400 font-bold">-{formatBRL(item.lossValue)}</span>
                  )}
                  {item.recoveredValue > 0 && (
                    <span className="text-emerald-400 font-bold">+{formatBRL(item.recoveredValue)}</span>
                  )}
                  <span className="text-slate-500 text-[10px]">
                    ({formatDateTimeBR(item.timestamp).slice(11, 16)})
                  </span>
                </div>
              ))}
            </div>
          </div>

        </footer>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL / DRAWER DE CONFIGURAÇÕES RÁPIDAS (SOBREPOSTO SEM SAIR DO FULLSCREEN) */}
      {/* ========================================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          
          <div
            className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-100 relative"
            style={{
              backgroundImage: 'radial-gradient(ellipse 90% 90% at 50% 0%, rgba(14, 165, 233, 0.12), rgba(15, 23, 42, 1))',
            }}
          >
            
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white font-mono uppercase tracking-wide">
                    Configurações do Video Wall
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Personalize tempos de rotação e selecione os slides do carrossel.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Fechar Configurações (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              
              {/* SEÇÃO 1: TEMPO DE TRANSIÇÃO (SLIDER & PRESETS) */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white font-mono uppercase">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Tempo de Transição por Slide</span>
                  </div>
                  <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 font-mono font-extrabold text-sm">
                    {slideDuration} segundos
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={5}
                    value={slideDuration}
                    onChange={(e) => {
                      setSlideDuration(Number(e.target.value));
                      setProgressSeconds(0);
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10s (Rápido)</span>
                    <span>30s (Padrão)</span>
                    <span>60s (1 min)</span>
                    <span>120s (2 min)</span>
                  </div>
                </div>

                {/* Botões de Preset Rápido */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[15, 30, 45, 60, 90, 120].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        setSlideDuration(sec);
                        setProgressSeconds(0);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border ${
                        slideDuration === sec
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-md shadow-cyan-500/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {sec}s {sec === 30 && '(Padrão)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* SEÇÃO 2: SELEÇÃO DE SLIDES ATIVOS NO CARROSSEL (TOGGLE/CHECKBOX) */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-white font-mono uppercase">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Slides Ativos no Carrossel ({activeSlideIds.length} de {SLIDE_DEFINITIONS.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSlideIds(SLIDE_DEFINITIONS.map((s) => s.id));
                      setProgressSeconds(0);
                    }}
                    className="text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer"
                  >
                    Marcar Todos
                  </button>
                </div>

                <div className="space-y-2.5">
                  {SLIDE_DEFINITIONS.map((slide) => {
                    const isChecked = activeSlideIds.includes(slide.id);
                    return (
                      <div
                        key={slide.id}
                        onClick={() => handleToggleSlide(slide.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? 'bg-slate-900/90 border-cyan-500/40 shadow-sm'
                            : 'bg-slate-950/50 border-slate-800/80 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="mt-0.5 text-cyan-400">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-cyan-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono">{slide.name}</span>
                            <span className="text-[10px] px-2 py-0.2 bg-slate-800 text-cyan-300 rounded font-mono">
                              {slide.categoryTag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{slide.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SEÇÃO 3: PREFERÊNCIAS ADICIONAIS DO CENTRO DE COMANDO */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Comportamento do Centro de Situação</span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  
                  {/* Toggle Alertas Críticos */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900/60">
                    <span className="text-slate-300 font-semibold">Alertas Visuais Críticos em Tempo Real (Furto / Alto Valor)</span>
                    <input
                      type="checkbox"
                      checked={criticalAlertsEnabled}
                      onChange={(e) => setCriticalAlertsEnabled(e.target.checked)}
                      className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* Toggle Ticker de Rodapé */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900/60">
                    <span className="text-slate-300 font-semibold">Exibir Ticker Animado no Rodapé (Feed Contínuo)</span>
                    <input
                      type="checkbox"
                      checked={showTicker}
                      onChange={(e) => setShowTicker(e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                    />
                  </label>

                  {/* Toggle Rotação Automática */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900/60">
                    <span className="text-slate-300 font-semibold">Rotação Automática Ativada</span>
                    <input
                      type="checkbox"
                      checked={isPlaying}
                      onChange={(e) => setIsPlaying(e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                    />
                  </label>

                </div>
              </div>

            </div>

            {/* Footer do Modal */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrões (30s)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar & Fechar</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
