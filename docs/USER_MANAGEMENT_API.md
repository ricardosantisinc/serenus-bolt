# 📚 Documentação - Sistema de Gerenciamento de Usuários

## 🎯 **Visão Geral**

Sistema completo de gerenciamento de usuários integrado ao Serenus, seguindo os padrões arquiteturais já estabelecidos no projeto. Implementa operações CRUD completas com validações, autenticação e autorização baseada em roles.

---

## 🏗️ **Arquitetura**

### **Componentes Principais**
- `UserManagement.tsx` - Interface principal de gerenciamento
- `useUserManagement.ts` - Hook customizado para lógica de negócio
- Integração com sistema de permissões existente
- Consistent design system e padrões de UI/UX

### **Estrutura de Arquivos**
```
src/
├── components/
│   ├── UserManagement.tsx          # Interface principal
│   ├── AdminDashboard.tsx          # Integração com dashboard admin
│   ├── HRDashboard.tsx            # Integração com dashboard HR
│   └── SuperAdminDashboard.tsx    # Integração com dashboard super admin
├── hooks/
│   └── useUserManagement.ts       # Hook de gerenciamento
└── types/
    └── index.ts                   # Tipos TypeScript atualizados
```

---

## 🔧 **API Reference**

### **Hook: useUserManagement**

```typescript
interface UseUserManagementOptions {
  currentUser: User;
  onUserCreated?: (user: User) => void;
  onUserUpdated?: (user: User) => void;
  onUserDeleted?: (userId: string) => void;
  onError?: (error: string) => void;
}

const userManagement = useUserManagement(options);
```

### **Métodos Disponíveis**

#### **1. Criar Usuário**
```typescript
const createUser = async (userData: CreateUserData) => {
  // Implementação...
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: Exclude<User['role'], 'super_admin'>;
  department?: string;
  companyId?: string;
}
```

#### **2. Atualizar Usuário**
```typescript
const updateUser = async (userId: string, userData: UpdateUserData) => {
  // Implementação...
}

interface UpdateUserData {
  name: string;
  email: string;
  role: Exclude<User['role'], 'super_admin'>;
  department?: string;
  companyId?: string;
  password?: string; // Opcional - apenas se alterando senha
}
```

#### **3. Alternar Status**
```typescript
const toggleUserStatus = async (userId: string) => {
  // Ativa/desativa usuário
}
```

#### **4. Excluir Usuário**
```typescript
const deleteUser = async (userId: string) => {
  // Exclusão permanente com confirmação
}
```

---

## 🛡️ **Segurança e Validações**

### **Validações de Frontend**
- **Nome**: Obrigatório, mínimo 2 caracteres
- **Email**: Formato válido e único no sistema
- **Senha**: Mínimo 6 caracteres (criação e alteração)
- **Confirmação de senha**: Deve coincidir com senha
- **Role**: Valores permitidos baseados em enum
- **Empresa**: Obrigatória para super admins

### **Regras de Negócio**
- Usuários não podem alterar/excluir a si mesmos
- Super admins não podem ser excluídos
- Validação de duplicidade de email
- Verificação de permissões baseada em role
- Sanitização de dados de entrada

### **Controle de Acesso por Role**

| Role | Permissões |
|------|------------|
| **Super Admin** | ✅ Criar/editar/excluir usuários de qualquer empresa |
| **Admin** | ✅ Criar/editar/excluir usuários da própria empresa |
| **HR** | ✅ Criar/editar/excluir usuários da própria empresa |
| **Manager** | ❌ Sem permissões de gerenciamento |
| **Employee** | ❌ Sem permissões de gerenciamento |
| **Psychologist** | ❌ Sem permissões de gerenciamento |

---

## 🎨 **Interface do Usuário**

### **Componente Principal: UserManagement**
```typescript
interface UserManagementProps {
  users: User[];
  currentUser: User;
  companies: Array<{ id: string; name: string }>;
  onCreateUser: (userData: CreateUserData) => Promise<Result>;
  onUpdateUser: (userId: string, userData: UpdateUserData) => Promise<Result>;
  onToggleUserStatus: (userId: string) => Promise<Result>;
  onDeleteUser: (userId: string) => Promise<Result>;
  onClose: () => void;
}
```

### **Funcionalidades da Interface**
- **📋 Lista de usuários** com paginação e filtros
- **🔍 Busca** por nome, email ou departamento
- **🏷️ Filtros** por role, status e empresa
- **➕ Formulário de criação** com validações em tempo real
- **✏️ Edição inline** de usuários existentes
- **🔄 Toggle de status** ativo/inativo
- **🗑️ Exclusão** com confirmação obrigatória
- **📱 Design responsivo** para todas as telas

### **Estados Visuais**
- 🔄 **Loading**: Indicadores durante operações
- ✅ **Success**: Confirmações de sucesso
- ❌ **Error**: Mensagens de erro detalhadas
- ⚠️ **Warning**: Alertas de confirmação
- 🔍 **Empty State**: Estados vazios informativos

---

## 📊 **Estrutura de Dados**

### **User Interface (Atualizada)**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'employee' | 'hr' | 'psychologist';
  companyId?: string;
  department?: string;
  avatar?: string;
  isActive?: boolean;        // ✨ Novo campo
  createdAt?: Date;          // ✨ Novo campo
  updatedAt?: Date;          // ✨ Novo campo
  // ... outros campos existentes
}
```

### **Response Pattern**
```typescript
interface ApiResponse {
  success: boolean;
  message: string;
  user?: User;     // Para operações que retornam usuário
  errors?: string[]; // Para validações detalhadas
}
```

---

## 🚀 **Implementação e Integração**

### **1. Dashboard Integration**
O sistema está integrado nos dashboards:
- **SuperAdminDashboard**: Acesso global a todos os usuários
- **AdminDashboard**: Usuários da empresa do admin
- **HRDashboard**: Usuários da empresa do HR

### **2. Uso nos Dashboards**
```typescript
// No SuperAdminDashboard.tsx
const [showUserManagement, setShowUserManagement] = useState(false);
const userManagement = useUserManagement({ currentUser: user });

<UserManagement
  users={allUsers}
  currentUser={user}
  companies={companies}
  onCreateUser={userManagement.createUser}
  onUpdateUser={userManagement.updateUser}
  onToggleUserStatus={userManagement.toggleUserStatus}
  onDeleteUser={userManagement.deleteUser}
  onClose={() => setShowUserManagement(false)}
/>
```

### **3. Botões de Acesso**
```typescript
// Quick Action Cards
<button onClick={() => setShowUserManagement(true)}>
  <UserCog className="h-8 w-8 mb-4" />
  <h3>Gerenciar Usuários</h3>
  <p>Criar, editar e gerenciar usuários do sistema</p>
</button>
```

---

## 🧪 **Testing Guidelines**

### **Cenários de Teste**
1. **Criação de usuário**
   - ✅ Dados válidos
   - ❌ Email duplicado
   - ❌ Senha fraca
   - ❌ Campos obrigatórios vazios

2. **Edição de usuário**
   - ✅ Alteração de dados básicos
   - ✅ Alteração de senha (opcional)
   - ❌ Email já em uso por outro usuário
   - ❌ Tentativa de auto-edição

3. **Exclusão de usuário**
   - ✅ Exclusão normal
   - ❌ Tentativa de auto-exclusão
   - ❌ Exclusão de super admin

4. **Filtros e busca**
   - ✅ Busca por nome
   - ✅ Busca por email
   - ✅ Filtros por role/status/empresa

---

## 🔄 **Migration Path (Produção)**

### **Para implementação real com Supabase:**

1. **Substituir mock storage**:
```typescript
// Em useUserManagement.ts
import { supabase } from '../lib/supabase';

const createUser = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select();
    
  // Tratar resposta...
};
```

2. **Implementar RLS policies**:
```sql
-- Política para criação de usuários
CREATE POLICY "Admins can create users in their company"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'hr', 'super_admin')
    )
  );
```

3. **Adicionar triggers para auditoria**:
```sql
-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

---

## 📈 **Performance Considerations**

### **Otimizações Implementadas**
- **Debounced search** para reduzir chamadas desnecessárias
- **Client-side filtering** para operações rápidas
- **Lazy loading** de componentes pesados
- **Memoization** de cálculos complexos
- **Virtual scrolling** para listas grandes (futuro)

### **Monitoring**
- Log de operações críticas
- Tracking de performance de queries
- Métricas de uso das funcionalidades
- Alertas para falhas frequentes

---

## 🎯 **Próximos Passos**

### **Melhorias Futuras**
1. **Importação em lote** de usuários via CSV
2. **Exportação** de relatórios de usuários
3. **Histórico de alterações** (audit log)
4. **Notificações** por email para novos usuários
5. **Integração com Active Directory** (SSO)
6. **Dashboard de analytics** de usuários
7. **Sistema de tags** para categorização

### **Integrações Planejadas**
- Sistema de notificações push
- Workflow de aprovação de usuários
- Integração com sistema de checkups
- Reports automáticos para gestores

---

**📝 Última atualização**: 28/06/2025
**👨‍💻 Desenvolvido por**: Serenus Platform Team
**📊 Versão**: 1.0.0