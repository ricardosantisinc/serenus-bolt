import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Loader2, 
  FileText, 
  Video, 
  Upload,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Eye,
  Archive
} from 'lucide-react';
import { Lesson, LessonFormData, ContentType, PublicationStatus, LessonContent } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { VideoContentEditor } from './VideoContentEditor';
import { DocumentUploader } from './DocumentUploader';

interface LessonEditorProps {
  mode: 'create' | 'edit';
  lesson?: Lesson;
  moduleId: string;
  onSave: (lessonData: LessonFormData & { content: LessonContent }) => Promise<void>;
  onClose: () => void;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
  mode,
  lesson,
  moduleId,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<LessonFormData>({
    title: '',
    description: '',
    status: 'draft',
    contentType: 'text'
  });
  const [content, setContent] = useState<LessonContent>({});
  const [activeContentTab, setActiveContentTab] = useState<'text' | 'video' | 'document'>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && lesson) {
      setFormData({
        title: lesson.title,
        description: lesson.description,
        status: lesson.status,
        contentType: lesson.contentType
      });
      setContent(lesson.content);
    }
  }, [mode, lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (!formData.description.trim()) {
      setError('Descrição é obrigatória');
      return;
    }

    // Validate content based on type
    if (formData.contentType === 'text' && (!content.text || !content.text.content.trim())) {
      setError('Conteúdo de texto é obrigatório');
      return;
    }

    if (formData.contentType === 'video' && (!content.videos || content.videos.length === 0)) {
      setError('Pelo menos um vídeo é obrigatório');
      return;
    }

    if (formData.contentType === 'document' && (!content.documents || content.documents.length === 0)) {
      setError('Pelo menos um documento é obrigatório');
      return;
    }

    setIsLoading(true);

    try {
      await onSave({ ...formData, content });
    } catch (err) {
      setError('Erro ao salvar aula. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getContentTypeIcon = (contentType: ContentType) => {
    switch (contentType) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <Upload className="h-4 w-4" />;
      case 'mixed':
        return <Plus className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: PublicationStatus) => {
    switch (status) {
      case 'published':
        return <Globe className="h-4 w-4" />;
      case 'draft':
        return <Eye className="h-4 w-4" />;
      case 'archived':
        return <Archive className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Nova Aula' : 'Editar Aula'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex overflow-hidden" style={{ height: 'calc(95vh - 80px)' }}>
          {/* Left Panel - Basic Info */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Aula *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Digite o título da aula"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Descreva o conteúdo da aula"
                  required
                />
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Conteúdo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'text', label: 'Texto', icon: FileText },
                    { value: 'video', label: 'Vídeo', icon: Video },
                    { value: 'document', label: 'Documento', icon: Upload },
                    { value: 'mixed', label: 'Misto', icon: Plus }
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.value}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          formData.contentType === type.value
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          contentType: type.value as ContentType 
                        }))}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'draft', label: 'Rascunho', description: 'Não visível' },
                    { value: 'published', label: 'Publicado', description: 'Visível' },
                    { value: 'archived', label: 'Arquivado', description: 'Oculto' }
                  ].map((status) => (
                    <div
                      key={status.value}
                      className={`border rounded-lg p-2 cursor-pointer transition-colors ${
                        formData.status === status.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        status: status.value as PublicationStatus 
                      }))}
                    >
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status.value as PublicationStatus)}
                        <div>
                          <span className="font-medium text-sm">{status.label}</span>
                          <p className="text-xs text-gray-500">{status.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3" />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel - Content Editor */}
          <div className="flex-1 flex flex-col">
            {/* Content Type Tabs for Mixed Content */}
            {formData.contentType === 'mixed' && (
              <div className="border-b border-gray-200 p-4">
                <div className="flex space-x-4">
                  {[
                    { key: 'text', label: 'Texto', icon: FileText },
                    { key: 'video', label: 'Vídeos', icon: Video },
                    { key: 'document', label: 'Documentos', icon: Upload }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveContentTab(tab.key as 'text' | 'video' | 'document')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          activeContentTab === tab.key
                            ? 'bg-teal-100 text-teal-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content Editor Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Text Content */}
              {(formData.contentType === 'text' || (formData.contentType === 'mixed' && activeContentTab === 'text')) && (
                <RichTextEditor
                  content={content.text?.content || ''}
                  onChange={(newContent) => setContent(prev => ({
                    ...prev,
                    text: { id: prev.text?.id || '', content: newContent, order: 0 }
                  }))}
                />
              )}

              {/* Video Content */}
              {(formData.contentType === 'video' || (formData.contentType === 'mixed' && activeContentTab === 'video')) && (
                <VideoContentEditor
                  videos={content.videos || []}
                  onChange={(videos) => setContent(prev => ({ ...prev, videos }))}
                />
              )}

              {/* Document Content */}
              {(formData.contentType === 'document' || (formData.contentType === 'mixed' && activeContentTab === 'document')) && (
                <DocumentUploader
                  documents={content.documents || []}
                  onChange={(documents) => setContent(prev => ({ ...prev, documents }))}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};