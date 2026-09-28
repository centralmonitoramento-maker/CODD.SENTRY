/**
 * @file NavigationTabs.tsx
 * @description Barra de navegação principal com controle de acesso (RBAC), abas dinâmicas por perfil,
 * botão de Gestão de Usuários (Master) e botão de Logout.
 */

import React from 'react';
import {
  Smartphone,
  MonitorPlay,
  BarChart3,
  Shield,
  Radio,
  LogOut,
  Users,
  KeyRound,
} from 'lucide-react';
import { AppTab } from '../types';
import { useAuth } from '../context/AuthContext';
import { getRoleBadgeInfo } from '../services/authService';

interface NavigationTabsProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  rondaCount?: number;
  cftvCount?: number;
  totalRecordsCount?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  rondaCount = 0,
  cftvCount = 0,
  totalRecordsCount = 0,
}) => {
  const { currentUser, logout, canAccessTab } = useAuth();

  const allTabs = [
    {
      id: 'ronda' as AppTab,
      label: 'Ronda Mobile',
      badge: 'Campo & GPS',
      icon: Smartphone,
      description: 'Formulários rápidos e geolocalização',
      count: rondaCount,
      activeColor: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-500/25',
    },
    {
      id: 'cftv' as AppTab,
      label: 'Central CFTV',
      badge: 'Console Desktop',
      icon: MonitorPlay,
      description: 'Câmeras, gravação & evidências VMS',
      count: cftvCount,
      activeColor: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-500/25',
    },
    {
      id: 'dashboard' as AppTab,
      label: 'Dashboard Gerencial',
      badge: 'BI & Relatórios',
      icon: BarChart3,
      description: 'Gráficos por filial, perdas vs. recuperação',
      count: totalRecordsCount,
      activeColor: 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-500/25',
    },
  ];

  // Filtra as abas permitidas para o papel do usuário
  const visibleTabs = allTabs.filter((tab) => canAccessTab(tab.id));
  const isMaster = currentUser?.role === 'ROLE_MASTER';
  const roleBadge = currentUser ? getRoleBadgeInfo(currentUser.role) : null;

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-2.5 lg:py-0 gap-3">
          
          {/* Logo Oficial P&P + Identidade Dia a Dia */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Container de Proteção do Logotipo Oficial */}
              <div className="relative flex items-center justify-center p-1 bg-white rounded-2xl border-2 border-amber-400 shadow-md shadow-amber-500/10 shrink-0">
                <img
                  src="/logo-pp.jpg"
                  alt="Prevenção de Perdas - Atacadão Dia a Dia"
                  className="w-11 h-11 sm:w-13 sm:h-13 object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Textos Institucionais Refinados */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-slate-900 font-black text-sm sm:text-base tracking-tight leading-none uppercase font-['Plus_Jakarta_Sans',sans-serif]">
                    PREVENÇÃO DE PERDAS
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wider shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping shrink-0" />
                    DIA A DIA
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-blue-600 inline shrink-0" />
                  <span>Sistema Integrado de Segurança & Monitoramento</span>
                </p>
              </div>
            </div>

            {/* Mobile Actions: Perfil & Sair */}
            <div className="flex items-center gap-2 lg:hidden">
              {isMaster && (
                <button
                  type="button"
                  onClick={() => onTabChange('admin_users')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    activeTab === 'admin_users'
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-purple-50 border-purple-200 text-purple-700'
                  }`}
                  title="Gestão de Usuários"
                >
                  <Users className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={logout}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-300 transition-colors"
                title="Sair do Sistema"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Abas Centrais Permitidas (RBAC) */}
          <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap">
            <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none" aria-label="Abas Permitidas">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    id={`tab-nav-${tab.id}`}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={`group relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 lg:py-3.5 rounded-2xl lg:rounded-b-none lg:rounded-t-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? `${tab.activeColor} lg:bg-slate-900 lg:text-white lg:border-b-3 lg:border-amber-400 shadow-md`
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:text-slate-900'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="tracking-tight">{tab.label}</span>
                        {tab.count > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                            isActive
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-medium block transition-colors ${
                        isActive ? 'text-amber-100 lg:text-amber-400' : 'text-slate-400'
                      }`}>
                        {tab.badge}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Botão de Gestão de Usuários para ROLE_MASTER */}
              {isMaster && (
                <button
                  id="tab-nav-admin-users"
                  type="button"
                  onClick={() => onTabChange('admin_users')}
                  className={`group relative hidden sm:flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 lg:py-3.5 rounded-2xl lg:rounded-b-none lg:rounded-t-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'admin_users'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 lg:bg-slate-900 lg:text-purple-300 lg:border-b-3 lg:border-purple-400'
                      : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50 border border-purple-200'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-colors ${
                    activeTab === 'admin_users'
                      ? 'bg-white/20 text-white'
                      : 'bg-purple-100 text-purple-700 group-hover:text-purple-900'
                  }`}>
                    <KeyRound className="w-4 h-4" />
                  </div>
                  
                  <div className="text-left">
                    <span className="tracking-tight block">Gestão Usuários</span>
                    <span className={`text-[10px] font-medium block transition-colors ${
                      activeTab === 'admin_users' ? 'text-purple-100 lg:text-purple-300' : 'text-purple-500'
                    }`}>
                      Painel Master
                    </span>
                  </div>
                </button>
              )}
            </nav>

            {/* Painel do Usuário Logado + Botão Logout (Desktop) */}
            {currentUser && (
              <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-slate-200">
                {/* Gamificação: Pontuação do Operador */}
                {(currentUser.score !== undefined || currentUser.pontosTotais !== undefined) && (
                  <div className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-900 font-mono text-[11px] font-extrabold flex items-center gap-1 shadow-2xs">
                    <span className="text-amber-600 font-black">⭐</span>
                    <span>{currentUser.score || currentUser.pontosTotais || 0} pts</span>
                  </div>
                )}

                {/* Avatar & Identificação */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-xs text-amber-800 font-mono shadow-2xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-900 block leading-tight max-w-[130px] truncate" title={currentUser.name}>
                      {currentUser.name}
                    </span>
                    {roleBadge && (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${roleBadge.bgColor} ${roleBadge.borderColor} ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Botão Sair */}
                <button
                  id="btn-nav-logout"
                  type="button"
                  onClick={logout}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-300 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Encerrar sessão de segurança"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
