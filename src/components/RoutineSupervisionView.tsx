/**
 * @file RoutineSupervisionView.tsx
 * @description Painel de Supervisão (Visão do Gestor):
 * 1. Desempenho da Equipe e Ranking de Operadores (Leaderboard) ordenado por pontos.
 * 2. Indicadores de Performance (KPIs): Taxa de Conclusão de Checklists e Produtividade (tempo ocioso vs. preventivo).
 * 3. Gestão e Delegação de Tarefas Preventivas com atribuição de pontuação personalizada.
 */

import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  Medal,
  Flame,
  Zap,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  CheckCircle2,
  Clock,
  Radio,
  Camera,
  AlertTriangle,
  Sparkles,
  Search,
  Plus,
  Filter,
  CheckCheck,
  Star,
  Users,
  ShieldAlert,
  HardDrive,
  Eye,
  DoorOpen,
  Film,
  Truck,
  Layers,
  ChevronRight,
  Gift,
  X,
  FileCheck2
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
  Cell
} from 'recharts';
import { RoutineTask, RoutineTaskCategory, RoutineTaskPriority, AppUser } from '../types';
import {
  ROUTINE_CATEGORIES,
  calculateOperatorLeaderboard,
  calculateRoutineKPIs,
  createRoutineTask
} from '../services/routineService';
import { BRANCH_OPTIONS } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

interface RoutineSupervisionViewProps {
  tasks: RoutineTask[];
  onTaskUpdated?: () => void;
}

export const RoutineSupervisionView: React.FC<RoutineSupervisionViewProps> = ({
  tasks,
  onTaskUpdated,
}) => {
  const { users, addPointsToUser } = useAuth();

  // Estados de Filtros e Busca
  const [subTab, setSubTab] = useState<'LEADERBOARD' | 'KPIS' | 'TASKS_MANAGEMENT'>('LEADERBOARD');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('TODAS');

  // Modal de Criação de Tarefa Preventiva
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newCategory, setNewCategory] = useState<RoutineTaskCategory>('auditoria_cameras');
  const [newBranch, setNewBranch] = useState<string>('01 - MATRIZ / SIA TRECHO 3');
  const [newPriority, setNewPriority] = useState<RoutineTaskPriority>('alta');
  const [newPoints, setNewPoints] = useState<number>(80);
  const [newMinutes, setNewMinutes] = useState<number>(15);
  const [newScheduledTime, setNewScheduledTime] = useState<string>('10:00');
  const [newChecklistRaw, setNewChecklistRaw] = useState<string>(
    'Verificar foco e nitidez da imagem\nConfirmar ausência de pontos cegos no corredor\nValidar taxa de gravação no NVR'
  );

  // Notificação de Bônus Concedido
  const [bonusToast, setBonusToast] = useState<{ operatorName: string; points: number } | null>(null);

  // Calcula o Leaderboard ordenado
  const leaderboard = useMemo(() => {
    return calculateOperatorLeaderboard(users, tasks);
  }, [users, tasks]);

  // Calcula KPIs agregados
  const kpis = useMemo(() => {
    return calculateRoutineKPIs(tasks);
  }, [tasks]);

  // Dados para Gráfico de Produtividade (Tempo Ocioso Convertido vs Tarefas)
  const productivityChartData = useMemo(() => {
    return leaderboard.map((op) => ({
      name: op.operatorName.split(' ')[0],
      pontos: op.totalPoints,
      tarefas: op.completedTasks,
      horasPreventivas: op.idleTimePreventedHours,
    }));
  }, [leaderboard]);

  // Submissão de Nova Tarefa Preventiva
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const checklistItems = newChecklistRaw
      .split('\n')
      .map((line, idx) => line.trim())
      .filter((line) => line.length > 0)
      .map((label, idx) => ({
        id: `c-${Date.now()}-${idx}`,
        label,
        checked: false,
      }));

    createRoutineTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      categoryLabel: ROUTINE_CATEGORIES[newCategory]?.label || newCategory,
      branch: newBranch,
      priority: newPriority,
      points: newPoints,
      pontosGanhos: newPoints,
      estimatedMinutes: newMinutes,
      scheduledTime: newScheduledTime,
      assignedTo: 'ALL',
      assignedToName: 'Central CFTV',
      checklistItems,
    });

    if (onTaskUpdated) {
      onTaskUpdated();
    }

    setIsCreateModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewPoints(80);
  };

  // Concede Bônus de Pontos da Supervisão ao Operador
  const handleAwardBonus = (operatorId: string, operatorName: string, amount: number) => {
    addPointsToUser(operatorId, amount);
    if (onTaskUpdated) {
      onTaskUpdated();
    }
    setBonusToast({ operatorName, points: amount });
    setTimeout(() => setBonusToast(null), 4000);
  };

  const top3 = leaderboard.slice(0, 3);
  const COLORS_PIE = ['#2563EB', '#E11D48', '#059669', '#D97706', '#9333EA', '#0891B2', '#CA8A04', '#EA580C'];

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER DO PAINEL DE SUPERVISÃO */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">
                Supervisão & Desempenho da Equipe
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold">
                Gamificação Ativa
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Otimização de tempo ocioso, adesão aos checklists diários e ranking da Central de Monitoramento.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Criar Nova Tarefa Preventiva</span>
          </button>
        </div>
      </div>

      {/* Toast de Bônus */}
      {bonusToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold">
              Bônus de +{bonusToast.points} pontos concedido com sucesso para {bonusToast.operatorName}!
            </span>
          </div>
          <button type="button" onClick={() => setBonusToast(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. CARDS DE KPIS DA ROTINA PREVENTIVA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Taxa de Conclusão Checklists</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{kpis.completionRate}%</div>
          <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {kpis.completedCount} de {kpis.totalTasks} tarefas concluídas
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tempo Ocioso Evitado</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{kpis.idleHoursPrevented}h</div>
          <div className="text-[11px] font-medium text-slate-500">
            Convertidas em rondas ativas e auditorias
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pontos Conquistados (Equipe)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            {kpis.totalPointsDistributed} pts
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            Engajamento e gamificação ativa
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Operador Líder do Turno</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-extrabold text-slate-900 truncate" title={top3[0]?.operatorName}>
            {top3[0]?.operatorName || 'Juliana Costa'}
          </div>
          <div className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
            <Star className="w-3 h-3 fill-purple-600" />
            {top3[0]?.totalPoints || 0} pts • {top3[0]?.level || 'Ouro'}
          </div>
        </div>

      </div>

      {/* 3. NAVEGAÇÃO DE SUB-ABAS (RANKING / INDICADORES KPIS / GESTÃO DE TAREFAS) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setSubTab('LEADERBOARD')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'LEADERBOARD'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Ranking de Operadores (Leaderboard)</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('KPIS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'KPIS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Indicadores de Produtividade</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('TASKS_MANAGEMENT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'TASKS_MANAGEMENT'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Tarefas & Auditorias ({tasks.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-ABA 1: LEADERBOARD & PÓDIO DE OPERADORES                                */}
      {/* ========================================================================= */}
      {subTab === 'LEADERBOARD' && (
        <div className="space-y-6">
          
          {/* PÓDIO TOP 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 2º Lugar (Prata) */}
            {top3[1] && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between order-2 md:order-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-300" />
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black font-mono">
                    2º LUGAR 🥈
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    {top3[1].completedTasks} tarefas
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {top3[1].operatorName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{top3[1].branch}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{top3[1].level}</span>
                    <span className="text-lg font-black text-slate-800 font-mono">
                      {top3[1].totalPoints} pts
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tempo preventivo:</span>
                  <span className="font-bold text-emerald-600">{top3[1].idleTimePreventedHours}h</span>
                </div>
              </div>
            )}

            {/* 1º Lugar (Ouro / Destaque) */}
            {top3[0] && (
              <div className="bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-6 text-slate-950 shadow-xl flex flex-col justify-between order-1 md:order-2 border-2 border-white transform md:-translate-y-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-xs font-black font-mono flex items-center gap-1 shadow-sm">
                    <Trophy className="w-3.5 h-3.5 fill-amber-300" />
                    CAMPEÃO DO TURNO 🥇
                  </span>
                  <span className="text-xs font-black text-slate-950 font-mono">
                    {top3[0].completedTasks} tarefas
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-slate-950 text-lg">
                    {top3[0].operatorName}
                  </h3>
                  <p className="text-xs text-slate-900 font-semibold mt-0.5">{top3[0].branch}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-950/20 text-slate-950 font-black text-xs">
                      {top3[0].level}
                    </span>
                    <span className="text-2xl font-black text-slate-950 font-mono">
                      {top3[0].totalPoints} pts
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-950/20 flex items-center justify-between text-xs font-bold">
                  <span>Tempo em Rondas CFTV:</span>
                  <span className="font-mono text-sm">{top3[0].idleTimePreventedHours}h</span>
                </div>
              </div>
            )}

            {/* 3º Lugar (Bronze) */}
            {top3[2] && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between order-3 md:order-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-700" />
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-black font-mono">
                    3º LUGAR 🥉
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    {top3[2].completedTasks} tarefas
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {top3[2].operatorName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{top3[2].branch}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{top3[2].level}</span>
                    <span className="text-lg font-black text-amber-800 font-mono">
                      {top3[2].totalPoints} pts
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tempo preventivo:</span>
                  <span className="font-bold text-emerald-600">{top3[2].idleTimePreventedHours}h</span>
                </div>
              </div>
            )}

          </div>

          {/* TABELA COMPLETA DO LEADERBOARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Classificação Geral da Equipe de Monitoramento</span>
              </div>
              <span className="text-xs text-slate-400">
                Atualizado em tempo real com base no Firestore / Storage
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 text-center">Posição</th>
                    <th className="py-3.5 px-4">Operador</th>
                    <th className="py-3.5 px-4">Nível / Patente</th>
                    <th className="py-3.5 px-4 text-center">Auditorias</th>
                    <th className="py-3.5 px-4 text-center">Adesão (%)</th>
                    <th className="py-3.5 px-4 text-center">Tempo Ativo</th>
                    <th className="py-3.5 px-4 text-right">Pontos Totais</th>
                    <th className="py-3.5 px-4 text-center">Ação Gestor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {leaderboard.map((op) => (
                    <tr key={op.operatorId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-bold font-mono text-xs ${
                          op.rankPosition === 1
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : op.rankPosition === 2
                            ? 'bg-slate-200 text-slate-800'
                            : op.rankPosition === 3
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {op.rankPosition}º
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{op.operatorName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">@{op.username} • {op.branch}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold">
                          {op.level}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                        {op.completedTasks}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-bold font-mono text-slate-800">{op.completionRatePercent}%</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-emerald-600 font-bold">
                        {op.idleTimePreventedHours}h
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-amber-600 text-sm">
                        {op.totalPoints} pts
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAwardBonus(op.operatorId, op.operatorName, 50)}
                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition-all cursor-pointer"
                            title="Conceder Bônus de +50 Pontos"
                          >
                            +50 pts
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAwardBonus(op.operatorId, op.operatorName, 100)}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold transition-all cursor-pointer"
                            title="Conceder Bônus de +100 Pontos"
                          >
                            +100 pts
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-ABA 2: GRÁFICOS DE INDICADORES & PRODUTIVIDADE                          */}
      {/* ========================================================================= */}
      {subTab === 'KPIS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gráfico 1: Produtividade por Operador */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Produtividade por Operador (Pontos & Horas Preventivas)</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productivityChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', border: 'none', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="pontos" fill="#EAB308" name="Pontos Conquistados" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="tarefas" fill="#2563EB" name="Tarefas Concluídas" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2: Distribuição por Categoria de Auditoria */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                <span>Auditorias Preventivas por Categoria</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kpis.categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="total"
                  >
                    {kpis.categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', border: 'none', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-ABA 3: GESTÃO & LISTA DE TODAS AS TAREFAS                              */}
      {/* ========================================================================= */}
      {subTab === 'TASKS_MANAGEMENT' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <FileCheck2 className="w-4 h-4 text-purple-600" />
              <span>Painel Geral de Tarefas Preventivas Cadastradas</span>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Tarefa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((t) => {
              const catMeta = ROUTINE_CATEGORIES[t.category];
              const isDone = t.status === 'CONCLUIDA';

              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDone ? 'bg-slate-50 border-slate-200' : 'bg-white border-amber-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                      {catMeta?.shortLabel || t.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-black ${
                      isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      +{t.points} pts
                    </span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 mb-1">
                    {t.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {t.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{t.branch || 'Todas as Lojas'}</span>
                    <span className={`font-bold ${isDone ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isDone ? '✓ Concluída' : '⏳ Pendente'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL DO GESTOR: CRIAR NOVA TAREFA PREVENTIVA                            */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Cadastrar Nova Rotina Preventiva
                  </h3>
                  <p className="text-xs text-slate-500">
                    Delegue uma auditoria ou checklist com pontuação gamificada para a Central CFTV
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              
              {/* Título */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">
                  TÍTULO DA TAREFA / AUDITORIA:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Auditoria de Câmeras Loja 08 (Setor Açougue & Frios)"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">
                  PROCEDIMENTO / INSTRUÇÃO PARA O OPERADOR:
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Instruções claras do que deve ser auditado, posições de câmeras ou itens de conferência..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Grid de Configurações */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Categoria */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-mono">CATEGORIA:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      const cat = e.target.value as RoutineTaskCategory;
                      setNewCategory(cat);
                      setNewPoints(ROUTINE_CATEGORIES[cat]?.defaultPoints || 80);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.values(ROUTINE_CATEGORIES).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.shortLabel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filial */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-mono">FILIAL / LOJA:</label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                  >
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prioridade */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-mono">PRIORIDADE:</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as RoutineTaskPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="critica">🚨 Crítica</option>
                    <option value="alta">⚡ Alta</option>
                    <option value="media">🔹 Média</option>
                    <option value="baixa">▫️ Baixa</option>
                  </select>
                </div>

              </div>

              {/* Pontos & Tempo Estimado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-mono">PONTOS GANHOS:</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    min={10}
                    max={500}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-mono font-bold text-amber-700 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-mono">TEMPO ESTIMADO (MIN):</label>
                  <input
                    type="number"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    min={5}
                    max={120}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-mono">HORÁRIO AGENDADO:</label>
                  <input
                    type="text"
                    value={newScheduledTime}
                    onChange={(e) => setNewScheduledTime(e.target.value)}
                    placeholder="10:00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

              </div>

              {/* Passos do Checklist */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">
                  ITENS DO CHECKLIST (UM POR LINHA):
                </label>
                <textarea
                  value={newChecklistRaw}
                  onChange={(e) => setNewChecklistRaw(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              {/* Botões do Modal */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar & Atribuir (+{newPoints} pts)</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
