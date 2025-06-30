import { useState, useEffect, useCallback } from 'react';
import { User, Company, CheckupResult, CompanyCheckupSettings, UserProfileUpdate, SubscriptionPlan, CompanyRecommendation } from '../types';
import { supabase } from '../lib/supabase';
import { validateEmail, validatePassword, getRoleDisplayName as getRoleLabel } from '../utils/userValidation';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicialização e carregamento da sessão
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Obter sessão atual do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Buscar dados completos do usuário na tabela users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userError) {
            console.error('Erro ao buscar dados do usuário:', userError);
            setUser(null);
          } else if (userData) {
            // Converter o formato dos dados do banco para o formato esperado pelo app
            const appUser: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              companyId: userData.company_id,
              department: userData.department,
              avatar: userData.avatar_url,
              lastCheckup: userData.last_checkup_date ? new Date(userData.last_checkup_date) : undefined,
              nextCheckup: userData.next_checkup_date ? new Date(userData.next_checkup_date) : undefined,
              permissions: [],
              isActive: userData.is_active,
              createdAt: userData.created_at ? new Date(userData.created_at) : undefined,
              updatedAt: userData.updated_at ? new Date(userData.updated_at) : undefined
            };
            
            setUser(appUser);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Configurar listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Buscar dados completos do usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (!userError && userData) {
          const appUser: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            companyId: userData.company_id,
            department: userData.department,
            avatar: userData.avatar_url,
            lastCheckup: userData.last_checkup_date ? new Date(userData.last_checkup_date) : undefined,
            nextCheckup: userData.next_checkup_date ? new Date(userData.next_checkup_date) : undefined,
            permissions: [],
            isActive: userData.is_active,
            createdAt: userData.created_at ? new Date(userData.created_at) : undefined,
            updatedAt: userData.updated_at ? new Date(userData.updated_at) : undefined
          };
          
          setUser(appUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    // Limpar subscription ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Autenticar com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Erro ao fazer login:', error.message);
        return false;
      }
      
      if (!data.session) {
        console.error('Login falhou: Nenhuma sessão retornada');
        return false;
      }

      // O usuário será carregado pelo onAuthStateChange listener
      return true;
      
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
      } else {
        setUser(null);
      }
      
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar perfil do usuário
  const updateProfile = useCallback(async (profileData: UserProfileUpdate): Promise<{ success: boolean; message: string }> => {
    try {
      if (!user) {
        return { success: false, message: 'Usuário não autenticado' };
      }
      
      setIsLoading(true);
      
      // Se estiver alterando a senha, verificar a senha atual
      if (profileData.currentPassword && profileData.newPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: profileData.currentPassword
        });
        
        if (signInError) {
          return { success: false, message: 'Senha atual incorreta' };
        }
        
        // Atualizar senha no Supabase Auth
        const { error: passwordError } = await supabase.auth.updateUser({
          password: profileData.newPassword
        });
        
        if (passwordError) {
          return { success: false, message: `Erro ao atualizar senha: ${passwordError.message}` };
        }
      }
      
      // Preparar dados para atualização
      const updateData: any = {
        name: profileData.name
      };
      
      if (profileData.birthDate) {
        updateData.birth_date = profileData.birthDate.toISOString().split('T')[0];
      }
      
      if (profileData.gender) {
        updateData.gender = profileData.gender;
      }
      
      // Atualizar perfil no Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);
        
      if (updateError) {
        return { success: false, message: `Erro ao atualizar perfil: ${updateError.message}` };
      }
      
      // Atualizar usuário no estado
      setUser(prev => prev ? {
        ...prev,
        name: profileData.name,
        birthDate: profileData.birthDate,
        gender: profileData.gender,
        updatedAt: new Date()
      } : null);
      
      return { success: true, message: 'Perfil atualizado com sucesso' };
      
    } catch (error) {
      return { success: false, message: `Erro interno: ${error instanceof Error ? error.message : 'Desconhecido'}` };
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
  const getCompanies = useCallback(async (): Promise<Company[]> => {
    try {
      // Buscar empresas do Supabase
      const { data, error } = await supabase
        .from('companies')
        .select('*');
        
      if (error) {
        console.error('Erro ao buscar empresas:', error);
        return [];
      }
      
      // Converter formato dos dados
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
        createdAt: new Date(company.created_at),
        updatedAt: company.updated_at ? new Date(company.updated_at) : undefined,
        subscriptionPlanId: company.subscription_plan_id
      }));
      
    } catch (error) {
      console.error('Erro ao obter empresas:', error);
      return [];
    }
  }, []);

  // Obter empresa por ID
  const getCompanyById = useCallback(async (companyId: string): Promise<Company | undefined> => {
    try {
      // Buscar empresa do Supabase
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar empresa:', error);
        return undefined;
      }
      
      // Converter formato dos dados
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
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        subscriptionPlanId: data.subscription_plan_id
      };
      
    } catch (error) {
      console.error('Erro ao obter empresa:', error);
      return undefined;
    }
  }, []);

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
      
      // Validações
      if (!companyData.name || !companyData.domain || !companyData.contactPerson || 
          !companyData.corporateEmail || !companyData.mobilePhone) {
        return { success: false, message: 'Todos os campos obrigatórios devem ser preenchidos' };
      }

      if (!validateEmail(companyData.corporateEmail)) {
        return { success: false, message: 'Email corporativo inválido' };
      }

      // Verificar se domínio já existe
      const { data: existingCompany, error: checkError } = await supabase
        .from('companies')
        .select('id')
        .eq('domain', companyData.domain)
        .single();
        
      if (!checkError && existingCompany) {
        return { success: false, message: 'Domínio já está em uso' };
      }
      
      // Preparar dados para inserção
      const insertData = {
        name: companyData.name,
        domain: companyData.domain,
        contact_person: companyData.contactPerson,
        corporate_email: companyData.corporateEmail,
        landline_phone: companyData.landlinePhone,
        mobile_phone: companyData.mobilePhone,
        logo_url: companyData.logoData ? `data:image/jpeg;base64,${companyData.logoData}` : '/serenus.png',
        is_active: true,
        plan_type: companyData.plan,
        max_users: companyData.maxUsers,
        current_users: 0
      };
      
      // Inserir empresa no Supabase
      const { data: newCompanyData, error: insertError } = await supabase
        .from('companies')
        .insert([insertData])
        .select()
        .single();
        
      if (insertError) {
        console.error('Erro ao inserir empresa:', insertError);
        return { success: false, message: `Erro ao registrar empresa: ${insertError.message}` };
      }
      
      // Converter formato dos dados para o formato da aplicação
      const newCompany: Company = {
        id: newCompanyData.id,
        name: newCompanyData.name,
        domain: newCompanyData.domain,
        contactPerson: newCompanyData.contact_person,
        corporateEmail: newCompanyData.corporate_email,
        landlinePhone: newCompanyData.landline_phone,
        mobilePhone: newCompanyData.mobile_phone,
        logo: newCompanyData.logo_url,
        isActive: newCompanyData.is_active,
        plan: newCompanyData.plan_type,
        maxUsers: newCompanyData.max_users,
        currentUsers: newCompanyData.current_users,
        createdAt: new Date(newCompanyData.created_at),
        updatedAt: newCompanyData.updated_at ? new Date(newCompanyData.updated_at) : undefined
      };

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
            title: 'Cuidando da Saúde Mental',
            content: 'Pratique técnicas de respiração diariamente para reduzir o estresse. Reserve momentos para atividades prazerosas e desconexão digital. Considere a meditação como parte da sua rotina.',
            recommendation_type: 'mental_health',
            order_index: 1
          },
          {
            company_id: newCompany.id,
            title: 'Alimentação Saudável',
            content: 'Mantenha uma dieta equilibrada com frutas, vegetais e proteínas magras. Hidrate-se adequadamente bebendo pelo menos 2 litros de água por dia. Evite alimentos ultraprocessados e excesso de açúcar.',
            recommendation_type: 'nutrition',
            order_index: 2
          }
        ]);

      return { success: true, message: 'Empresa cadastrada com sucesso!', company: newCompany };
      
    } catch (error) {
      console.error('Erro ao registrar empresa:', error);
      return { success: false, message: `Erro ao registrar empresa: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Excluir empresa
  const deleteCompany = useCallback(async (companyId: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      
      // Verificar se a empresa existe
      const { data: company, error: checkError } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();
        
      if (checkError) {
        return { success: false, message: 'Empresa não encontrada' };
      }
      
      // Excluir empresa
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);
        
      if (deleteError) {
        console.error('Erro ao excluir empresa:', deleteError);
        return { success: false, message: `Erro ao excluir empresa: ${deleteError.message}` };
      }

      return { success: true, message: `Empresa "${company.name}" excluída com sucesso!` };
      
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      return { success: false, message: `Erro ao excluir empresa: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, []);

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

      // Verificar se a empresa existe
      if (userData.companyId) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('id', userData.companyId)
          .single();
          
        if (companyError || !company) {
          return { success: false, message: 'Empresa não encontrada' };
        }
      }

      // Criar usuário na autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          name: userData.name,
          role: userData.role
        }
      });
      
      if (authError) {
        return { success: false, message: `Erro ao criar usuário: ${authError.message}` };
      }
      
      if (!authData.user) {
        return { success: false, message: 'Erro ao criar usuário: Resposta inválida do servidor' };
      }
      
      // Criar registro do usuário na tabela users
      const { data: userData2, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          company_id: userData.companyId,
          department: userData.department,
          is_active: true
        }])
        .select()
        .single();
        
      if (userError) {
        // Tentar remover o usuário da autenticação em caso de erro
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        return { success: false, message: `Erro ao criar registro do usuário: ${userError.message}` };
      }
      
      // Converter formato de dados para o formato da aplicação
      const newUser: User = {
        id: userData2.id,
        name: userData2.name,
        email: userData2.email,
        role: userData2.role,
        companyId: userData2.company_id,
        department: userData2.department,
        avatar: userData2.avatar_url,
        permissions: [],
        isActive: userData2.is_active,
        createdAt: new Date(userData2.created_at),
        updatedAt: userData2.updated_at ? new Date(userData2.updated_at) : undefined
      };

      return { success: true, message: 'Usuário criado com sucesso!', user: newUser };
      
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { success: false, message: `Erro ao registrar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar resultado de checkup
  const saveCheckupResult = useCallback(async (checkupResult: CheckupResult): Promise<boolean> => {
    try {
      if (!user) return false;
      
      setIsLoading(true);
      
      // Preparar dados para inserção
      const insertData = {
        user_id: checkupResult.userId,
        company_id: checkupResult.companyId,
        responses: checkupResult.responses,
        scores: checkupResult.scores,
        classifications: checkupResult.classifications,
        overall_score: checkupResult.overallScore,
        severity_level: checkupResult.severityLevel,
        next_checkup_date: checkupResult.nextCheckupDate.toISOString().split('T')[0],
        // IAS fields
        ias_responses: checkupResult.iasResponses,
        ias_total_score: checkupResult.iasTotalScore,
        ias_classification: checkupResult.iasClassification,
        // Combined assessment fields
        combined_recommended_paths: checkupResult.combinedRecommendedPaths,
        combined_psychologist_referral_needed: checkupResult.combinedPsychologistReferralNeeded,
        combined_justification: checkupResult.combinedJustification,
        combined_critical_level: checkupResult.combinedCriticalLevel,
        combined_recommendations: checkupResult.combinedRecommendations
      };
      
      // Inserir no Supabase
      const { error } = await supabase
        .from('checkup_results')
        .insert([insertData]);
        
      if (error) {
        console.error('Erro ao salvar resultado de checkup:', error);
        return false;
      }
      
      // Atualizar o objeto user com as novas datas de checkup
      // Nota: a trigger no Supabase já atualizará a tabela users
      // Aqui só atualizamos o estado local para refletir a mudança
      setUser(prev => prev ? {
        ...prev,
        lastCheckup: new Date(),
        nextCheckup: checkupResult.nextCheckupDate
      } : null);
      
      return true;
      
    } catch (error) {
      console.error('Erro ao salvar resultado de checkup:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Gerenciamento de planos de assinatura
  const getSubscriptionPlans = useCallback(async (): Promise<SubscriptionPlan[]> => {
    try {
      // Buscar planos do Supabase
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*');
        
      if (error) {
        console.error('Erro ao buscar planos de assinatura:', error);
        return [];
      }
      
      // Converter formato dos dados
      return data.map(plan => ({
        id: plan.id,
        name: plan.name,
        value: plan.value,
        periodicity: plan.periodicity,
        features: plan.features,
        isActive: plan.is_active,
        createdAt: new Date(plan.created_at),
        updatedAt: plan.updated_at ? new Date(plan.updated_at) : undefined,
        description: plan.description
      }));
      
    } catch (error) {
      console.error('Erro ao obter planos de assinatura:', error);
      return [];
    }
  }, []);

  const addSubscriptionPlan = useCallback(async (planData: {
    name: string;
    value: number;
    periodicity: SubscriptionPlan['periodicity'];
    features: string[];
    description?: string;
  }): Promise<{ success: boolean; message: string; plan?: SubscriptionPlan }> => {
    try {
      setIsLoading(true);
      
      // Validações
      if (!planData.name || planData.value <= 0) {
        return { success: false, message: 'Nome e valor são obrigatórios' };
      }
      
      // Preparar dados para inserção
      const insertData = {
        name: planData.name,
        value: planData.value,
        periodicity: planData.periodicity,
        features: planData.features || [],
        is_active: true,
        description: planData.description
      };
      
      // Inserir no Supabase
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([insertData])
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao adicionar plano:', error);
        return { success: false, message: `Erro ao adicionar plano: ${error.message}` };
      }
      
      // Converter formato dos dados
      const newPlan: SubscriptionPlan = {
        id: data.id,
        name: data.name,
        value: data.value,
        periodicity: data.periodicity,
        features: data.features,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        description: data.description
      };

      return { success: true, message: 'Plano criado com sucesso!', plan: newPlan };
      
    } catch (error) {
      console.error('Erro ao adicionar plano:', error);
      return { success: false, message: `Erro ao adicionar plano: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSubscriptionPlan = useCallback(async (planId: string, planData: {
    name: string;
    value: number;
    periodicity: SubscriptionPlan['periodicity'];
    features: string[];
    description?: string;
  }): Promise<{ success: boolean; message: string; plan?: SubscriptionPlan }> => {
    try {
      setIsLoading(true);
      
      // Verificar se o plano existe
      const { data: existingPlan, error: checkError } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('id', planId)
        .single();
        
      if (checkError) {
        return { success: false, message: 'Plano não encontrado' };
      }
      
      // Preparar dados para atualização
      const updateData = {
        name: planData.name,
        value: planData.value,
        periodicity: planData.periodicity,
        features: planData.features,
        description: planData.description,
        updated_at: new Date().toISOString()
      };
      
      // Atualizar no Supabase
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updateData)
        .eq('id', planId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao atualizar plano:', error);
        return { success: false, message: `Erro ao atualizar plano: ${error.message}` };
      }
      
      // Converter formato dos dados
      const updatedPlan: SubscriptionPlan = {
        id: data.id,
        name: data.name,
        value: data.value,
        periodicity: data.periodicity,
        features: data.features,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        description: data.description
      };

      return { success: true, message: 'Plano atualizado com sucesso!', plan: updatedPlan };
      
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      return { success: false, message: `Erro ao atualizar plano: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const togglePlanStatus = useCallback(async (planId: string): Promise<{ success: boolean; message: string; plan?: SubscriptionPlan }> => {
    try {
      setIsLoading(true);
      
      // Buscar plano atual
      const { data: currentPlan, error: checkError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();
        
      if (checkError) {
        return { success: false, message: 'Plano não encontrado' };
      }
      
      // Alternar status
      const newStatus = !currentPlan.is_active;
      
      // Atualizar no Supabase
      const { data, error } = await supabase
        .from('subscription_plans')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao alternar status do plano:', error);
        return { success: false, message: `Erro ao alternar status do plano: ${error.message}` };
      }
      
      // Converter formato dos dados
      const updatedPlan: SubscriptionPlan = {
        id: data.id,
        name: data.name,
        value: data.value,
        periodicity: data.periodicity,
        features: data.features,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        description: data.description
      };

      const statusMessage = updatedPlan.isActive ? 'ativado' : 'desativado';
      return { success: true, message: `Plano ${updatedPlan.name} ${statusMessage} com sucesso!`, plan: updatedPlan };
      
    } catch (error) {
      console.error('Erro ao alternar status do plano:', error);
      return { success: false, message: `Erro ao alternar status do plano: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Gerenciamento de configurações de checkup
  const getCompanyCheckupSettings = useCallback(async (companyId: string): Promise<CompanyCheckupSettings | null> => {
    try {
      // Buscar configurações do Supabase
      const { data, error } = await supabase
        .from('company_checkup_settings')
        .select('*')
        .eq('company_id', companyId)
        .single();
        
      if (error) {
        // Se não encontrar, criar configurações padrão
        if (error.code === 'PGRST116') { // Not Found
          // Inserir configurações padrão
          const { data: newData, error: insertError } = await supabase
            .from('company_checkup_settings')
            .insert([{
              company_id: companyId,
              normal_interval_days: 90,
              severe_interval_days: 30,
              auto_reminders_enabled: true
            }])
            .select()
            .single();
            
          if (insertError) {
            console.error('Erro ao criar configurações padrão:', insertError);
            return null;
          }
          
          // Converter formato dos dados
          return {
            id: newData.id,
            companyId: newData.company_id,
            normalIntervalDays: newData.normal_interval_days,
            severeIntervalDays: newData.severe_interval_days,
            autoRemindersEnabled: newData.auto_reminders_enabled,
            createdAt: new Date(newData.created_at),
            updatedAt: newData.updated_at ? new Date(newData.updated_at) : new Date(newData.created_at)
          };
        }
        
        console.error('Erro ao buscar configurações de checkup:', error);
        return null;
      }
      
      // Converter formato dos dados
      return {
        id: data.id,
        companyId: data.company_id,
        normalIntervalDays: data.normal_interval_days,
        severeIntervalDays: data.severe_interval_days,
        autoRemindersEnabled: data.auto_reminders_enabled,
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(data.created_at)
      };
      
    } catch (error) {
      console.error('Erro ao obter configurações de checkup:', error);
      return null;
    }
  }, []);

  const saveCompanyCheckupSettings = useCallback(async (settings: Omit<CompanyCheckupSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      
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
      
      // Verificar se já existem configurações para esta empresa
      const { data: existingSettings, error: checkError } = await supabase
        .from('company_checkup_settings')
        .select('id')
        .eq('company_id', settings.companyId)
        .maybeSingle();
      
      let result;
      
      if (existingSettings) {
        // Atualizar configurações existentes
        result = await supabase
          .from('company_checkup_settings')
          .update({
            normal_interval_days: settings.normalIntervalDays,
            severe_interval_days: settings.severeIntervalDays,
            auto_reminders_enabled: settings.autoRemindersEnabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id);
      } else {
        // Inserir novas configurações
        result = await supabase
          .from('company_checkup_settings')
          .insert([{
            company_id: settings.companyId,
            normal_interval_days: settings.normalIntervalDays,
            severe_interval_days: settings.severeIntervalDays,
            auto_reminders_enabled: settings.autoRemindersEnabled
          }]);
      }
      
      if (result.error) {
        console.error('Erro ao salvar configurações de checkup:', result.error);
        return { success: false, message: `Erro ao salvar configurações: ${result.error.message}` };
      }
      
      return { success: true, message: 'Configurações salvas com sucesso!' };
      
    } catch (error) {
      console.error('Erro ao salvar configurações de checkup:', error);
      return { success: false, message: `Erro ao salvar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Gerenciamento de recomendações da empresa
  const getCompanyRecommendations = useCallback(async (companyId: string): Promise<CompanyRecommendation[]> => {
    try {
      // Buscar recomendações do Supabase
      const { data, error } = await supabase
        .from('company_recommendations')
        .select('*')
        .eq('company_id', companyId)
        .order('order_index', { ascending: true });
        
      if (error) {
        console.error('Erro ao buscar recomendações:', error);
        return [];
      }
      
      if (data.length === 0) {
        // Criar recomendações padrão se não houver
        const defaultRecommendations = [
          {
            company_id: companyId,
            title: 'Cuidando da Saúde Mental',
            content: 'Pratique técnicas de respiração diariamente para reduzir o estresse. Reserve momentos para atividades prazerosas e desconexão digital. Considere a meditação como parte da sua rotina.',
            recommendation_type: 'mental_health',
            order_index: 1
          },
          {
            company_id: companyId,
            title: 'Alimentação Saudável',
            content: 'Mantenha uma dieta equilibrada com frutas, vegetais e proteínas magras. Hidrate-se adequadamente bebendo pelo menos 2 litros de água por dia. Evite alimentos ultraprocessados e excesso de açúcar.',
            recommendation_type: 'nutrition',
            order_index: 2
          }
        ];
        
        const { data: newData, error: insertError } = await supabase
          .from('company_recommendations')
          .insert(defaultRecommendations)
          .select();
          
        if (insertError) {
          console.error('Erro ao criar recomendações padrão:', insertError);
          return [];
        }
        
        // Converter formato dos dados
        return newData.map(rec => ({
          id: rec.id,
          companyId: rec.company_id,
          title: rec.title,
          content: rec.content,
          recommendationType: rec.recommendation_type,
          orderIndex: rec.order_index,
          createdAt: new Date(rec.created_at),
          updatedAt: rec.updated_at ? new Date(rec.updated_at) : new Date(rec.created_at)
        }));
      }
      
      // Converter formato dos dados
      return data.map(rec => ({
        id: rec.id,
        companyId: rec.company_id,
        title: rec.title,
        content: rec.content,
        recommendationType: rec.recommendation_type,
        orderIndex: rec.order_index,
        createdAt: new Date(rec.created_at),
        updatedAt: rec.updated_at ? new Date(rec.updated_at) : new Date(rec.created_at)
      }));
      
    } catch (error) {
      console.error('Erro ao obter recomendações:', error);
      return [];
    }
  }, []);

  const saveCompanyRecommendation = useCallback(async (recommendation: Omit<CompanyRecommendation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<{ success: boolean; message: string; recommendation?: CompanyRecommendation }> => {
    try {
      setIsLoading(true);
      
      // Validações
      if (!recommendation.title.trim() || !recommendation.content.trim()) {
        return { success: false, message: 'Título e conteúdo são obrigatórios' };
      }
      
      // Preparar dados para persistência
      const saveData = {
        company_id: recommendation.companyId,
        title: recommendation.title.trim(),
        content: recommendation.content.trim(),
        recommendation_type: recommendation.recommendationType,
        order_index: recommendation.orderIndex
      };
      
      let result;
      
      // Atualizar ou inserir com base na presença de ID
      if (recommendation.id) {
        // Atualizar
        result = await supabase
          .from('company_recommendations')
          .update(saveData)
          .eq('id', recommendation.id)
          .select()
          .single();
      } else {
        // Inserir
        result = await supabase
          .from('company_recommendations')
          .insert([saveData])
          .select()
          .single();
      }
      
      if (result.error) {
        console.error('Erro ao salvar recomendação:', result.error);
        return { success: false, message: `Erro ao salvar recomendação: ${result.error.message}` };
      }
      
      // Converter formato dos dados
      const savedRecommendation: CompanyRecommendation = {
        id: result.data.id,
        companyId: result.data.company_id,
        title: result.data.title,
        content: result.data.content,
        recommendationType: result.data.recommendation_type,
        orderIndex: result.data.order_index,
        createdAt: new Date(result.data.created_at),
        updatedAt: result.data.updated_at ? new Date(result.data.updated_at) : new Date(result.data.created_at)
      };

      const action = recommendation.id ? 'atualizada' : 'criada';
      return { 
        success: true, 
        message: `Recomendação ${action} com sucesso!`, 
        recommendation: savedRecommendation 
      };
      
    } catch (error) {
      console.error('Erro ao salvar recomendação:', error);
      return { success: false, message: `Erro ao salvar recomendação: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCompanyRecommendation = useCallback(async (id: string, companyId: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      
      // Verificar se a recomendação existe
      const { data: recommendation, error: checkError } = await supabase
        .from('company_recommendations')
        .select('id, title')
        .eq('id', id)
        .eq('company_id', companyId)
        .single();
        
      if (checkError) {
        return { success: false, message: 'Recomendação não encontrada' };
      }
      
      // Excluir recomendação
      const { error } = await supabase
        .from('company_recommendations')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Erro ao excluir recomendação:', error);
        return { success: false, message: `Erro ao excluir recomendação: ${error.message}` };
      }

      return { success: true, message: 'Recomendação excluída com sucesso!' };
      
    } catch (error) {
      console.error('Erro ao excluir recomendação:', error);
      return { success: false, message: `Erro ao excluir recomendação: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Funções de gerenciamento de usuários
  const createUser = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    role: User['role'];
    department?: string;
    companyId?: string;
  }): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      setIsLoading(true);
      
      // Validações
      if (!userData.name.trim() || !userData.email.trim() || !userData.role) {
        return { success: false, message: 'Nome, email e perfil são obrigatórios' };
      }
      
      if (!validateEmail(userData.email)) {
        return { success: false, message: 'Email inválido' };
      }
      
      if (userData.password && userData.password.length < 6) {
        return { success: false, message: 'Senha deve ter pelo menos 6 caracteres' };
      }
      
      // Super Admins não precisam de companyId, outros perfis sim
      if (userData.role !== 'super_admin' && !userData.companyId) {
        return { success: false, message: 'Empresa é obrigatória para usuários que não são Super Admin' };
      }
      
      // Criar usuário na autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password || Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10), // Senha aleatória se não for fornecida
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          name: userData.name,
          role: userData.role
        }
      });
      
      if (authError) {
        return { success: false, message: `Erro ao criar usuário: ${authError.message}` };
      }
      
      if (!authData.user) {
        return { success: false, message: 'Erro ao criar usuário: Resposta inválida do servidor' };
      }
      
      // Inserir na tabela users
      const { data: userData2, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          company_id: userData.role === 'super_admin' ? null : userData.companyId,
          department: userData.role === 'super_admin' ? null : userData.department,
          is_active: true
        }])
        .select()
        .single();
        
      if (userError) {
        // Tentar remover o usuário da autenticação em caso de erro
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error('Erro ao remover usuário da autenticação após falha:', deleteError);
        }
        
        return { success: false, message: `Erro ao criar registro do usuário: ${userError.message}` };
      }
      
      // Converter formato dos dados
      const newUser: User = {
        id: userData2.id,
        name: userData2.name,
        email: userData2.email,
        role: userData2.role,
        companyId: userData2.company_id,
        department: userData2.department,
        avatar: userData2.avatar_url,
        permissions: [],
        isActive: userData2.is_active,
        createdAt: new Date(userData2.created_at),
        updatedAt: userData2.updated_at ? new Date(userData2.updated_at) : undefined
      };

      return { success: true, message: 'Usuário criado com sucesso!', user: newUser };
      
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return { success: false, message: `Erro ao criar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: string, userData: {
    name: string;
    email: string;
    role: User['role'];
    department?: string;
    companyId?: string;
    password?: string;
  }): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      setIsLoading(true);
      
      // Validações
      if (!userData.name.trim() || !userData.email.trim() || !userData.role) {
        return { success: false, message: 'Nome, email e perfil são obrigatórios' };
      }
      
      if (!validateEmail(userData.email)) {
        return { success: false, message: 'Email inválido' };
      }
      
      if (userData.password && userData.password.length < 6) {
        return { success: false, message: 'Senha deve ter pelo menos 6 caracteres' };
      }
      
      // Super Admins não precisam de companyId, outros perfis sim
      if (userData.role !== 'super_admin' && !userData.companyId) {
        return { success: false, message: 'Empresa é obrigatória para usuários que não são Super Admin' };
      }
      
      // Buscar usuário atual para verificar se o email mudou
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
        
      if (userError) {
        return { success: false, message: 'Usuário não encontrado' };
      }
      
      // Se o email mudou, atualizar na autenticação
      if (currentUser.email !== userData.email) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          userId,
          { email: userData.email }
        );
        
        if (authError) {
          return { success: false, message: `Erro ao atualizar email: ${authError.message}` };
        }
      }
      
      // Se a senha foi fornecida, atualizá-la
      if (userData.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          userId,
          { password: userData.password }
        );
        
        if (passwordError) {
          return { success: false, message: `Erro ao atualizar senha: ${passwordError.message}` };
        }
      }
      
      // Atualizar dados na tabela users
      const updateData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        company_id: userData.role === 'super_admin' ? null : userData.companyId,
        department: userData.role === 'super_admin' ? null : userData.department,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        return { success: false, message: `Erro ao atualizar usuário: ${error.message}` };
      }
      
      // Converter formato dos dados
      const updatedUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        companyId: data.company_id,
        department: data.department,
        avatar: data.avatar_url,
        permissions: [],
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
      };

      // Se for o usuário atual, atualizar o estado
      if (user && user.id === userId) {
        setUser(updatedUser);
      }

      return { success: true, message: 'Usuário atualizado com sucesso!', user: updatedUser };
      
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, message: `Erro ao atualizar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const toggleUserStatus = useCallback(async (userId: string): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      setIsLoading(true);
      
      // Não permitir alteração do próprio usuário
      if (user && user.id === userId) {
        return { success: false, message: 'Você não pode alterar seu próprio status' };
      }
      
      // Buscar usuário atual
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (userError) {
        return { success: false, message: 'Usuário não encontrado' };
      }
      
      // Alternar status
      const newStatus = !currentUser.is_active;
      
      // Atualizar no Supabase
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao alternar status do usuário:', error);
        return { success: false, message: `Erro ao alternar status do usuário: ${error.message}` };
      }
      
      // Converter formato dos dados
      const updatedUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        companyId: data.company_id,
        department: data.department,
        avatar: data.avatar_url,
        permissions: [],
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
      };

      const statusMessage = updatedUser.isActive ? 'ativado' : 'desativado';
      return { success: true, message: `Usuário ${statusMessage} com sucesso!`, user: updatedUser };
      
    } catch (error) {
      console.error('Erro ao alternar status do usuário:', error);
      return { success: false, message: `Erro ao alternar status do usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteUser = useCallback(async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      
      // Não permitir exclusão do próprio usuário
      if (user && user.id === userId) {
        return { success: false, message: 'Você não pode excluir sua própria conta' };
      }
      
      // Verificar se o usuário existe
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (userError) {
        return { success: false, message: 'Usuário não encontrado' };
      }
      
      // Excluir usuário da autenticação do Supabase
      const { error: authError } = await supabase.auth.admin.deleteUser(
        userId
      );
      
      if (authError) {
        console.error('Erro ao excluir usuário da autenticação:', authError);
        return { success: false, message: `Erro ao excluir usuário da autenticação: ${authError.message}` };
      }
      
      // O trigger no banco de dados cuidará de decrementar o contador de usuários da empresa

      return { success: true, message: 'Usuário excluído com sucesso!' };
      
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return { success: false, message: `Erro ao excluir usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getAllUsers = useCallback(async (): Promise<User[]> => {
    try {
      // Verificar se é super admin para buscar todos os usuários
      // ou se é gerente para buscar apenas usuários da empresa
      const isAdmin = user && user.role === 'super_admin';
      const isManager = user && user.role === 'gerente';
      
      let query = supabase.from('users').select('*');
      
      // Se for gerente, filtrar por empresa
      if (isManager && user && user.companyId) {
        query = query.eq('company_id', user.companyId);
      } else if (!isAdmin) {
        // Se não for admin nem gerente, retornar apenas o próprio usuário
        if (!user) return [];
        
        query = query.eq('id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
      }
      
      // Converter formato dos dados
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
        permissions: [],
        isActive: userData.is_active,
        createdAt: new Date(userData.created_at),
        updatedAt: userData.updated_at ? new Date(userData.updated_at) : undefined
      }));
      
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
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