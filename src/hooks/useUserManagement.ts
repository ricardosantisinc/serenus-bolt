/**
 * Hook para gerenciamento de usuários
 * 
 * Fornece funcionalidades para:
 * - Criação de usuários
 * - Edição de usuários existentes
 * - Ativação/desativação de usuários
 * - Exclusão de usuários
 * - Listagem com filtros
 * 
 * @author Serenus Platform
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { User } from '../types';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: User['role'];
  department?: string;
  companyId?: string;
}

interface UpdateUserData {
  name: string;
  email: string;
  role: User['role'];
  department?: string;
  companyId?: string;
  password?: string;
}

interface UseUserManagementOptions {
  currentUser: User;
  onUserCreated?: (user: User) => void;
  onUserUpdated?: (user: User) => void;
  onUserDeleted?: (userId: string) => void;
  onError?: (error: string) => void;
}

interface UseUserManagementReturn {
  isLoading: boolean;
  createUser: (userData: CreateUserData) => Promise<{ success: boolean; message: string; user?: User }>;
  updateUser: (userId: string, userData: UpdateUserData) => Promise<{ success: boolean; message: string; user?: User }>;
  toggleUserStatus: (userId: string) => Promise<{ success: boolean; message: string; user?: User }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  searchUsers: (query: string, users: User[]) => User[];
  filterUsers: (filters: UserFilters, users: User[]) => User[];
}

interface UserFilters {
  role?: User['role'] | 'all';
  status?: 'active' | 'inactive' | 'all';
  companyId?: string | 'all';
  department?: string;
}

export const useUserManagement = (options: UseUserManagementOptions): UseUserManagementReturn => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Cria um novo usuário
   */
  const createUser = useCallback(async (userData: CreateUserData): Promise<{ success: boolean; message: string; user?: User }> => {
    setIsLoading(true);

    try {
      // Simulação do tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validações
      if (!userData.name.trim()) {
        return { success: false, message: 'Nome é obrigatório' };
      }

      if (!userData.email.trim()) {
        return { success: false, message: 'Email é obrigatório' };
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        return { success: false, message: 'Email deve ter formato válido' };
      }

      if (!userData.password || userData.password.length < 6) {
        return { success: false, message: 'Senha deve ter pelo menos 6 caracteres' };
      }

      // Verificar se o usuário atual pode criar super_admin
      if (userData.role === 'super_admin' && options.currentUser.role !== 'super_admin') {
        return { success: false, message: 'Apenas Super Administradores podem criar outros Super Administradores' };
      }

      // Verificar se o usuário é super_admin mas não tem companyId
      if (userData.role !== 'super_admin' && !userData.companyId) {
        return { success: false, message: 'Empresa é obrigatória para usuários que não são Super Admin' };
      }

      // Usar a função de callback para criar o usuário
      try {
        const newUser: User = {
          id: `user_${Date.now()}`,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          companyId: userData.role === 'super_admin' ? undefined : userData.companyId,
          department: userData.role === 'super_admin' ? undefined : userData.department,
          avatar: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400',
          isActive: true,
          permissions: [],
          createdAt: new Date()
        };

        // Callback para o componente pai
        if (options.onUserCreated) {
          options.onUserCreated(newUser);
        }

        return {
          success: true,
          message: 'Usuário criado com sucesso!',
          user: newUser
        };
      } catch (error) {
        if (options.onError) {
          options.onError('Erro ao criar usuário');
        }
        return {
          success: false,
          message: 'Erro ao criar usuário. Tente novamente.'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro interno';
      
      if (options.onError) {
        options.onError(errorMessage);
      }

      return {
        success: false,
        message: 'Erro ao criar usuário. Tente novamente.'
      };
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Atualiza um usuário existente
   */
  const updateUser = useCallback(async (userId: string, userData: UpdateUserData): Promise<{ success: boolean; message: string; user?: User }> => {
    setIsLoading(true);

    try {
      // Simular tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 800));

      // Validações
      if (!userData.name.trim()) {
        return { success: false, message: 'Nome é obrigatório' };
      }

      if (!userData.email.trim()) {
        return { success: false, message: 'Email é obrigatório' };
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        return { success: false, message: 'Email deve ter formato válido' };
      }

      // Verificar se o usuário atual pode editar para super_admin
      if (userData.role === 'super_admin' && options.currentUser.role !== 'super_admin') {
        return { success: false, message: 'Apenas Super Administradores podem gerenciar outros Super Administradores' };
      }

      // Validar senha se fornecida
      if (userData.password && userData.password.length < 6) {
        return { success: false, message: 'Senha deve ter pelo menos 6 caracteres' };
      }

      try {
        const updatedUser: User = {
          id: userId,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          companyId: userData.role === 'super_admin' ? undefined : userData.companyId,
          department: userData.role === 'super_admin' ? undefined : userData.department,
          avatar: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400',
          isActive: true,
          permissions: [],
          updatedAt: new Date()
        };

        // Callback para o componente pai
        if (options.onUserUpdated) {
          options.onUserUpdated(updatedUser);
        }

        return {
          success: true,
          message: 'Usuário atualizado com sucesso!',
          user: updatedUser
        };
      } catch (error) {
        if (options.onError) {
          options.onError('Erro ao atualizar usuário');
        }
        return {
          success: false,
          message: 'Erro ao atualizar usuário. Tente novamente.'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro interno';
      
      if (options.onError) {
        options.onError(errorMessage);
      }

      return {
        success: false,
        message: 'Erro ao atualizar usuário. Tente novamente.'
      };
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Alterna o status ativo/inativo de um usuário
   */
  const toggleUserStatus = useCallback(async (userId: string): Promise<{ success: boolean; message: string; user?: User }> => {
    setIsLoading(true);

    try {
      // Simular tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar se o usuário atual pode gerenciar um super_admin
      if (options.currentUser.role !== 'super_admin') {
        const targetUser = await options.onUserUpdated?.({ id: userId } as User);
        if (targetUser && (targetUser as User).role === 'super_admin') {
          return { 
            success: false, 
            message: 'Você não tem permissão para modificar um Super Administrador' 
          };
        }
      }

      // Não permitir desativar o próprio usuário
      if (userId === options.currentUser.id) {
        return { 
          success: false, 
          message: 'Você não pode alterar seu próprio status' 
        };
      }

      try {
        // Callback para o componente pai
        if (options.onUserUpdated) {
          const user = { id: userId } as User;
          options.onUserUpdated(user);
        }

        return {
          success: true,
          message: 'Status do usuário alterado com sucesso!'
        };
      } catch (error) {
        if (options.onError) {
          options.onError('Erro ao alterar status do usuário');
        }
        return {
          success: false,
          message: 'Erro ao alterar status do usuário. Tente novamente.'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status do usuário:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro interno';
      
      if (options.onError) {
        options.onError(errorMessage);
      }

      return {
        success: false,
        message: 'Erro ao alterar status do usuário.'
      };
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Exclui um usuário
   */
  const deleteUser = useCallback(async (userId: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);

    try {
      // Simular tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 800));

      // Não permitir excluir o próprio usuário
      if (userId === options.currentUser.id) {
        return { 
          success: false, 
          message: 'Você não pode excluir sua própria conta' 
        };
      }

      try {
        // Callback para o componente pai
        if (options.onUserDeleted) {
          options.onUserDeleted(userId);
        }

        return {
          success: true,
          message: 'Usuário excluído com sucesso!'
        };
      } catch (error) {
        if (options.onError) {
          options.onError('Erro ao excluir usuário');
        }
        return {
          success: false,
          message: 'Erro ao excluir usuário. Tente novamente.'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro interno';
      
      if (options.onError) {
        options.onError(errorMessage);
      }

      return {
        success: false,
        message: 'Erro ao excluir usuário. Tente novamente.'
      };
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Busca usuários por texto
   */
  const searchUsers = useCallback((query: string, users: User[]): User[] => {
    if (!query.trim()) return users;

    const searchTerm = query.toLowerCase().trim();
    
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.department?.toLowerCase() || '').includes(searchTerm)
    );
  }, []);

  /**
   * Filtra usuários por critérios
   */
  const filterUsers = useCallback((filters: UserFilters, users: User[]): User[] => {
    return users.filter(user => {
      // Filtro por role
      if (filters.role && filters.role !== 'all' && user.role !== filters.role) {
        return false;
      }

      // Filtro por status
      if (filters.status && filters.status !== 'all') {
        const isActive = filters.status === 'active';
        if (user.isActive !== isActive) {
          return false;
        }
      }

      // Filtro por empresa
      if (filters.companyId && filters.companyId !== 'all') {
        // Super Admins não têm empresa, então não devem aparecer quando filtramos por empresa
        if (user.role === 'super_admin') {
          return false;
        }
        if (user.companyId !== filters.companyId) {
          return false;
        }
      }

      // Filtro por departamento
      if (filters.department && filters.department.trim()) {
        const department = user.department?.toLowerCase() || '';
        const filterDept = filters.department.toLowerCase().trim();
        if (!department.includes(filterDept)) {
          return false;
        }
      }

      return true;
    });
  }, []);

  return {
    isLoading,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    searchUsers,
    filterUsers
  };
};