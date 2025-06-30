import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  X, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  Loader2,
  Search,
  Filter,
  UserPlus,
  Mail,
  Lock,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  Save,
  Trash2,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { User } from '../types';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  companies: Array<{ id: string; name: string }>;
  onCreateUser: (userData: CreateUserData) => Promise<{ success: boolean; message: string; user?: User }>;
  onUpdateUser: (userId: string, userData: UpdateUserData) => Promise<{ success: boolean; message: string; user?: User }>;
  onToggleUserStatus: (userId: string) => Promise<{ success: boolean; message: string; user?: User }>;
  onDeleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  onClose: () => void;
}

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

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: User['role'];
  department: string;
  companyId: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  companies,
  onCreateUser,
  onUpdateUser,
  onToggleUserStatus,
  onDeleteUser,
  onClose
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | User['role']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [companyFilter, setCompanyFilter] = useState<'all' | string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'colaborador',
    department: '',
    companyId: currentUser.role === 'super_admin' ? '' : currentUser.companyId || ''
  });

  // Log received data for debugging
  useEffect(() => {
    console.log('UserManagement - Recebeu companies:', companies);
    console.log('UserManagement - Recebeu users:', users);
  }, [companies, users]);

  // Define role options based on current user's role
  const roleOptions = currentUser.role === 'super_admin' 
    ? [
        { value: 'super_admin', label: 'Super Administrador' },
        { value: 'gerente', label: 'Gerente' },
        { value: 'colaborador', label: 'Colaborador' }
      ]
    : [
        { value: 'gerente', label: 'Gerente' },
        { value: 'colaborador', label: 'Colaborador' }
      ];

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'colaborador',
      department: '',
      companyId: currentUser.role === 'super_admin' ? '' : currentUser.companyId || ''
    });
    setEditingUser(null);
    setError('');
    setSuccess('');
    setShowPasswords({ password: false, confirmPassword: false });
  };

  // Open form for create or edit
  const openForm = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role,
        department: user.department || '',
        companyId: user.companyId || ''
      });
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email deve ter formato válido');
      return false;
    }

    if (currentUser.role === 'super_admin' && !formData.companyId && formData.role !== 'super_admin') {
      setError('Empresa é obrigatória para usuários que não são Super Admin');
      return false;
    }

    // Password validation only for new users or when password is being changed
    if (!editingUser || formData.password) {
      if (!formData.password) {
        setError('Senha é obrigatória');
        return false;
      }

      if (formData.password.length < 6) {
        setError('Senha deve ter pelo menos 6 caracteres');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Confirmação de senha não confere');
        return false;
      }
    }

    // Check for duplicate email (excluding current user if editing)
    const emailExists = users.some(user => 
      user.email.toLowerCase() === formData.email.toLowerCase() && 
      user.id !== editingUser?.id
    );
    
    if (emailExists) {
      setError('Este email já está em uso');
      return false;
    }

    // Verificar se usuário tem permissão para criar super_admin
    if (formData.role === 'super_admin' && currentUser.role !== 'super_admin') {
      setError('Apenas Super Administradores podem criar outros Super Administradores');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let result;
      
      if (editingUser) {
        // Update user
        
        const updateData: UpdateUserData = {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          role: formData.role,
          department: formData.role === 'super_admin' ? undefined : formData.department.trim() || undefined,
          companyId: formData.role === 'super_admin' ? undefined : (currentUser.role === 'super_admin' ? formData.companyId : currentUser.companyId)
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        result = await onUpdateUser(editingUser.id, updateData);
      } else {
        // Create user
        const createData: CreateUserData = {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          role: formData.role,
          department: formData.role === 'super_admin' ? undefined : formData.department.trim() || undefined,
          companyId: formData.role === 'super_admin' ? undefined : (currentUser.role === 'super_admin' ? formData.companyId : currentUser.companyId)
        };

        result = await onCreateUser(createData);
      }

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          closeForm();
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user status toggle
  const handleToggleStatus = async (user: User) => {
    try {
      // Verificar se o usuário atual pode gerenciar um super_admin
      if (user.role === 'super_admin' && currentUser.role !== 'super_admin') {
        setError('Você não tem permissão para modificar um Super Administrador');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      const result = await onToggleUserStatus(user.id);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Erro ao alterar status do usuário');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (user: User) => {
    try {
      const result = await onDeleteUser(user.id);
      if (result.success) {
        setSuccess(result.message);
        setShowDeleteConfirm(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Erro ao excluir usuário');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Get role display name
  const getRoleDisplayName = (role: User['role']): string => {
    const roleNames = {
      super_admin: 'Super Administrador',
      gerente: 'Gerente',
      colaborador: 'Colaborador'
    };
    return roleNames[role];
  };

  // Get company name
  const getCompanyName = (companyId?: string): string => {
    if (!companyId) return '-';
    const company = companies.find(c => c.id === companyId);
    return company?.name || 'Empresa não encontrada';
  };
  
  // Get role badge style
  const getRoleBadgeStyle = (role: User['role']): string => {
    const styles = {
      super_admin: 'bg-purple-100 text-purple-800',
      gerente: 'bg-blue-100 text-blue-800',
      colaborador: 'bg-gray-100 text-gray-800'
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.department?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    const matchesCompany = companyFilter === 'all' || 
                          user.companyId === companyFilter || 
                          (user.role === 'super_admin' && companyFilter === 'all');
    
    // Hide current user from list (can't manage yourself)
    const isNotCurrentUser = user.id !== currentUser.id;
    
    // Role-based filtering
    let hasPermission = true;
    if (currentUser.role === 'gerente') {
      // Gerentes can only see users from their company
      hasPermission = user.companyId === currentUser.companyId;
    }
    
    // Super admins can manage super admins, others cannot
    if (user.role === 'super_admin' && currentUser.role !== 'super_admin') {
      hasPermission = false;
    }
    
    return matchesSearch && matchesRole && matchesStatus && matchesCompany && isNotCurrentUser && hasPermission;
  });

  console.log('UserManagement - filteredUsers:', filteredUsers);

  // Get available companies for current user
  const availableCompanies = currentUser.role === 'super_admin' 
    ? companies 
    : companies.filter(c => c.id === currentUser.companyId);

  console.log('UserManagement - availableCompanies:', availableCompanies);

  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <UserPlus className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
            </div>
            <button
              onClick={closeForm}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Perfil de Acesso *
                  </label>
                  <div className="relative">
                    {formData.role === 'super_admin' && (
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-500" />
                    )}
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => {
                        const newRole = e.target.value as User['role'];
                        setFormData(prev => ({ 
                          ...prev, 
                          role: newRole,
                          // Limpar companyId se for super_admin
                          companyId: newRole === 'super_admin' ? '' : prev.companyId
                        }));
                      }}
                      className={`w-full ${formData.role === 'super_admin' ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${formData.role === 'super_admin' ? 'border-purple-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                      required
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {formData.role === 'super_admin' && (
                    <p className="mt-1 text-xs text-purple-600">
                      Super Administradores têm acesso total a todas as funcionalidades do sistema.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ex: TI, Vendas, Marketing"
                    disabled={formData.role === 'super_admin'}
                  />
                </div>
              </div>

              {currentUser.role === 'super_admin' && formData.role !== 'super_admin' && (
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      id="company"
                      value={formData.companyId}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required={formData.role !== 'super_admin'}
                    >
                      <option value="">Selecione uma empresa</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              {/* Info for SuperAdmin */}
              {formData.role === 'super_admin' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-purple-800 font-medium">Informações importantes sobre Super Administradores</p>
                      <ul className="mt-1 text-xs text-purple-700 space-y-1">
                        <li>• Super Administradores têm acesso total ao sistema</li>
                        <li>• Não estão vinculados a nenhuma empresa específica</li>
                        <li>• Podem gerenciar todas as empresas e usuários</li>
                        <li>• Use com responsabilidade</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                {editingUser ? 'Alterar Senha (opcional)' : 'Senha de Acesso'}
              </h3>
              
              {editingUser && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    Deixe os campos de senha em branco para manter a senha atual.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    {editingUser ? 'Nova Senha' : 'Senha *'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="password"
                      type={showPasswords.password ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, password: !prev.password }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    {editingUser ? 'Confirmar Nova Senha' : 'Confirmar Senha *'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showPasswords.confirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Confirme a senha"
                      minLength={6}
                      required={!editingUser || !!formData.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">As senhas não conferem</p>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm bg-green-50 border border-green-200 p-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{editingUser ? 'Atualizando...' : 'Criando...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{editingUser ? 'Atualizar Usuário' : 'Criar Usuário'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-900">Gerenciar Usuários</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'all' | User['role'])}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="all">Todos os Perfis</option>
                  {/* Mostrar Super Admin na lista de filtros apenas para Super Admin */}
                  {currentUser.role === 'super_admin' && (
                    <option value="super_admin">Super Administrador</option>
                  )}
                  {roleOptions.filter(option => option.value !== 'super_admin').map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>

              {currentUser.role === 'super_admin' && companies.length > 0 && (
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="all">Todas as Empresas</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => openForm()}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 text-sm whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Usuário</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Usuário</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Perfil</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Departamento</th>
                    {currentUser.role === 'super_admin' && (
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Empresa</th>
                    )}
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Criado em</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover bg-gray-200"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{user.name}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${getRoleBadgeStyle(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{user.department || '-'}</span>
                      </td>
                      {currentUser.role === 'super_admin' && (
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {user.role === 'super_admin' ? 'Global' : getCompanyName(user.companyId)}
                          </span>
                        </td>
                      )}
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openForm(user)}
                            className="text-teal-600 hover:text-teal-800 transition-colors"
                            title="Editar usuário"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`transition-colors ${
                              user.isActive ? 'text-teal-600 hover:text-teal-800' : 'text-gray-400 hover:text-gray-600'
                            }`}
                            title={user.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                          >
                            {user.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Excluir usuário"
                          >
                            <Trash2 className="h-4 w-4" />
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
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || companyFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece criando seu primeiro usuário'
                }
              </p>
              {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && companyFilter === 'all' && (
                <button
                  onClick={() => openForm()}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Criar Primeiro Usuário
                </button>
              )}
            </div>
          )}

          {/* Success/Error Messages */}
          {(success || error) && (
            <div className="fixed bottom-4 right-4 z-50">
              <div className={`p-4 rounded-lg shadow-lg ${
                success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {success || error}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
                  <p className="text-sm text-gray-600">Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-700">
                  Tem certeza que deseja excluir o usuário <strong>{showDeleteConfirm.name}</strong>?
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Todos os dados relacionados a este usuário serão permanentemente removidos.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Excluir Usuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};