/*
  # Sistema de Recomendações Personalizadas por Empresa

  1. Nova Tabela
    - `company_recommendations` - Armazena recomendações personalizadas por empresa
      - `id` (uuid, chave primária)
      - `company_id` (uuid, chave estrangeira para companies)
      - `title` (text) - Título da recomendação
      - `content` (text) - Conteúdo detalhado da recomendação
      - `recommendation_type` (text) - Tipo da recomendação ('mental_health', 'nutrition', 'general', 'integrated', 'universal')
      - `order_index` (integer) - Para ordenação das recomendações
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Enable RLS na tabela company_recommendations
    - Políticas para super_admin: acesso total
    - Políticas para gerente: acesso total às recomendações da própria empresa
    - Políticas para colaborador: acesso de leitura às recomendações da própria empresa
*/

-- Criar tabela de recomendações por empresa
CREATE TABLE IF NOT EXISTS company_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('mental_health', 'nutrition', 'general', 'integrated', 'universal')),
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_company_recommendations_company_id ON company_recommendations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_recommendations_type ON company_recommendations(recommendation_type);

-- Habilitar RLS
ALTER TABLE company_recommendations ENABLE ROW LEVEL SECURITY;

-- Políticas para super_admin
CREATE POLICY "Super admins can manage all recommendations"
  ON company_recommendations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Políticas para gerente
CREATE POLICY "Gerentes can manage company recommendations"
  ON company_recommendations
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'gerente'
    )
  );

-- Políticas para colaborador
CREATE POLICY "Colaboradores can view company recommendations"
  ON company_recommendations
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Inserir recomendações padrão para cada empresa
INSERT INTO company_recommendations (company_id, title, content, recommendation_type, order_index)
SELECT 
  id AS company_id,
  'Cuidando da Saúde Mental' AS title,
  'Pratique técnicas de respiração diariamente para reduzir o estresse. Reserve momentos para atividades prazerosas e desconexão digital. Considere a meditação como parte da sua rotina.' AS content,
  'mental_health' AS recommendation_type,
  1 AS order_index
FROM companies;

INSERT INTO company_recommendations (company_id, title, content, recommendation_type, order_index)
SELECT 
  id AS company_id,
  'Alimentação Saudável' AS title,
  'Mantenha uma dieta equilibrada com frutas, vegetais e proteínas magras. Hidrate-se adequadamente bebendo pelo menos 2 litros de água por dia. Evite alimentos ultraprocessados e excesso de açúcar.' AS content,
  'nutrition' AS recommendation_type,
  2 AS order_index
FROM companies;

INSERT INTO company_recommendations (company_id, title, content, recommendation_type, order_index)
SELECT 
  id AS company_id,
  'Bem-estar Integrado' AS title,
  'Lembre-se que saúde mental e alimentação saudável estão conectadas. Uma boa nutrição melhora seu humor e funções cognitivas, enquanto um estado mental equilibrado favorece escolhas alimentares mais conscientes.' AS content,
  'integrated' AS recommendation_type,
  3 AS order_index
FROM companies;

INSERT INTO company_recommendations (company_id, title, content, recommendation_type, order_index)
SELECT 
  id AS company_id,
  'Práticas Universais de Bem-estar' AS title,
  'Pratique atividade física regularmente (pelo menos 30 min, 3x por semana). Mantenha uma rotina de sono adequada (7-8 horas por noite). Cultive relacionamentos sociais saudáveis e redes de apoio.' AS content,
  'universal' AS recommendation_type,
  4 AS order_index
FROM companies;