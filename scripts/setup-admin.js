#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas.');
  console.error('Certifique-se de que VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no arquivo .env');
  console.error('\n📋 Instruções para obter a Service Role Key:');
  console.error('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
  console.error('2. Selecione seu projeto');
  console.error('3. Vá em Settings > API');
  console.error('4. Copie a "service_role" key (não a anon key)');
  console.error('5. Cole no arquivo .env na variável SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (supabaseServiceKey === 'your_service_role_key_here') {
  console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY ainda não foi configurada.');
  console.error('Substitua "your_service_role_key_here" pela chave real do Supabase.');
  console.error('\n📋 Instruções para obter a Service Role Key:');
  console.error('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
  console.error('2. Selecione seu projeto');
  console.error('3. Vá em Settings > API');
  console.error('4. Copie a "service_role" key (não a anon key)');
  console.error('5. Cole no arquivo .env substituindo "your_service_role_key_here"');
  process.exit(1);
}

// Criar cliente Supabase com service role para operações admin
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDefaultAdmin() {
  try {
    console.log('🚀 Iniciando configuração do usuário administrador...');
    
    const adminEmail = 'admin@serenus.com';
    const adminPassword = 'admin123456';
    const adminName = 'Administrador Serenus';
    
    // Verificar se o usuário já existe na tabela users
    console.log('🔍 Verificando se o usuário administrador já existe...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', adminEmail)
      .single();
      
    if (existingUser && !checkError) {
      console.log('✅ Usuário administrador já existe na tabela users:', adminEmail);
      console.log('🔄 Verificando se existe na autenticação...');
      
      // Verificar se existe na autenticação
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('⚠️  Erro ao verificar usuários na autenticação:', authError.message);
      } else {
        const authUser = authUsers.users.find(u => u.email === adminEmail);
        if (authUser) {
          console.log('✅ Usuário também existe na autenticação');
          console.log('\n🎉 Configuração já concluída!');
          console.log('📧 Email de login:', adminEmail);
          console.log('🔑 Senha de login:', adminPassword);
          return;
        } else {
          console.log('⚠️  Usuário existe na tabela mas não na autenticação. Criando na autenticação...');
          
          // Criar na autenticação usando o mesmo ID
          const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: {
              name: adminName,
              role: 'super_admin'
            }
          });
          
          if (authCreateError) {
            console.error('❌ Erro ao criar usuário na autenticação:', authCreateError.message);
            return;
          }
          
          // Atualizar o ID na tabela users se necessário
          if (authData.user && authData.user.id !== existingUser.id) {
            const { error: updateError } = await supabase
              .from('users')
              .update({ id: authData.user.id })
              .eq('email', adminEmail);
              
            if (updateError) {
              console.error('⚠️  Erro ao atualizar ID do usuário:', updateError.message);
            }
          }
          
          console.log('✅ Usuário criado na autenticação com sucesso');
          console.log('\n🎉 Configuração concluída!');
          console.log('📧 Email de login:', adminEmail);
          console.log('🔑 Senha de login:', adminPassword);
          return;
        }
      }
    }
    
    // Criar usuário na autenticação Supabase
    console.log('👤 Criando usuário na autenticação...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        name: adminName,
        role: 'super_admin'
      }
    });
    
    if (authError) {
      // Verificar se o erro é porque o usuário já existe
      if (authError.message.includes('already registered')) {
        console.log('✅ Usuário já existe na autenticação');
        // Tentar obter o usuário existente
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const existingAuthUser = authUsers.users.find(u => u.email === adminEmail);
        
        if (existingAuthUser) {
          // Verificar se existe na tabela users
          const { data: tableUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', adminEmail)
            .single();
            
          if (!tableUser) {
            // Criar na tabela users
            console.log('📝 Criando registro do usuário na tabela...');
            const { error: userError } = await supabase
              .from('users')
              .insert([{
                id: existingAuthUser.id,
                name: adminName,
                email: adminEmail,
                role: 'super_admin',
                company_id: null,
                department: null,
                is_active: true
              }]);
              
            if (userError) {
              throw new Error(`Erro ao criar registro do usuário: ${userError.message}`);
            }
            
            console.log('✅ Registro do usuário criado com sucesso');
          }
        }
      } else {
        throw new Error(`Erro ao criar usuário na autenticação: ${authError.message}`);
      }
    } else {
      if (!authData.user) {
        throw new Error('Falha ao criar usuário na autenticação');
      }
      
      console.log('✅ Usuário criado na autenticação com sucesso');
      
      // Criar registro na tabela users
      console.log('📝 Criando registro do usuário na tabela...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          name: adminName,
          email: adminEmail,
          role: 'super_admin',
          company_id: null, // Super admin não pertence a uma empresa específica
          department: null,
          is_active: true
        }])
        .select()
        .single();
        
      if (userError) {
        // Se houve erro ao criar o registro, tentar excluir o usuário da autenticação
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
          console.log('🧹 Usuário removido da autenticação devido ao erro');
        } catch (cleanupError) {
          console.error('⚠️  Erro ao limpar usuário da autenticação:', cleanupError.message);
        }
        
        throw new Error(`Erro ao criar registro do usuário: ${userError.message}`);
      }
      
      console.log('✅ Registro do usuário criado com sucesso');
    }
    
    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('📧 Email de login:', adminEmail);
    console.log('🔑 Senha de login:', adminPassword);
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    console.log('\n🔗 Agora você pode fazer login no sistema com essas credenciais.');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    console.error('\n🔧 Soluções possíveis:');
    console.error('1. Verifique se a SUPABASE_SERVICE_ROLE_KEY está correta');
    console.error('2. Verifique se a URL do Supabase está correta');
    console.error('3. Verifique se as tabelas do banco de dados foram criadas');
    console.error('4. Verifique as permissões RLS no Supabase');
    process.exit(1);
  }
}

// Executar configuração
createDefaultAdmin();