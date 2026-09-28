/**
 * @file RoutineOperatorView.tsx
 * @description Painel do Operador de CFTV: 'Minha Rotina / Checklists & Gamificação'.
 * Permite visualizar e executar tarefas preventivas diárias, auditar câmeras,
 * marcar checklists e acumular pontos em tempo real no perfil do usuário.
 */

import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  Radio,
  Camera,
  AlertTriangle,
  Sparkles,
  Search,
  CheckCheck,
  Star,
  ShieldCheck,
  DoorOpen,
  HardDrive,
  Eye,
  Film,
  Truck,
  Layers,
  ChevronRight,
  Send,
  X,
  MessageSquare
} from 'lucide-react';
import { RoutineTask, RoutineTaskCategory, RoutineTaskPriority } from '../types';
import { ROUTINE_CATEGORIES, completeRoutineTask } from '../services/routineService';
import { useAuth } from '../context/AuthContext';

interface RoutineOperatorViewProps {
  tasks: RoutineTask[];
  onTaskUpdated?: () => void;
}

export const RoutineOperatorView: React.FC<RoutineOperatorViewProps> = ({
  tasks,
  onTaskUpdated,
}) => {
  const { currentUser, addPointsToUser } = useAuth();

  // Filtros de visualização
  const [statusFilter, setStatusFilter] = useState<'TODAS' | 'PENDENTE' | 'CONCLUIDA'>('PENDENTE');
  const [priorityFilter, setPriorityFilter] = useState<string>('TODAS');
  const [categoryFilter, setCategoryFilter] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal de Execução de Tarefa
  const [executingTask, setExecutingTask] = useState<RoutineTask | null>(null);
  const [checklistState, setChecklistState] = useState<{ id: string; label: string; checked: boolean }[]>([]);
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [cameraObserved, setCameraObserved] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal de Celebração de Pontos
  const [earnedCelebration, setEarnedCelebration] = useState<{ points: number; title: string } | null>(null);

  // Abre o modal de execução preenchendo o checklist da tarefa
  const handleOpenExecution = (task: RoutineTask) => {
    setExecutingTask(task);
    setChecklistState(
      task.checklistItems && task.checklistItems.length > 0
        ? task.checklistItems.map((c) => ({ ...c }))
        : [
            { id: 'c1', label: 'Verificação visual no software VMS', checked: true },
            { id: 'c2', label: 'Confirmação de integridade do sinal de vídeo', checked: true },
          ]
    );
    setCompletionNotes(task.completionNotes || '');
    setCameraObserved(task.cameraObserved || task.title.split('(')[0].trim());
  };

  // Alterna o checkbox de um item do checklist
  const handleToggleChecklistItem = (id: string) => {
    setChecklistState((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Conclui a tarefa e adiciona pontos
  const handleFinishTask = () => {
    if (!executingTask || !currentUser) return;
    setIsSubmitting(true);

    const result = completeRoutineTask(
      executingTask.id,
      currentUser,
      completionNotes,
      cameraObserved,
      checklistState
    );

    if (result.success) {
      // Adiciona pontuação ao perfil do operador
      addPointsToUser(currentUser.id, result.pointsEarned);
      
      // Notifica pai
      if (onTaskUpdated) {
        onTaskUpdated();
      }

      const points = result.pointsEarned;
      const title = executingTask.title;

      setExecutingTask(null);
      setIsSubmitting(false);

      // Exibe celebração gamificada
      setEarnedCelebration({ points, title });
      setTimeout(() => {
        setEarnedCelebration(null);
      }, 4500);
    } else {
      setIsSubmitting(false);
    }
  };

  // Filtragem das tarefas
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== 'TODAS' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'TODAS' && t.priority !== priorityFilter) return false;
      if (categoryFilter !== 'TODAS' && t.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesBranch = (t.branch || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesBranch) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, categoryFilter, searchQuery]);

  // Estatísticas do operador atual
  const myCompletedCount = useMemo(() => {
    if (!currentUser) return 0;
    return tasks.filter((t) => t.status === 'CONCLUIDA' && t.completedBy?.id === currentUser.id).length;
  }, [tasks, currentUser]);

  const pendingCount = tasks.filter((t) => t.status === 'PENDENTE').length;
  const currentScore = currentUser?.score || currentUser?.pontosTotais || 0;
  const operatorLevel = currentUser?.level || 'Operador Ouro 🥇';
  const dailyGoal = 5;
  const dailyProgressPercent = Math.min(100, Math.round((myCompletedCount / dailyGoal) * 100));

  // Ícone por categoria
  const getCategoryIcon = (category: RoutineTaskCategory) => {
    switch (category) {
      case 'auditoria_cameras':
        return <Camera className="w-4 h-4" />;
      case 'teste_panico':
        return <Radio className="w-4 h-4" />;
      case 'ronda_virtual':
        return <ShieldCheck className="w-4 h-4" />;
      case 'link_nvr':
        return <HardDrive className="w-4 h-4" />;
      case 'saidas_emergencia':
        return <DoorOpen className="w-4 h-4" />;
      case 'qualidade_imagem':
        return <Eye className="w-4 h-4" />;
      case 'preservacao_vms':
        return <Film className="w-4 h-4" />;
      case 'inspecao_perimetral':
        return <Truck className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const getPriorityBadge = (priority: RoutineTaskPriority) => {
    switch (priority) {
      case 'critica':
        return <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-black tracking-wide border border-red-200">CRÍTICA</span>;
      case 'alta':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold tracking-wide border border-amber-200">ALTA</span>;
      case 'media':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-medium border border-blue-200">MÉDIA</span>;
      case 'baixa':
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">BAIXA</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HERO CARD DE GAMIFICAÇÃO & DESEMPENHO DO OPERADOR */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Lado Esquerdo: Identificação, Nível e Pontos */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-1 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black shadow-xs">
                NVL
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {currentUser?.name || 'Operador CFTV'}
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {operatorLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Central de Monitoramento CFTV</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                  {currentUser?.streakDays || 8} dias seguidos ativo
                </span>
              </p>
            </div>
          </div>

          {/* Lado Direito: Placar de Pontos e Meta Diária */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            {/* Placar de Pontos */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block font-mono">
                Pontos Totais
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{currentScore}</span>
              </div>
              <span className="text-[10px] text-slate-300 font-medium">pts conquistados</span>
            </div>

            {/* Checklists Concluídos */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block font-mono">
                Auditorias Hoje
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                {myCompletedCount}
              </div>
              <span className="text-[10px] text-slate-300 font-medium">de {dailyGoal} meta diária</span>
            </div>

            {/* Tempo Ocioso Evitado */}
            <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block font-mono">
                Tempo Preventivo
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
                {((myCompletedCount * 20) / 60).toFixed(1)}h
              </div>
              <span className="text-[10px] text-slate-300 font-medium">em rondas ativas</span>
            </div>

          </div>

        </div>

        {/* Barra de Progresso da Meta Diária */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Meta de Rotina Preventiva do Turno ({myCompletedCount}/{dailyGoal} tarefas)
            </span>
            <span className="font-mono font-bold text-amber-400">{dailyProgressPercent}% Concluída</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${dailyProgressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Notificação Toast de Celebração de Pontos Ganhos */}
      {earnedCelebration && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 p-4 rounded-3xl shadow-2xl border-2 border-white flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center">
              <Award className="w-7 h-7 text-slate-950 fill-amber-300" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-900">
                🎉 TAREFA CONCLUÍDA COM SUCESSO!
              </div>
              <div className="text-lg font-black text-slate-950">
                +{earnedCelebration.points} Pontos Somados ao Perfil!
              </div>
              <div className="text-xs font-medium text-slate-900 line-clamp-1">
                {earnedCelebration.title}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BARRA DE CONTROLE E FILTROS DE TAREFAS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Abas de Status */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setStatusFilter('PENDENTE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                statusFilter === 'PENDENTE'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendentes</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-600 text-white font-mono">
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('CONCLUIDA')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                statusFilter === 'CONCLUIDA'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Concluídas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-700 text-white font-mono">
                {tasks.filter((t) => t.status === 'CONCLUIDA').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('TODAS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'TODAS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({tasks.length})
            </button>
          </div>

          {/* Busca Textual */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar checklist ou loja..."
              className="w-full h-10 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </div>

        </div>

        {/* Filtros Secundários de Prioridade e Categoria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 whitespace-nowrap">Prioridade:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="TODAS">Todas as Prioridades</option>
              <option value="critica">🚨 Crítica</option>
              <option value="alta">⚡ Alta</option>
              <option value="media">🔹 Média</option>
              <option value="baixa">▫️ Baixa</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 whitespace-nowrap">Categoria:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="TODAS">Todas as Categorias</option>
              {Object.values(ROUTINE_CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.shortLabel} (+{cat.defaultPoints} pts)
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* 3. GRID DE TAREFAS PREVENTIVAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const catMeta = ROUTINE_CATEGORIES[task.category];
          const isDone = task.status === 'CONCLUIDA';
          const points = task.points || task.pontosGanhos || 50;

          return (
            <div
              key={task.id}
              className={`rounded-3xl p-5 border transition-all relative flex flex-col justify-between ${
                isDone
                  ? 'bg-slate-50/80 border-slate-200 opacity-90'
                  : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md'
              }`}
            >
              
              {/* Header do Card */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-2xl ${catMeta?.bgColor || 'bg-blue-50'} ${catMeta?.color || 'text-blue-600'} flex items-center justify-center shrink-0 border ${catMeta?.borderColor || 'border-blue-200'}`}>
                      {getCategoryIcon(task.category)}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                        {task.categoryLabel || catMeta?.shortLabel || 'Rotina'}
                      </span>
                      {task.branch && (
                        <span className="text-xs font-semibold text-slate-700">
                          {task.branch}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge de Pontuação Gamificada */}
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority)}
                    <div className={`px-2.5 py-1 rounded-xl font-mono text-xs font-black flex items-center gap-1 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>+{points} pts</span>
                    </div>
                  </div>

                </div>

                {/* Título & Descrição */}
                <h3 className={`font-black text-sm sm:text-base tracking-tight mb-2 ${
                  isDone ? 'text-slate-700 line-through' : 'text-slate-900'
                }`}>
                  {task.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4 font-medium">
                  {task.description}
                </p>

                {/* Checklist Preview */}
                {task.checklistItems && task.checklistItems.length > 0 && (
                  <div className="space-y-1.5 mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Passos de Verificação:
                    </div>
                    {task.checklistItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isDone || item.checked ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={isDone || item.checked ? 'line-through text-slate-400' : ''}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer do Card */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    ~{task.estimatedMinutes} min
                  </span>
                  {task.scheduledTime && (
                    <span className="font-mono text-[11px] text-amber-700 font-semibold">
                      Agendado: {task.scheduledTime}
                    </span>
                  )}
                </div>

                {isDone ? (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <CheckCheck className="w-3.5 h-3.5" />
                      Concluída por {task.completedBy?.name.split(' ')[0]}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenExecution(task)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <span>Executar & Pontuar</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

              </div>

            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">
            Nenhuma tarefa encontrada para este filtro
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Todas as rotinas do checklist estão atualizadas ou não correspondem à busca.
          </p>
        </div>
      )}

      {/* 4. MODAL DE EXECUÇÃO DE TAREFA PREVENTIVA */}
      {executingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-5">
            
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Zap className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      Checklist Preventivo
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                      +{executingTask.points} PONTOS
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {executingTask.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExecutingTask(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-700 block mb-1">Procedimento Operacional:</span>
              {executingTask.description}
            </div>

            {/* Checklist Interativo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                ITENS DO CHECKLIST (CONFIRMAR):
              </label>
              <div className="space-y-2">
                {checklistState.map((item) => (
                  <label
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                      item.checked
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {}}
                      className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Câmeras / Dispositivos Observados */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                <Camera className="w-4 h-4 text-blue-600" />
                CÂMERAS OU SENSORES OBSERVADOS:
              </label>
              <input
                type="text"
                value={cameraObserved}
                onChange={(e) => setCameraObserved(e.target.value)}
                placeholder="Ex: CAM-04, PTZ-01, Sensor Doca 02"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            {/* Observações / Parecer do Operador */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                PARECER TÉCNICO / OBSERVAÇÃO DE AUDITORIA:
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={3}
                placeholder="Descreva eventuais anomalias identificadas, foco de câmeras ou confirmação de conformidade..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Ações do Modal */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setExecutingTask(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleFinishTask}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Concluir Tarefa (+{executingTask.points} pts)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
