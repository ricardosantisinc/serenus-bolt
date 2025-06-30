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
    
    // Verificar se o usuário já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', adminEmail)
      .single();
      
    if (existingUser) {
      console.log('✅ Usuário administrador já existe:', adminEmail);
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Senha:', adminPassword);
      return;
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
      throw new Error(`Erro ao criar usuário na autenticação: ${authError.message}`);
    }
    
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
    
    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('📧 Email de login:', adminEmail);
    console.log('🔑 Senha de login:', adminPassword);
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    process.exit(1);
  }
}

// Executar configuração
createDefaultAdmin();