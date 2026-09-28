/**
 * @file AdminUsersView.tsx
 * @description Painel de Gestão de Usuários (CRUD) exclusivo para Administradores Master.
 * Permite adicionar usuários, editar perfis/roles, resetar senhas e desativar/excluir contas.
 */

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  Smartphone,
  MonitorPlay,
  BarChart3,
  Building,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppUser, UserRole } from '../types';
import { getRoleBadgeInfo } from '../services/authService';

interface AdminUsersViewProps {
  onBackToDashboard?: () => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({ onBackToDashboard }) => {
  const { users, currentUser, addUser, updateUser, deleteUser, resetPassword } = useAuth();

  // Estados de Filtros e Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Estados dos Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [resetPassUser, setResetPassUser] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);

  // Formulário de Criação/Edição
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('ROLE_RONDA');
  const [formBranch, setFormBranch] = useState('Filial 01 - SIA');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Formulário de Reset de Senha
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Abertura do Modal de Criação
  const handleOpenCreateModal = () => {
    setFormName('');
    setFormUsername('');
    setFormPassword('');
    setFormRole('ROLE_RONDA');
    setFormBranch('Filial 01 - SIA');
    setFormStatus('active');
    setFormError(null);
    setFormSuccess(null);
    setIsCreateModalOpen(true);
  };

  // Abertura do Modal de Edição
  const handleOpenEditModal = (user: AppUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormPassword('');
    setFormRole(user.role);
    setFormBranch(user.branch || 'Matriz');
    setFormStatus(user.status);
    setFormError(null);
    setFormSuccess(null);
  };

  // Submissão do Formulário de Criação
  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formUsername.trim() || !formPassword.trim()) {
      setFormError('Preencha todos os campos obrigatórios (Nome, Usuário e Senha).');
      return;
    }

    const roleLabels: Record<UserRole, string> = {
      ROLE_MASTER: 'Administrador Geral (Master)',
      ROLE_RONDA: 'Ronda Mobile (Campo & GPS)',
      ROLE_CFTV: 'Central de Monitoramento CFTV',
      ROLE_GERENCIAL: 'Dashboard & BI Gerencial',
    };

    const res = addUser({
      name: formName.trim(),
      username: formUsername.trim(),
      password: formPassword.trim(),
      role: formRole,
      roleLabel: roleLabels[formRole],
      branch: formBranch,
      status: formStatus,
    });

    if (!res.success) {
      setFormError(res.error || 'Erro ao criar usuário.');
      return;
    }

    setFormSuccess('Usuário cadastrado com sucesso!');
    setTimeout(() => {
      setIsCreateModalOpen(false);
      setFormSuccess(null);
    }, 1000);
  };

  // Submissão do Formulário de Edição
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError(null);

    if (!formName.trim() || !formUsername.trim()) {
      setFormError('Nome e Usuário são obrigatórios.');
      return;
    }

    const roleLabels: Record<UserRole, string> = {
      ROLE_MASTER: 'Administrador Geral (Master)',
      ROLE_RONDA: 'Ronda Mobile (Campo & GPS)',
      ROLE_CFTV: 'Central de Monitoramento CFTV',
      ROLE_GERENCIAL: 'Dashboard & BI Gerencial',
    };

    const updates: Partial<AppUser> = {
      name: formName.trim(),
      username: formUsername.trim(),
      role: formRole,
      roleLabel: roleLabels[formRole],
      branch: formBranch,
      status: formStatus,
    };

    if (formPassword.trim()) {
      updates.password = formPassword.trim();
    }

    const res = updateUser(editingUser.id, updates);
    if (!res.success) {
      setFormError(res.error || 'Erro ao atualizar usuário.');
      return;
    }

    setFormSuccess('Usuário atualizado com sucesso!');
    setTimeout(() => {
      setEditingUser(null);
      setFormSuccess(null);
    }, 1000);
  };

  // Submissão de Reset de Senha
  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUser) return;
    setResetError(null);

    const res = resetPassword(resetPassUser.id, newPasswordInput);
    if (!res.success) {
      setResetError(res.error || 'Erro ao redefinir senha.');
      return;
    }

    setResetSuccess('Senha redefinida com sucesso!');
    setTimeout(() => {
      setResetPassUser(null);
      setNewPasswordInput('');
      setResetSuccess(null);
    }, 1000);
  };

  // Confirmação de Exclusão
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    const res = deleteUser(deletingUser.id);
    if (!res.success) {
      alert(res.error);
      return;
    }
    setDeletingUser(null);
  };

  // Filtro de Usuários
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.branch && u.branch.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const countMaster = users.filter((u) => u.role === 'ROLE_MASTER').length;
  const countRonda = users.filter((u) => u.role === 'ROLE_RONDA').length;
  const countCFTV = users.filter((u) => u.role === 'ROLE_CFTV').length;
  const countGerencial = users.filter((u) => u.role === 'ROLE_GERENCIAL').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-slate-100">
      
      {/* Topo / Banner Informativo */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold font-mono tracking-wide">
              <Shield className="w-3.5 h-3.5" />
              MÓDULO EXCLUSIVO MASTER (RBAC)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-400" />
              Gestão de Usuários e Perfis de Acesso
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Administre operadores, permissões restritas por função e credenciais do Sistema de Monitoramento Integrado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                Voltar à Operação
              </button>
            )}

            <button
              id="admin-btn-add-user"
              type="button"
              onClick={handleOpenCreateModal}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              Novo Usuário
            </button>
          </div>
        </div>

        {/* 4 Cards de Métricas por Perfil */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase block font-semibold">Master (Total)</span>
              <span className="text-2xl font-black font-mono text-purple-400">{countMaster}</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase block font-semibold">Ronda Mobile</span>
              <span className="text-2xl font-black font-mono text-emerald-400">{countRonda}</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <MonitorPlay className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase block font-semibold">Central CFTV</span>
              <span className="text-2xl font-black font-mono text-cyan-400">{countCFTV}</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase block font-semibold">BI Gerencial</span>
              <span className="text-2xl font-black font-mono text-amber-400">{countGerencial}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Campo de Busca */}
        <div className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, login ou filial..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
          />
        </div>

        {/* Filtros de Role / Perfil */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'ROLE_MASTER', label: 'Master' },
            { id: 'ROLE_RONDA', label: 'Ronda' },
            { id: 'ROLE_CFTV', label: 'CFTV' },
            { id: 'ROLE_GERENCIAL', label: 'Gerencial' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setRoleFilter(f.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === f.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* Tabela de Usuários Cadastrados */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono">
              Usuários Registrados no Sistema ({filteredUsers.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Autenticação Local RBAC</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Usuário / Nome</th>
                <th className="py-3.5 px-4">Perfil / Permissão</th>
                <th className="py-3.5 px-4">Filial / Lotação</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Data Cadastro</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
              {filteredUsers.map((user) => {
                const badge = getRoleBadgeInfo(user.role);
                const isCurrent = currentUser?.id === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Nome & Login */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-purple-400 font-mono shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-sm tracking-tight">{user.name}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-bold font-mono">
                                VOCÊ
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <KeyRound className="w-3 h-3 text-slate-500" />
                            login: <b className="text-slate-300 font-bold">{user.username}</b>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Perfil / Role */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${badge.bgColor} ${badge.borderColor} ${badge.color} font-mono`}>
                        {user.role === 'ROLE_MASTER' && <KeyRound className="w-3 h-3" />}
                        {user.role === 'ROLE_RONDA' && <Smartphone className="w-3 h-3" />}
                        {user.role === 'ROLE_CFTV' && <MonitorPlay className="w-3 h-3" />}
                        {user.role === 'ROLE_GERENCIAL' && <BarChart3 className="w-3 h-3" />}
                        {badge.label}
                      </span>
                    </td>

                    {/* Filial */}
                    <td className="py-4 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        <span>{user.branch || 'Todas as Unidades'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                        user.status === 'active'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Data */}
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Reset Senha */}
                        <button
                          type="button"
                          onClick={() => {
                            setResetPassUser(user);
                            setNewPasswordInput('');
                            setResetError(null);
                            setResetSuccess(null);
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                          title="Resetar Senha"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-blue-400 transition-colors cursor-pointer"
                          title="Editar Usuário"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Excluir */}
                        <button
                          type="button"
                          onClick={() => setDeletingUser(user)}
                          disabled={isCurrent}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isCurrent ? 'Não é possível excluir seu próprio usuário' : 'Excluir Usuário'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CRIAR NOVO USUÁRIO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-scaleIn">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                Cadastrar Novo Usuário
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Defina o perfil de acesso (RBAC) e as credenciais operacionais
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Fernando Souza"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Usuário / Login</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="Ex: fsouza"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Senha Inicial</label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Perfil de Acesso (Role)</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="ROLE_RONDA">ROLE_RONDA - Exclusivo Ronda Mobile (Campo & GPS)</option>
                  <option value="ROLE_CFTV">ROLE_CFTV - Exclusivo Central CFTV (Mesa & Despacho)</option>
                  <option value="ROLE_GERENCIAL">ROLE_GERENCIAL - Exclusivo Dashboard Gerencial & BI</option>
                  <option value="ROLE_MASTER">ROLE_MASTER - Acesso Total a Todos os Módulos + Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Filial / Lotação</label>
                  <input
                    type="text"
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    placeholder="Ex: Filial 01 - SIA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="active">Ativo (Permitir Login)</option>
                    <option value="inactive">Inativo (Bloquear Login)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR USUÁRIO */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-scaleIn">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                Editar Usuário: {editingUser.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Altere permissões de perfil, filial ou informações cadastrais
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Usuário / Login</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nova Senha (Opcional)</label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Manter a atual"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Perfil de Acesso (Role)</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ROLE_RONDA">ROLE_RONDA - Exclusivo Ronda Mobile (Campo & GPS)</option>
                  <option value="ROLE_CFTV">ROLE_CFTV - Exclusivo Central CFTV (Mesa & Despacho)</option>
                  <option value="ROLE_GERENCIAL">ROLE_GERENCIAL - Exclusivo Dashboard Gerencial & BI</option>
                  <option value="ROLE_MASTER">ROLE_MASTER - Acesso Total a Todos os Módulos + Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Filial / Lotação</label>
                  <input
                    type="text"
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">Ativo (Permitir Login)</option>
                    <option value="inactive">Inativo (Bloquear Login)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESETAR SENHA */}
      {resetPassUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-scaleIn">
            <button
              type="button"
              onClick={() => setResetPassUser(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-400" />
                Redefinir Senha
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Redefinindo senha para o usuário: <b className="text-white">{resetPassUser.name}</b> ({resetPassUser.username})
              </p>
            </div>

            {resetError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveResetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nova Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Mínimo 3 caracteres"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetPassUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 cursor-pointer"
                >
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRMAÇÃO DE EXCLUSÃO */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-scaleIn text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Excluir Usuário?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Tem certeza de que deseja remover a conta de <b className="text-white">{deletingUser.name}</b> ({deletingUser.username})? Esta ação removerá o acesso imediatamente.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
