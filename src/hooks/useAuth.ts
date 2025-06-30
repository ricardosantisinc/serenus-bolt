import { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Company, 
  CheckupResult, 
  CompanyCheckupSettings, 
  CompanyRecommendation,
  UserProfileUpdate,
  SubscriptionPlan 
} from '../types';
import { supabase } from '../lib/supabase';
import { getHighestSeverityLevel } from '../utils/dass21Calculator';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar e restaurar sessão ao iniciar
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        // Verificar se há uma sessão ativa
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao verificar sessão:', sessionError);
          return;
        }
        
        // Se há uma sessão ativa, buscar dados do usuário
        if (sessionData?.session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();
            
          if (userError || !userData) {
            console.error('Erro ao buscar dados do usuário:', userError);
            return;
          }
          
          // Carregar histórico de checkups do usuário
          const { data: checkupHistory, error: checkupError } = await supabase
            .from('checkup_results')
            .select('*')
            .eq('user_id', userData.id)
            .order('created_at', { ascending: false });
            
          if (!checkupError && checkupHistory) {
            // Converter datas e adicionar histórico ao usuário
            const processedHistory = checkupHistory.map(checkup => ({
              ...checkup,
              date: new Date(checkup.created_at),
              nextCheckupDate: new Date(checkup.next_checkup_date)
            }));
            
            userData.checkupHistory = processedHistory;
          }
          
          // Converter timestamps para objetos Date
          if (userData.last_checkup_date) {
            userData.lastCheckup = new Date(userData.last_checkup_date);
          }
          if (userData.next_checkup_date) {
            userData.nextCheckup = new Date(userData.next_checkup_date);
          }
          if (userData.created_at) {
            userData.createdAt = new Date(userData.created_at);
          }
          if (userData.updated_at) {
            userData.updatedAt = new Date(userData.updated_at);
          }
          
          // Mapear dados do banco para o formato do app
          const mappedUser: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            companyId: userData.company_id,
            department: userData.department,
            avatar: userData.avatar_url,
            lastCheckup: userData.lastCheckup,
            nextCheckup: userData.nextCheckup,
            isActive: userData.is_active,
            birthDate: userData.birth_date ? new Date(userData.birth_date) : undefined,
            gender: userData.gender,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            checkupHistory: userData.checkupHistory,
            permissions: [] // Será preenchido com base na role
          };
          
          // Atribuir permissões com base na role
          mappedUser.permissions = getPermissionsByRole(mappedUser.role);
          
          setUser(mappedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Função para fazer login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Autenticar usando Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Erro de login:', error.message);
        return false;
      }
      
      if (!data.user || !data.session) {
        console.error('Autenticação falhou: Dados do usuário não encontrados');
        return false;
      }
      
      // Buscar informações completas do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (userError || !userData) {
        console.error('Erro ao buscar dados do usuário:', userError);
        return false;
      }
      
      // Carregar histórico de checkups do usuário
      const { data: checkupHistory, error: checkupError } = await supabase
        .from('checkup_results')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });
        
      if (!checkupError && checkupHistory) {
        // Converter datas e adicionar histórico ao usuário
        const processedHistory = checkupHistory.map(checkup => ({
          ...checkup,
          date: new Date(checkup.created_at),
          nextCheckupDate: new Date(checkup.next_checkup_date)
        }));
        
        userData.checkupHistory = processedHistory;
      }
      
      // Converter timestamps para objetos Date
      if (userData.last_checkup_date) {
        userData.lastCheckup = new Date(userData.last_checkup_date);
      }
      if (userData.next_checkup_date) {
        userData.nextCheckup = new Date(userData.next_checkup_date);
      }
      if (userData.created_at) {
        userData.createdAt = new Date(userData.created_at);
      }
      if (userData.updated_at) {
        userData.updatedAt = new Date(userData.updated_at);
      }
      
      // Mapear dados do banco para o formato do app
      const mappedUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        companyId: userData.company_id,
        department: userData.department,
        avatar: userData.avatar_url,
        lastCheckup: userData.lastCheckup,
        nextCheckup: userData.nextCheckup,
        isActive: userData.is_active,
        birthDate: userData.birth_date ? new Date(userData.birth_date) : undefined,
        gender: userData.gender,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        checkupHistory: userData.checkupHistory,
        permissions: [] // Será preenchido com base na role
      };
      
      // Atribuir permissões com base na role
      mappedUser.permissions = getPermissionsByRole(mappedUser.role);
      
      setUser(mappedUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Erro inesperado durante login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para fazer logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error.message);
      }
    } catch (error) {
      console.error('Erro inesperado durante logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  // Função auxiliar para obter permissões com base na role
  const getPermissionsByRole = (role: User['role']): string[] => {
    switch (role) {
      case 'super_admin':
        return ['system_settings', 'view_all_data', 'manage_users', 'manage_companies'];
      case 'gerente':
        return ['manage_users', 'view_team_data'];
      case 'colaborador':
      default:
        return [];
    }
  };

  // Função para verificar permissão
  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    
    // Super admin tem todas as permissões
    if (user.role === 'super_admin') return true;
    
    // Verificar se o usuário tem a permissão específica
    return user.permissions.includes(permission);
  }, [user]);

  // Função para obter o nome amigável da role
  const getRoleDisplayName = useCallback((role: User['role']): string => {
    const roleNames: Record<string, string> = {
      'super_admin': 'Super Administrador',
      'gerente': 'Gerente',
      'colaborador': 'Colaborador'
    };
    
    return roleNames[role] || role;
  }, []);

  // Função para obter todas as empresas
  const getCompanies = useCallback(async (): Promise<Company[]> => {
    try {
      let query = supabase.from('companies').select('*');
      
      // Se não for super_admin, filtrar apenas a empresa do usuário
      if (user && user.role !== 'super_admin' && user.companyId) {
        query = query.eq('id', user.companyId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar empresas:', error.message);
        return [];
      }
      
      // Mapear dados do banco para o formato do app
      return data.map(company => ({
        id: company.id,
        name: company.name,
        domain: company.domain,
        contactPerson: company.contact_person,
        corporateEmail: company.corporate_email,
        landlinePhone: company.landline_phone,
        mobilePhone: company.mobile_phone,
        logo: company.logo_url,
        isActive: company.is_active,
        plan: company.plan_type,
        maxUsers: company.max_users,
        currentUsers: company.current_users,
        subscriptionPlanId: company.subscription_plan_id,
        createdAt: new Date(company.created_at)
      }));
    } catch (error) {
      console.error('Erro inesperado ao buscar empresas:', error);
      return [];
    }
  }, [user]);

  // Função para obter uma empresa pelo ID
  const getCompanyById = useCallback(async (companyId: string): Promise<Company | undefined> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar empresa:', error.message);
        return undefined;
      }
      
      // Mapear dados do banco para o formato do app
      return {
        id: data.id,
        name: data.name,
        domain: data.domain,
        contactPerson: data.contact_person,
        corporateEmail: data.corporate_email,
        landlinePhone: data.landline_phone,
        mobilePhone: data.mobile_phone,
        logo: data.logo_url,
        isActive: data.is_active,
        plan: data.plan_type,
        maxUsers: data.max_users,
        currentUsers: data.current_users,
        subscriptionPlanId: data.subscription_plan_id,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Erro inesperado ao buscar empresa:', error);
      return undefined;
    }
  }, []);

  // Função para registrar uma nova empresa
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
      // Verificar se já existe uma empresa com o mesmo domínio
      const { data: existingCompany, error: checkError } = await supabase
        .from('companies')
        .select('id')
        .eq('domain', companyData.domain)
        .single();
        
      if (existingCompany) {
        return {
          success: false,
          message: 'Já existe uma empresa registrada com este domínio.'
        };
      }
      
      // Se tiver logoData, fazer upload para o storage
      let logo_url = '/serenus.png';
      if (companyData.logoData) {
        try {
          // Gerar um nome de arquivo único
          const fileName = `company_logo_${Date.now()}.jpg`;
          
          // Fazer o upload para o bucket 'logos'
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('logos')
            .upload(fileName, companyData.logoData, {
              contentType: 'image/jpeg'
            });
            
          if (uploadError) {
            console.error('Erro ao fazer upload do logo:', uploadError);
          } else if (uploadData) {
            // Obter URL pública do logo
            const { data: urlData } = supabase
              .storage
              .from('logos')
              .getPublicUrl(fileName);
              
            if (urlData) {
              logo_url = urlData.publicUrl;
            }
          }
        } catch (logoError) {
          console.error('Erro ao processar logo da empresa:', logoError);
        }
      }
      
      // Criar a empresa no banco
      const { data: newCompany, error } = await supabase
        .from('companies')
        .insert([{
          name: companyData.name,
          domain: companyData.domain,
          contact_person: companyData.contactPerson,
          corporate_email: companyData.corporateEmail,
          landline_phone: companyData.landlinePhone,
          mobile_phone: companyData.mobilePhone,
          logo_url,
          is_active: true,
          plan_type: companyData.plan,
          max_users: companyData.maxUsers,
          current_users: 0
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao criar empresa:', error.message);
        return {
          success: false,
          message: 'Erro ao registrar empresa: ' + error.message
        };
      }
      
      // Criar configurações de checkup padrão para a empresa
      await supabase
        .from('company_checkup_settings')
        .insert([{
          company_id: newCompany.id,
          normal_interval_days: 90,
          severe_interval_days: 30,
          auto_reminders_enabled: true
        }]);
        
      // Criar recomendações padrão para a empresa
      await supabase
        .from('company_recommendations')
        .insert([
          {
            company_id: newCompany.id,
            title: 'Cuidados com a Saúde Mental',
            content: 'Incentivamos todos os colaboradores a reservarem ao menos 15 minutos diários para exercícios de respiração e mindfulness.',
            recommendation_type: 'mental_health',
            order_index: 0
          },
          {
            company_id: newCompany.id,
            title: 'Alimentação Saudável',
            content: 'Lembre-se de manter uma alimentação equilibrada com frutas e vegetais. Hidratação adequada também é fundamental para o bem-estar.',
            recommendation_type: 'nutrition',
            order_index: 1
          }
        ]);
      
      // Mapear dados do banco para o formato do app
      const mappedCompany: Company = {
        id: newCompany.id,
        name: newCompany.name,
        domain: newCompany.domain,
        contactPerson: newCompany.contact_person,
        corporateEmail: newCompany.corporate_email,
        landlinePhone: newCompany.landline_phone,
        mobilePhone: newCompany.mobile_phone,
        logo: newCompany.logo_url,
        isActive: newCompany.is_active,
        plan: newCompany.plan_type,
        maxUsers: newCompany.max_users,
        currentUsers: newCompany.current_users,
        createdAt: new Date(newCompany.created_at)
      };
      
      return {
        success: true,
        message: 'Empresa registrada com sucesso!',
        company: mappedCompany
      };
    } catch (error) {
      console.error('Erro inesperado ao registrar empresa:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao registrar a empresa. Tente novamente.'
      };
    }
  }, []);

  // Função para excluir uma empresa
  const deleteCompany = useCallback(async (companyId: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Verificar se a empresa existe
      const { data: company, error: checkError } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();
        
      if (checkError) {
        return {
          success: false,
          message: 'Empresa não encontrada.'
        };
      }
      
      const companyName = company.name;
      
      // Excluir a empresa (as políticas de CASCADE nas chaves estrangeiras 
      // garantem que todos os dados relacionados sejam excluídos)
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);
        
      if (error) {
        console.error('Erro ao excluir empresa:', error.message);
        return {
          success: false,
          message: 'Erro ao excluir empresa: ' + error.message
        };
      }
      
      return {
        success: true,
        message: `Empresa "${companyName}" excluída com sucesso.`
      };
    } catch (error) {
      console.error('Erro inesperado ao excluir empresa:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao excluir a empresa. Tente novamente.'
      };
    }
  }, []);

  // Função para registrar um novo usuário
  const registerUser = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    role: User['role'];
    department?: string;
    companyId: string;
  }): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      // Verificar se a empresa existe (se não for super_admin)
      if (userData.role !== 'super_admin' && userData.companyId) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('id', userData.companyId)
          .single();
          
        if (companyError) {
          return {
            success: false,
            message: 'Empresa não encontrada.'
          };
        }
      }
      
      // Primeiro, criar o usuário na autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });
      
      if (authError) {
        console.error('Erro ao criar usuário na autenticação:', authError.message);
        return {
          success: false,
          message: 'Erro ao criar usuário: ' + authError.message
        };
      }
      
      if (!authData.user) {
        return {
          success: false,
          message: 'Falha ao criar usuário. Tente novamente.'
        };
      }
      
      // Depois, criar o registro do usuário na tabela users
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          name: userData.name,
          email: userData.email.toLowerCase(),
          role: userData.role,
          company_id: userData.role === 'super_admin' ? null : userData.companyId,
          department: userData.role === 'super_admin' ? null : userData.department,
          is_active: true
        }])
        .select()
        .single();
        
      if (userError) {
        console.error('Erro ao criar registro de usuário:', userError.message);
        
        // Tentar excluir o usuário da autenticação para evitar inconsistências
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (e) {
          console.error('Erro ao excluir usuário da autenticação após falha:', e);
        }
        
        return {
          success: false,
          message: 'Erro ao criar registro de usuário: ' + userError.message
        };
      }
      
      // Se não for super_admin, incrementar o contador de usuários da empresa
      if (userData.role !== 'super_admin' && userData.companyId) {
        await supabase.rpc('increment_company_users', { 
          company_id: userData.companyId 
        });
      }
      
      // Mapear dados do banco para o formato do app
      const mappedUser: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyId: newUser.company_id,
        department: newUser.department,
        avatar: newUser.avatar_url,
        isActive: newUser.is_active,
        createdAt: new Date(newUser.created_at),
        updatedAt: new Date(newUser.updated_at),
        permissions: getPermissionsByRole(newUser.role)
      };
      
      return {
        success: true,
        message: 'Usuário registrado com sucesso!',
        user: mappedUser
      };
    } catch (error) {
      console.error('Erro inesperado ao registrar usuário:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao registrar o usuário. Tente novamente.'
      };
    }
  }, []);

  // Função para salvar resultado de checkup
  const saveCheckupResult = useCallback(async (checkupResult: CheckupResult): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Mapear resultado para o formato do banco
      const mappedResult = {
        user_id: checkupResult.userId,
        company_id: checkupResult.companyId,
        responses: checkupResult.responses,
        scores: checkupResult.scores,
        classifications: checkupResult.classifications,
        overall_score: checkupResult.overallScore,
        severity_level: checkupResult.severityLevel,
        next_checkup_date: checkupResult.nextCheckupDate,
        // Dados do IAS
        ias_responses: checkupResult.iasResponses,
        ias_total_score: checkupResult.iasTotalScore,
        ias_classification: checkupResult.iasClassification,
        // Dados combinados
        combined_recommended_paths: checkupResult.combinedRecommendedPaths,
        combined_psychologist_referral_needed: checkupResult.combinedPsychologistReferralNeeded,
        combined_justification: checkupResult.combinedJustification,
        combined_critical_level: checkupResult.combinedCriticalLevel,
        combined_recommendations: checkupResult.combinedRecommendations
      };
      
      // Inserir no banco de dados
      const { error } = await supabase
        .from('checkup_results')
        .insert([mappedResult]);
        
      if (error) {
        console.error('Erro ao salvar resultado de checkup:', error.message);
        return false;
      }
      
      // Recarregar dados do usuário para obter as novas datas de checkup
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!userError && userData) {
          // Converter datas
          const updatedUser = { ...user };
          
          if (userData.last_checkup_date) {
            updatedUser.lastCheckup = new Date(userData.last_checkup_date);
          }
          
          if (userData.next_checkup_date) {
            updatedUser.nextCheckup = new Date(userData.next_checkup_date);
          }
          
          setUser(updatedUser);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao salvar resultado de checkup:', error);
      return false;
    }
  }, [user]);

  // Função para obter configurações de checkup de uma empresa
  const getCompanyCheckupSettings = useCallback(async (companyId: string): Promise<CompanyCheckupSettings | null> => {
    try {
      const { data, error } = await supabase
        .from('company_checkup_settings')
        .select('*')
        .eq('company_id', companyId)
        .single();
        
      if (error) {
        console.error('Erro ao obter configurações de checkup:', error.message);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      // Mapear dados do banco para o formato do app
      return {
        id: data.id,
        companyId: data.company_id,
        normalIntervalDays: data.normal_interval_days,
        severeIntervalDays: data.severe_interval_days,
        autoRemindersEnabled: data.auto_reminders_enabled,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Erro inesperado ao obter configurações de checkup:', error);
      return null;
    }
  }, []);

  // Função para salvar configurações de checkup de uma empresa
  const saveCompanyCheckupSettings = useCallback(async (settings: Omit<CompanyCheckupSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string }> => {
    try {
      const companyId = settings.companyId;
      
      // Verificar se a empresa existe
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .single();
        
      if (companyError) {
        return {
          success: false,
          message: 'Empresa não encontrada.'
        };
      }
      
      // Verificar se já existem configurações para a empresa
      const { data: existingSettings, error: settingsError } = await supabase
        .from('company_checkup_settings')
        .select('id')
        .eq('company_id', companyId)
        .single();
        
      let result;
      
      if (!settingsError && existingSettings) {
        // Atualizar configurações existentes
        result = await supabase
          .from('company_checkup_settings')
          .update({
            normal_interval_days: settings.normalIntervalDays,
            severe_interval_days: settings.severeIntervalDays,
            auto_reminders_enabled: settings.autoRemindersEnabled,
            updated_at: new Date()
          })
          .eq('company_id', companyId);
      } else {
        // Criar novas configurações
        result = await supabase
          .from('company_checkup_settings')
          .insert([{
            company_id: companyId,
            normal_interval_days: settings.normalIntervalDays,
            severe_interval_days: settings.severeIntervalDays,
            auto_reminders_enabled: settings.autoRemindersEnabled
          }]);
      }
      
      if (result.error) {
        console.error('Erro ao salvar configurações de checkup:', result.error.message);
        return {
          success: false,
          message: 'Erro ao salvar configurações de checkup: ' + result.error.message
        };
      }
      
      return {
        success: true,
        message: 'Configurações de checkup salvas com sucesso!'
      };
    } catch (error) {
      console.error('Erro inesperado ao salvar configurações de checkup:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao salvar as configurações. Tente novamente.'
      };
    }
  }, []);

  // Função para obter recomendações de uma empresa
  const getCompanyRecommendations = useCallback(async (companyId: string): Promise<CompanyRecommendation[]> => {
    try {
      const { data, error } = await supabase
        .from('company_recommendations')
        .select('*')
        .eq('company_id', companyId)
        .order('order_index', { ascending: true });
        
      if (error) {
        console.error('Erro ao obter recomendações da empresa:', error.message);
        return [];
      }
      
      if (!data) {
        return [];
      }
      
      // Mapear dados do banco para o formato do app
      return data.map(recommendation => ({
        id: recommendation.id,
        companyId: recommendation.company_id,
        title: recommendation.title,
        content: recommendation.content,
        recommendationType: recommendation.recommendation_type,
        orderIndex: recommendation.order_index,
        createdAt: new Date(recommendation.created_at),
        updatedAt: new Date(recommendation.updated_at)
      }));
    } catch (error) {
      console.error('Erro inesperado ao obter recomendações da empresa:', error);
      return [];
    }
  }, []);

  // Função para salvar uma recomendação de empresa
  const saveCompanyRecommendation = useCallback(async (recommendation: Omit<CompanyRecommendation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<{ success: boolean; message: string; recommendation?: CompanyRecommendation }> => {
    try {
      const companyId = recommendation.companyId;
      
      // Verificar se a empresa existe
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .single();
        
      if (companyError) {
        return {
          success: false,
          message: 'Empresa não encontrada.'
        };
      }
      
      let result;
      
      if (recommendation.id) {
        // Atualização
        result = await supabase
          .from('company_recommendations')
          .update({
            title: recommendation.title,
            content: recommendation.content,
            recommendation_type: recommendation.recommendationType,
            order_index: recommendation.orderIndex,
            updated_at: new Date()
          })
          .eq('id', recommendation.id)
          .select()
          .single();
      } else {
        // Criação
        result = await supabase
          .from('company_recommendations')
          .insert([{
            company_id: recommendation.companyId,
            title: recommendation.title,
            content: recommendation.content,
            recommendation_type: recommendation.recommendationType,
            order_index: recommendation.orderIndex
          }])
          .select()
          .single();
      }
      
      if (result.error) {
        console.error('Erro ao salvar recomendação:', result.error.message);
        return {
          success: false,
          message: 'Erro ao salvar recomendação: ' + result.error.message
        };
      }
      
      // Mapear dados do banco para o formato do app
      const savedRecommendation: CompanyRecommendation = {
        id: result.data.id,
        companyId: result.data.company_id,
        title: result.data.title,
        content: result.data.content,
        recommendationType: result.data.recommendation_type,
        orderIndex: result.data.order_index,
        createdAt: new Date(result.data.created_at),
        updatedAt: new Date(result.data.updated_at)
      };
      
      return {
        success: true,
        message: recommendation.id ? 'Recomendação atualizada com sucesso!' : 'Recomendação criada com sucesso!',
        recommendation: savedRecommendation
      };
    } catch (error) {
      console.error('Erro inesperado ao salvar recomendação:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao salvar a recomendação. Tente novamente.'
      };
    }
  }, []);

  // Função para excluir uma recomendação de empresa
  const deleteCompanyRecommendation = useCallback(async (id: string, companyId: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Verificar se a recomendação existe e pertence à empresa
      const { data: recommendation, error: checkError } = await supabase
        .from('company_recommendations')
        .select('id')
        .eq('id', id)
        .eq('company_id', companyId)
        .single();
        
      if (checkError) {
        return {
          success: false,
          message: 'Recomendação não encontrada ou não pertence a esta empresa.'
        };
      }
      
      // Excluir a recomendação
      const { error } = await supabase
        .from('company_recommendations')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Erro ao excluir recomendação:', error.message);
        return {
          success: false,
          message: 'Erro ao excluir recomendação: ' + error.message
        };
      }
      
      return {
        success: true,
        message: 'Recomendação excluída com sucesso!'
      };
    } catch (error) {
      console.error('Erro inesperado ao excluir recomendação:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao excluir a recomendação. Tente novamente.'
      };
    }
  }, []);

  // Função para atualizar perfil do usuário
  const updateProfile = useCallback(async (profileData: UserProfileUpdate): Promise<{ success: boolean; message: string }> => {
    try {
      if (!user) {
        return {
          success: false,
          message: 'Usuário não autenticado.'
        };
      }
      
      // Preparar dados para atualização
      const updateData: any = {
        name: profileData.name,
        updated_at: new Date()
      };
      
      if (profileData.birthDate) {
        updateData.birth_date = profileData.birthDate;
      }
      
      if (profileData.gender) {
        updateData.gender = profileData.gender;
      }
      
      // Atualizar dados do perfil
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) {
        console.error('Erro ao atualizar perfil:', error.message);
        return {
          success: false,
          message: 'Erro ao atualizar perfil: ' + error.message
        };
      }
      
      // Se estiver alterando a senha
      if (profileData.currentPassword && profileData.newPassword && profileData.confirmPassword) {
        // Verificar se as senhas coincidem
        if (profileData.newPassword !== profileData.confirmPassword) {
          return {
            success: false,
            message: 'A confirmação de senha não coincide.'
          };
        }
        
        const { error: passwordError } = await supabase.auth.updateUser({
          password: profileData.newPassword
        });
        
        if (passwordError) {
          console.error('Erro ao atualizar senha:', passwordError.message);
          return {
            success: false,
            message: 'Erro ao atualizar senha: ' + passwordError.message
          };
        }
      }
      
      // Atualizar usuário no state
      const updatedUser = { ...user, name: profileData.name };
      if (profileData.birthDate) updatedUser.birthDate = profileData.birthDate;
      if (profileData.gender) updatedUser.gender = profileData.gender;
      setUser(updatedUser);
      
      return {
        success: true,
        message: 'Perfil atualizado com sucesso!'
      };
    } catch (error) {
      console.error('Erro inesperado ao atualizar perfil:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao atualizar o perfil. Tente novamente.'
      };
    }
  }, [user]);

  // Função para obter planos de assinatura
  const getSubscriptionPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('value', { ascending: true });
        
      if (error) {
        console.error('Erro ao obter planos de assinatura:', error.message);
        return [];
      }
      
      if (!data) {
        return [];
      }
      
      // Mapear dados do banco para o formato do app
      return data.map(plan => ({
        id: plan.id,
        name: plan.name,
        value: plan.value,
        periodicity: plan.periodicity,
        features: plan.features,
        description: plan.description,
        isActive: plan.is_active,
        createdAt: new Date(plan.created_at)
      }));
    } catch (error) {
      console.error('Erro inesperado ao obter planos de assinatura:', error);
      return [];
    }
  }, []);

  // Função para adicionar plano de assinatura
  const addSubscriptionPlan = useCallback(async (planData: {
    name: string;
    value: number;
    periodicity: SubscriptionPlan['periodicity'];
    features: string[];
    description?: string;
  }): Promise<{ success: boolean; message: string; plan?: SubscriptionPlan }> => {
    try {
      // Inserir plano no banco
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([{
          name: planData.name,
          value: planData.value,
          periodicity: planData.periodicity,
          features: planData.features,
          description: planData.description,
          is_active: true
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao adicionar plano de assinatura:', error.message);
        return {
          success: false,
          message: 'Erro ao adicionar plano: ' + error.message
        };
      }
      
      // Mapear dados do banco para o formato do app
      const newPlan: SubscriptionPlan = {
        id: data.id,
        name: data.name,
        value: data.value,
        periodicity: data.periodicity,
        features: data.features,
        description: data.description,
        isActive: data.is_active,
        createdAt: new Date(data.created_at)
      };
      
      return {
        success: true,
        message: 'Plano de assinatura criado com sucesso!',
        plan: newPlan
      };
    } catch (error) {
      console.error('Erro inesperado ao adicionar plano de assinatura:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao adicionar o plano. Tente novamente.'
      };
    }
  }, []);

  // Função para atualizar plano de assinatura
  const updateSubscriptionPlan = useCallback(async (planId: string, planData: {
    name: string;
    value: number;
    periodicity: SubscriptionPlan['periodicity'];
    features: string[];
    description?: string;
  }): Promise<{ success: boolean; message: string; plan?: SubscriptionPlan }> => {
    try {
      // Atualizar plano no banco
      const { data, error } = await supabase
        .from('subscription_plans')
        .update({
          name: planData.name,
          value: planData.value,
          periodicity: planData.periodicity,
          features: planData.features,
          description: planData.description
        })
        .eq('id', planId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao atualizar plano de assinatura:', error.message);
        return {
          success: false,
          message: 'Erro ao atualizar plano: ' + error.message
        };
      }
      
      // Mapear dados do banco para o formato do app
      const updatedPlan: SubscriptionPlan = {
        id: data.id,
        name: data.name,
        value: data.value,
        periodicity: data.periodicity,
        features: data.features,
        description: data.description,
        isActive: data.is_active,
        createdAt: new Date(data.created_at)
      };
      
      return {
        success: true,
        message: 'Plano de assinatura atualizado com sucesso!',
        plan: updatedPlan
      };
    } catch (error) {
      console.error('Erro inesperado ao atualizar plano de assinatura:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao atualizar o plano. Tente novamente.'
      };
    }
  }, []);

  // Função para alternar status do plano de assinatura
  const togglePlanStatus = useCallback(async (planId: string): Promise<{ success: boolean; message: string; plan?: SubscriptionPlan }> => {
    try {
      // Primeiro, obter o status atual do plano
      const { data: currentPlan, error: fetchError } = await supabase
        .from('subscription_plans')
        .select('is_active')
        .eq('id', planId)
        .single();
        
      if (fetchError) {
        console.error('Erro ao obter plano de assinatura:', fetchError.message);
        return {
          success: false,
          message: 'Plano de assinatura não encontrado.'
        };
      }
      
      // Alternar o status
      const newStatus = !currentPlan.is_active;
      
      // Atualizar status no banco
      const { data, error } = await supabase
        .from('subscription_plans')
        .update({
          is_active: newStatus
        })
        .eq('id', planId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao alternar status do plano:', error.message);
        return {
          success: false,
          message: 'Erro ao alternar status do plano: ' + error.message
        };
      }
      
      // Mapear dados do banco para o formato do app
      const updatedPlan: SubscriptionPlan = {
        id: data.id,
        name: data.name,
        value: data.value,
        periodicity: data.periodicity,
        features: data.features,
        description: data.description,
        isActive: data.is_active,
        createdAt: new Date(data.created_at)
      };
      
      return {
        success: true,
        message: `Plano de assinatura ${newStatus ? 'ativado' : 'desativado'} com sucesso!`,
        plan: updatedPlan
      };
    } catch (error) {
      console.error('Erro inesperado ao alternar status do plano:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao alternar o status do plano. Tente novamente.'
      };
    }
  }, []);

  // Função para criar usuário
  const createUser = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    role: User['role'];
    department?: string;
    companyId?: string;
  }) => {
    try {
      // Verificar se a empresa existe (se não for super_admin)
      if (userData.role !== 'super_admin' && userData.companyId) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('id', userData.companyId)
          .single();
          
        if (companyError) {
          return {
            success: false,
            message: 'Empresa não encontrada.'
          };
        }
      }
      
      // Primeiro, criar o usuário na autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          name: userData.name,
          role: userData.role
        },
        email_confirm: true // Auto-confirmar email para fins de demo
      });
      
      if (authError) {
        console.error('Erro ao criar usuário na autenticação:', authError.message);
        return {
          success: false,
          message: 'Erro ao criar usuário: ' + authError.message
        };
      }
      
      if (!authData.user) {
        return {
          success: false,
          message: 'Falha ao criar usuário. Tente novamente.'
        };
      }
      
      // Depois, criar o registro do usuário na tabela users
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          name: userData.name,
          email: userData.email.toLowerCase(),
          role: userData.role,
          company_id: userData.role === 'super_admin' ? null : userData.companyId,
          department: userData.role === 'super_admin' ? null : userData.department,
          is_active: true
        }])
        .select()
        .single();
        
      if (userError) {
        console.error('Erro ao criar registro de usuário:', userError.message);
        
        // Tentar excluir o usuário da autenticação para evitar inconsistências
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (e) {
          console.error('Erro ao excluir usuário da autenticação após falha:', e);
        }
        
        return {
          success: false,
          message: 'Erro ao criar registro de usuário: ' + userError.message
        };
      }
      
      // Se não for super_admin, incrementar o contador de usuários da empresa
      if (userData.role !== 'super_admin' && userData.companyId) {
        await supabase.rpc('increment_company_users', { 
          company_id: userData.companyId 
        });
      }
      
      // Mapear dados do banco para o formato do app
      const mappedUser: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyId: newUser.company_id,
        department: newUser.department,
        avatar: newUser.avatar_url,
        isActive: newUser.is_active,
        createdAt: new Date(newUser.created_at),
        updatedAt: new Date(newUser.updated_at),
        permissions: getPermissionsByRole(newUser.role)
      };
      
      return {
        success: true,
        message: 'Usuário criado com sucesso!',
        user: mappedUser
      };
    } catch (error) {
      console.error('Erro inesperado ao criar usuário:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao criar o usuário. Tente novamente.'
      };
    }
  }, []);

  // Função para atualizar usuário
  const updateUser = useCallback(async (userId: string, userData: {
    name: string;
    email: string;
    role: User['role'];
    department?: string;
    companyId?: string;
    password?: string;
  }) => {
    try {
      // Não permitir atualizar o próprio usuário
      if (user && user.id === userId) {
        return {
          success: false,
          message: 'Você não pode atualizar seu próprio usuário por esta interface.'
        };
      }
      
      // Verificar se o usuário existe
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, role, company_id, email')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Erro ao buscar usuário:', userError.message);
        return {
          success: false,
          message: 'Usuário não encontrado.'
        };
      }
      
      // Verificar permissão para atualizar super_admin
      if (existingUser.role === 'super_admin' && user?.role !== 'super_admin') {
        return {
          success: false,
          message: 'Você não tem permissão para atualizar um Super Administrador.'
        };
      }
      
      // Se o email foi alterado, verificar se já está em uso
      if (existingUser.email !== userData.email.toLowerCase()) {
        const { data: emailCheck, error: emailError } = await supabase
          .from('users')
          .select('id')
          .eq('email', userData.email.toLowerCase())
          .neq('id', userId)
          .single();
          
        if (emailCheck) {
          return {
            success: false,
            message: 'Este email já está em uso por outro usuário.'
          };
        }
      }
      
      // Verificar se a empresa existe (se não for super_admin)
      if (userData.role !== 'super_admin' && userData.companyId) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('id', userData.companyId)
          .single();
          
        if (companyError) {
          return {
            success: false,
            message: 'Empresa não encontrada.'
          };
        }
      }
      
      // Preparar dados para atualização
      const updateData: any = {
        name: userData.name,
        email: userData.email.toLowerCase(),
        role: userData.role,
        company_id: userData.role === 'super_admin' ? null : userData.companyId,
        department: userData.role === 'super_admin' ? null : userData.department,
        updated_at: new Date()
      };
      
      // Atualizar usuário no banco
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
        
      if (updateError) {
        console.error('Erro ao atualizar usuário:', updateError.message);
        return {
          success: false,
          message: 'Erro ao atualizar usuário: ' + updateError.message
        };
      }
      
      // Se mudou de empresa, atualizar contadores
      if (existingUser.company_id !== updateData.company_id) {
        // Decrementar contador da empresa antiga
        if (existingUser.company_id) {
          await supabase.rpc('decrement_company_users', { 
            company_id: existingUser.company_id 
          });
        }
        
        // Incrementar contador da nova empresa
        if (updateData.company_id) {
          await supabase.rpc('increment_company_users', { 
            company_id: updateData.company_id 
          });
        }
      }
      
      // Se a senha foi fornecida, atualizá-la
      if (userData.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          userId,
          { password: userData.password }
        );
        
        if (passwordError) {
          console.error('Erro ao atualizar senha:', passwordError.message);
          return {
            success: false,
            message: 'Usuário atualizado, mas ocorreu um erro ao atualizar a senha: ' + passwordError.message
          };
        }
      }
      
      // Mapear dados do banco para o formato do app
      const mappedUser: User = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        companyId: updatedUser.company_id,
        department: updatedUser.department,
        avatar: updatedUser.avatar_url,
        isActive: updatedUser.is_active,
        createdAt: new Date(updatedUser.created_at),
        updatedAt: new Date(updatedUser.updated_at),
        permissions: getPermissionsByRole(updatedUser.role)
      };
      
      return {
        success: true,
        message: 'Usuário atualizado com sucesso!',
        user: mappedUser
      };
    } catch (error) {
      console.error('Erro inesperado ao atualizar usuário:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao atualizar o usuário. Tente novamente.'
      };
    }
  }, [user]);

  // Função para alternar status do usuário (ativo/inativo)
  const toggleUserStatus = useCallback(async (userId: string) => {
    try {
      // Não permitir alternar o próprio status
      if (user && user.id === userId) {
        return {
          success: false,
          message: 'Você não pode alterar seu próprio status.'
        };
      }
      
      // Verificar se o usuário existe
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, role, is_active')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Erro ao buscar usuário:', userError.message);
        return {
          success: false,
          message: 'Usuário não encontrado.'
        };
      }
      
      // Verificar permissão para alterar super_admin
      if (existingUser.role === 'super_admin' && user?.role !== 'super_admin') {
        return {
          success: false,
          message: 'Você não tem permissão para alterar o status de um Super Administrador.'
        };
      }
      
      // Alternar status
      const newStatus = !existingUser.is_active;
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          is_active: newStatus,
          updated_at: new Date()
        })
        .eq('id', userId)
        .select()
        .single();
        
      if (updateError) {
        console.error('Erro ao alternar status do usuário:', updateError.message);
        return {
          success: false,
          message: 'Erro ao alternar status do usuário: ' + updateError.message
        };
      }
      
      // Desativar usuário na autenticação, se necessário
      if (!newStatus) {
        await supabase.auth.admin.updateUserById(
          userId,
          { ban_duration: '87600h' } // ~10 anos (valor alto para "ban permanente")
        );
      } else {
        // Reativar usuário na autenticação
        await supabase.auth.admin.updateUserById(
          userId,
          { ban_duration: null }
        );
      }
      
      // Mapear dados do banco para o formato do app
      const mappedUser: User = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        companyId: updatedUser.company_id,
        department: updatedUser.department,
        avatar: updatedUser.avatar_url,
        isActive: updatedUser.is_active,
        createdAt: new Date(updatedUser.created_at),
        updatedAt: new Date(updatedUser.updated_at),
        permissions: getPermissionsByRole(updatedUser.role)
      };
      
      return {
        success: true,
        message: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso!`,
        user: mappedUser
      };
    } catch (error) {
      console.error('Erro inesperado ao alternar status do usuário:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao alternar o status do usuário. Tente novamente.'
      };
    }
  }, [user]);

  // Função para excluir usuário
  const deleteUser = useCallback(async (userId: string) => {
    try {
      // Não permitir excluir o próprio usuário
      if (user && user.id === userId) {
        return {
          success: false,
          message: 'Você não pode excluir seu próprio usuário.'
        };
      }
      
      // Verificar se o usuário existe
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, role, company_id')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Erro ao buscar usuário:', userError.message);
        return {
          success: false,
          message: 'Usuário não encontrado.'
        };
      }
      
      // Verificar permissão para excluir super_admin
      if (existingUser.role === 'super_admin' && user?.role !== 'super_admin') {
        return {
          success: false,
          message: 'Você não tem permissão para excluir um Super Administrador.'
        };
      }
      
      // Decrementar contador da empresa, se aplicável
      if (existingUser.company_id) {
        await supabase.rpc('decrement_company_users', { 
          company_id: existingUser.company_id 
        });
      }
      
      // Excluir usuário da tabela users
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
        
      if (deleteError) {
        console.error('Erro ao excluir usuário da tabela:', deleteError.message);
        return {
          success: false,
          message: 'Erro ao excluir usuário: ' + deleteError.message
        };
      }
      
      // Excluir usuário da autenticação
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authDeleteError) {
        console.error('Erro ao excluir usuário da autenticação:', authDeleteError.message);
        // Não retornamos erro aqui pois o usuário já foi excluído da tabela
      }
      
      return {
        success: true,
        message: 'Usuário excluído com sucesso!'
      };
    } catch (error) {
      console.error('Erro inesperado ao excluir usuário:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao excluir o usuário. Tente novamente.'
      };
    }
  }, [user]);

  // Função para obter todos os usuários
  const getAllUsers = useCallback(async () => {
    try {
      let query = supabase.from('users').select('*');
      
      // Se não for super_admin, filtrar apenas usuários da mesma empresa
      if (user && user.role !== 'super_admin' && user.companyId) {
        query = query.eq('company_id', user.companyId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar usuários:', error.message);
        return [];
      }
      
      if (!data) {
        return [];
      }
      
      // Mapear dados do banco para o formato do app
      return data.map(userData => ({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        companyId: userData.company_id,
        department: userData.department,
        avatar: userData.avatar_url,
        lastCheckup: userData.last_checkup_date ? new Date(userData.last_checkup_date) : undefined,
        nextCheckup: userData.next_checkup_date ? new Date(userData.next_checkup_date) : undefined,
        isActive: userData.is_active,
        birthDate: userData.birth_date ? new Date(userData.birth_date) : undefined,
        gender: userData.gender,
        createdAt: new Date(userData.created_at),
        updatedAt: userData.updated_at ? new Date(userData.updated_at) : undefined,
        permissions: getPermissionsByRole(userData.role)
      }));
    } catch (error) {
      console.error('Erro inesperado ao buscar todos os usuários:', error);
      return [];
    }
  }, [user]);

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