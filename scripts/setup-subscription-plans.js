// scripts/setup-subscription-plans.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas.');
  console.error('Certifique-se de que VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase com service role para operações admin
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const defaultSubscriptionPlans = [
  { 
    name: 'Básico', 
    value: 29.90, 
    periodicity: 'monthly', 
    features: ['Até 50 usuários', 'Checkups mensais', 'Relatórios básicos', 'Suporte por email'], 
    is_active: true, 
    description: 'Plano ideal para pequenas empresas iniciando sua jornada de bem-estar' 
  },
  { 
    name: 'Premium', 
    value: 79.90, 
    periodicity: 'monthly', 
    features: ['Até 200 usuários', 'Checkups personalizáveis', 'Relatórios avançados', 'Recomendações personalizadas', 'Suporte prioritário'], 
    is_active: true, 
    description: 'Recursos avançados para empresas em crescimento' 
  },
  { 
    name: 'Enterprise', 
    value: 199.90, 
    periodicity: 'monthly', 
    features: ['Até 1000 usuários', 'API dedicada', 'Checkups customizados', 'Relatórios completos', 'Integração com outros sistemas', 'Suporte 24/7'], 
    is_active: true, 
    description: 'Solução completa para grandes organizações' 
  }
];

async function setupSubscriptionPlans() {
  try {
    console.log('🚀 Verificando planos de assinatura...');
    
    // Verificar se a tabela subscription_plans existe
    let tableExists = true;
    try {
      const { data: tables } = await supabase.rpc('list_tables');
      tableExists = tables?.some(table => table === 'subscription_plans');
    } catch (error) {
      // Se não conseguir verificar via RPC, tenta via consulta direta
      try {
        const { error: tableError } = await supabase
          .from('subscription_plans')
          .select('count(*)', { count: 'exact', head: true });
        
        tableExists = !tableError || tableError.code !== '42P01';
      } catch (innerError) {
        tableExists = false;
      }
    }

    if (!tableExists) {
      // Criar a tabela se ela não existir
      console.log('📝 Tabela "subscription_plans" não existe. Criando a tabela...');
      
      // Criar tipo enum para periodicidade se não existir
      await supabase.rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_periodicity') THEN
              CREATE TYPE subscription_periodicity AS ENUM ('monthly', 'quarterly', 'annually');
            END IF;
          END $$;
        `
      });
      
      // Criar tabela
      await supabase.rpc('exec_sql', {
        sql: `
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
          
          -- Políticas para todos os usuários (visualização)
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
        `
      });
      
      console.log('✅ Tabela "subscription_plans" criada com sucesso');
    }
    
    // Verificar se existem planos na tabela
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro ao verificar planos existentes:', error.message);
      return;
    }
    
    const count = data?.[0]?.count || 0;
    
    if (count === 0) {
      console.log('📝 Tabela "subscription_plans" vazia. Inserindo planos padrão...');
      
      const { error: insertError } = await supabase
        .from('subscription_plans')
        .insert(defaultSubscriptionPlans);
      
      if (insertError) {
        console.error('❌ Erro ao inserir planos padrão:', insertError.message);
        return;
      }
      
      console.log('✅ Planos padrão inseridos com sucesso!');
    } else {
      console.log(`✅ Existem ${count} planos de assinatura na tabela.`);
    }
    
    console.log('\n🎉 Configuração dos planos de assinatura concluída!');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.error('\n🔧 Soluções possíveis:');
    console.error('1. Verifique se a SUPABASE_SERVICE_ROLE_KEY está correta no arquivo .env');
    console.error('2. Verifique se a URL do Supabase está correta');
    console.error('3. Execute as migrações do Supabase: `supabase migration up`');
    console.error('4. Verifique se você tem permissões para criar tabelas no banco de dados');
  }
}

// Executar função principal
setupSubscriptionPlans();