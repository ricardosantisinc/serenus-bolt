/**
 * Utilitário para validação de dados de usuários e empresas
 * 
 * Fornece funções para:
 * - Validação de emails
 * - Validação de telefones
 * - Validação de senhas
 * - Verificação de permissões
 * 
 * @author Serenus Platform
 * @version 1.0.0
 */

/**
 * Valida formato de email
 * @param email Email a ser validado
 * @returns Verdadeiro se o email for válido
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida formato de telefone fixo
 * @param phone Telefone a ser validado
 * @returns Verdadeiro se o telefone for válido
 */
export const validateLandlinePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Aceita formato (XX) XXXX-XXXX
  const phoneRegex = /^\(\d{2}\)\s\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Valida formato de celular
 * @param phone Celular a ser validado
 * @returns Verdadeiro se o celular for válido
 */
export const validateMobilePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Aceita formato (XX) XXXXX-XXXX
  const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Valida formato e complexidade de senha
 * @param password Senha a ser validada
 * @returns Resultado da validação
 */
export const validatePassword = (password: string): { 
  valid: boolean; 
  message?: string;
} => {
  if (!password) {
    return { valid: false, message: 'Senha é obrigatória' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'Senha deve ter pelo menos 6 caracteres' };
  }
  
  return { valid: true };
};

/**
 * Verifica se o usuário atual pode gerenciar um super_admin
 * @param currentUserRole Role do usuário atual
 * @param targetUserRole Role do usuário alvo
 * @returns Verdadeiro se o usuário pode gerenciar
 */
export const canManageSuperAdmin = (currentUserRole: string, targetUserRole: string): boolean => {
  // Apenas super_admin pode gerenciar outro super_admin
  if (targetUserRole === 'super_admin') {
    return currentUserRole === 'super_admin';
  }
  
  // Qualquer usuário pode gerenciar roles não-super_admin
  return true;
};

/**
 * Verifica se o usuário pode criar/promover para super_admin
 * @param currentUserRole Role do usuário atual
 * @returns Verdadeiro se o usuário pode criar/promover para super_admin
 */
export const canCreateSuperAdmin = (currentUserRole: string): boolean => {
  return currentUserRole === 'super_admin';
};

/**
 * Obtém o rótulo amigável para a role
 * @param role Role do usuário
 * @returns String com o nome amigável da role
 */
export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    'super_admin': 'Super Administrador',
    'gerente': 'Gerente',
    'colaborador': 'Colaborador'
  };
  
  return roleNames[role] || role;
};

/**
 * Verifica se o usuário pode gerenciar usuários de uma empresa
 * @param currentUser Usuário atual
 * @param targetCompanyId ID da empresa alvo
 * @returns Verdadeiro se o usuário pode gerenciar
 */
export const canManageCompanyUsers = (
  currentUserRole: string, 
  currentUserCompanyId?: string,
  targetCompanyId?: string
): boolean => {
  // Super admin pode gerenciar qualquer empresa
  if (currentUserRole === 'super_admin') {
    return true;
  }
  
  // Gerentes só podem gerenciar sua própria empresa
  if (currentUserRole === 'gerente') {
    return currentUserCompanyId === targetCompanyId;
  }
  
  // Outros perfis não podem gerenciar usuários
  return false;
};