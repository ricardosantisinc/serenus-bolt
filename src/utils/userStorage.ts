/**
 * Utilitário para persistência de dados de usuários, empresas e planos no localStorage
 * 
 * Fornece funções para:
 * - Salvar e carregar usuários do localStorage
 * - Salvar e carregar empresas do localStorage
 * - Salvar e carregar planos de assinatura do localStorage
 * - Converter objetos Date para string e vice-versa
 * 
 * @author Serenus Platform
 * @version 1.1.0
 */

import { User, Company, SubscriptionPlan } from '../types';

// Chaves de armazenamento
const USERS_STORAGE_KEY = 'allUsers';
const COMPANIES_STORAGE_KEY = 'allCompanies';
const SUBSCRIPTION_PLANS_STORAGE_KEY = 'allSubscriptionPlans';

// Replacer para JSON.stringify que converte Date para string ISO
const dateReplacer = (_key: string, value: any): any => {
  if (value instanceof Date) {
    return { __type: 'Date', iso: value.toISOString() };
  }
  return value;
};

// Reviver para JSON.parse que converte string ISO para Date
const dateReviver = (_key: string, value: any): any => {
  if (value && typeof value === 'object' && value.__type === 'Date' && value.iso) {
    return new Date(value.iso);
  }
  return value;
};

/**
 * Salva lista de usuários no localStorage
 * @param users Objeto com usuários
 * @returns Verdadeiro se salvo com sucesso
 */
export const saveUsersToStorage = (users: Record<string, Omit<User, 'permissions'>>): boolean => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users, dateReplacer));
    console.log('💾 Usuários salvos no localStorage:', Object.keys(users).length);
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar usuários no localStorage:', error);
    return false;
  }
};

/**
 * Carrega usuários do localStorage
 * @returns Objeto com usuários ou null se não existir
 */
export const loadUsersFromStorage = (): Record<string, Omit<User, 'permissions'>> | null => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) return null;
    
    const users = JSON.parse(data, dateReviver) as Record<string, Omit<User, 'permissions'>>;
    
    console.log('📋 Usuários carregados do localStorage:', Object.keys(users).length);
    return users;
  } catch (error) {
    console.error('❌ Erro ao carregar usuários do localStorage:', error);
    return null;
  }
};

/**
 * Remover um usuário do localStorage
 * @param userId ID do usuário a ser removido
 * @returns Verdadeiro se removido com sucesso
 */
export const removeUserFromStorage = (userId: string): boolean => {
  try {
    const users = loadUsersFromStorage();
    if (!users) return false;
    
    const userKey = Object.keys(users).find(key => users[key].id === userId);
    if (!userKey) return false;
    
    delete users[userKey];
    saveUsersToStorage(users);
    return true;
  } catch (error) {
    console.error('❌ Erro ao remover usuário do localStorage:', error);
    return false;
  }
};

/**
 * Adiciona ou atualiza um usuário no localStorage
 * @param user Usuário a ser salvo
 * @returns Verdadeiro se salvo com sucesso
 */
export const saveUserToStorage = (user: Omit<User, 'permissions'>): boolean => {
  try {
    const users = loadUsersFromStorage() || {};
    users[user.email.toLowerCase()] = user;
    saveUsersToStorage(users);
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar usuário no localStorage:', error);
    return false;
  }
};

/**
 * Salva lista de empresas no localStorage
 * @param companies Objeto com empresas
 * @returns Verdadeiro se salvo com sucesso
 */
export const saveCompaniesToStorage = (companies: Record<string, Company>): boolean => {
  try {
    localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies, dateReplacer));
    console.log('💾 Empresas salvas no localStorage:', Object.keys(companies).length);
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar empresas no localStorage:', error);
    return false;
  }
};

/**
 * Carrega empresas do localStorage
 * @returns Objeto com empresas ou null se não existir
 */
export const loadCompaniesFromStorage = (): Record<string, Company> | null => {
  try {
    const data = localStorage.getItem(COMPANIES_STORAGE_KEY);
    if (!data) return null;
    
    const companies = JSON.parse(data, dateReviver) as Record<string, Company>;
    
    console.log('📋 Empresas carregadas do localStorage:', Object.keys(companies).length);
    return companies;
  } catch (error) {
    console.error('❌ Erro ao carregar empresas do localStorage:', error);
    return null;
  }
};

/**
 * Remove uma empresa do localStorage
 * @param companyId ID da empresa a ser removida
 * @returns Verdadeiro se removida com sucesso
 */
export const removeCompanyFromStorage = (companyId: string): boolean => {
  try {
    const companies = loadCompaniesFromStorage();
    if (!companies) return false;
    
    const companyKey = Object.keys(companies).find(key => companies[key].id === companyId);
    if (!companyKey) return false;
    
    delete companies[companyKey];
    saveCompaniesToStorage(companies);
    return true;
  } catch (error) {
    console.error('❌ Erro ao remover empresa do localStorage:', error);
    return false;
  }
};

/**
 * Salva lista de planos de assinatura no localStorage
 * @param plans Objeto com planos de assinatura
 * @returns Verdadeiro se salvo com sucesso
 */
export const saveSubscriptionPlansToStorage = (plans: Record<string, SubscriptionPlan>): boolean => {
  try {
    localStorage.setItem(SUBSCRIPTION_PLANS_STORAGE_KEY, JSON.stringify(plans, dateReplacer));
    console.log('💾 Planos de assinatura salvos no localStorage:', Object.keys(plans).length);
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar planos de assinatura no localStorage:', error);
    return false;
  }
};

/**
 * Carrega planos de assinatura do localStorage
 * @returns Objeto com planos ou null se não existir
 */
export const loadSubscriptionPlansFromStorage = (): Record<string, SubscriptionPlan> | null => {
  try {
    const data = localStorage.getItem(SUBSCRIPTION_PLANS_STORAGE_KEY);
    if (!data) return null;
    
    const plans = JSON.parse(data, dateReviver) as Record<string, SubscriptionPlan>;
    
    console.log('📋 Planos de assinatura carregados do localStorage:', Object.keys(plans).length);
    return plans;
  } catch (error) {
    console.error('❌ Erro ao carregar planos de assinatura do localStorage:', error);
    return null;
  }
};