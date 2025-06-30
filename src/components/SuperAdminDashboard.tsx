import React, { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, TrendingUp, Plus, Settings, BarChart3, Shield, CreditCard, Search, Filter, UserCog, GraduationCap, Trash2, AlertTriangle } from 'lucide-react';
import { User, SuperAdminStats, Company } from '../types';
import { RegisterCompanyForm } from './RegisterCompanyForm';
import { SubscriptionPlansManagement } from './SubscriptionPlansManagement';
import { UserManagement } from './UserManagement';
import { EducationalPrograms } from './EducationalPrograms';
import { useUserManagement } from '../hooks/useUserManagement';

interface SuperAdminDashboardProps {
  user: User;
  hasPermission: (permission: string) => boolean;
  companies: Company[];
  users: User[];
  onRegisterCompany: (companyData: {
    name: string;
    domain: string;
    contactPerson: string;
    corporateEmail: string;
    landlinePhone?: string;
    mobilePhone: string;
    plan: Company['plan'];
    maxUsers: number;
    logoData?: string;
  }) => Promise<{ success: boolean; message: string; company?: Company }>;
  onDeleteCompany: (companyId: string) => Promise<{ success: boolean; message: string }>;
  getSubscriptionPlans: () => any[];
  onAddSubscriptionPlan: (planData: any) => Promise<any>;
  onUpdateSubscriptionPlan: (planId: string, planData: any) => Promise<any>;
  onTogglePlanStatus: (planId: string) => Promise<any>;
  createUser: (userData: any) => Promise<any>;
  updateUser: (userId: string, userData: any) => Promise<any>;
  toggleUserStatus: (userId: string) => Promise<any>;
  deleteUser: (userId: string) => Promise<any>;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  user, 
  hasPermission, 
  companies,
  users,
  onRegisterCompany,
  onDeleteCompany,
  getSubscriptionPlans,
  onAddSubscriptionPlan,
  onUpdateSubscriptionPlan,
  onTogglePlanStatus,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
}) => {
  const [showRegisterCompanyForm, setShowRegisterCompanyForm] = useState(false);
  const [showPlansManagement, setShowPlansManagement] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showEducationalPrograms, setShowEducationalPrograms] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'basic' | 'premium' | 'enterprise'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    companyId: string;
    companyName: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statsData, setStatsData] = useState<SuperAdminStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    companiesGrowth: 15, // Valores fixos para crescimento
    usersGrowth: 23,
    revenueGrowth: 18
  });

  // Calcular estatísticas em tempo real
  useEffect(() => {
    // Calcular total e número de empresas ativas
    const totalCompaniesCount = companies.length;
    const activeCompaniesCount = companies.filter(company => company.isActive).length;
    
    // Calcular total e número de usuários ativos
    const totalUsersCount = users.length;
    const activeUsersCount = users.filter(user => user.isActive).length;
    
    // Calcular receita mensal (planos * empresas ativas)
    let monthlyRevenue = 0;
    const plans = getSubscriptionPlans();
    
    companies.forEach(company => {
      if (company.isActive) {
        let planValue = 0;
        if (company.subscriptionPlanId) {
          const plan = plans.find(p => p.id === company.subscriptionPlanId);
          if (plan) {
            planValue = plan.value;
          }
        } else if (company.plan === 'basic') {
          planValue = 29.90; // Valor padrão do plano básico
        } else if (company.plan === 'premium') {
          planValue = 79.90; // Valor padrão do plano premium
        } else if (company.plan === 'enterprise') {
          planValue = 199.90; // Valor padrão do plano enterprise
        }
        
        monthlyRevenue += planValue;
      }
    });
    
    setStatsData({
      totalCompanies: totalCompaniesCount,
      activeCompanies: activeCompaniesCount,
      totalUsers: totalUsersCount,
      monthlyRevenue: monthlyRevenue,
      // Manter valores fixos para crescimento
      companiesGrowth: 15,
      usersGrowth: 23,
      revenueGrowth: 18
    });
    
  }, [companies, users, getSubscriptionPlans]);

  // User management hook
  const userManagement = useUserManagement({
    currentUser: user
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPlanColor = (plan: Company['plan']) => {
    const colors = {
      basic: 'bg-gray-100 text-gray-800',
      premium: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };
    return colors[plan];
  };

  const getPlanName = (plan: Company['plan']) => {
    const names = {
      basic: 'Básico',
      premium: 'Premium',
      enterprise: 'Enterprise'
    };
    return names[plan];
  };

  // Manipular exclusão de empresa
  const handleDeleteCompany = (companyId: string, companyName: string) => {
    setShowDeleteConfirm({
      companyId,
      companyName
    });
  };

  const confirmDeleteCompany = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      const result = await onDeleteCompany(showDeleteConfirm.companyId);
      
      if (result.success) {
        setSuccess(result.message || `Empresa "${showDeleteConfirm.companyName}" excluída com sucesso`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Erro ao excluir empresa');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Erro interno ao excluir empresa. Tente novamente.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const cancelDeleteCompany = () => {
    setShowDeleteConfirm(null);
  };

  // Filter companies
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && company.isActive) ||
                         (statusFilter === 'inactive' && !company.isActive);
    
    const matchesPlan = planFilter === 'all' || company.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Prepare companies for user management
  const companiesForUserManagement = companies.map(company => ({
    id: company.id,
    name: company.name
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Painel Super Administrador
        </h1>
        <p className="text-gray-600">Gestão global da plataforma Serenus</p>
      </div>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className={`p-4 rounded-lg ${success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {success || error}
        </div>
      )}

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Empresas</h3>
            <Building2 className="h-5 w-5 text-teal-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{statsData.totalCompanies}</span>
            <span className="text-sm text-green-600 font-medium">+{statsData.companiesGrowth}%</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{statsData.activeCompanies} ativas</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Usuários Totais</h3>
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{statsData.totalUsers.toLocaleString()}</span>
            <span className="text-sm text-green-600 font-medium">+{statsData.usersGrowth}%</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{users.filter(u => u.isActive).length} ativos</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Receita Mensal</h3>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(statsData.monthlyRevenue)}</span>
            <span className="text-sm text-green-600 font-medium">+{statsData.revenueGrowth}%</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">MRR (Monthly Recurring Revenue)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Crescimento</h3>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-green-600">+{statsData.companiesGrowth}%</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Novas empresas este mês</p>
        </div>
      </div>

      {/* Companies Management */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Empresas Cadastradas</h3>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
              </select>
              
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as 'all' | 'basic' | 'premium' | 'enterprise')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              >
                <option value="all">Todos os Planos</option>
                <option value="basic">Básico</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            
            <button 
              onClick={() => setShowRegisterCompanyForm(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Empresa</span>
            </button>
          </div>
        </div>
        
        {filteredCompanies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Contato</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Plano</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Usuários</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Criada em</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={company.logo || '/serenus.png'}
                          alt={company.name}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/serenus.png'; // Fallback para logo padrão
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{company.name}</h4>
                          <p className="text-sm text-gray-600">{company.domain}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{company.contactPerson}</p>
                        <p className="text-sm text-gray-600">{company.corporateEmail}</p>
                        <p className="text-sm text-gray-600">{company.mobilePhone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(company.plan)}`}>
                        {getPlanName(company.plan)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{company.currentUsers}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">{company.maxUsers}</span>
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-teal-600 h-1 rounded-full"
                          style={{ width: `${(company.currentUsers / company.maxUsers) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        company.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {company.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {company.createdAt.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteCompany(company.id, company.name)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || planFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece registrando sua primeira empresa'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && planFilter === 'all' && (
              <button
                onClick={() => setShowRegisterCompanyForm(true)}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Registrar Primeira Empresa
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <button 
          onClick={() => setShowRegisterCompanyForm(true)}
          className="bg-teal-600 text-white p-6 rounded-xl hover:bg-teal-700 transition-colors text-left"
        >
          <Building2 className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Gerenciar Empresas</h3>
          <p className="text-teal-100 text-sm">Criar, editar e configurar empresas na plataforma</p>
        </button>

        <button 
          onClick={() => setShowUserManagement(true)}
          className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors text-left"
        >
          <UserCog className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Gerenciar Usuários</h3>
          <p className="text-blue-100 text-sm">Criar, editar e gerenciar usuários do sistema</p>
        </button>

        <button 
          onClick={() => setShowPlansManagement(true)}
          className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition-colors text-left"
        >
          <CreditCard className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Planos de Assinatura</h3>
          <p className="text-purple-100 text-sm">Criar e gerenciar planos de assinatura</p>
        </button>

        <button 
          onClick={() => setShowEducationalPrograms(true)}
          className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors text-left"
        >
          <GraduationCap className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Programas Educacionais</h3>
          <p className="text-green-100 text-sm">Gerenciar cursos, módulos e aulas</p>
        </button>

        <button className="bg-orange-600 text-white p-6 rounded-xl hover:bg-orange-700 transition-colors text-left">
          <BarChart3 className="h-8 w-8 mb-4" />
          <h3 className="font-semibold mb-2">Relatórios Globais</h3>
          <p className="text-orange-100 text-sm">Análises e métricas de toda a plataforma</p>
        </button>
      </div>

      {/* Register Company Form Modal */}
      {showRegisterCompanyForm && (
        <RegisterCompanyForm
          onRegisterCompany={onRegisterCompany}
          onClose={() => setShowRegisterCompanyForm(false)}
        />
      )}

      {/* User Management Modal */}
      {showUserManagement && (
        <UserManagement
          users={users}
          currentUser={user}
          companies={companiesForUserManagement}
          onCreateUser={createUser}
          onUpdateUser={updateUser}
          onToggleUserStatus={toggleUserStatus}
          onDeleteUser={deleteUser}
          onClose={() => setShowUserManagement(false)}
        />
      )}

      {/* Subscription Plans Management Modal */}
      {showPlansManagement && (
        <SubscriptionPlansManagement
          plans={getSubscriptionPlans()}
          onAddPlan={onAddSubscriptionPlan}
          onUpdatePlan={onUpdateSubscriptionPlan}
          onTogglePlanStatus={onTogglePlanStatus}
          onClose={() => setShowPlansManagement(false)}
        />
      )}

      {/* Educational Programs Modal */}
      {showEducationalPrograms && (
        <EducationalPrograms
          currentUser={user}
          onClose={() => setShowEducationalPrograms(false)}
        />
      )}

      {/* Confirmation Modal for Company Deletion */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Tem certeza que deseja excluir a empresa <strong>{showDeleteConfirm.companyName}</strong>?
              </p>
              <p className="text-sm text-red-600">
                Todos os usuários, configurações e dados associados a esta empresa serão permanentemente removidos.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteCompany}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteCompany}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir Empresa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};