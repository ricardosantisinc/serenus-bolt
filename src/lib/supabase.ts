import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase usando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Credenciais do Supabase não configuradas. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);