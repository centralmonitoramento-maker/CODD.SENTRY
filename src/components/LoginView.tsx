/**
 * @file LoginView.tsx
 * @description Tela de Login corporativa com design dark mode moderno, controle de acesso e atalhos rápidos para teste de perfis.
 */

import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Smartphone,
  MonitorPlay,
  BarChart3,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciais inválidas.');
        setIsLoading(false);
      }
    }, 250);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(u, p);
      if (!res.success) {
        setErrorMessage(res.error || 'Erro ao autenticar perfil.');
        setIsLoading(false);
      }
    }, 200);
  };

  const quickProfiles = [
    {
      role: 'ROLE_MASTER' as UserRole,
      title: 'Master / Admin',
      user: 'master',
      pass: 'master',
      icon: KeyRound,
      color: 'from-purple-600 to-indigo-600',
      border: 'border-purple-500/40 hover:border-purple-400',
      bgBadge: 'bg-purple-500/20 text-purple-300',
      desc: 'Acesso total + Gestão de Usuários',
    },
    {
      role: 'ROLE_RONDA' as UserRole,
      title: 'Ronda Mobile',
      user: 'ronda',
      pass: 'ronda',
      icon: Smartphone,
      color: 'from-emerald-600 to-teal-600',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      bgBadge: 'bg-emerald-500/20 text-emerald-300',
      desc: 'Acesso exclusivo: Formulários & GPS',
    },
    {
      role: 'ROLE_CFTV' as UserRole,
      title: 'Central CFTV',
      user: 'cftv',
      pass: 'cftv',
      icon: MonitorPlay,
      color: 'from-cyan-600 to-blue-600',
      border: 'border-cyan-500/40 hover:border-cyan-400',
      bgBadge: 'bg-cyan-500/20 text-cyan-300',
      desc: 'Acesso exclusivo: Mesa de Câmeras & Despacho',
    },
    {
      role: 'ROLE_GERENCIAL' as UserRole,
      title: 'BI Gerencial',
      user: 'bi',
      pass: 'bi',
      icon: BarChart3,
      color: 'from-amber-600 to-orange-600',
      border: 'border-amber-500/40 hover:border-amber-400',
      bgBadge: 'bg-amber-500/20 text-amber-300',
      desc: 'Acesso exclusivo: Relatórios & Video Wall',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F4F7FB] text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Decorativo com Grid Sutil e Gradientes */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho Minimalista da Tela de Login */}
      <header className="relative z-10 w-full py-3.5 px-6 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center p-1 bg-white rounded-2xl border-2 border-amber-400 shadow-md shadow-amber-500/10 shrink-0">
              <img
                src="/logo-pp.jpg"
                alt="Prevenção de Perdas - Atacadão Dia a Dia"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-black text-sm sm:text-base tracking-tight leading-none block">
                  PREVENÇÃO DE PERDAS
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black tracking-wider">
                  DIA A DIA
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                Central Integrada de Segurança & Monitoramento
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">PORTAL SEGURO • RBAC V2.0</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal / Card Central */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Coluna Esquerda: Informações e Perfis Rápidos */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-mono tracking-wide mb-3 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                ACESSO CONTROLADO POR PERFIL
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Controle & Inteligência Operacional
              </h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed font-medium">
                Autentique-se com suas credenciais corporativas para acessar a mesa operacional correspondente ao seu papel.
              </p>
            </div>

            {/* Seletor Rápido de Perfis para Teste */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                  Perfis de Demonstração (Clique para testar):
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Auto-preenchimento</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickProfiles.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleQuickLogin(p.user, p.pass)}
                      className={`p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md group cursor-pointer`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-md`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${p.bgBadge}`}>
                          {p.user}/{p.pass}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                        {p.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Informações de Compliance */}
            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200 flex items-center gap-3 text-xs text-slate-600 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sessões monitoradas e registradas com rastreabilidade por protocolo de ocorrência.</span>
            </div>
          </div>

          {/* Coluna Direita: Formulário de Login */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 p-1 flex items-center justify-center shrink-0">
                  <img
                    src="/logo-pp.jpg"
                    alt="Logo P&P"
                    className="w-10 h-10 object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Identificação do Usuário
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Insira suas credenciais de operador ou gestor
                  </p>
                </div>
              </div>

              {/* Mensagem de Erro */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo Usuário */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    USUÁRIO / LOGIN
                  </label>
                  <div className="relative">
                    <input
                      id="login-username-input"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ex: master, ronda, cftv, bi"
                      required
                      autoComplete="username"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      SENHA DE ACESSO
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Case-sensitive</span>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                      title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Botão de Entrar */}
                <div className="pt-2">
                  <button
                    id="login-submit-button"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-extrabold text-sm tracking-wide shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Autenticando sessão...</span>
                      </>
                    ) : (
                      <>
                        <span>Acessar Sistema</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 font-mono">
                  Atacadão Dia a Dia • Prevenção de Perdas & Segurança Corporativa
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Rodapé Corporativo */}
      <footer className="relative z-10 py-3.5 px-6 border-t border-slate-200/80 bg-white/90 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Atacadão Dia a Dia • Departamento de Prevenção de Perdas</span>
          <span className="font-mono text-[11px] text-slate-400">
            Segurança da Informação • Padrão ISO/IEC 27001
          </span>
        </div>
      </footer>
    </div>
  );
};
