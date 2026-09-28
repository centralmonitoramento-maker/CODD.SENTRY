/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file App.tsx
 * @description Sistema Integrado de Monitoramento, Prevenção de Perdas e Segurança.
 * Com controle de acesso RBAC, tela de login inicial e isolamento estrito de permissões:
 * 1. 'ROLE_RONDA' -> Acesso exclusivo a 'Ronda Mobile'
 * 2. 'ROLE_CFTV' -> Acesso exclusivo a 'Central CFTV'
 * 3. 'ROLE_GERENCIAL' -> Acesso exclusivo a 'Dashboard Gerencial'
 * 4. 'ROLE_MASTER' -> Acesso total (Ronda, CFTV, Dashboard) + Painel 'Gestão de Usuários'
 */

import React, { useState, useEffect } from 'react';
import { AppTab, UnifiedEventRecord } from './types';
import { NavigationTabs } from './components/NavigationTabs';
import { RondaMobileView } from './components/RondaMobileView';
import { CentralCFTVView } from './components/CentralCFTVView';
import { DashboardGerencialView } from './components/DashboardGerencialView';
import { AdminUsersView } from './components/AdminUsersView';
import { LoginView } from './components/LoginView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { INITIAL_HISTORICAL_EVENTS } from './services/dashboardData';
import { getDefaultTabForRole } from './services/authService';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, currentUser, canAccessTab } = useAuth();

  // Aba ativa inicial (sincronizada com o perfil do usuário)
  const [activeTab, setActiveTab] = useState<AppTab>('ronda');

  // Base unificada de ocorrências (histórico fictício + novos registros em tempo real)
  const [records, setRecords] = useState<UnifiedEventRecord[]>(INITIAL_HISTORICAL_EVENTS);

  // Sincroniza a aba ativa quando o usuário faz login ou altera de perfil
  useEffect(() => {
    if (currentUser) {
      const defaultTab = getDefaultTabForRole(currentUser.role);
      setActiveTab(defaultTab);
    }
  }, [currentUser?.id, currentUser?.role]);

  // Se o usuário tentar acessar uma aba não permitida, redireciona para a permitida
  useEffect(() => {
    if (currentUser && !canAccessTab(activeTab)) {
      const fallbackTab = getDefaultTabForRole(currentUser.role);
      setActiveTab(fallbackTab);
    }
  }, [activeTab, currentUser, canAccessTab]);

  // 1. Se não estiver autenticado, bloqueia o app inteiro e exibe a Tela de Login
  if (!isAuthenticated || !currentUser) {
    return <LoginView />;
  }

  // Inserção de novo registro
  const handleAddNewRecord = (newRecord: UnifiedEventRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
  };

  // Atualização de registro existente (ex: Assumido ou Tratado na Central CFTV)
  const handleUpdateRecord = (updatedRecord: UnifiedEventRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
  };

  const rondaCount = records.filter((r) => r.source === 'RONDA_MOBILE').length;
  const cftvCount = records.filter((r) => r.source === 'CENTRAL_CFTV').length;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. BARRA DE NAVEGAÇÃO PRINCIPAL (Menu / Tabs com RBAC e Logout) */}
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        rondaCount={rondaCount}
        cftvCount={cftvCount}
        totalRecordsCount={records.length}
      />

      {/* 2. ÁREA DE CONTEÚDO DINÂMICO CONFORME PERFIL DO USUÁRIO */}
      <main className="flex-1 flex flex-col">
        {/* Área 1: Ronda Mobile (ROLE_RONDA ou ROLE_MASTER) */}
        {activeTab === 'ronda' && canAccessTab('ronda') && (
          <div className="flex-1 w-full animate-fadeIn">
            <RondaMobileView onEventSubmitted={handleAddNewRecord} />
          </div>
        )}

        {/* Área 2: Central CFTV (ROLE_CFTV ou ROLE_MASTER) */}
        {activeTab === 'cftv' && canAccessTab('cftv') && (
          <div className="flex-1 w-full animate-fadeIn">
            <CentralCFTVView 
              records={records}
              onEventSubmitted={handleAddNewRecord}
              onUpdateRecord={handleUpdateRecord}
            />
          </div>
        )}

        {/* Área 3: Dashboard Gerencial (ROLE_GERENCIAL ou ROLE_MASTER) */}
        {activeTab === 'dashboard' && canAccessTab('dashboard') && (
          <div className="flex-1 w-full animate-fadeIn">
            <DashboardGerencialView records={records} />
          </div>
        )}

        {/* Área 4: Painel Administrativo de Gestão de Usuários (Exclusivo ROLE_MASTER) */}
        {activeTab === 'admin_users' && canAccessTab('admin_users') && (
          <div className="flex-1 w-full animate-fadeIn">
            <AdminUsersView onBackToDashboard={() => setActiveTab('dashboard')} />
          </div>
        )}

        {/* Fallback de Segurança caso tente acessar rota não autorizada */}
        {!canAccessTab(activeTab) && (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white">Acesso Não Autorizado</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seu perfil de usuário ({currentUser.role}) não possui permissão para acessar este módulo.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab(getDefaultTabForRole(currentUser.role))}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retornar ao Meu Módulo
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé Corporativo Discreto */}
      <footer className="border-t border-slate-800/80 bg-[#070A11] py-4 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Atacadão Dia a Dia • Central Integrada de Prevenção de Perdas & Segurança</span>
          <span className="font-mono text-[11px] text-slate-400">
            Sessão Ativa: <b className="text-slate-300 font-semibold">{currentUser.name}</b> ({currentUser.role})
          </span>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
