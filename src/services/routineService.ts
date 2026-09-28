/**
 * @file routineService.ts
 * @description Serviço de Gestão de Rotina Preventiva e Gamificação para Operadores da Central CFTV.
 * Suporta persistência em tempo real, cálculo de pontuação, leaderboard (ranking),
 * e indicadores de produtividade vs. tempo ocioso.
 */

import { RoutineTask, RoutineTaskCategory, OperatorPerformanceStats, AppUser } from '../types';

export interface CategoryMetadata {
  id: RoutineTaskCategory;
  label: string;
  shortLabel: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  defaultPoints: number;
}

export const ROUTINE_CATEGORIES: Record<RoutineTaskCategory, CategoryMetadata> = {
  auditoria_cameras: {
    id: 'auditoria_cameras',
    label: 'Auditoria de Câmeras & Ângulos',
    shortLabel: 'Auditoria CFTV',
    iconName: 'Camera',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    defaultPoints: 80,
  },
  teste_panico: {
    id: 'teste_panico',
    label: 'Teste de Pânico & Alarme de Docas',
    shortLabel: 'Teste de Pânico',
    iconName: 'Radio',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    defaultPoints: 120,
  },
  ronda_virtual: {
    id: 'ronda_virtual',
    label: 'Ronda Virtual Perimetral & Salão',
    shortLabel: 'Ronda Virtual',
    iconName: 'ShieldCheck',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    defaultPoints: 100,
  },
  link_nvr: {
    id: 'link_nvr',
    label: 'Checagem de Links NVR & Armazenamento',
    shortLabel: 'Status NVR / HD',
    iconName: 'HardDrive',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    defaultPoints: 60,
  },
  saidas_emergencia: {
    id: 'saidas_emergencia',
    label: 'Inspeção de Saídas de Emergência CFTV',
    shortLabel: 'Saídas Emergência',
    iconName: 'DoorOpen',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    defaultPoints: 70,
  },
  qualidade_imagem: {
    id: 'qualidade_imagem',
    label: 'Auditoria de Nitidez e Iluminação',
    shortLabel: 'Nitidez & Foco',
    iconName: 'Eye',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    defaultPoints: 90,
  },
  preservacao_vms: {
    id: 'preservacao_vms',
    label: 'Auditoria de Backup VMS e Gravações',
    shortLabel: 'Backup VMS',
    iconName: 'Film',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    defaultPoints: 150,
  },
  inspecao_perimetral: {
    id: 'inspecao_perimetral',
    label: 'Varredura de Estacionamento & Portarias',
    shortLabel: 'Perímetro & Portaria',
    iconName: 'Truck',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    defaultPoints: 110,
  },
};

export const INITIAL_ROUTINE_TASKS: RoutineTask[] = [
  {
    id: 'rt-01',
    title: 'Auditoria de Câmeras Loja 04 (Bebidas Quentes & Destilados)',
    description: 'Verificar se todas as câmeras dos corredores 04 e 05 estão com foco limpo, sem pontos cegos no setor de alto risco e sem obstrução por placas promocionais.',
    category: 'auditoria_cameras',
    categoryLabel: 'Auditoria de Câmeras & Ângulos',
    status: 'PENDENTE',
    points: 80,
    pontosGanhos: 80,
    priority: 'alta',
    estimatedMinutes: 15,
    assignedTo: 'ALL',
    assignedToName: 'Central CFTV',
    branch: '04 - ASA NORTE',
    scheduledTime: '09:00',
    createdAt: '2026-08-24T08:00:00.000Z',
    checklistItems: [
      { id: 'c1', label: 'CAM-04 Corredor Destilados sem obstrução de cartaz', checked: false },
      { id: 'c2', label: 'CAM-05 Foco em gôndola de whisky e gin importado', checked: false },
      { id: 'c3', label: 'Taxa de FPS estável acima de 25 fps', checked: false },
    ],
  },
  {
    id: 'rt-02',
    title: 'Teste de Pânico & Alarme de Docas Loja 01 (SIA Trecho 3)',
    description: 'Realizar acionamento de teste silencioso com o fiscal de docas via rádio HT e confirmar recepção imediata do pop-up no software VMS.',
    category: 'teste_panico',
    categoryLabel: 'Teste de Pânico & Alarme de Docas',
    status: 'PENDENTE',
    points: 120,
    pontosGanhos: 120,
    priority: 'critica',
    estimatedMinutes: 20,
    assignedTo: 'ALL',
    assignedToName: 'Central CFTV',
    branch: '01 - MATRIZ / SIA TRECHO 3',
    scheduledTime: '10:30',
    createdAt: '2026-08-24T08:15:00.000Z',
    checklistItems: [
      { id: 'c1', label: 'Contato prévio com fiscal de recepção de mercadorias', checked: false },
      { id: 'c2', label: 'Disparo do botão de pânico recebido em < 3 segundos', checked: false },
      { id: 'c3', label: 'Sirene local e giroflex acionados corretamente', checked: false },
    ],
  },
  {
    id: 'rt-03',
    title: 'Ronda Virtual Perimetral - Filial 06 (Ceilândia)',
    description: 'Varredura preventiva de 360° em todas as câmeras do muro externo, docas de recebimento e portaria de carretas durante o período de troca de turno.',
    category: 'ronda_virtual',
    categoryLabel: 'Ronda Virtual Perimetral & Salão',
    status: 'PENDENTE',
    points: 100,
    pontosGanhos: 100,
    priority: 'media',
    estimatedMinutes: 25,
    assignedTo: 'ALL',
    assignedToName: 'Central CFTV',
    branch: '06 - CEILÂNDIA SUL',
    scheduledTime: '11:45',
    createdAt: '2026-08-24T08:30:00.000Z',
    checklistItems: [
      { id: 'c1', label: 'Câmeras de muro perimetral sem pontos escuros', checked: false },
      { id: 'c2', label: 'Portão de carretas fechado e trancado', checked: false },
      { id: 'c3', label: 'Presença de rondas de solo identificada nas áreas de docas', checked: false },
    ],
  },
  {
    id: 'rt-04',
    title: 'Checagem de Links NVR e Armazenamento (Dias de Retenção) Loja 12',
    description: 'Auditar se os servidores NVR da Loja 12 estão com storage saudável (> 30 dias de histórico contínuo) e sem perdas de pacotes na rede.',
    category: 'link_nvr',
    categoryLabel: 'Checagem de Links NVR & Armazenamento',
    status: 'PENDENTE',
    points: 60,
    pontosGanhos: 60,
    priority: 'media',
    estimatedMinutes: 10,
    assignedTo: 'ALL',
    assignedToName: 'Central CFTV',
    branch: '12 - ÁGUAS CLARAS',
    scheduledTime: '13:00',
    createdAt: '2026-08-24T08:45:00.000Z',
    checklistItems: [
      { id: 'c1', label: 'Taxa de ocupação de disco NVR-01 abaixo de 92%', checked: false },
      { id: 'c2', label: '32 câmeras IP conectadas sem perda de sincronia NTP', checked: false },
    ],
  },
  {
    id: 'rt-05',
    title: 'Inspeção de Desobstrução de Saídas de Emergência Loja 02',
    description: 'Verificar pelas câmeras de salão se as 6 portas corta-fogo e saídas de emergência estão livres de paletes, caixas e carrinhos de reposição.',
    category: 'saidas_emergencia',
    categoryLabel: 'Inspeção de Saídas de Emergência CFTV',
    status: 'PENDENTE',
    points: 70,
    pontosGanhos: 70,
    priority: 'alta',
    estimatedMinutes: 15,
    assignedTo: 'ALL',
    assignedToName: 'Central CFTV',
    branch: '02 - TAGUATINGA CENTRO',
    scheduledTime: '14:30',
    createdAt: '2026-08-24T09:00:00.000Z',
    checklistItems: [
      { id: 'c1', label: 'Porta de emergência fundo Loja 02 100% desobstruída', checked: false },
      { id: 'c2', label: 'Extintores e hidrantes com acesso livre e sinalizados', checked: false },
      { id: 'c3', label: 'Luzes de emergência alimentadas', checked: false },
    ],
  },
  {
    id: 'rt-06',
    title: 'Auditoria de Nitidez e Iluminação dos Caixas Rápidos Loja 05',
    description: 'Analisar imagem das câmeras pin-hole dos caixas 01 a 08 para assegurar nitidez na contagem de cédulas e leitura de comprovantes TEF.',
    category: 'qualidade_imagem',
    categoryLabel: 'Auditoria de Nitidez e Iluminação',
    status: 'PENDENTE',
    points: 90,
    pontosGanhos: 90,
    priority: 'media',
    estimatedMinutes: 20,
    assignedTo: 'ALL',
    assignedToName: 'Central CFTV',
    branch: '05 - VALPARAÍSO',
    scheduledTime: '16:00',
    createdAt: '2026-08-24T09:15:00.000Z',
    checklistItems: [
      { id: 'c1', label: 'Identificação nítida de notas de R$ 50 e R$ 100', checked: false },
      { id: 'c2', label: 'Sem reflexo de lâmpadas LED direto na lente da câmera', checked: false },
    ],
  },
  // Tarefas Concluídas para alimentar histórico e rankings
  {
    id: 'rt-07',
    title: 'Auditoria de Preservação e Backup VMS - Final de Semana Loja 03',
    description: 'Exportação e custódia segura das gravações de eventos críticos ocorridos na madrugada de domingo.',
    category: 'preservacao_vms',
    categoryLabel: 'Auditoria de Backup VMS e Gravações',
    status: 'CONCLUIDA',
    points: 150,
    pontosGanhos: 150,
    priority: 'alta',
    estimatedMinutes: 30,
    assignedTo: 'usr-cftv-01',
    assignedToName: 'Juliana Costa (Operadora de VMS)',
    branch: '03 - VICENTE PIRES',
    scheduledTime: '08:00',
    createdAt: '2026-08-24T07:00:00.000Z',
    completedAt: '2026-08-24T07:35:00.000Z',
    completedBy: {
      id: 'usr-cftv-01',
      name: 'Juliana Costa (Operadora de VMS)',
      username: 'cftv',
    },
    completionNotes: 'Exportação de 4 horas de gravação realizada e validada no storage secundário NAS.',
    cameraObserved: 'CAM-01 a CAM-08 Docas e Salão',
    checklistItems: [
      { id: 'c1', label: 'Hash MD5 gerado para integridade pericial', checked: true },
      { id: 'c2', label: 'Armazenamento em nuvem criptografado', checked: true },
    ],
  },
  {
    id: 'rt-08',
    title: 'Verificação de Câmeras PTZ e LPR (Leitura de Placas) Loja 07',
    description: 'Teste dos motores de pan/tilt/zoom e calibragem do OCR de leitura de placas na cancela de entrada de clientes.',
    category: 'inspecao_perimetral',
    categoryLabel: 'Varredura de Estacionamento & Portarias',
    status: 'CONCLUIDA',
    points: 110,
    pontosGanhos: 110,
    priority: 'media',
    estimatedMinutes: 20,
    assignedTo: 'usr-cftv-03',
    assignedToName: 'Patrícia Souza (Operadora CFTV Pl.)',
    branch: '07 - SAMAMBAIA',
    scheduledTime: '08:30',
    createdAt: '2026-08-24T07:30:00.000Z',
    completedAt: '2026-08-24T08:05:00.000Z',
    completedBy: {
      id: 'usr-cftv-03',
      name: 'Patrícia Souza (Operadora CFTV Pl.)',
      username: 'patricia.cftv',
    },
    completionNotes: 'LPR calibrado com 98% de precisão na cancela 01 e 02.',
    cameraObserved: 'CAM-LPR-01 & PTZ-02 Estacionamento',
    checklistItems: [
      { id: 'c1', label: 'Presença de infravermelho noturno ativo', checked: true },
      { id: 'c2', label: 'Preset de ronda automática gravado no joystick', checked: true },
    ],
  },
];

const STORAGE_ROUTINE_KEY = 'atacadao_dia_a_dia_routine_tasks_v1';

/**
 * Obtém a lista de tarefas preventivas armazenadas
 */
export function getStoredRoutineTasks(): RoutineTask[] {
  try {
    const data = localStorage.getItem(STORAGE_ROUTINE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar tarefas de rotina do localStorage:', err);
  }
  return INITIAL_ROUTINE_TASKS;
}

/**
 * Salva as tarefas e notifica os ouvintes em tempo real
 */
export function saveRoutineTasksToStorage(tasks: RoutineTask[]): void {
  try {
    localStorage.setItem(STORAGE_ROUTINE_KEY, JSON.stringify(tasks));
    // Dispara evento customizado para sincronia de componentes
    window.dispatchEvent(new CustomEvent('routine-tasks-updated', { detail: tasks }));
  } catch (err) {
    console.warn('Erro ao salvar tarefas de rotina:', err);
  }
}

/**
 * Inscreve-se para atualizações em tempo real das tarefas
 */
export function subscribeToRoutineTasks(callback: (tasks: RoutineTask[]) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<RoutineTask[]>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getStoredRoutineTasks());
    }
  };

  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_ROUTINE_KEY) {
      callback(getStoredRoutineTasks());
    }
  };

  window.addEventListener('routine-tasks-updated', handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener('routine-tasks-updated', handler);
    window.removeEventListener('storage', storageHandler);
  };
}

/**
 * Marca uma tarefa como CONCLUIDA e registra as evidências/notas
 */
export function completeRoutineTask(
  taskId: string,
  operator: AppUser,
  completionNotes: string = '',
  cameraObserved: string = '',
  checklistItems?: { id: string; label: string; checked: boolean }[]
): { success: boolean; task?: RoutineTask; pointsEarned: number } {
  const currentTasks = getStoredRoutineTasks();
  const targetIndex = currentTasks.findIndex((t) => t.id === taskId);

  if (targetIndex === -1) {
    return { success: false, pointsEarned: 0 };
  }

  const existingTask = currentTasks[targetIndex];
  const points = existingTask.points || existingTask.pontosGanhos || 50;
  const nowIso = new Date().toISOString();

  const updatedTask: RoutineTask = {
    ...existingTask,
    status: 'CONCLUIDA',
    completedAt: nowIso,
    completedBy: {
      id: operator.id,
      name: operator.name,
      username: operator.username,
    },
    completionNotes: completionNotes.trim() || 'Tarefa preventiva concluída com sucesso conforme procedimento.',
    cameraObserved: cameraObserved.trim() || existingTask.cameraObserved || 'CFTV Geral',
    checklistItems: checklistItems || existingTask.checklistItems?.map((c) => ({ ...c, checked: true })),
  };

  currentTasks[targetIndex] = updatedTask;
  saveRoutineTasksToStorage(currentTasks);

  return {
    success: true,
    task: updatedTask,
    pointsEarned: points,
  };
}

/**
 * Cria uma nova tarefa preventiva (Visão do Supervisor/Gestor)
 */
export function createRoutineTask(
  taskData: Omit<RoutineTask, 'id' | 'createdAt' | 'status'>
): RoutineTask {
  const currentTasks = getStoredRoutineTasks();
  const categoryMeta = ROUTINE_CATEGORIES[taskData.category];

  const newTask: RoutineTask = {
    ...taskData,
    id: `rt-${Date.now()}`,
    status: 'PENDENTE',
    categoryLabel: categoryMeta ? categoryMeta.label : taskData.category,
    points: taskData.points || categoryMeta?.defaultPoints || 50,
    pontosGanhos: taskData.points || categoryMeta?.defaultPoints || 50,
    createdAt: new Date().toISOString(),
  };

  const updated = [newTask, ...currentTasks];
  saveRoutineTasksToStorage(updated);
  return newTask;
}

/**
 * Remove uma tarefa preventiva
 */
export function deleteRoutineTask(taskId: string): boolean {
  const currentTasks = getStoredRoutineTasks();
  const filtered = currentTasks.filter((t) => t.id !== taskId);
  if (filtered.length !== currentTasks.length) {
    saveRoutineTasksToStorage(filtered);
    return true;
  }
  return false;
}

/**
 * Calcula o Leaderboard completo ordenado por pontuação
 */
export function calculateOperatorLeaderboard(
  users: AppUser[],
  tasks: RoutineTask[]
): OperatorPerformanceStats[] {
  // Filtra usuários operadores ou com pontuação
  const eligibleUsers = users.filter((u) => u.status === 'active');

  const stats: OperatorPerformanceStats[] = eligibleUsers.map((u) => {
    // Tarefas concluídas por esse usuário
    const userCompletedTasks = tasks.filter(
      (t) => t.status === 'CONCLUIDA' && t.completedBy?.id === u.id
    );

    // Soma de pontos reais calculada pelas tarefas concluídas + base score do usuário
    const taskPointsSum = userCompletedTasks.reduce((acc, t) => acc + (t.points || t.pontosGanhos || 0), 0);
    const totalPoints = Math.max(u.score || u.pontosTotais || 0, taskPointsSum);

    const completedCount = Math.max(u.completedTasksCount || 0, userCompletedTasks.length);
    const assignedTasks = tasks.filter((t) => t.assignedTo === u.id || t.assignedTo === 'ALL');
    const totalAssigned = Math.max(assignedTasks.length, completedCount);
    
    const completionRatePercent = totalAssigned > 0 
      ? Math.min(100, Math.round((completedCount / (totalAssigned || 1)) * 100))
      : 85;

    // Tempo ocioso evitado (horas convertidas em auditoria e checagem preventiva)
    const minutesExecuted = userCompletedTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 15), 0);
    const idleTimePreventedHours = Number(((minutesExecuted + completedCount * 12) / 60).toFixed(1));

    let level = u.level || 'Operador Bronze 🥉';
    if (totalPoints >= 1200) {
      level = 'Mestre da Prevenção ⭐⭐⭐';
    } else if (totalPoints >= 800) {
      level = 'Operador Elite 💎';
    } else if (totalPoints >= 500) {
      level = 'Operador Ouro 🥇';
    } else if (totalPoints >= 250) {
      level = 'Operador Prata 🥈';
    }

    return {
      operatorId: u.id,
      operatorName: u.name,
      username: u.username,
      role: u.role,
      branch: u.branch || 'Central CFTV',
      totalPoints,
      completedTasks: completedCount,
      pendingTasks: Math.max(0, tasks.filter((t) => t.status === 'PENDENTE').length),
      completionRatePercent,
      avgExecutionMinutes: userCompletedTasks.length > 0 
        ? Math.round(minutesExecuted / userCompletedTasks.length) 
        : 15,
      level,
      rankPosition: 1,
      streakDays: u.streakDays || 5,
      idleTimePreventedHours: idleTimePreventedHours > 0 ? idleTimePreventedHours : 3.5,
    };
  });

  // Ordena por pontuação decrescente
  stats.sort((a, b) => b.totalPoints - a.totalPoints);

  // Atribui posições
  stats.forEach((item, index) => {
    item.rankPosition = index + 1;
  });

  return stats;
}

/**
 * Retorna KPIs agregados da Rotina Preventiva
 */
export function calculateRoutineKPIs(tasks: RoutineTask[]) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'CONCLUIDA');
  const pendingTasks = tasks.filter((t) => t.status === 'PENDENTE');

  const totalPointsDistributed = completedTasks.reduce(
    (acc, t) => acc + (t.points || t.pontosGanhos || 0),
    0
  );

  const completionRate = totalTasks > 0
    ? Math.round((completedTasks.length / totalTasks) * 100)
    : 0;

  const totalEstimatedMinutes = completedTasks.reduce(
    (acc, t) => acc + (t.estimatedMinutes || 15),
    0
  );

  const idleHoursPrevented = (totalEstimatedMinutes / 60).toFixed(1);

  // Agrupamento por categoria
  const categoryCounts: Record<string, { name: string; total: number; concluidas: number; color: string }> = {};

  tasks.forEach((t) => {
    const meta = ROUTINE_CATEGORIES[t.category];
    const catName = meta ? meta.shortLabel : t.category;
    if (!categoryCounts[catName]) {
      categoryCounts[catName] = {
        name: catName,
        total: 0,
        concluidas: 0,
        color: meta?.color || '#3B82F6',
      };
    }
    categoryCounts[catName].total += 1;
    if (t.status === 'CONCLUIDA') {
      categoryCounts[catName].concluidas += 1;
    }
  });

  const categoryChartData = Object.values(categoryCounts);

  return {
    totalTasks,
    completedCount: completedTasks.length,
    pendingCount: pendingTasks.length,
    completionRate,
    totalPointsDistributed,
    totalEstimatedMinutes,
    idleHoursPrevented,
    categoryChartData,
  };
}
