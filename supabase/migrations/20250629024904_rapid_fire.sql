/*
  # Integração dos Testes DASS-21 e IAS

  1. Alterações na tabela checkup_results
    - Adicionar campos para o teste IAS
    - Adicionar campos para resultados combinados
    - Atualizar políticas se necessário

  2. Novos campos
    - ias_responses (jsonb) - Respostas do teste IAS
    - ias_total_score (integer) - Score total do IAS
    - ias_classification (text) - Classificação do IAS
    - combined_recommended_paths (text[]) - Trilhas recomendadas combinadas
    - combined_psychologist_referral_needed (boolean) - Necessidade de encaminhamento psicológico
    - combined_justification (text) - Justificativa da classificação combinada
    - combined_critical_level (text) - Nível crítico geral
    - combined_recommendations (text[]) - Recomendações detalhadas combinadas
*/

-- Adicionar novas colunas à tabela checkup_results
DO $$
BEGIN
  -- IAS data fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkup_results' AND column_name = 'ias_responses'
  ) THEN
    ALTER TABLE checkup_results ADD COLUMN ias_responses jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkup_results' AND column_name = 'ias_total_score'
  ) THEN
    ALTER TABLE checkup_results ADD COLUMN ias_total_score integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkup_results' AND column_name = 'ias_classification'
  ) THEN
    ALTER TABLE checkup_results ADD COLUMN ias_classification text CHECK (ias_classification IN ('alto_risco', 'desbalanceada', 'razoavel', 'saudavel'));
  END IF;

  -- Combined assessment fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkup_results' AND column_name = 'combined_recommended_paths'
  ) THEN
    ALTER TABLE checkup_results ADD COLUMN combined_recommended_paths text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkup_results' AND column_name = 'combined_psychologist_referral_needed'
  ) THEN
    ALTER TABLE checkup_results ADD COLUMN combined_psychologist_referral_needed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkup_results' AND column_name = 'combined_justification'
  ) THEN
    ALTER TABLE checkup_results ADD COLUMN combined_justification text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkup_results' AND column_name = 'combined_critical_level'
  ) THEN
    ALTER TABLE checkup_results ADD COLUMN combined_critical_level text CHECK (combined_critical_level IN ('baixo', 'moderado', 'alto', 'crítico'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkup_results' AND column_name = 'combined_recommendations'
  ) THEN
    ALTER TABLE checkup_results ADD COLUMN combined_recommendations text[];
  END IF;
END $$;

-- Adicionar índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_checkup_results_ias_classification ON checkup_results(ias_classification);
CREATE INDEX IF NOT EXISTS idx_checkup_results_combined_critical_level ON checkup_results(combined_critical_level);
CREATE INDEX IF NOT EXISTS idx_checkup_results_combined_psychologist_referral ON checkup_results(combined_psychologist_referral_needed);

-- Comentários para documentação
COMMENT ON COLUMN checkup_results.ias_responses IS 'Respostas do questionário IAS (Índice de Alimentação Saudável)';
COMMENT ON COLUMN checkup_results.ias_total_score IS 'Score total do IAS calculado';
COMMENT ON COLUMN checkup_results.ias_classification IS 'Classificação do IAS: alto_risco, desbalanceada, razoavel, saudavel';
COMMENT ON COLUMN checkup_results.combined_recommended_paths IS 'Trilhas de tratamento recomendadas baseadas na avaliação combinada DASS-21 + IAS';
COMMENT ON COLUMN checkup_results.combined_psychologist_referral_needed IS 'Indica se há necessidade de encaminhamento psicológico baseado na avaliação combinada';
COMMENT ON COLUMN checkup_results.combined_justification IS 'Justificativa técnica da classificação combinada';
COMMENT ON COLUMN checkup_results.combined_critical_level IS 'Nível crítico geral: baixo, moderado, alto, crítico';
COMMENT ON COLUMN checkup_results.combined_recommendations IS 'Recomendações detalhadas baseadas na avaliação combinada';