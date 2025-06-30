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
    
    // Verificar se existem planos na tabela
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro ao verificar planos existentes:', error);
      
      if (error.code === '42P01') { // Código para "relation does not exist"
        console.error('🛑 A tabela "subscription_plans" não existe.');
        console.error('Execute as migrações do Supabase primeiro: `supabase migration up`');
      }
      return;
    }
    
    const count = data?.[0]?.count || 0;
    
    if (count === 0) {
      console.log('📝 Tabela "subscription_plans" vazia. Inserindo planos padrão...');
      
      const { error: insertError } = await supabase
        .from('subscription_plans')
        .insert(defaultSubscriptionPlans);
      
      if (insertError) {
        console.error('❌ Erro ao inserir planos padrão:', insertError);
        return;
      }
      
      console.log('✅ Planos padrão inseridos com sucesso!');
    } else {
      console.log(`✅ Existem ${count} planos de assinatura na tabela.`);
    }
    
    console.log('\n🎉 Configuração dos planos de assinatura concluída!');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    console.error('\n🔧 Soluções possíveis:');
    console.error('1. Verifique se a SUPABASE_SERVICE_ROLE_KEY está correta no arquivo .env');
    console.error('2. Verifique se a URL do Supabase está correta');
    console.error('3. Execute as migrações do Supabase: `supabase migration up`');
    console.error('4. Verifique se você tem permissões para acessar a tabela subscription_plans');
  }
}

// Executar função principal
setupSubscriptionPlans();