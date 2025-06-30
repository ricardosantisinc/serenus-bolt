-- Adição da tabela de planos de assinatura

-- Criar tipo enum para periodicidade
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_periodicity') THEN
    CREATE TYPE subscription_periodicity AS ENUM ('monthly', 'quarterly', 'annually');
  END IF;
END $$;

-- Criar tabela de planos de assinatura
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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_value ON subscription_plans(value);

-- Habilitar RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Políticas para super_admin
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

-- Políticas para gerentes
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

-- Inserir planos padrão
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