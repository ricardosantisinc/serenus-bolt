import { useState, useEffect, useCallback } from 'react';
import { User, Permission, Company, CheckupResult, CompanyCheckupSettings, UserProfileUpdate, SubscriptionPlan, CompanyRecommendation } from '../types';

// Importar funções de armazenamento
import {
  loadUsersFromStorage,
  saveUsersToStorage,
  saveUserToStorage,
  removeUserFromStorage,
  loadCompaniesFromStorage,
  saveCompaniesToStorage,
  removeCompanyFromStorage,
  loadSubscriptionPlansFromStorage,
  saveSubscriptionPlansToStorage
} from '../utils/userStorage';

// Importar funções de validação
import { 
  validateEmail, 
  validatePassword, 
  getRoleDisplayName as getRoleLabel
} from '../utils/userValidation';

// Importar cliente Supabase (para uso futuro com backend real)
import { supabase } from '../lib/supabase';

// ID do Super Admin para verificações
const SUPER_ADMIN_ID = 'admin-123';

// Mock data inicial
let mockUsers: Record<string, User> = {
  'admin@serenus.com': {
    id: SUPER_ADMIN_ID,
    name: 'Administrador',
    email: 'admin@serenus.com',
    role: 'super_admin',
    permissions: [],
    avatar: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    createdAt: new Date('2025-01-01')
  }
};

let mockCompanies: Record<string, Company> = {};

let mockSubscriptionPlans: Record<string, SubscriptionPlan> = {
  'plan1': {
    id: 'plan1',
    name: 'Básico',
    value: 29.90,
    periodicity: 'monthly',
    features: ['Até 50 usuários', 'Checkups mensais', 'Relatórios básicos', 'Suporte por email'],
    isActive: true,
    createdAt: new Date('2025-01-01'),
    description: 'Plano ideal para pequenas empresas iniciando sua jornada de bem-estar'
  },
  'plan2': {
    id: 'plan2',
    name: 'Premium',
    value: 79.90,
    periodicity: 'monthly',
    features: ['Até 200 usuários', 'Checkups personalizáveis', 'Relatórios avançados', 'Recomendações personalizadas', 'Suporte prioritário'],
    isActive: true,
    createdAt: new Date('2025-01-01'),
    description: 'Recursos avançados para empresas em crescimento'
  },
  'plan3': {
    id: 'plan3',
    name: 'Enterprise',
    value: 199.90,
    periodicity: 'monthly',
    features: ['Até 1000 usuários', 'API dedicada', 'Checkups customizados', 'Relatórios completos', 'Integração com outros sistemas', 'Suporte 24/7'],
    isActive: true,
    createdAt: new Date('2025-01-01'),
    description: 'Solução completa para grandes organizações'
  }
};

// Mock de configurações de checkup por empresa
const mockCompanyCheckupSettings: Record<string, CompanyCheckupSettings> = {};

// Mock de recomendações por empresa
const mockCompanyRecommendations: Record<string, CompanyRecommendation[]> = {};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Record<string, Company>>({});
  const [subscriptionPlans, setSubscriptionPlans] = useState<Record<string, SubscriptionPlan>>({});
  
  // Inicialização
  useEffect(() => {
    // Carregar dados do localStorage na inicialização
    const storedUsers = loadUsersFromStorage();
    const storedCompanies = loadCompaniesFromStorage();
    const storedPlans = loadSubscriptionPlansFromStorage();

    // Inicializar usuários
    if (storedUsers) {
      mockUsers = storedUsers;
    } else {
      // Salvar dados padrão no localStorage
      saveUsersToStorage(mockUsers);
    }

    // Inicializar empresas
    if (storedCompanies) {
      mockCompanies = storedCompanies;
      setCompanies(storedCompanies);
    } else {
      setCompanies(mockCompanies);
    }

    // Inicializar planos de assinatura
    if (storedPlans) {
      mockSubscriptionPlans = storedPlans;
      setSubscriptionPlans(storedPlans);
    } else {
      setSubscriptionPlans(mockSubscriptionPlans);
    }

    // Verificar se há sessão de usuário
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Converter strings de data para objetos Date
        if (userData.createdAt) userData.createdAt = new Date(userData.createdAt);
        if (userData.updatedAt) userData.updatedAt = new Date(userData.updatedAt);
        if (userData.lastCheckup) userData.lastCheckup = new Date(userData.lastCheckup);
        if (userData.nextCheckup) userData.nextCheckup = new Date(userData.nextCheckup);
        
        setUser(userData);
      } catch (error) {
        console.error('Erro ao processar sessão do usuário:', error);
        localStorage.removeItem('currentUser');
      }
    }

    setIsLoading(false);
  }, []);

  // Salvar usuário atual no localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  // Login
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Em uma aplicação real, aqui faria a autenticação com Supabase
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      // Simular autenticação
      const user = Object.values(mockUsers).find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        console.log('Usuário não encontrado:', email);
        return false;
      }

      // Em aplicação real, verificaria senha com bcrypt
      // Em mock, apenas verificamos se é a senha padrão para admin ou "senha123" para outros
      const isAdmin = user.role === 'super_admin' && email === 'admin@serenus.com';
      const validPassword = isAdmin ? password === 'admin123456' : password === 'senha123';

      if (!validPassword) {
        console.log('Senha inválida para:', email);
        return false;
      }

      // Gerar histórico mock de checkup se não existir
      if (!user.checkupHistory) {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        
        user.lastCheckup = date;
        user.nextCheckup = new Date();
        user.checkupHistory = [
          {
            id: 'checkup1',
            userId: user.id,
            companyId: user.companyId || '',
            date: date,
            responses: [],
            scores: { stress: 16, anxiety: 8, depression: 12 },
            classifications: { stress: 'leve', anxiety: 'leve', depression: 'leve' },
            overallScore: 78,
            severityLevel: 'leve',
            nextCheckupDate: new Date()
          }
        ];
      }

      setUser(user);
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    // Em uma aplicação real, faria logout do Supabase
    // supabase.auth.signOut();
    setUser(null);
  }, []);

  // Atualizar perfil do usuário
  const updateProfile = useCallback(async (profileData: UserProfileUpdate): Promise<{ success: boolean; message: string }> => {
    try {
      if (!user) {
        return { success: false, message: 'Usuário não autenticado' };
      }

      setIsLoading(true);

      // Em uma aplicação real, atualizaria o perfil no Supabase
      // const { data, error } = await supabase.from('users').update({...}).eq('id', user.id);

      // Validar senha atual (simulação)
      if (profileData.currentPassword) {
        const isAdmin = user.role === 'super_admin' && user.email === 'admin@serenus.com';
        const validPassword = isAdmin 
          ? profileData.currentPassword === 'admin123456' 
          : profileData.currentPassword === 'senha123';
        
        if (!validPassword) {
          return { success: false, message: 'Senha atual incorreta' };
        }
      }

      // Atualizar mock do usuário
      const updatedUser: User = {
        ...user,
        name: profileData.name,
        birthDate: profileData.birthDate,
        gender: profileData.gender,
        updatedAt: new Date()
      };

      // Atualizar no mock
      mockUsers[user.email] = updatedUser;

      // Atualizar localStorage
      saveUserToStorage(updatedUser);

      // Atualizar estado
      setUser(updatedUser);

      return { success: true, message: 'Perfil atualizado com sucesso' };
    } catch (error) {
      return { success: false, message: 'Erro ao atualizar perfil' };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Verificar autenticação
  const isAuthenticated = useCallback(() => {
    return user !== null;
  }, [user]);

  // Verificar permissão
  const hasPermission = useCallback((permission: string): boolean => {
    // Permissões baseadas em role
    if (!user) return false;

    switch (permission) {
      case 'view_all_data':
        return user.role === 'super_admin';
      case 'view_team_data':
        return ['super_admin', 'gerente'].includes(user.role);
      case 'manage_users':
        return ['super_admin', 'gerente'].includes(user.role);
      case 'manage_companies':
        return user.role === 'super_admin';
      case 'system_settings':
        return user.role === 'super_admin';
      case 'view_checkups':
        return true; // Todos podem ver seus próprios checkups
      default:
        return false;
    }
  }, [user]);

  // Retornar rótulo amigável para role
  const getRoleDisplayName = useCallback((role: User['role']): string => {
    return getRoleLabel(role);
  }, []);

  // Obter lista de empresas
  const getCompanies = useCallback((): Company[] => {
    return Object.values(companies);
  }, [companies]);

  // Obter empresa por ID
  const getCompanyById = useCallback((companyId: string): Company | undefined => {
    return companies[companyId];
  }, [companies]);

  // Registrar nova empresa
  const registerCompany = useCallback(async (companyData: {
    name: string;
    domain: string;
    contactPerson: string;
    corporateEmail: string;
    landlinePhone?: string;
    mobilePhone: string;
    plan: Company['plan'];
    maxUsers: number;
    logoData?: string;
  }): Promise<{ success: boolean; message: string; company?: Company }> => {
    try {
      setIsLoading(true);
      
      // Em uma aplicação real, criaria a empresa no Supabase
      // const { data, error } = await supabase.from('companies').insert({...}).select().single();

      // Validações
      if (!companyData.name || !companyData.domain || !companyData.contactPerson || 
          !companyData.corporateEmail || !companyData.mobilePhone) {
        return { success: false, message: 'Todos os campos obrigatórios devem ser preenchidos' };
      }

      if (!validateEmail(companyData.corporateEmail)) {
        return { success: false, message: 'Email corporativo inválido' };
      }

      // Verificar se domínio já existe
      if (Object.values(companies).some(c => c.domain.toLowerCase() === companyData.domain.toLowerCase())) {
        return { success: false, message: 'Domínio já está em uso' };
      }

      // Criar nova empresa
      const newCompany: Company = {
        id: `company_${Date.now()}`,
        name: companyData.name,
        domain: companyData.domain,
        contactPerson: companyData.contactPerson,
        corporateEmail: companyData.corporateEmail,
        landlinePhone: companyData.landlinePhone,
        mobilePhone: companyData.mobilePhone,
        logo: companyData.logoData ? `data:image/jpeg;base64,${companyData.logoData}` : '/serenus.png',
        createdAt: new Date(),
        isActive: true,
        plan: companyData.plan,
        maxUsers: companyData.maxUsers,
        currentUsers: 0
      };

      // Atualizar estado local
      const updatedCompanies = {
        ...companies,
        [newCompany.id]: newCompany
      };
      
      setCompanies(updatedCompanies);
      mockCompanies = updatedCompanies;

      // Persistir no localStorage
      saveCompaniesToStorage(updatedCompanies);

      // Criar configurações de checkup padrão para a empresa
      mockCompanyCheckupSettings[newCompany.id] = {
        id: `settings_${Date.now()}`,
        companyId: newCompany.id,
        normalIntervalDays: 90,
        severeIntervalDays: 30,
        autoRemindersEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return { success: true, message: 'Empresa cadastrada com sucesso!', company: newCompany };

    } catch (error) {
      console.error('Erro ao registrar empresa:', error);
      return { success: false, message: 'Erro ao registrar empresa. Tente novamente.' };
    } finally {
      setIsLoading(false);
    }
  }, [companies]);

  // Excluir empresa
  const deleteCompany = useCallback(async (companyId: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      
      // Em uma aplicação real, excluiria a empresa no Supabase
      // const { error } = await supabase.from('companies').delete().eq('id', companyId);

      // Verificar se a empresa existe
      if (!companies[companyId]) {
        return { success: false, message: 'Empresa não encontrada' };
      }

      // Armazenar o nome para mensagem de sucesso
      const companyName = companies[companyId].name;

      // Criar cópia atualizada das empresas
      const updatedCompanies = { ...companies };
      delete updatedCompanies[companyId];
      
      // Atualizar estado
      setCompanies(updatedCompanies);
      mockCompanies = updatedCompanies;

      // Persistir no localStorage
      saveCompaniesToStorage(updatedCompanies);
      
      // Limpar configurações relacionadas
      delete mockCompanyCheckupSettings[companyId];
      delete mockCompanyRecommendations[companyId];

      return { success: true, message: `Empresa "${companyName}" excluída com sucesso!` };

    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      return { success: false, message: 'Erro ao excluir empresa. Tente novamente.' };
    } finally {
      setIsLoading(false);
    }
  }, [companies]);

  // Registrar usuário
  const registerUser = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    role: User['role'];
    department?: string;
    companyId: string;
  }): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      setIsLoading(true);

      // Em uma aplicação real, criaria o usuário no Supabase Auth
      // const { data, error } = await supabase.auth.signUp({email, password, ...});

      // Validações
      if (!userData.name || !userData.email || !userData.password) {
        return { success: false, message: 'Todos os campos obrigatórios devem ser preenchidos' };
      }

      if (!validateEmail(userData.email)) {
        return { success: false, message: 'Email inválido' };
      }

      const passwordValidation = validatePassword(userData.password);
      if (!passwordValidation.valid) {
        return { success: false, message: passwordValidation.message || 'Senha inválida' };
      }

      // Verificar se email já existe
      if (Object.values(mockUsers).some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, message: 'Email já está em uso' };
      }

      // Verificar se a empresa existe
      if (!companies[userData.companyId]) {
        return { success: false, message: 'Empresa não encontrada' };
      }

      // Criar novo usuário
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        companyId: userData.companyId,
        department: userData.department,
        avatar: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400',
        permissions: [],
        isActive: true,
        createdAt: new Date()
      };

      // Atualizar mock
      mockUsers[userData.email.toLowerCase()] = newUser;

      // Salvar no localStorage
      saveUserToStorage(newUser);

      // Incrementar contador de usuários da empresa
      const company = companies[userData.companyId];
      if (company) {
        const updatedCompany = { ...company, currentUsers: company.currentUsers + 1 };
        const updatedCompanies = { ...companies, [userData.companyId]: updatedCompany };
        
        setCompanies(updatedCompanies);
        mockCompanies = updatedCompanies;
        
        saveCompaniesToStorage(updatedCompanies);
      }

      return { success: true, message: 'Usuário criado com sucesso!', user: newUser };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { success: false, message: 'Erro ao registrar usuário. Tente novamente.' };
    } finally {
      setIsLoading(false);
    }
  }, [companies]);

  // Salvar resultado de checkup
  const saveCheckupResult = useCallback(async (checkupResult: CheckupResult): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Atualizar mock do usuário com os dados do checkup
      const updatedUser = { ...user };
      updatedUser.lastCheckup = checkupResult.date;
      updatedUser.nextCheckup = checkupResult.nextCheckupDate;
      
      if (!updatedUser.checkupHistory) {
        updatedUser.checkupHistory = [];
      }
      
      updatedUser.checkupHistory.push(checkupResult);
      
      // Atualizar no mock
      mockUsers[user.email] = updatedUser;
      
      // Atualizar localStorage
      saveUserToStorage(updatedUser);
      
      // Atualizar estado
      setUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar resultado de checkup:', error);
      return false;
    }
  }, [user]);

  // Gerenciamento de planos de assinatura
  const getSubscriptionPlans = useCallback(() => {
    return Object.values(subscriptionPlans);
  }, [subscriptionPlans]);

  const addSubscriptionPlan = useCallback(async (planData: {
    name: string;
    value: number;
    periodicity: SubscriptionPlan['periodicity'];
    features: string[];
    description?: string;
  }): Promise<{ success: boolean; message: string; plan?: SubscriptionPlan }> => {
    try {
      // Validações
      if (!planData.name || planData.value <= 0) {
        return { success: false, message: 'Nome e valor são obrigatórios' };
      }

      // Criar novo plano
      const newPlan: SubscriptionPlan = {
        id: `plan_${Date.now()}`,
        name: planData.name,
        value: planData.value,
        periodicity: planData.periodicity,
        features: planData.features || [],
        isActive: true,
        createdAt: new Date(),
        description: planData.description
      };

      // Atualizar mock
      const updatedPlans = {
        ...subscriptionPlans,
        [newPlan.id]: newPlan
      };
      
      mockSubscriptionPlans = updatedPlans;
      setSubscriptionPlans(updatedPlans);
      
      // Persistir no localStorage
      saveSubscriptionPlansToStorage(updatedPlans);

      return { success: true, message: 'Plano criado com sucesso!', plan: newPlan };
    } catch (error) {
      return { success: false, message: 'Erro ao adicionar plano' };
    }
  }, [subscriptionPlans]);

  const updateSubscriptionPlan = useCallback(async (planId: string, planData: {
    name: string;
    value: number;
    periodicity: SubscriptionPlan['periodicity'];
    features: string[];
    description?: string;
  }): Promise<{ success: boolean; message: string; plan?: SubscriptionPlan }> => {
    try {
      // Verificar se o plano existe
      if (!subscriptionPlans[planId]) {
        return { success: false, message: 'Plano não encontrado' };
      }

      // Atualizar plano
      const updatedPlan = {
        ...subscriptionPlans[planId],
        name: planData.name,
        value: planData.value,
        periodicity: planData.periodicity,
        features: planData.features,
        description: planData.description,
        updatedAt: new Date()
      };

      // Atualizar mock
      const updatedPlans = {
        ...subscriptionPlans,
        [planId]: updatedPlan
      };
      
      mockSubscriptionPlans = updatedPlans;
      setSubscriptionPlans(updatedPlans);
      
      // Persistir no localStorage
      saveSubscriptionPlansToStorage(updatedPlans);

      return { success: true, message: 'Plano atualizado com sucesso!', plan: updatedPlan };
    } catch (error) {
      return { success: false, message: 'Erro ao atualizar plano' };
    }
  }, [subscriptionPlans]);

  const togglePlanStatus = useCallback(async (planId: string): Promise<{ success: boolean; message: string; plan?: SubscriptionPlan }> => {
    try {
      // Verificar se o plano existe
      if (!subscriptionPlans[planId]) {
        return { success: false, message: 'Plano não encontrado' };
      }

      const plan = subscriptionPlans[planId];
      
      // Alternar status
      const updatedPlan = {
        ...plan,
        isActive: !plan.isActive,
        updatedAt: new Date()
      };

      // Atualizar mock
      const updatedPlans = {
        ...subscriptionPlans,
        [planId]: updatedPlan
      };
      
      mockSubscriptionPlans = updatedPlans;
      setSubscriptionPlans(updatedPlans);
      
      // Persistir no localStorage
      saveSubscriptionPlansToStorage(updatedPlans);

      const statusMessage = updatedPlan.isActive ? 'ativado' : 'desativado';
      return { 
        success: true, 
        message: `Plano ${updatedPlan.name} ${statusMessage} com sucesso!`, 
        plan: updatedPlan 
      };
    } catch (error) {
      return { success: false, message: 'Erro ao alterar status do plano' };
    }
  }, [subscriptionPlans]);

  // Gerenciamento de configurações de checkup
  const getCompanyCheckupSettings = useCallback(async (companyId: string): Promise<CompanyCheckupSettings | null> => {
    // Verificar se a empresa existe
    if (!companies[companyId]) {
      return null;
    }

    // Retornar configurações ou criar padrão
    if (mockCompanyCheckupSettings[companyId]) {
      return mockCompanyCheckupSettings[companyId];
    }

    // Criar configurações padrão
    const defaultSettings: CompanyCheckupSettings = {
      id: `settings_${Date.now()}`,
      companyId,
      normalIntervalDays: 90,
      severeIntervalDays: 30,
      autoRemindersEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockCompanyCheckupSettings[companyId] = defaultSettings;
    return defaultSettings;
  }, [companies]);

  const saveCompanyCheckupSettings = useCallback(async (settings: Omit<CompanyCheckupSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string }> => {
    try {
      // Verificar se a empresa existe
      if (!companies[settings.companyId]) {
        return { success: false, message: 'Empresa não encontrada' };
      }

      // Validações
      if (settings.normalIntervalDays < 1 || settings.normalIntervalDays > 365) {
        return { success: false, message: 'Intervalo normal deve estar entre 1 e 365 dias' };
      }

      if (settings.severeIntervalDays < 1 || settings.severeIntervalDays > 90) {
        return { success: false, message: 'Intervalo para casos severos deve estar entre 1 e 90 dias' };
      }

      if (settings.severeIntervalDays >= settings.normalIntervalDays) {
        return { success: false, message: 'Intervalo para casos severos deve ser menor que o intervalo normal' };
      }

      // Atualizar ou criar configurações
      const existingSettings = mockCompanyCheckupSettings[settings.companyId];
      
      const updatedSettings: CompanyCheckupSettings = {
        id: existingSettings?.id || `settings_${Date.now()}`,
        companyId: settings.companyId,
        normalIntervalDays: settings.normalIntervalDays,
        severeIntervalDays: settings.severeIntervalDays,
        autoRemindersEnabled: settings.autoRemindersEnabled,
        createdAt: existingSettings?.createdAt || new Date(),
        updatedAt: new Date()
      };

      mockCompanyCheckupSettings[settings.companyId] = updatedSettings;

      return { success: true, message: 'Configurações salvas com sucesso!' };
    } catch (error) {
      return { success: false, message: 'Erro ao salvar configurações' };
    }
  }, [companies]);

  // Gerenciamento de recomendações da empresa
  const getCompanyRecommendations = useCallback(async (companyId: string): Promise<CompanyRecommendation[]> => {
    // Verificar se a empresa existe
    if (!companies[companyId]) {
      return [];
    }

    // Retornar recomendações ou criar padrão
    if (mockCompanyRecommendations[companyId]) {
      return mockCompanyRecommendations[companyId];
    }

    // Criar recomendações padrão
    const defaultRecommendations: CompanyRecommendation[] = [
      {
        id: `rec1_${Date.now()}`,
        companyId,
        title: 'Cuidando da Saúde Mental',
        content: 'Pratique técnicas de respiração diariamente para reduzir o estresse. Reserve momentos para atividades prazerosas e desconexão digital. Considere a meditação como parte da sua rotina.',
        recommendationType: 'mental_health',
        orderIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `rec2_${Date.now()}`,
        companyId,
        title: 'Alimentação Saudável',
        content: 'Mantenha uma dieta equilibrada com frutas, vegetais e proteínas magras. Hidrate-se adequadamente bebendo pelo menos 2 litros de água por dia. Evite alimentos ultraprocessados e excesso de açúcar.',
        recommendationType: 'nutrition',
        orderIndex: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockCompanyRecommendations[companyId] = defaultRecommendations;
    return defaultRecommendations;
  }, [companies]);

  const saveCompanyRecommendation = useCallback(async (recommendation: Omit<CompanyRecommendation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<{ success: boolean; message: string; recommendation?: CompanyRecommendation }> => {
    try {
      // Verificar se a empresa existe
      if (!companies[recommendation.companyId]) {
        return { success: false, message: 'Empresa não encontrada' };
      }

      // Validações
      if (!recommendation.title.trim() || !recommendation.content.trim()) {
        return { success: false, message: 'Título e conteúdo são obrigatórios' };
      }

      // Inicializar array de recomendações se não existir
      if (!mockCompanyRecommendations[recommendation.companyId]) {
        mockCompanyRecommendations[recommendation.companyId] = [];
      }

      // Se tem ID, é atualização; senão, é criação
      if (recommendation.id) {
        // Encontrar recomendação existente
        const index = mockCompanyRecommendations[recommendation.companyId]
          .findIndex(r => r.id === recommendation.id);
        
        if (index === -1) {
          return { success: false, message: 'Recomendação não encontrada' };
        }

        // Atualizar recomendação existente
        const updatedRecommendation: CompanyRecommendation = {
          ...mockCompanyRecommendations[recommendation.companyId][index],
          title: recommendation.title,
          content: recommendation.content,
          recommendationType: recommendation.recommendationType,
          orderIndex: recommendation.orderIndex,
          updatedAt: new Date()
        };

        mockCompanyRecommendations[recommendation.companyId][index] = updatedRecommendation;

        return { 
          success: true, 
          message: 'Recomendação atualizada com sucesso!', 
          recommendation: updatedRecommendation 
        };
      } else {
        // Criar nova recomendação
        const newRecommendation: CompanyRecommendation = {
          id: `rec_${Date.now()}`,
          companyId: recommendation.companyId,
          title: recommendation.title,
          content: recommendation.content,
          recommendationType: recommendation.recommendationType,
          orderIndex: recommendation.orderIndex,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockCompanyRecommendations[recommendation.companyId].push(newRecommendation);

        return { 
          success: true, 
          message: 'Recomendação criada com sucesso!', 
          recommendation: newRecommendation 
        };
      }
    } catch (error) {
      return { success: false, message: 'Erro ao salvar recomendação' };
    }
  }, [companies]);

  const deleteCompanyRecommendation = useCallback(async (id: string, companyId: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Verificar se a empresa existe
      if (!companies[companyId]) {
        return { success: false, message: 'Empresa não encontrada' };
      }

      // Verificar se há recomendações para a empresa
      if (!mockCompanyRecommendations[companyId]) {
        return { success: false, message: 'Nenhuma recomendação encontrada para esta empresa' };
      }

      // Encontrar recomendação
      const index = mockCompanyRecommendations[companyId].findIndex(r => r.id === id);
      
      if (index === -1) {
        return { success: false, message: 'Recomendação não encontrada' };
      }

      // Remover recomendação
      mockCompanyRecommendations[companyId].splice(index, 1);

      return { success: true, message: 'Recomendação excluída com sucesso!' };
    } catch (error) {
      return { success: false, message: 'Erro ao excluir recomendação' };
    }
  }, [companies]);

  // Funções de gerenciamento de usuários
  const createUser = useCallback(async (userData: any): Promise<any> => {
    try {
      // Validações básicas
      if (!userData.name || !userData.email || !userData.role) {
        return { success: false, message: 'Dados incompletos' };
      }

      // Verificar se email já existe
      if (Object.values(mockUsers).some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, message: 'Email já está em uso' };
      }

      // Criar novo usuário
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        companyId: userData.companyId,
        department: userData.department,
        avatar: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400',
        permissions: [],
        isActive: true,
        createdAt: new Date()
      };

      // Atualizar mock
      mockUsers[userData.email.toLowerCase()] = newUser;

      // Salvar no localStorage
      saveUserToStorage(newUser);

      // Se o usuário pertence a uma empresa, incrementar contador
      if (userData.companyId && companies[userData.companyId]) {
        const updatedCompany = { 
          ...companies[userData.companyId], 
          currentUsers: companies[userData.companyId].currentUsers + 1 
        };
        
        const updatedCompanies = {
          ...companies,
          [userData.companyId]: updatedCompany
        };
        
        setCompanies(updatedCompanies);
        mockCompanies = updatedCompanies;
        
        saveCompaniesToStorage(updatedCompanies);
      }

      return { success: true, message: 'Usuário criado com sucesso!', user: newUser };
    } catch (error) {
      return { success: false, message: 'Erro ao criar usuário' };
    }
  }, [companies]);

  const updateUser = useCallback(async (userId: string, userData: any): Promise<any> => {
    try {
      // Encontrar usuário por ID
      const userToUpdate = Object.values(mockUsers).find(u => u.id === userId);
      
      if (!userToUpdate) {
        return { success: false, message: 'Usuário não encontrado' };
      }

      // Salvar companyId antigo para verificar se mudou
      const oldCompanyId = userToUpdate.companyId;

      // Atualizar usuário
      const updatedUser: User = {
        ...userToUpdate,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        companyId: userData.companyId,
        department: userData.department,
        updatedAt: new Date()
      };

      // Atualizar mock
      delete mockUsers[userToUpdate.email.toLowerCase()];
      mockUsers[userData.email.toLowerCase()] = updatedUser;

      // Salvar no localStorage
      saveUserToStorage(updatedUser);

      // Atualizar contadores de empresa se a empresa mudou
      if (oldCompanyId !== userData.companyId) {
        const updatedCompanies = { ...companies };
        
        // Decrementar da empresa antiga
        if (oldCompanyId && updatedCompanies[oldCompanyId]) {
          updatedCompanies[oldCompanyId] = {
            ...updatedCompanies[oldCompanyId],
            currentUsers: Math.max(0, updatedCompanies[oldCompanyId].currentUsers - 1)
          };
        }
        
        // Incrementar na nova empresa
        if (userData.companyId && updatedCompanies[userData.companyId]) {
          updatedCompanies[userData.companyId] = {
            ...updatedCompanies[userData.companyId],
            currentUsers: updatedCompanies[userData.companyId].currentUsers + 1
          };
        }
        
        setCompanies(updatedCompanies);
        mockCompanies = updatedCompanies;
        
        saveCompaniesToStorage(updatedCompanies);
      }

      // Se for o usuário atual, atualizar o estado
      if (user && user.id === userId) {
        setUser(updatedUser);
      }

      return { success: true, message: 'Usuário atualizado com sucesso!', user: updatedUser };
    } catch (error) {
      return { success: false, message: 'Erro ao atualizar usuário' };
    }
  }, [companies, user]);

  const toggleUserStatus = useCallback(async (userId: string): Promise<any> => {
    try {
      // Encontrar usuário por ID
      const userToUpdate = Object.values(mockUsers).find(u => u.id === userId);
      
      if (!userToUpdate) {
        return { success: false, message: 'Usuário não encontrado' };
      }

      // Não permitir alteração do próprio usuário
      if (user && user.id === userId) {
        return { success: false, message: 'Você não pode alterar seu próprio status' };
      }

      // Alternar status
      const updatedUser: User = {
        ...userToUpdate,
        isActive: !userToUpdate.isActive,
        updatedAt: new Date()
      };

      // Atualizar mock
      mockUsers[userToUpdate.email.toLowerCase()] = updatedUser;

      // Salvar no localStorage
      saveUserToStorage(updatedUser);

      const statusMessage = updatedUser.isActive ? 'ativado' : 'desativado';
      return { 
        success: true, 
        message: `Usuário ${statusMessage} com sucesso!`, 
        user: updatedUser 
      };
    } catch (error) {
      return { success: false, message: 'Erro ao alterar status do usuário' };
    }
  }, [user]);

  const deleteUser = useCallback(async (userId: string): Promise<any> => {
    try {
      // Encontrar usuário por ID
      const userToDelete = Object.values(mockUsers).find(u => u.id === userId);
      
      if (!userToDelete) {
        return { success: false, message: 'Usuário não encontrado' };
      }

      // Não permitir exclusão do próprio usuário
      if (user && user.id === userId) {
        return { success: false, message: 'Você não pode excluir sua própria conta' };
      }

      // Salvar companyId para atualizar contador
      const companyId = userToDelete.companyId;

      // Remover usuário
      delete mockUsers[userToDelete.email.toLowerCase()];

      // Remover do localStorage
      removeUserFromStorage(userId);

      // Atualizar contador de usuários da empresa
      if (companyId && companies[companyId]) {
        const updatedCompany = { 
          ...companies[companyId], 
          currentUsers: Math.max(0, companies[companyId].currentUsers - 1) 
        };
        
        const updatedCompanies = {
          ...companies,
          [companyId]: updatedCompany
        };
        
        setCompanies(updatedCompanies);
        mockCompanies = updatedCompanies;
        
        saveCompaniesToStorage(updatedCompanies);
      }

      return { success: true, message: 'Usuário excluído com sucesso!' };
    } catch (error) {
      return { success: false, message: 'Erro ao excluir usuário' };
    }
  }, [companies, user]);

  const getAllUsers = useCallback(() => {
    return mockUsers;
  }, []);

  return {
    user,
    isLoading,
    login,
    logout,
    updateProfile,
    isAuthenticated,
    hasPermission,
    getRoleDisplayName,
    getCompanies,
    getCompanyById,
    registerCompany,
    deleteCompany,
    registerUser,
    saveCheckupResult,
    getSubscriptionPlans,
    addSubscriptionPlan,
    updateSubscriptionPlan,
    togglePlanStatus,
    getCompanyCheckupSettings,
    saveCompanyCheckupSettings,
    getCompanyRecommendations,
    saveCompanyRecommendation,
    deleteCompanyRecommendation,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    getAllUsers
  };
};