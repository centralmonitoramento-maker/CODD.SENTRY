/**
 * @file AuthContext.tsx
 * @description Contexto de Autenticação e Controle de Acesso Baseado em Perfis (RBAC).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, AuthContextType, AppTab, UserRole } from '../types';
import {
  getStoredUsers,
  saveUsersToStorage,
  getStoredCurrentUser,
  saveCurrentUserToStorage,
  getAllowedTabsForRole,
} from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AppUser[]>(() => getStoredUsers());
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getStoredCurrentUser());

  // Salva usuários no localStorage sempre que a lista for modificada
  useEffect(() => {
    saveUsersToStorage(users);
  }, [users]);

  // Salva o usuário autenticado na sessão
  useEffect(() => {
    saveCurrentUserToStorage(currentUser);
  }, [currentUser]);

  const login = (username: string, password: string): { success: boolean; error?: string } => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, error: 'Informe usuário e senha para continuar.' };
    }

    const foundUser = users.find(
      (u) => u.username.toLowerCase() === trimmedUser && u.password === trimmedPass
    );

    if (!foundUser) {
      return { success: false, error: 'Usuário ou senha inválidos. Verifique as credenciais.' };
    }

    if (foundUser.status === 'inactive') {
      return { success: false, error: 'Este usuário está inativado no sistema. Contate o Administrador.' };
    }

    // Registra último login
    const updatedUser = {
      ...foundUser,
      lastLogin: new Date().toISOString(),
    };

    setUsers((prev) => prev.map((u) => (u.id === foundUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (userData: Omit<AppUser, 'id' | 'createdAt'>): { success: boolean; error?: string } => {
    const existing = users.find(
      (u) => u.username.toLowerCase() === userData.username.trim().toLowerCase()
    );

    if (existing) {
      return { success: false, error: `O nome de usuário "${userData.username}" já está em uso.` };
    }

    const newUser: AppUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      username: userData.username.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    return { success: true };
  };

  const updateUser = (id: string, updates: Partial<AppUser>): { success: boolean; error?: string } => {
    if (updates.username) {
      const usernameLower = updates.username.trim().toLowerCase();
      const duplicate = users.find((u) => u.id !== id && u.username.toLowerCase() === usernameLower);
      if (duplicate) {
        return { success: false, error: `O nome de usuário "${updates.username}" já está em uso.` };
      }
      updates.username = usernameLower;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          // Se for o usuário atual logado, atualiza seu state também
          if (currentUser && currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    return { success: true };
  };

  const deleteUser = (id: string): { success: boolean; error?: string } => {
    if (currentUser && currentUser.id === id) {
      return { success: false, error: 'Você não pode excluir o seu próprio usuário logado.' };
    }

    // Não permitir deletar o último master
    const targetUser = users.find((u) => u.id === id);
    if (targetUser?.role === 'ROLE_MASTER') {
      const masterCount = users.filter((u) => u.role === 'ROLE_MASTER' && u.id !== id).length;
      if (masterCount === 0) {
        return { success: false, error: 'O sistema deve manter ao menos um usuário com perfil Master.' };
      }
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
    return { success: true };
  };

  const resetPassword = (id: string, newPass: string): { success: boolean; error?: string } => {
    if (!newPass || newPass.trim().length < 3) {
      return { success: false, error: 'A nova senha deve ter no mínimo 3 caracteres.' };
    }

    return updateUser(id, { password: newPass.trim() });
  };

  const addPointsToUser = (userId: string, points: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const currentScore = u.score || u.pontosTotais || 0;
          const newScore = currentScore + points;
          const newCompletedCount = (u.completedTasksCount || 0) + 1;
          
          let level = u.level || 'Operador Bronze 🥉';
          if (newScore >= 1200) {
            level = 'Mestre da Prevenção ⭐⭐⭐';
          } else if (newScore >= 800) {
            level = 'Operador Elite 💎';
          } else if (newScore >= 500) {
            level = 'Operador Ouro 🥇';
          } else if (newScore >= 250) {
            level = 'Operador Prata 🥈';
          }

          const updated = {
            ...u,
            score: newScore,
            pontosTotais: newScore,
            completedTasksCount: newCompletedCount,
            level,
          };

          if (currentUser && currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const allowedTabs: AppTab[] = getAllowedTabsForRole(currentUser?.role);

  const canAccessTab = (tab: AppTab): boolean => {
    if (!currentUser) return false;
    return allowedTabs.includes(tab);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        users,
        addUser,
        updateUser,
        deleteUser,
        resetPassword,
        addPointsToUser,
        allowedTabs,
        canAccessTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
