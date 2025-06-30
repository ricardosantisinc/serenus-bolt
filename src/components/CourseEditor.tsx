import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Loader2, 
  Upload, 
  Image as ImageIcon, 
  Tag as TagIcon,
  Globe,
  Eye,
  Archive
} from 'lucide-react';
import { Course, CourseFormData, PublicationStatus } from '../types';

interface CourseEditorProps {
  mode: 'create' | 'edit';
  course?: Course;
  onSave: (courseData: CourseFormData) => Promise<void>;
  onClose: () => void;
}

export const CourseEditor: React.FC<CourseEditorProps> = ({
  mode,
  course,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    status: 'draft',
    tags: [],
    category: '',
    level: 'beginner'
  });
  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && course) {
      setFormData({
        title: course.title,
        description: course.description,
        status: course.status,
        tags: course.tags,
        category: course.category || '',
        level: course.level || 'beginner'
      });
    }
  }, [mode, course]);

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

    setIsLoading(true);

    try {
      await onSave(formData);
    } catch (err) {
      setError('Erro ao salvar curso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Novo Curso' : 'Editar Curso'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título do Curso *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Digite o título do curso"
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
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Descreva o conteúdo e objetivos do curso"
                required
              />
            </div>
          </div>

          {/* Course Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Dificuldade
              </label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  level: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <input
                id="category"
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Ex: Bem-estar, Produtividade"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex space-x-2 mb-3">
              <div className="flex-1 relative">
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Adicionar tag"
                />
              </div>
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Adicionar
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-teal-600 hover:text-teal-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status de Publicação
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'draft', label: 'Rascunho', description: 'Apenas você pode ver' },
                { value: 'published', label: 'Publicado', description: 'Visível para todos' },
                { value: 'archived', label: 'Arquivado', description: 'Oculto dos usuários' }
              ].map((status) => (
                <div
                  key={status.value}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    formData.status === status.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    status: status.value as PublicationStatus 
                  }))}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {getStatusIcon(status.value as PublicationStatus)}
                    <span className="font-medium text-sm">{status.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{status.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem de Capa
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Clique para fazer upload ou arraste a imagem aqui</p>
              <p className="text-xs text-gray-500">JPG, PNG até 5MB</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData(prev => ({ ...prev, coverImage: file }));
                  }
                }}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{mode === 'create' ? 'Criar Curso' : 'Salvar Alterações'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};