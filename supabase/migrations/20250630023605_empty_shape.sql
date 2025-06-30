-- Adição da tabela de planos de assinatura

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

-- Criar índices para melhor performance (apenas se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_subscription_plans_active'
  ) THEN
    CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_subscription_plans_value'
  ) THEN
    CREATE INDEX idx_subscription_plans_value ON subscription_plans(value);
  END IF;
END $$;

-- Habilitar RLS se não estiver habilitado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'subscription_plans' AND rowsecurity = 't'
  ) THEN
    ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Verificar se as políticas existem antes de criar
DO $$
BEGIN
  -- Verificar política para super_admin
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscription_plans' AND policyname = 'Super admins can manage all subscription plans'
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

  -- Verificar política para visualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscription_plans' AND policyname = 'All authenticated users can view active subscription plans'
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

-- Inserir planos padrão se não existirem
INSERT INTO subscription_plans (name, value, periodicity, features, is_active, description)
SELECT 
  'Básico', 29.90, 'monthly', 
  ARRAY['Até 50 usuários', 'Checkups mensais', 'Relatórios básicos', 'Suporte por email'], 
  true,
  'Plano ideal para pequenas empresas iniciando sua jornada de bem-estar'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE name = 'Básico'
);

INSERT INTO subscription_plans (name, value, periodicity, features, is_active, description)
SELECT 
  'Premium', 79.90, 'monthly', 
  ARRAY['Até 200 usuários', 'Checkups personalizáveis', 'Relatórios avançados', 'Recomendações personalizadas', 'Suporte prioritário'], 
  true,
  'Recursos avançados para empresas em crescimento'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE name = 'Premium'
);

INSERT INTO subscription_plans (name, value, periodicity, features, is_active, description)
SELECT 
  'Enterprise', 199.90, 'monthly', 
  ARRAY['Até 1000 usuários', 'API dedicada', 'Checkups customizados', 'Relatórios completos', 'Integração com outros sistemas', 'Suporte 24/7'], 
  true,
  'Solução completa para grandes organizações'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE name = 'Enterprise'
);