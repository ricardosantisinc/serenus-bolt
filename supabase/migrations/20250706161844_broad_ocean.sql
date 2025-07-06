/*
  # Adição da tabela de planos de assinatura

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `value` (numeric, not null, >= 0)
      - `periodicity` (enum: monthly, quarterly, annually)
      - `features` (text array)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now)
      - `description` (text, nullable)

  2. Security
    - Enable RLS on `subscription_plans` table
    - Add policy for super admins to manage all plans
    - Add policy for authenticated users to view active plans

  3. Data
    - Insert default subscription plans (Básico, Premium, Enterprise)
*/

-- Criar tipo enum para periodicidade se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_periodicity') THEN
    CREATE TYPE subscription_periodicity AS ENUM ('monthly', 'quarterly', 'annually');
  END IF;
END $$;

-- Criar tabela de planos de assinatura se não existir
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value numeric NOT NULL CHECK (value >= 0),
  periodicity subscription_periodicity NOT NULL,
  features text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  description text
);

-- Criar índices para melhor performance se não existirem
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_value ON subscription_plans(value);

-- Habilitar RLS se ainda não estiver habilitado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'subscription_plans' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Criar política para super admins se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscription_plans' 
    AND policyname = 'Super admins can manage all subscription plans'
  ) THEN
    CREATE POLICY "Super admins can manage all subscription plans"
      ON subscription_plans
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND users.role = 'super_admin'
        )
      );
  END IF;
END $$;

-- Criar política para usuários autenticados visualizarem planos ativos se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscription_plans' 
    AND policyname = 'All authenticated users can view active subscription plans'
  ) THEN
    CREATE POLICY "All authenticated users can view active subscription plans"
      ON subscription_plans
      FOR SELECT
      TO authenticated
      USING (is_active = true OR 
        EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND users.role IN ('super_admin', 'gerente')
        )
      );
  END IF;
END $$;

-- Inserir planos padrão apenas se a tabela estiver vazia
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM subscription_plans LIMIT 1) THEN
    INSERT INTO subscription_plans (name, value, periodicity, features, is_active, description)
    VALUES 
      ('Básico', 29.90, 'monthly', 
       ARRAY['Até 50 usuários', 'Checkups mensais', 'Relatórios básicos', 'Suporte por email'], 
       true,
       'Plano ideal para pequenas empresas iniciando sua jornada de bem-estar'),
      
      ('Premium', 79.90, 'monthly', 
       ARRAY['Até 200 usuários', 'Checkups personalizáveis', 'Relatórios avançados', 'Recomendações personalizadas', 'Suporte prioritário'], 
       true,
       'Recursos avançados para empresas em crescimento'),
      
      ('Enterprise', 199.90, 'monthly', 
       ARRAY['Até 1000 usuários', 'API dedicada', 'Checkups customizados', 'Relatórios completos', 'Integração com outros sistemas', 'Suporte 24/7'], 
       true,
       'Solução completa para grandes organizações');
  END IF;
END $$;