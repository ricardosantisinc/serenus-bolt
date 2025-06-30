import React, { useState } from 'react';
import { Users, TrendingUp, AlertTriangle, Calendar, BarChart3, Settings, UserPlus, UserCog } from 'lucide-react';
import { User, AdminStats, CompanyCheckupSettings } from '../types';
import { RegisterUserForm } from './RegisterUserForm';
import { CompanyCheckupSettingsComponent } from './CompanyCheckupSettings';
import { UserManagement } from './UserManagement';
import { useUserManagement } from '../hooks/useUserManagement';

interface AdminDashboardProps {
  user: User;
  hasPermission: (permission: string) => boolean;
  onRegisterUser: (userData: {
    name: string;
    email: string;
    password: string;
    role: User['role'];
    department?: string;
    companyId: string;
  }) => Promise<{ success: boolean; message: string; user?: User }>;
  getCompanyCheckupSettings: (companyId: string) => Promise<CompanyCheckupSettings | null>;
  onSaveCompanyCheckupSettings: (settings: Omit<CompanyCheckupSettings, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; message: string }>;
  createUser: (userData: any) => Promise<any>;
  updateUser: (userId: string, userData: any) => Promise<any>;
  toggleUserStatus: (userId: string) => Promise<any>;
  deleteUser: (userId: string) => Promise<any>;
  getAllUsers: () => User[];
}

const mockAdminStats: AdminStats = {
  totalEmployees: 247,
  activeEmployees: 231,
  averageMentalHealthScore: 72,
  checkupsThisMonth: 89,
  departmentStats: [
    { name: 'TI', employeeCount: 45, averageScore: 68, color: '#3B82F6' },
    { name: 'Vendas', employeeCount: 62, averageScore: 75, color: '#10B981' },
    { name: 'Marketing', employeeCount: 38, averageScore: 71, color: '#F59E0B' },
    { name: 'RH', employeeCount: 28, averageScore: 78, color: '#8B5CF6' },
    { name: 'Financeiro', employeeCount: 34, averageScore: 69, color: '#EF4444' }
  ]
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, 
  hasPermission, 
  onRegisterUser,
  getCompanyCheckupSettings,
  onSaveCompanyCheckupSettings,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAllUsers
}) => {
  const [showRegisterUserForm, setShowRegisterUserForm] = useState(false);
  const [showCheckupSettings, setShowCheckupSettings] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [checkupSettings, setCheckupSettings] = useState<CompanyCheckupSettings | null>(null);

  // User management hook
  const userManagement = useUserManagement({
    currentUser: user
  });

  const handleOpenCheckupSettings = async () => {
    if (user.companyId) {
      const settings = await getCompanyCheckupSettings(user.companyId);
      setCheckupSettings(settings);
      setShowCheckupSettings(true);
    }
  };

  // Filter users for current company
  const companyUsers = getAllUsers().filter(u => u.companyId === user.companyId);

  // Company data for user management
  const companies = user.companyId ? [{ id: user.companyId, name: 'Minha Empresa' }] : [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Painel Administrativo
        </h1>
        <p className="text-gray-600">Visão geral da saúde mental organizacional</p>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Total de Funcionários</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{mockAdminStats.totalEmployees}</span>
            <span className="text-sm text-green-600 font-medium">+12 este mês</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{mockAdminStats.activeEmployees} ativos</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Score Médio</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{mockAdminStats.averageMentalHealthScore}%</span>
            <span className="text-sm text-green-600 font-medium">+5%</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Saúde mental geral</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Checkups</h3>
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{mockAdminStats.checkupsThisMonth}</span>
            <span className="text-sm text-green-600 font-medium">+23%</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Este mês</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Alertas</h3>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-red-600">8</span>
            <span className="text-sm text-red-600 font-medium">Críticos</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Requerem atenção</p>
        </div>
      </div>

      {/* Department Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Estatísticas por Departamento</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {mockAdminStats.departmentStats.map((dept) => (
            <div key={dept.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: dept.color }}
                />
                <div>
                  <h4 className="font-medium text-gray-900">{dept.name}</h4>
                  <p className="text-sm text-gray-600">{dept.employeeCount} funcionários</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{dept.averageScore}%</p>
                <p className="text-sm text-gray-600">Score médio</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={() => setShowRegisterUserForm(true)}
          className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors text-left"
        >
          <UserPlus className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Registrar Novo Usuário</h3>
          <p className="text-blue-100 text-sm">Adicionar novos colaboradores ao sistema</p>
        </button>

        <button 
          onClick={() => setShowUserManagement(true)}
          className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors text-left"
        >
          <UserCog className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Gerenciar Usuários</h3>
          <p className="text-green-100 text-sm">Editar, ativar/desativar e excluir usuários</p>
        </button>

        <button 
          onClick={handleOpenCheckupSettings}
          className="bg-teal-600 text-white p-6 rounded-xl hover:bg-teal-700 transition-colors text-left"
        >
          <Settings className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Configurações de Checkup</h3>
          <p className="text-teal-100 text-sm">Definir periodicidade dos testes de bem-estar</p>
        </button>

        <button className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition-colors text-left">
          <BarChart3 className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Relatórios Avançados</h3>
          <p className="text-purple-100 text-sm">Gerar relatórios detalhados e análises</p>
        </button>
      </div>

      {/* Register User Form Modal */}
      {showRegisterUserForm && user.companyId && (
        <RegisterUserForm
          onRegisterUser={onRegisterUser}
          companyId={user.companyId}
          onClose={() => setShowRegisterUserForm(false)}
        />
      )}

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

      {/* Checkup Settings Modal */}
      {showCheckupSettings && user.companyId && (
        <CompanyCheckupSettingsComponent
          companyId={user.companyId}
          settings={checkupSettings || undefined}
          onSave={onSaveCompanyCheckupSettings}
          onClose={() => setShowCheckupSettings(false)}
        />
      )}
    </div>
  );
};