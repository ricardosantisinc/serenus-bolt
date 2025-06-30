# 📚 Documentação - Sistema de Programas Educacionais

## 🎯 **Visão Geral**

Sistema completo de gerenciamento de programas educacionais integrado ao Serenus, permitindo criação, organização e distribuição de conteúdo educacional hierárquico com suporte a múltiplos tipos de mídia.

---

## 🏗️ **Arquitetura do Sistema**

### **Estrutura Hierárquica**
```
📚 Curso
├── 📖 Módulo 1
│   ├── 📄 Aula 1 (Texto)
│   ├── 🎥 Aula 2 (Vídeo)
│   └── 📎 Aula 3 (Documento)
├── 📖 Módulo 2
│   ├── 🎭 Aula 4 (Misto)
│   └── 📄 Aula 5 (Texto)
└── 📖 Módulo 3
    └── 🎥 Aula 6 (Vídeo)
```

### **Componentes Principais**
- `EducationalPrograms.tsx` - Interface principal de gerenciamento
- `CourseEditor.tsx` - Editor de cursos
- `ModuleEditor.tsx` - Editor de módulos  
- `LessonEditor.tsx` - Editor de aulas
- `ContentViewer.tsx` - Visualizador de conteúdo
- `RichTextEditor.tsx` - Editor de texto rico
- `VideoContentEditor.tsx` - Editor de conteúdo de vídeo
- `DocumentUploader.tsx` - Upload de documentos
- `useEducationalPrograms.ts` - Hook de gerenciamento

---

## 🔧 **API Reference**

### **Hook: useEducationalPrograms**

```typescript
interface UseEducationalProgramsOptions {
  currentUser: User;
  onError?: (error: string) => void;
}

const {
  courses,
  isLoading,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderContent,
  getStats,
  getCourseTree
} = useEducationalPrograms(options);
```

### **Métodos de Gerenciamento**

#### **1. Gerenciamento de Cursos**
```typescript
// Criar curso
const createCourse = async (courseData: CourseFormData) => Promise<Course>

// Atualizar curso
const updateCourse = async (courseId: string, courseData: CourseFormData) => Promise<Course>

// Excluir curso
const deleteCourse = async (courseId: string) => Promise<boolean>
```

#### **2. Gerenciamento de Módulos**
```typescript
// Criar módulo
const createModule = async (courseId: string, moduleData: ModuleFormData) => Promise<Module>

// Atualizar módulo
const updateModule = async (moduleId: string, moduleData: ModuleFormData) => Promise<Module>

// Excluir módulo
const deleteModule = async (moduleId: string) => Promise<boolean>
```

#### **3. Gerenciamento de Aulas**
```typescript
// Criar aula
const createLesson = async (
  moduleId: string, 
  lessonData: LessonFormData & { content: LessonContent }
) => Promise<Lesson>

// Atualizar aula
const updateLesson = async (
  lessonId: string, 
  lessonData: LessonFormData & { content: LessonContent }
) => Promise<Lesson>

// Excluir aula
const deleteLesson = async (lessonId: string) => Promise<boolean>
```

---

## 📊 **Estrutura de Dados**

### **Course Interface**
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  status: PublicationStatus; // 'draft' | 'published' | 'archived'
  order: number;
  modules: Module[];
  totalLessons: number;
  estimatedDuration: number; // em minutos
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}
```

### **Module Interface**
```typescript
interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  status: PublicationStatus;
  order: number;
  lessons: Lesson[];
  estimatedDuration: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Lesson Interface**
```typescript
interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  status: PublicationStatus;
  order: number;
  contentType: ContentType; // 'text' | 'video' | 'document' | 'mixed'
  content: LessonContent;
  estimatedDuration: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### **LessonContent Interface**
```typescript
interface LessonContent {
  text?: RichTextContent;
  videos?: VideoContent[];
  documents?: DocumentContent[];
}

interface RichTextContent {
  id: string;
  content: string; // HTML content
  order: number;
}

interface VideoContent {
  id: string;
  title: string;
  description?: string;
  provider: 'youtube' | 'vimeo';
  videoId: string;
  embedUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  order: number;
}

interface DocumentContent {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  originalFileName: string;
  fileType: 'pdf' | 'doc' | 'docx';
  fileSize: number;
  downloadUrl: string;
  previewUrl?: string;
  order: number;
  uploadedAt: Date;
}
```

---

## 🎨 **Interface do Usuário**

### **Componente Principal: EducationalPrograms**
```typescript
interface EducationalProgramsProps {
  currentUser: User;
  onClose: () => void;
}
```

### **Funcionalidades da Interface**
- **📊 Dashboard com estatísticas** de cursos, módulos e aulas
- **🔍 Sistema de busca** por título, descrição e tags
- **🏷️ Filtros avançados** por status, tipo de conteúdo e categoria
- **📋 Visualização em grade** e **🌳 visualização em árvore**
- **✏️ Editores especializados** para cada tipo de conteúdo
- **👁️ Preview de conteúdo** antes da publicação
- **🎯 Drag-and-drop** para reordenação (futuro)

### **Estados Visuais**
- 🔄 **Loading**: Indicadores durante operações
- ✅ **Success**: Confirmações de sucesso
- ❌ **Error**: Mensagens de erro detalhadas
- 📝 **Draft**: Conteúdo em rascunho
- 🌐 **Published**: Conteúdo publicado
- 📦 **Archived**: Conteúdo arquivado

---

## 🛡️ **Segurança e Controle de Acesso**

### **Controle de Acesso por Role**

| Role | Permissões |
|------|------------|
| **Super Admin** | ✅ CRUD completo de todos os conteúdos |
| **Admin** | ❌ Sem permissões de gerenciamento |
| **HR** | ❌ Sem permissões de gerenciamento |
| **Manager** | ❌ Sem permissões de gerenciamento |
| **Employee** | 👁️ Apenas visualização de conteúdo publicado |
| **Psychologist** | 👁️ Apenas visualização de conteúdo publicado |

### **Validações de Segurança**
- **Autenticação obrigatória** para todas as operações
- **Verificação de permissões** baseada em role
- **Validação de tipos de arquivo** para uploads
- **Sanitização de conteúdo** HTML
- **Verificação de URLs** de vídeo
- **Limitação de tamanho** de arquivos (10MB)

---

## 📝 **Tipos de Conteúdo Suportados**

### **1. Conteúdo de Texto**
- **Editor WYSIWYG** com formatação rica
- **Suporte a HTML** com sanitização
- **Inserção de links** e imagens
- **Formatação avançada**: títulos, listas, citações, código
- **Contagem de caracteres** em tempo real

### **2. Conteúdo de Vídeo**
- **YouTube**: Suporte completo com embed
- **Vimeo**: Integração nativa
- **Thumbnails automáticos** dos vídeos
- **Validação de URLs** e extração de IDs
- **Preview integrado** no visualizador

### **3. Conteúdo de Documentos**
- **Tipos suportados**: PDF, DOC, DOCX
- **Upload drag-and-drop** com validação
- **Preview de documentos** (quando disponível)
- **Download direto** dos arquivos
- **Informações de arquivo**: tamanho, tipo, data

### **4. Conteúdo Misto**
- **Combinação de tipos** em uma única aula
- **Organização por abas** no editor
- **Ordem customizável** dos elementos
- **Visualização integrada** de todos os tipos

---

## 🎯 **Funcionalidades Avançadas**

### **Sistema de Ordenação**
- **Ordem automática** baseada na criação
- **Reordenação manual** (implementação futura)
- **Drag-and-drop** para reorganização
- **Preservação de hierarquia** durante movimentações

### **Sistema de Status**
- **Draft**: Conteúdo em desenvolvimento
- **Published**: Conteúdo disponível para usuários
- **Archived**: Conteúdo oculto mas preservado

### **Visualização em Árvore**
- **Estrutura hierárquica** expandível
- **Indicadores visuais** de status
- **Informações de duração** por item
- **Navegação rápida** entre elementos

### **Preview de Conteúdo**
- **Visualização completa** antes da publicação
- **Navegação entre aulas** no preview
- **Renderização real** do conteúdo
- **Teste de funcionalidades** (vídeos, downloads)

---

## 📊 **Estatísticas e Analytics**

### **EducationalStats Interface**
```typescript
interface EducationalStats {
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
  publishedCourses: number;
  draftCourses: number;
  totalEstimatedHours: number;
  contentByType: {
    text: number;
    video: number;
    document: number;
    mixed: number;
  };
}
```

### **Métricas Disponíveis**
- **📚 Total de cursos** criados
- **📖 Total de módulos** organizados
- **📄 Total de aulas** desenvolvidas
- **🌐 Cursos publicados** vs **📝 rascunhos**
- **⏱️ Horas totais** de conteúdo estimado
- **📊 Distribuição por tipo** de conteúdo

---

## 🚀 **Implementação e Integração**

### **1. Integração no SuperAdminDashboard**
```typescript
const [showEducationalPrograms, setShowEducationalPrograms] = useState(false);

<button onClick={() => setShowEducationalPrograms(true)}>
  <GraduationCap className="h-8 w-8 mb-4" />
  <h3>Programas Educacionais</h3>
  <p>Gerenciar cursos, módulos e aulas</p>
</button>

{showEducationalPrograms && (
  <EducationalPrograms
    currentUser={user}
    onClose={() => setShowEducationalPrograms(false)}
  />
)}
```

### **2. Uso do Hook**
```typescript
const {
  courses,
  isLoading,
  createCourse,
  updateCourse,
  deleteCourse,
  getStats
} = useEducationalPrograms({
  currentUser: user,
  onError: (error) => console.error('Educational Programs Error:', error)
});
```

---

## 🗄️ **Estrutura do Banco de Dados**

### **Tabelas Principais**
```sql
-- Cursos
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  cover_image_url text,
  status publication_status DEFAULT 'draft',
  order_index integer DEFAULT 0,
  total_lessons integer DEFAULT 0,
  estimated_duration integer DEFAULT 0,
  created_by uuid REFERENCES users(id),
  tags text[] DEFAULT '{}',
  category text,
  level difficulty_level DEFAULT 'beginner',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Módulos
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  status publication_status DEFAULT 'draft',
  order_index integer DEFAULT 0,
  estimated_duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Aulas
CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  status publication_status DEFAULT 'draft',
  order_index integer DEFAULT 0,
  content_type content_type DEFAULT 'text',
  estimated_duration integer DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Conteúdo das Aulas
CREATE TABLE lesson_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  content_type content_type NOT NULL,
  order_index integer DEFAULT 0,
  -- Campos específicos para cada tipo de conteúdo
  text_content text,
  video_title text,
  video_provider video_provider,
  video_id text,
  document_title text,
  document_type document_type,
  document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### **Políticas RLS**
```sql
-- Super admins têm acesso total
CREATE POLICY "Super admins can manage all courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Usuários podem ver conteúdo publicado
CREATE POLICY "Users can view published courses"
  ON courses FOR SELECT
  TO authenticated
  USING (status = 'published');
```

---

## 🧪 **Testing Guidelines**

### **Cenários de Teste**
1. **Criação de conteúdo**
   - ✅ Criar curso com dados válidos
   - ✅ Criar módulo dentro do curso
   - ✅ Criar aula com diferentes tipos de conteúdo
   - ❌ Validação de campos obrigatórios

2. **Edição de conteúdo**
   - ✅ Atualizar informações básicas
   - ✅ Alterar status de publicação
   - ✅ Modificar conteúdo das aulas
   - ❌ Validação de permissões

3. **Visualização de conteúdo**
   - ✅ Preview de cursos
   - ✅ Navegação entre aulas
   - ✅ Reprodução de vídeos
   - ✅ Download de documentos

4. **Filtros e busca**
   - ✅ Busca por título e descrição
   - ✅ Filtros por status e categoria
   - ✅ Visualização em árvore
   - ✅ Estatísticas em tempo real

---

## 🔄 **Migration Path (Produção)**

### **Para implementação real com Supabase:**

1. **Executar migrations**:
```bash
supabase migration up
```

2. **Configurar storage para arquivos**:
```sql
-- Bucket para documentos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lesson-documents', 'lesson-documents', false);

-- Políticas de acesso
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lesson-documents');
```

3. **Implementar upload real**:
```typescript
// Em DocumentUploader.tsx
const { data, error } = await supabase.storage
  .from('lesson-documents')
  .upload(`${lessonId}/${file.name}`, file);
```

---

## 📈 **Performance Considerations**

### **Otimizações Implementadas**
- **Lazy loading** de conteúdo pesado
- **Paginação** para listas grandes
- **Cache de estatísticas** calculadas
- **Compressão de imagens** automática
- **CDN ready** para arquivos estáticos

### **Monitoring**
- Log de operações de conteúdo
- Tracking de tempo de carregamento
- Métricas de uso por tipo de conteúdo
- Alertas para falhas de upload

---

## 🎯 **Próximos Passos**

### **Funcionalidades Futuras**
1. **Sistema de progresso** do usuário
2. **Certificados** de conclusão
3. **Quizzes e avaliações** integrados
4. **Comentários** nas aulas
5. **Sistema de favoritos** e bookmarks
6. **Recomendações** baseadas em IA
7. **Analytics avançados** de engajamento
8. **Integração com LMS** externos

### **Melhorias Técnicas**
- **Drag-and-drop** para reordenação
- **Editor de vídeo** integrado
- **Transcrição automática** de vídeos
- **Busca full-text** no conteúdo
- **Versionamento** de conteúdo
- **Workflow de aprovação** para publicação

---

**📝 Última atualização**: 28/06/2025  
**👨‍💻 Desenvolvido por**: Serenus Platform Team  
**📊 Versão**: 1.0.0