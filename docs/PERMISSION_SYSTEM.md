# 🔐 Sistema de Permissões e Níveis de Acesso - Serenus SAAS

## 🎯 **Visão Geral**

Sistema de controle de acesso baseado em roles (RBAC) para o Serenus, garantindo segurança, privacidade de dados e segregação adequada de responsabilidades entre os três níveis hierárquicos.

---

## 🏗️ **Arquitetura de Permissões**

### **Princípios de Segurança**
- **Princípio do Menor Privilégio**: Cada usuário recebe apenas as permissões necessárias para suas funções
- **Segregação de Dados**: Isolamento total de dados entre empresas
- **Auditoria Completa**: Log de todas as ações sensíveis
- **Validação em Múltiplas Camadas**: Frontend, Backend e Banco de Dados
- **Criptografia de Dados Sensíveis**: Proteção de informações críticas

---

## 👑 **SUPERADMIN - Administrador do Sistema**

### **Escopo de Acesso**
- **Alcance**: Todo o sistema, todas as empresas
- **Limitações**: Nenhuma (acesso administrativo completo)
- **Auditoria**: Todas as ações são logadas e monitoradas

### **Permissões Detalhadas**

#### **1. Gerenciamento de Empresas**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Criar Empresa** | `companies:create` | Registro de novas empresas no sistema |
| **Visualizar Empresas** | `companies:read:all` | Acesso a dados de todas as empresas |
| **Editar Empresas** | `companies:update:all` | Modificação de dados empresariais |
| **Desativar Empresas** | `companies:deactivate` | Suspensão de contas empresariais |
| **Excluir Empresas** | `companies:delete` | Remoção permanente (com confirmação) |
| **Gerenciar Planos** | `subscription:manage:all` | Alterar planos de assinatura |
| **Configurar Limites** | `limits:configure:all` | Definir limites de usuários, storage, etc. |

#### **2. Gerenciamento Global de Usuários**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Criar Usuários** | `users:create:global` | Criar usuários em qualquer empresa |
| **Visualizar Usuários** | `users:read:global` | Acesso a dados de todos os usuários |
| **Editar Usuários** | `users:update:global` | Modificar qualquer perfil de usuário |
| **Alterar Roles** | `users:role:change:global` | Promover/rebaixar usuários |
| **Suspender Usuários** | `users:suspend:global` | Suspender contas temporariamente |
| **Excluir Usuários** | `users:delete:global` | Remoção permanente de usuários |
| **Redefinir Senhas** | `users:password:reset:global` | Reset de senhas de emergência |

#### **3. Configurações do Sistema**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Configurações Globais** | `system:config:all` | Parâmetros gerais do sistema |
| **Backup e Restore** | `system:backup:manage` | Gestão de backups do sistema |
| **Manutenção** | `system:maintenance` | Modo manutenção e atualizações |
| **Logs do Sistema** | `system:logs:read` | Acesso a logs de auditoria |
| **Monitoramento** | `system:monitoring:read` | Métricas de performance e uso |
| **Integrações** | `integrations:manage:all` | APIs e serviços externos |

#### **4. Relatórios e Analytics**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Relatórios Globais** | `reports:global:read` | Métricas consolidadas do sistema |
| **Analytics Empresariais** | `analytics:companies:read` | Dados analíticos por empresa |
| **Métricas de Uso** | `metrics:usage:read` | Estatísticas de utilização |
| **Relatórios Financeiros** | `reports:financial:read` | Dados de faturamento e receita |
| **Exportar Dados** | `data:export:global` | Exportação de dados para compliance |

#### **5. Gerenciamento de Conteúdo**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Criar Cursos** | `content:courses:create:global` | Criação de conteúdo educacional |
| **Gerenciar Biblioteca** | `content:library:manage:global` | Biblioteca global de conteúdo |
| **Aprovar Conteúdo** | `content:approval:global` | Aprovação de conteúdo criado |
| **Distribuir Conteúdo** | `content:distribute:global` | Atribuição massiva de conteúdo |

---

## 👔 **GERENTE - Gestor da Empresa**

### **Escopo de Acesso**
- **Alcance**: Apenas sua empresa designada
- **Limitações**: Sem acesso a dados de outras empresas
- **Auditoria**: Ações registradas no contexto empresarial

### **Permissões Detalhadas**

#### **1. Gerenciamento de Colaboradores**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Criar Colaboradores** | `users:create:company` | Adicionar novos funcionários |
| **Visualizar Equipe** | `users:read:company` | Dados dos colaboradores da empresa |
| **Editar Perfis** | `users:update:company` | Modificar dados dos funcionários |
| **Definir Departamentos** | `users:department:assign` | Organização departamental |
| **Suspender Contas** | `users:suspend:company` | Suspensão temporária |
| **Gerenciar Hierarquia** | `users:hierarchy:manage` | Estrutura organizacional |

#### **2. Relatórios da Equipe**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Relatórios de Bem-estar** | `reports:wellness:company` | Métricas de saúde mental da equipe |
| **Dashboard Gerencial** | `dashboard:manager:read` | Visão executiva da empresa |
| **Estatísticas Departamentais** | `analytics:departments:read` | Dados por departamento |
| **Relatórios de Progresso** | `reports:progress:team` | Avanço educacional da equipe |
| **Exportar Relatórios** | `reports:export:company` | Exportação de dados da empresa |

#### **3. Testes DASS21 da Equipe**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Visualizar Resultados** | `dass21:results:team:read` | Resultados dos testes da equipe |
| **Acompanhar Histórico** | `dass21:history:team:read` | Evolução dos indicadores |
| **Configurar Periodicidade** | `dass21:schedule:company` | Definir frequência dos testes |
| **Alertas de Risco** | `dass21:alerts:receive` | Notificações de casos críticos |
| **Relatórios Analíticos** | `dass21:analytics:team` | Análises estatísticas |

#### **4. Gestão de Conteúdo Educacional**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Atribuir Cursos** | `content:assign:team` | Designar conteúdo aos colaboradores |
| **Criar Trilhas** | `content:paths:create` | Criar jornadas educacionais |
| **Acompanhar Progresso** | `content:progress:monitor` | Monitorar conclusão de cursos |
| **Avaliar Desempenho** | `content:performance:evaluate` | Análise de performance educacional |
| **Biblioteca Empresarial** | `content:library:company` | Gestão do acervo da empresa |

#### **5. Configurações Empresariais**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Configurar Empresa** | `company:settings:update` | Dados e preferências da empresa |
| **Gerenciar Notificações** | `notifications:company:manage` | Configurar alertas e comunicações |
| **Definir Políticas** | `policies:company:define` | Políticas internas de bem-estar |

---

## 👤 **COLABORADOR - Usuário Final**

### **Escopo de Acesso**
- **Alcance**: Apenas dados pessoais e conteúdo atribuído
- **Limitações**: Sem acesso a dados de outros usuários
- **Auditoria**: Ações registradas para acompanhamento pessoal

### **Permissões Detalhadas**

#### **1. Gerenciamento do Perfil Pessoal**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Visualizar Perfil** | `profile:read:self` | Acesso aos próprios dados |
| **Editar Perfil** | `profile:update:self` | Modificar informações pessoais |
| **Alterar Senha** | `profile:password:change` | Segurança da conta |
| **Upload de Foto** | `profile:photo:upload` | Foto de perfil |
| **Preferências** | `profile:preferences:update` | Configurações pessoais |
| **Histórico Pessoal** | `profile:history:read` | Histórico de atividades |

#### **2. Testes DASS21 Pessoais**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Realizar Teste** | `dass21:test:take` | Execução do teste DASS21 |
| **Visualizar Resultados** | `dass21:results:self:read` | Próprios resultados históricos |
| **Acompanhar Evolução** | `dass21:progress:self:read` | Gráficos e tendências pessoais |
| **Exportar Dados** | `dass21:export:self` | Exportação dos próprios dados |
| **Lembretes** | `dass21:reminders:receive` | Notificações de teste |

#### **3. Conteúdo Educacional**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Visualizar Cursos** | `content:courses:assigned:read` | Cursos atribuídos pelo gerente |
| **Participar de Aulas** | `content:lessons:participate` | Acesso ao conteúdo das aulas |
| **Marcar Progresso** | `content:progress:self:update` | Registrar conclusão de módulos |
| **Fazer Anotações** | `content:notes:self:create` | Anotações pessoais |
| **Favoritar Conteúdo** | `content:favorites:self:manage` | Lista de favoritos |
| **Avaliações** | `content:ratings:submit` | Avaliar qualidade do conteúdo |

#### **4. Comunicação e Suporte**
| Ação | Permissão | Detalhes |
|------|-----------|----------|
| **Solicitar Ajuda** | `support:request:create` | Abrir tickets de suporte |
| **Chat com RH** | `communication:hr:chat` | Canal direto com RH |
| **Feedback Anônimo** | `feedback:anonymous:submit` | Enviar feedback sem identificação |
| **Recursos de Bem-estar** | `wellness:resources:access` | Acesso a materiais de apoio |

---

## 🔒 **Matriz de Segurança e Privacidade**

### **Controles de Acesso Implementados**

#### **1. Autenticação Multi-Fator (MFA)**
| Nível | Obrigatório | Método |
|-------|-------------|---------|
| **SuperAdmin** | ✅ Sim | TOTP + SMS |
| **Gerente** | ✅ Sim | TOTP ou SMS |
| **Colaborador** | ⚠️ Opcional | SMS |

#### **2. Criptografia de Dados**
| Tipo de Dado | Em Repouso | Em Trânsito | Chave |
|--------------|------------|-------------|-------|
| **Dados Pessoais** | AES-256 | TLS 1.3 | Company-specific |
| **Resultados DASS21** | AES-256 | TLS 1.3 | User-specific |
| **Senhas** | bcrypt | TLS 1.3 | Salt único |

#### **3. Auditoria e Compliance**
| Ação | Log Detalhado | Retenção | Acesso |
|-------|--------------|----------|---------|
| **Login/Logout** | ✅ IP, Device, Timestamp | 2 anos | SuperAdmin |
| **Mudanças de Dados** | ✅ Before/After, User | 7 anos | SuperAdmin, Compliance |
| **Acesso a Relatórios** | ✅ User, Data, Export | 2 anos | SuperAdmin |
| **Alterações de Permissão** | ✅ Full Context | Permanente | SuperAdmin |

#### **4. Isolamento de Dados**
```
🏢 Empresa A     🏢 Empresa B     🏢 Empresa C
├── 👥 Usuários  ├── 👥 Usuários  ├── 👥 Usuários
├── 📊 Dados     ├── 📊 Dados     ├── 📊 Dados
├── 📚 Conteúdo  ├── 📚 Conteúdo  ├── 📚 Conteúdo
└── 🔒 Isolado   └── 🔒 Isolado   └── 🔒 Isolado

        ⬇️ Acesso Controlado ⬇️
              🔧 SuperAdmin
```

---

## 🛠️ **Implementação Técnica**

### **1. Row Level Security (RLS) no Supabase**
```sql
-- Exemplo: Políticas para tabela users
CREATE POLICY "users_select_own_company" 
ON users FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "superadmin_full_access" 
ON users FOR ALL 
USING (is_super_admin(auth.uid()));
```

### **2. Middleware de Autorização**
```typescript
// Verificação de permissões em tempo real
const checkPermission = (permission: string, context?: any) => {
  return userPermissions.includes(permission) && 
         validateContext(context);
};
```

### **3. Validação no Frontend**
```typescript
// Renderização condicional baseada em permissões
{hasPermission('reports:global:read') && (
  <GlobalReportsSection />
)}
```

---

## 🚨 **Cenários de Emergência**

### **1. Vazamento de Dados**
- **Isolamento Imediato**: Suspensão automática de acessos
- **Notificação**: Alertas em tempo real para SuperAdmins
- **Auditoria**: Log detalhado para investigação
- **Comunicação**: Notificação às empresas afetadas

### **2. Acesso Não Autorizado**
- **Bloqueio Automático**: Conta suspensa após tentativas falhadas
- **Análise de Comportamento**: IA para detectar padrões suspeitos
- **Escalação**: Notificação imediata para SuperAdmins

### **3. Perda de Acesso de SuperAdmin**
- **Conta de Emergência**: SuperAdmin backup pré-configurado
- **Processo de Recuperação**: Verificação multi-etapa
- **Documentação**: Procedimentos claros e auditados

---

## 📋 **Checklist de Compliance**

### **LGPD (Lei Geral de Proteção de Dados)**
- ✅ Consentimento explícito para coleta de dados
- ✅ Direito de acesso, retificação e exclusão
- ✅ Portabilidade de dados
- ✅ Minimização de dados coletados
- ✅ Pseudonimização de dados sensíveis

### **ISO 27001 (Segurança da Informação)**
- ✅ Política de segurança documentada
- ✅ Gestão de riscos implementada
- ✅ Controles de acesso baseados em roles
- ✅ Monitoramento contínuo
- ✅ Resposta a incidentes estruturada

---

## 🔄 **Atualizações e Melhorias Futuras**

### **Versão 2.0 - Planejadas**
1. **Permissões Granulares**: Controle mais fino por funcionalidade
2. **Aprovação em Múltiplas Etapas**: Workflow para ações críticas
3. **Inteligência Artificial**: Detecção de anomalias comportamentais
4. **Certificações**: SOC 2, ISO 27001 completas
5. **Zero Trust Architecture**: Verificação contínua de identidade

### **Integrações Planejadas**
- **Single Sign-On (SSO)**: SAML/OAuth2
- **Active Directory**: Sincronização de usuários
- **Ferramentas de Compliance**: Automação de auditoria
- **SIEM**: Integração com sistemas de segurança

---

**📝 Última atualização**: 28/06/2025  
**👨‍💻 Desenvolvido por**: Serenus Platform Team  
**🔐 Versão de Segurança**: 1.0.0  
**📊 Status**: Implementado e Auditado