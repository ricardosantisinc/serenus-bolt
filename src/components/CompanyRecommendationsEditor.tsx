import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  X, 
  Save, 
  Loader2, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  BookOpen,
  Brain,
  Utensils,
  Heart,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { CompanyRecommendation } from '../types';

interface CompanyRecommendationsEditorProps {
  companyId: string;
  recommendations: CompanyRecommendation[];
  onSave: (recommendationData: Omit<CompanyRecommendation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<{ success: boolean; message: string; recommendation?: CompanyRecommendation }>;
  onDelete: (id: string, companyId: string) => Promise<{ success: boolean; message: string }>;
  onClose: () => void;
}

export const CompanyRecommendationsEditor: React.FC<CompanyRecommendationsEditorProps> = ({
  companyId,
  recommendations,
  onSave,
  onDelete,
  onClose
}) => {
  const [localRecommendations, setLocalRecommendations] = useState<CompanyRecommendation[]>([]);
  const [editingRecommendation, setEditingRecommendation] = useState<CompanyRecommendation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    recommendationType: 'general' as CompanyRecommendation['recommendationType']
  });

  useEffect(() => {
    setLocalRecommendations([...recommendations].sort((a, b) => a.orderIndex - b.orderIndex));
  }, [recommendations]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      recommendationType: 'general'
    });
    setEditingRecommendation(null);
    setIsCreating(false);
    setError('');
    setSuccess('');
  };

  const handleCreateNew = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEdit = (recommendation: CompanyRecommendation) => {
    setFormData({
      title: recommendation.title,
      content: recommendation.content,
      recommendationType: recommendation.recommendationType
    });
    setEditingRecommendation(recommendation);
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      setIsLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError('Conteúdo é obrigatório');
      setIsLoading(false);
      return;
    }

    try {
      const orderIndex = editingRecommendation 
        ? editingRecommendation.orderIndex 
        : Math.max(0, ...localRecommendations.map(r => r.orderIndex)) + 1;

      const recommendationData = {
        id: editingRecommendation?.id,
        companyId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        recommendationType: formData.recommendationType,
        orderIndex
      };

      const result = await onSave(recommendationData);

      if (result.success && result.recommendation) {
        setSuccess(result.message);
        
        // Update local state
        if (editingRecommendation) {
          setLocalRecommendations(prev => 
            prev.map(r => r.id === result.recommendation!.id ? result.recommendation! : r)
          );
        } else {
          setLocalRecommendations(prev => [...prev, result.recommendation!].sort((a, b) => a.orderIndex - b.orderIndex));
        }
        
        // Reset form after a short delay
        setTimeout(() => {
          resetForm();
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (recommendation: CompanyRecommendation) => {
    if (!window.confirm(`Tem certeza que deseja excluir a recomendação "${recommendation.title}"?`)) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await onDelete(recommendation.id, companyId);
      
      if (result.success) {
        setSuccess(result.message);
        setLocalRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro ao excluir recomendação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveUp = async (recommendation: CompanyRecommendation) => {
    const currentIndex = localRecommendations.findIndex(r => r.id === recommendation.id);
    if (currentIndex <= 0) return; // Já está no topo
    
    const prevRecommendation = localRecommendations[currentIndex - 1];
    
    setIsLoading(true);
    
    try {
      // Trocar as posições
      const updates = [
        onSave({ 
          ...recommendation, 
          orderIndex: prevRecommendation.orderIndex 
        }),
        onSave({ 
          ...prevRecommendation, 
          orderIndex: recommendation.orderIndex 
        })
      ];
      
      const results = await Promise.all(updates);
      
      if (results.every(r => r.success)) {
        // Atualizar estado local
        const newRecommendations = [...localRecommendations];
        newRecommendations[currentIndex] = {
          ...newRecommendations[currentIndex],
          orderIndex: prevRecommendation.orderIndex
        };
        newRecommendations[currentIndex - 1] = {
          ...newRecommendations[currentIndex - 1],
          orderIndex: recommendation.orderIndex
        };
        
        // Ordenar novamente
        setLocalRecommendations(newRecommendations.sort((a, b) => a.orderIndex - b.orderIndex));
        setSuccess('Ordem atualizada com sucesso!');
      } else {
        setError('Erro ao atualizar a ordem das recomendações');
      }
    } catch (err) {
      setError('Erro ao reordenar recomendações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveDown = async (recommendation: CompanyRecommendation) => {
    const currentIndex = localRecommendations.findIndex(r => r.id === recommendation.id);
    if (currentIndex >= localRecommendations.length - 1) return; // Já está no fim
    
    const nextRecommendation = localRecommendations[currentIndex + 1];
    
    setIsLoading(true);
    
    try {
      // Trocar as posições
      const updates = [
        onSave({ 
          ...recommendation, 
          orderIndex: nextRecommendation.orderIndex 
        }),
        onSave({ 
          ...nextRecommendation, 
          orderIndex: recommendation.orderIndex 
        })
      ];
      
      const results = await Promise.all(updates);
      
      if (results.every(r => r.success)) {
        // Atualizar estado local
        const newRecommendations = [...localRecommendations];
        newRecommendations[currentIndex] = {
          ...newRecommendations[currentIndex],
          orderIndex: nextRecommendation.orderIndex
        };
        newRecommendations[currentIndex + 1] = {
          ...newRecommendations[currentIndex + 1],
          orderIndex: recommendation.orderIndex
        };
        
        // Ordenar novamente
        setLocalRecommendations(newRecommendations.sort((a, b) => a.orderIndex - b.orderIndex));
        setSuccess('Ordem atualizada com sucesso!');
      } else {
        setError('Erro ao atualizar a ordem das recomendações');
      }
    } catch (err) {
      setError('Erro ao reordenar recomendações');
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationTypeIcon = (type: CompanyRecommendation['recommendationType']) => {
    switch (type) {
      case 'mental_health':
        return <Brain className="h-5 w-5 text-purple-600" />;
      case 'nutrition':
        return <Utensils className="h-5 w-5 text-green-600" />;
      case 'integrated':
        return <Heart className="h-5 w-5 text-red-600" />;
      case 'universal':
        return <Activity className="h-5 w-5 text-blue-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-teal-600" />;
    }
  };

  const getRecommendationTypeLabel = (type: CompanyRecommendation['recommendationType']) => {
    switch (type) {
      case 'mental_health':
        return 'Saúde Mental';
      case 'nutrition':
        return 'Alimentação';
      case 'integrated':
        return 'Integrado';
      case 'universal':
        return 'Universal';
      default:
        return 'Geral';
    }
  };

  const getRecommendationTypeColor = (type: CompanyRecommendation['recommendationType']) => {
    switch (type) {
      case 'mental_health':
        return 'bg-purple-100 border-purple-200 text-purple-800';
      case 'nutrition':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'integrated':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'universal':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      default:
        return 'bg-teal-100 border-teal-200 text-teal-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recomendações da Empresa</h2>
              <p className="text-sm text-gray-600">Personalize as recomendações para sua equipe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Panel - Recommendations List */}
          <div className={`w-1/2 border-r border-gray-200 p-6 overflow-y-auto ${isCreating ? 'hidden md:block' : 'block'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recomendações Atuais</h3>
              <button
                onClick={handleCreateNew}
                className="bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Nova</span>
              </button>
            </div>

            {localRecommendations.length > 0 ? (
              <div className="space-y-4">
                {localRecommendations.map((recommendation) => (
                  <div 
                    key={recommendation.id}
                    className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                      editingRecommendation?.id === recommendation.id ? 'border-teal-500 ring-1 ring-teal-500' : 'border-gray-200'
                    }`}
                  >
                    <div className={`p-4 ${getRecommendationTypeColor(recommendation.recommendationType)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getRecommendationTypeIcon(recommendation.recommendationType)}
                          <h4 className="font-medium">{recommendation.title}</h4>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(recommendation)}
                            className="text-gray-600 hover:text-teal-600 transition-colors p-1"
                            title="Editar"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(recommendation)}
                            className="text-gray-600 hover:text-red-600 transition-colors p-1"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-gray-700 text-sm">{recommendation.content}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-gray-500">
                          Tipo: {getRecommendationTypeLabel(recommendation.recommendationType)}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleMoveUp(recommendation)}
                            disabled={localRecommendations.indexOf(recommendation) === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
                            title="Mover para cima"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(recommendation)}
                            disabled={localRecommendations.indexOf(recommendation) === localRecommendations.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
                            title="Mover para baixo"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma recomendação</h3>
                <p className="text-gray-600 mb-4">Adicione recomendações personalizadas para sua equipe</p>
                <button
                  onClick={handleCreateNew}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Criar Primeira Recomendação
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Editor */}
          {isCreating && (
            <div className="w-full md:w-1/2 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRecommendation ? 'Editar Recomendação' : 'Nova Recomendação'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ex: Dicas para Saúde Mental"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo *
                  </label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={8}
                    placeholder="Escreva aqui as recomendações detalhadas..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Recomendação
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {[
                      { value: 'mental_health', label: 'Saúde Mental', icon: Brain, color: 'bg-purple-100 text-purple-800' },
                      { value: 'nutrition', label: 'Alimentação', icon: Utensils, color: 'bg-green-100 text-green-800' },
                      { value: 'integrated', label: 'Integrado', icon: Heart, color: 'bg-red-100 text-red-800' },
                      { value: 'universal', label: 'Universal', icon: Activity, color: 'bg-blue-100 text-blue-800' },
                      { value: 'general', label: 'Geral', icon: BookOpen, color: 'bg-teal-100 text-teal-800' }
                    ].map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.value}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            formData.recommendationType === type.value
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, recommendationType: type.value as CompanyRecommendation['recommendationType'] }))}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-8 h-8 rounded-full ${type.color} flex items-center justify-center mb-2`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-medium">{type.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Dicas para recomendações eficazes:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Mantenha as recomendações concisas e diretas</li>
                        <li>• Use linguagem positiva e motivacional</li>
                        <li>• Forneça exemplos práticos e aplicáveis</li>
                        <li>• Considere o contexto e cultura da empresa</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
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
                        <span>Salvar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Right Panel Empty State (when not editing) */}
          {!isCreating && (
            <div className="w-1/2 flex items-center justify-center p-6 md:block hidden">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Edit3 className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Edite suas Recomendações</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Selecione uma recomendação para editar ou crie uma nova para personalizar as orientações de bem-estar para sua equipe.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nova Recomendação</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};