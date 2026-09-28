/**
 * @file authService.ts
 * @description Mock data de usuários, persistência local e regras de autorização RBAC.
 */

import { AppUser, UserRole, AppTab } from '../types';

export const INITIAL_MOCK_USERS: AppUser[] = [
  {
    id: 'usr-master-01',
    name: 'Carlos Mendes (Diretor de Segurança)',
    username: 'master',
    password: 'master',
    role: 'ROLE_MASTER',
    roleLabel: 'Administrador Geral (Master)',
    branch: 'Matriz / Todas as Unidades',
    createdAt: '2026-01-10T08:00:00.000Z',
    status: 'active',
    score: 1250,
    pontosTotais: 1250,
    completedTasksCount: 42,
    level: 'Mestre da Prevenção ⭐⭐⭐',
    streakDays: 14,
    badges: [
      { id: 'b-master', name: 'Guardião Geral', icon: 'ShieldAlert', description: 'Supervisão integral de rotina', unlockedAt: '2026-01-15' },
      { id: 'b-auditor', name: 'Auditor de Elite', icon: 'CheckCheck', description: 'Mais de 40 auditorias concluídas', unlockedAt: '2026-02-01' }
    ]
  },
  {
    id: 'usr-cftv-01',
    name: 'Juliana Costa (Operadora de VMS)',
    username: 'cftv',
    password: 'cftv',
    role: 'ROLE_CFTV',
    roleLabel: 'Central de Monitoramento CFTV',
    branch: 'Central Integrada CFTV',
    createdAt: '2026-02-05T14:15:00.000Z',
    status: 'active',
    score: 850,
    pontosTotais: 850,
    completedTasksCount: 28,
    level: 'Operador Ouro 🥇',
    streakDays: 8,
    badges: [
      { id: 'b-cftv-gold', name: 'Olhos de Águia', icon: 'Eye', description: '100% de câmeras auditadas', unlockedAt: '2026-02-10' },
      { id: 'b-fast-response', name: 'Agilidade Total', icon: 'Zap', description: 'SLA médio abaixo de 10 min', unlockedAt: '2026-02-18' }
    ]
  },
  {
    id: 'usr-cftv-02',
    name: 'Lucas Moreira (Operador CFTV Jr.)',
    username: 'lucas.cftv',
    password: '123',
    role: 'ROLE_CFTV',
    roleLabel: 'Central de Monitoramento CFTV',
    branch: 'Central Integrada CFTV',
    createdAt: '2026-02-08T09:00:00.000Z',
    status: 'active',
    score: 620,
    pontosTotais: 620,
    completedTasksCount: 19,
    level: 'Operador Prata 🥈',
    streakDays: 5,
    badges: [
      { id: 'b-cftv-silver', name: 'Vigilante Noturno', icon: 'Moon', description: '10 rondas virtuais concluídas', unlockedAt: '2026-02-14' }
    ]
  },
  {
    id: 'usr-cftv-03',
    name: 'Patrícia Souza (Operadora CFTV Pl.)',
    username: 'patricia.cftv',
    password: '123',
    role: 'ROLE_CFTV',
    roleLabel: 'Central de Monitoramento CFTV',
    branch: 'Central Integrada CFTV',
    createdAt: '2026-02-10T11:20:00.000Z',
    status: 'active',
    score: 740,
    pontosTotais: 740,
    completedTasksCount: 24,
    level: 'Operador Ouro 🥇',
    streakDays: 7,
    badges: [
      { id: 'b-panic-test', name: 'Guardião do Pânico', icon: 'Radio', description: 'Auditoria de botões de pânico sem falhas', unlockedAt: '2026-02-17' }
    ]
  },
  {
    id: 'usr-ronda-01',
    name: 'Marcos Silva (Agente de Campo)',
    username: 'ronda',
    password: 'ronda',
    role: 'ROLE_RONDA',
    roleLabel: 'Ronda Mobile (Campo & GPS)',
    branch: 'Filial 01 - SIA Trecho 3',
    createdAt: '2026-02-01T10:30:00.000Z',
    status: 'active',
    score: 480,
    pontosTotais: 480,
    completedTasksCount: 15,
    level: 'Operador Bronze 🥉',
    streakDays: 4,
    badges: [
      { id: 'b-ronda-field', name: 'Patrulheiro Ágil', icon: 'MapPin', description: 'Rastreamento georreferenciado', unlockedAt: '2026-02-12' }
    ]
  },
  {
    id: 'usr-gerencial-01',
    name: 'Roberto Alencar (Gerente de Prevenção)',
    username: 'bi',
    password: 'bi',
    role: 'ROLE_GERENCIAL',
    roleLabel: 'Dashboard & BI Gerencial',
    branch: 'Controladoria & Auditoria',
    createdAt: '2026-02-12T09:00:00.000Z',
    status: 'active',
    score: 910,
    pontosTotais: 910,
    completedTasksCount: 31,
    level: 'Mestre da Prevenção ⭐⭐⭐',
    streakDays: 10,
    badges: [
      { id: 'b-gestor', name: 'Estrategista de Prevenção', icon: 'TrendingUp', description: 'Análise de KPI e rotinas proativas', unlockedAt: '2026-02-15' }
    ]
  },
];

const STORAGE_USERS_KEY = 'atacadao_dia_a_dia_users_v1';
const STORAGE_CURRENT_USER_KEY = 'atacadao_dia_a_dia_current_user_v1';

export function getStoredUsers(): AppUser[] {
  try {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar usuários locais:', err);
  }
  return INITIAL_MOCK_USERS;
}

export function saveUsersToStorage(users: AppUser[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn('Erro ao salvar usuários:', err);
  }
}

export function getStoredCurrentUser(): AppUser | null {
  try {
    const data = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Erro ao carregar usuário logado:', err);
  }
  return null;
}

export function saveCurrentUserToStorage(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch (err) {
    console.warn('Erro ao salvar sessão de usuário:', err);
  }
}

/**
 * Retorna as abas permitidas de acordo com a Role do usuário
 */
export function getAllowedTabsForRole(role: UserRole | undefined): AppTab[] {
  if (!role) return [];
  switch (role) {
    case 'ROLE_RONDA':
      return ['ronda'];
    case 'ROLE_CFTV':
      return ['cftv'];
    case 'ROLE_GERENCIAL':
      return ['dashboard'];
    case 'ROLE_MASTER':
      return ['ronda', 'cftv', 'dashboard', 'admin_users'];
    default:
      return [];
  }
}

/**
 * Retorna a primeira aba padrão do usuário
 */
export function getDefaultTabForRole(role: UserRole | undefined): AppTab {
  if (!role) return 'ronda';
  switch (role) {
    case 'ROLE_RONDA':
      return 'ronda';
    case 'ROLE_CFTV':
      return 'cftv';
    case 'ROLE_GERENCIAL':
      return 'dashboard';
    case 'ROLE_MASTER':
      return 'ronda';
    default:
      return 'ronda';
  }
}

export function getRoleBadgeInfo(role: UserRole): { label: string; color: string; bgColor: string; borderColor: string } {
  switch (role) {
    case 'ROLE_MASTER':
      return {
        label: 'Acesso Total (Master)',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
      };
    case 'ROLE_RONDA':
      return {
        label: 'Ronda Mobile',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
      };
    case 'ROLE_CFTV':
      return {
        label: 'Central CFTV',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
      };
    case 'ROLE_GERENCIAL':
      return {
        label: 'Gestão & BI',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
      };
  }
}
