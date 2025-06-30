import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertTriangle, Calendar, BarChart3, Settings, UserPlus, UserCog, MessageSquare, BookOpen } from 'lucide-react';
import { User, AdminStats, CompanyCheckupSettings, CompanyRecommendation } from '../types';
import { RegisterUserForm } from './RegisterUserForm';
import { CompanyCheckupSettingsComponent } from './CompanyCheckupSettings';
import { UserManagement } from './UserManagement';
import { useUserManagement } from '../hooks/useUserManagement';
import { CompanyRecommendationsEditor } from './CompanyRecommendationsEditor';

interface ManagerDashboardProps {
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
  getCompanyRecommendations: (companyId: string) => Promise<CompanyRecommendation[]>;
  onSaveCompanyRecommendation: (recommendation: Omit<CompanyRecommendation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<{ success: boolean; message: string; recommendation?: CompanyRecommendation }>;
  onDeleteCompanyRecommendation: (id: string, companyId: string) => Promise<{ success: boolean; message: string }>;
  createUser: (userData: any) => Promise<any>;
  updateUser: (userId: string, userData: any) => Promise<any>;
  toggleUserStatus: (userId: string) => Promise<any>;
  deleteUser: (userId: string) => Promise<any>;
  getAllUsers: () => User[];
}

const mockTeamData = {
  teamSize: 12,
  averageScore: 74,
  checkupsCompleted: 8,
  needsAttention: 2
};

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ 
  user, 
  hasPermission, 
  onRegisterUser,
  getCompanyCheckupSettings,
  onSaveCompanyCheckupSettings,
  getCompanyRecommendations,
  onSaveCompanyRecommendation,
  onDeleteCompanyRecommendation,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAllUsers
}) => {
  const [showRegisterUserForm, setShowRegisterUserForm] = useState(false);
  const [showCheckupSettings, setShowCheckupSettings] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showRecommendationsEditor, setShowRecommendationsEditor] = useState(false);
  const [checkupSettings, setCheckupSettings] = useState<CompanyCheckupSettings | null>(null);
  const [recommendations, setRecommendations] = useState<CompanyRecommendation[]>([]);

  // User management hook
  const userManagement = useUserManagement({
    currentUser: user,
    onUserCreated: async (newUser) => {
      console.log('✅ Usuário criado:', newUser);
      await createUser(newUser);
    },
    onUserUpdated: async (updatedUser) => {
      console.log('✅ Usuário atualizado:', updatedUser);
      await updateUser(updatedUser.id, updatedUser);
    },
    onUserDeleted: async (userId) => {
      console.log('✅ Usuário excluído:', userId);
      await deleteUser(userId);
    },
    onError: (error) => {
      console.error('❌ Erro no gerenciamento de usuários:', error);
    }
  });

  useEffect(() => {
    const loadRecommendations = async () => {
      if (user.companyId) {
        const companyRecommendations = await getCompanyRecommendations(user.companyId);
        setRecommendations(companyRecommendations);
      }
    };
    
    loadRecommendations();
  }, [user.companyId, getCompanyRecommendations]);

  const handleOpenCheckupSettings = async () => {
    if (user.companyId) {
      const settings = await getCompanyCheckupSettings(user.companyId);
      setCheckupSettings(settings);
      setShowCheckupSettings(true);
    }
  };

  const handleOpenRecommendationsEditor = async () => {
    if (user.companyId) {
      const companyRecommendations = await getCompanyRecommendations(user.companyId);
      setRecommendations(companyRecommendations);
      setShowRecommendationsEditor(true);
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
          Painel Gerencial
        </h1>
        <p className="text-gray-600">Gestão da equipe e monitoramento de bem-estar</p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tamanho da Equipe</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-3xl font-bold text-gray-900">{mockTeamData.teamSize}</span>
          <p className="text-sm text-gray-600 mt-2">Membros ativos</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Score da Equipe</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{mockTeamData.averageScore}%</span>
            <span className="text-sm text-green-600 font-medium">+3%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Checkups</h3>
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-3xl font-bold text-gray-900">{mockTeamData.checkupsCompleted}</span>
          <p className="text-sm text-gray-600 mt-2">Concluídos este mês</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Atenção</h3>
            <MessageSquare className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-3xl font-bold text-orange-600">{mockTeamData.needsAttention}</span>
          <p className="text-sm text-gray-600 mt-2">Membros precisam de suporte</p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Membros da Equipe</h3>
        <div className="space-y-4">
          {[
            { name: 'João Silva', score: 78, status: 'good', lastCheckup: '2 dias' },
            { name: 'Maria Santos', score: 65, status: 'attention', lastCheckup: '1 semana' },
            { name: 'Pedro Costa', score: 82, status: 'excellent', lastCheckup: '1 dia' },
            { name: 'Ana Oliveira', score: 58, status: 'critical', lastCheckup: '2 semanas' }
          ].map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-600">Último checkup: {member.lastCheckup}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-gray-900">{member.score}%</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.status === 'excellent' ? 'bg-green-100 text-green-800' :
                  member.status === 'good' ? 'bg-blue-100 text-blue-800' :
                  member.status === 'attention' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {member.status === 'excellent' ? 'Excelente' :
                   member.status === 'good' ? 'Bom' :
                   member.status === 'attention' ? 'Atenção' : 'Crítico'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <button 
          onClick={() => setShowRegisterUserForm(true)}
          className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors text-left"
        >
          <UserPlus className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Novo Colaborador</h3>
          <p className="text-blue-100 text-sm">Adicionar novos membros à equipe</p>
        </button>

        <button 
          onClick={() => setShowUserManagement(true)}
          className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors text-left"
        >
          <UserCog className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Gerenciar Equipe</h3>
          <p className="text-green-100 text-sm">Editar dados dos colaboradores</p>
        </button>

        <button 
          onClick={handleOpenRecommendationsEditor}
          className="bg-amber-600 text-white p-6 rounded-xl hover:bg-amber-700 transition-colors text-left"
        >
          <BookOpen className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Recomendações</h3>
          <p className="text-amber-100 text-sm">Personalize orientações para a equipe</p>
        </button>

        <button 
          onClick={handleOpenCheckupSettings}
          className="bg-teal-600 text-white p-6 rounded-xl hover:bg-teal-700 transition-colors text-left"
        >
          <Settings className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Configurações</h3>
          <p className="text-teal-100 text-sm">Periodicidade dos checkups</p>
        </button>

        <button className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition-colors text-left">
          <BarChart3 className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Relatórios</h3>
          <p className="text-purple-100 text-sm">Análises da equipe</p>
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

      {/* Recommendations Editor Modal */}
      {showRecommendationsEditor && user.companyId && (
        <CompanyRecommendationsEditor
          companyId={user.companyId}
          recommendations={recommendations}
          onSave={onSaveCompanyRecommendation}
          onDelete={onDeleteCompanyRecommendation}
          onClose={() => setShowRecommendationsEditor(false)}
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