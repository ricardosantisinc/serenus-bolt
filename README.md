# Plataforma Serenus

Sistema de gestão de saúde mental corporativa com avaliações DASS-21 e IAS.

## Configuração Inicial

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração do Banco de Dados

Certifique-se de que as migrações do Supabase foram executadas e que as tabelas estão criadas.

### 3. Configuração do Usuário Administrador

**IMPORTANTE**: Antes de usar a aplicação, você deve criar o usuário administrador.

#### Passo 1: Configurar a Service Role Key

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings > API**
4. Copie a **service_role** key (não a anon key)
5. Edite o arquivo `.env` e substitua `your_service_role_key_here` pela chave real:

```env
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

#### Passo 2: Executar o Script de Configuração

```bash
npm run setup-admin
```

Este script criará o usuário administrador padrão:
- **Email**: admin@serenus.com  
- **Senha**: admin123456

### 4. Configuração dos Planos de Assinatura

Se a tabela `subscription_plans` estiver vazia ou não existir, execute:

```bash
npm run setup-plans
```

Este script verificará e, se necessário, criará a tabela de planos e inserirá os planos de assinatura padrão na sua base de dados.

### 5. Executar a Aplicação

```bash
npm run dev
```

### 6. Fazer Login

Acesse a aplicação em http://localhost:5173 e faça login com:
- **Email**: admin@serenus.com
- **Senha**: admin123456

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

## Solução de Problemas

### Erro "relation 'public.subscription_plans' does not exist"

Este erro ocorre quando a tabela de planos de assinatura não foi criada. Execute:

```bash
npm run setup-plans
```

### Erro "Invalid login credentials"

Este erro indica que o usuário administrador não foi criado. Execute:

```bash
npm run setup-admin
```

### Erro no script setup-admin

Verifique se:
1. A `SUPABASE_SERVICE_ROLE_KEY` está configurada corretamente no `.env`
2. A URL do Supabase está correta
3. As tabelas do banco de dados foram criadas
4. As permissões RLS estão configuradas

### Verificar se o usuário foi criado

Você pode verificar no painel do Supabase:
1. Vá em **Authentication > Users**
2. Procure por `admin@serenus.com`

## Estrutura do Projeto

- `/src/components/` - Componentes React
- `/src/hooks/` - Hooks customizados
- `/src/utils/` - Utilitários e helpers
- `/src/types/` - Definições de tipos TypeScript
- `/scripts/` - Scripts de configuração
- `/supabase/migrations/` - Migrações do banco de dados

## Tecnologias Utilizadas

- React + TypeScript
- Vite
- Supabase (Backend as a Service)
- Tailwind CSS
- Lucide React (Ícones)
- Recharts (Gráficos)