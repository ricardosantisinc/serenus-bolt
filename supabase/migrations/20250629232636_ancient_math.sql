/*
  # Funções e Stored Procedures para o Serenus

  1. Funções Utilitárias
    - `increment_company_users`: Incrementa o contador de usuários de uma empresa
    - `decrement_company_users`: Decrementa o contador de usuários de uma empresa
    
  2. Segurança
    - Funções acessíveis apenas por usuários autenticados
    - Permissão de execução somente para roles apropriadas
*/

-- Função para incrementar o contador de usuários de uma empresa
CREATE OR REPLACE FUNCTION increment_company_users(company_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE companies
  SET 
    current_users = current_users + 1,
    updated_at = now()
  WHERE id = company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar o contador de usuários de uma empresa
CREATE OR REPLACE FUNCTION decrement_company_users(company_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE companies
  SET 
    current_users = GREATEST(current_users - 1, 0), -- Evitar número negativo
    updated_at = now()
  WHERE id = company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões para as funções
GRANT EXECUTE ON FUNCTION increment_company_users TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_company_users TO authenticated;

-- Trigger para atualizar contador de usuários quando um usuário é criado
CREATE OR REPLACE FUNCTION update_company_users_on_user_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando um novo usuário é criado
  IF TG_OP = 'INSERT' THEN
    IF NEW.company_id IS NOT NULL THEN
      PERFORM increment_company_users(NEW.company_id);
    END IF;
  
  -- Quando um usuário é atualizado
  ELSIF TG_OP = 'UPDATE' THEN
    -- Se a empresa foi alterada
    IF OLD.company_id IS DISTINCT FROM NEW.company_id THEN
      -- Decrementar contador da empresa antiga
      IF OLD.company_id IS NOT NULL THEN
        PERFORM decrement_company_users(OLD.company_id);
      END IF;
      
      -- Incrementar contador da nova empresa
      IF NEW.company_id IS NOT NULL THEN
        PERFORM increment_company_users(NEW.company_id);
      END IF;
    END IF;
  
  -- Quando um usuário é excluído
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.company_id IS NOT NULL THEN
      PERFORM decrement_company_users(OLD.company_id);
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger se já existir
DROP TRIGGER IF EXISTS trigger_update_company_users ON users;

-- Criar trigger para gerenciar contadores de usuários
CREATE TRIGGER trigger_update_company_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_company_users_on_user_change();