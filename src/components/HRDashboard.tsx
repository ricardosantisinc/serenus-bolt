import React, { useState } from 'react';
import { Users, Heart, AlertCircle, TrendingUp, UserPlus, UserCog } from 'lucide-react';
import { User } from '../types';
import { UserManagement } from './UserManagement';
import { useUserManagement } from '../hooks/useUserManagement';

interface HRDashboardProps {
  user: User;
  hasPermission: (permission: string) => boolean;
  createUser: (userData: any) => Promise<any>;
  updateUser: (userId: string, userData: any) => Promise<any>;
  toggleUserStatus: (userId: string) => Promise<any>;
  deleteUser: (userId: string) => Promise<any>;
  getAllUsers: () => User[];
}

export const HRDashboard: React.FC<HRDashboardProps> = ({ 
  user, 
  hasPermission, 
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAllUsers
}) => {
  const [showUserManagement, setShowUserManagement] = useState(false);

  // User management hook
  const userManagement = useUserManagement({
    currentUser: user
  });

  // Filter users for current company
  const companyUsers = getAllUsers().filter(u => u.companyId === user.companyId);

  // Company data for user management
  const companies = user.companyId ? [{ id: user.companyId, name: 'Minha Empresa' }] : [];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Painel de Recursos Humanos
        </h1>
        <p className="text-gray-600">Gestão do bem-estar organizacional</p>
      </div>

      {/* HR Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Funcionários</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-3xl font-bold text-gray-900">247</span>
          <p className="text-sm text-gray-600 mt-2">Total ativo</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Bem-estar</h3>
            <Heart className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">72%</span>
            <span className="text-sm text-green-600 font-medium">+5%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Solicitações</h3>
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-3xl font-bold text-orange-600">15</span>
          <p className="text-sm text-gray-600 mt-2">Pendentes</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Engajamento</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">85%</span>
            <span className="text-sm text-green-600 font-medium">+8%</span>
          </div>
        </div>
      </div>

      {/* Support Requests */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Solicitações de Suporte</h3>
        <div className="space-y-4">
          {[
            { employee: 'Carlos Silva', department: 'TI', issue: 'Estresse no trabalho', priority: 'high', time: '2h' },
            { employee: 'Ana Santos', department: 'Vendas', issue: 'Conflito com colega', priority: 'medium', time: '4h' },
            { employee: 'Roberto Lima', department: 'Marketing', issue: 'Sobrecarga de trabalho', priority: 'high', time: '1d' }
          ].map((request, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">{request.employee}</h4>
                  <p className="text-sm text-gray-600">{request.department} • {request.issue}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.priority === 'high' ? 'Alta' : 'Média'}
                </span>
                <span className="text-sm text-gray-500">{request.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setShowUserManagement(true)}
          className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors text-left"
        >
          <UserCog className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Gerenciar Usuários</h3>
          <p className="text-blue-100 text-sm">Criar, editar e gerenciar colaboradores</p>
        </button>

        <button className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors text-left">
          <Heart className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Suporte ao Bem-estar</h3>
          <p className="text-green-100 text-sm">Atender solicitações de apoio psicológico</p>
        </button>

        <button className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition-colors text-left">
          <TrendingUp className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Relatórios de RH</h3>
          <p className="text-purple-100 text-sm">Análises de clima organizacional</p>
        </button>
      </div>

      {/* User Management Modal */}
      {showUserManagement && (
        <UserManagement
          users={companyUsers}
          currentUser={user}
          companies={companies}
          onCreateUser={createUser}
          onUpdateUser={updateUser}
          onToggleUserStatus={toggleUserStatus}
          onDeleteUser={deleteUser}
          onClose={() => setShowUserManagement(false)}
        />
      )}
    </div>
  );
};