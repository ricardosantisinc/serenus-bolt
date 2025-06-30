/*
  # Correção da recursão infinita nas políticas RLS

  1. Problema identificado
    - Recursão infinita detectada nas políticas RLS da tabela `users`
    - Funções `get_user_company_id()` e `is_super_admin()` causando loops

  2. Solução
    - Recriar funções com SECURITY DEFINER
    - Configurar search_path adequadamente
    - Ajustar políticas RLS para evitar recursão

  3. Mudanças
    - Dropar políticas existentes problemáticas
    - Recriar funções auxiliares com configuração correta
    - Implementar políticas RLS mais simples e eficientes
*/

-- Primeiro, remover as políticas existentes que causam recursão
DROP POLICY IF EXISTS "users_select_own_company" ON users;
DROP POLICY IF EXISTS "superadmin_full_access" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON users;
DROP POLICY IF EXISTS "Gerentes can manage users in their company" ON users;

-- Remover funções existentes que podem causar recursão
DROP FUNCTION IF EXISTS get_user_company_id();
DROP FUNCTION IF EXISTS is_super_admin(uuid);

-- Criar função para verificar se o usuário é super admin
-- Usando SECURITY DEFINER para contornar RLS
CREATE OR REPLACE FUNCTION is_super_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = user_id 
    AND role = 'super_admin'
  );
END;
$$;

-- Criar função para obter o company_id do usuário atual
-- Usando SECURITY DEFINER para contornar RLS
CREATE OR REPLACE FUNCTION get_user_company_id(user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_id uuid;
BEGIN
  SELECT u.company_id INTO company_id
  FROM users u
  WHERE u.id = user_id;
  
  RETURN company_id;
END;
$$;

-- Criar função para verificar se o usuário é gerente
-- Usando SECURITY DEFINER para contornar RLS
CREATE OR REPLACE FUNCTION is_manager(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = user_id 
    AND role = 'gerente'
  );
END;
$$;

-- Criar função para verificar se dois usuários estão na mesma empresa
-- Usando SECURITY DEFINER para contornar RLS
CREATE OR REPLACE FUNCTION same_company(user1_id uuid, user2_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company1_id uuid;
  company2_id uuid;
BEGIN
  SELECT company_id INTO company1_id FROM users WHERE id = user1_id;
  SELECT company_id INTO company2_id FROM users WHERE id = user2_id;
  
  RETURN company1_id IS NOT NULL 
    AND company2_id IS NOT NULL 
    AND company1_id = company2_id;
END;
$$;

-- Criar políticas RLS mais simples e eficientes
-- Usuários podem ver seus próprios dados
CREATE POLICY "users_can_view_own_data" 
ON users FOR SELECT 
USING (auth.uid() = id);

-- Super admins podem fazer tudo
CREATE POLICY "super_admins_full_access" 
ON users FOR ALL 
USING (is_super_admin());

-- Gerentes podem gerenciar usuários da mesma empresa
CREATE POLICY "managers_can_manage_company_users" 
ON users FOR ALL 
USING (
  is_manager() AND 
  same_company(id, auth.uid())
);

-- Permitir que gerentes vejam usuários da mesma empresa
CREATE POLICY "managers_can_view_company_users" 
ON users FOR SELECT 
USING (
  is_manager() AND 
  same_company(id, auth.uid())
);

-- Permitir inserção para super admins e auto-inserção durante signup
CREATE POLICY "allow_user_creation" 
ON users FOR INSERT 
WITH CHECK (
  is_super_admin() OR 
  auth.uid() = id
);

-- Permitir que usuários atualizem seus próprios dados
CREATE POLICY "users_can_update_own_data" 
ON users FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Permitir que gerentes atualizem dados de usuários da mesma empresa
CREATE POLICY "managers_can_update_company_users" 
ON users FOR UPDATE 
USING (
  is_manager() AND 
  same_company(id, auth.uid())
)
WITH CHECK (
  is_manager() AND 
  same_company(id, auth.uid())
);

-- Permitir que super admins e gerentes deletem usuários
CREATE POLICY "admins_can_delete_users" 
ON users FOR DELETE 
USING (
  is_super_admin() OR 
  (is_manager() AND same_company(id, auth.uid()))
);

-- Garantir que as funções sejam executadas com privilégios do proprietário
GRANT EXECUTE ON FUNCTION is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_company_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_manager(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION same_company(uuid, uuid) TO authenticated;

-- Criar índices para melhorar performance das consultas RLS
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_company_role ON users(company_id, role);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(id) WHERE id IS NOT NULL;