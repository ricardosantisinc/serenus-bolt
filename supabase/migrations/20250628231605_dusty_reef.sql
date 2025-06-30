/*
  # Atualização do Sistema de Perfis de Acesso

  1. Alterações
    - Modificação do tipo de role para suportar apenas 3 níveis hierárquicos
    - Atualização das políticas de acesso
    - Migração de usuários existentes para os novos perfis

  2. Detalhes
    - Perfis antigos: 'super_admin', 'admin', 'manager', 'hr', 'psychologist', 'employee'
    - Novos perfis: 'super_admin', 'gerente', 'colaborador'
*/

-- Primeiro, criar um tipo temporário para os novos roles
CREATE TYPE user_role_new AS ENUM ('super_admin', 'gerente', 'colaborador');

-- Migrar dados existentes
DO $$
BEGIN
  -- Atualizar usuários existentes para os novos perfis
  UPDATE users SET 
    role = CASE 
      WHEN role = 'super_admin' THEN 'super_admin'
      WHEN role IN ('admin', 'manager', 'hr') THEN 'gerente'
      WHEN role IN ('psychologist', 'employee') THEN 'colaborador'
      ELSE 'colaborador' -- Fallback para qualquer outro valor
    END;
END $$;

-- Modificar a constraint de verificação para aceitar apenas os novos perfis
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'gerente', 'colaborador'));

-- Atualizar políticas de acesso
-- Primeiro, remover políticas existentes
DROP POLICY IF EXISTS "Super admins can manage all users" ON users;
DROP POLICY IF EXISTS "Admins and HR can manage users in their company" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Managers can view team members" ON users;

-- Criar novas políticas
CREATE POLICY "Super admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'super_admin'
    )
  );

CREATE POLICY "Gerentes can manage users in their company"
  ON users
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'gerente'
    )
  );

CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Atualizar políticas para checkup_results
DROP POLICY IF EXISTS "Admins and HR can view all company checkup results" ON checkup_results;
DROP POLICY IF EXISTS "Managers can view team checkup results" ON checkup_results;
DROP POLICY IF EXISTS "Psychologists can view checkup results in their company" ON checkup_results;

CREATE POLICY "Gerentes can view all company checkup results"
  ON checkup_results
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'gerente'
    )
  );

-- Atualizar políticas para company_checkup_settings
DROP POLICY IF EXISTS "Admins can manage company checkup settings" ON company_checkup_settings;

CREATE POLICY "Gerentes can manage company checkup settings"
  ON company_checkup_settings
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('super_admin', 'gerente')
    )
  );

-- Atualizar políticas para user_photos
DROP POLICY IF EXISTS "Admins can view company user photos" ON user_photos;

CREATE POLICY "Gerentes can view company user photos"
  ON user_photos
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT u.id FROM users u
      JOIN users gerente ON gerente.company_id = u.company_id
      WHERE gerente.id = auth.uid() 
      AND gerente.role = 'gerente'
    )
  );

-- Atualizar políticas para educational content
DROP POLICY IF EXISTS "Users can view published courses" ON courses;
DROP POLICY IF EXISTS "Users can view published modules" ON modules;
DROP POLICY IF EXISTS "Users can view published lessons" ON lessons;
DROP POLICY IF EXISTS "Users can view lesson content" ON lesson_content;

CREATE POLICY "Users can view published courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (status = 'published');

CREATE POLICY "Users can view published modules"
  ON modules
  FOR SELECT
  TO authenticated
  USING (
    status = 'published' OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.status = 'published'
    )
  );

CREATE POLICY "Users can view published lessons"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (
    status = 'published' OR
    EXISTS (
      SELECT 1 FROM modules
      WHERE modules.id = lessons.module_id
      AND modules.status = 'published'
    )
  );

CREATE POLICY "Users can view lesson content"
  ON lesson_content
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = lesson_content.lesson_id
      AND (
        lessons.status = 'published' OR
        EXISTS (
          SELECT 1 FROM modules
          WHERE modules.id = lessons.module_id
          AND modules.status = 'published'
        )
      )
    )
  );