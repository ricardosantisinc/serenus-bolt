import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  X, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  Loader2,
  Check,
  Calendar,
  DollarSign
} from 'lucide-react';
import { SubscriptionPlan } from '../types';

interface SubscriptionPlansManagementProps {
  plans: SubscriptionPlan[];
  onAddPlan: (planData: {
    name: string;
    value: number;
    periodicity: SubscriptionPlan['periodicity'];
    features: string[];
    description?: string;
  }) => Promise<{ success: boolean; message: string; plan?: SubscriptionPlan }>;
  onUpdatePlan: (planId: string, planData: {
    name: string;
    value: number;
    periodicity: SubscriptionPlan['periodicity'];
    features: string[];
    description?: string;
  }) => Promise<{ success: boolean; message: string; plan?: SubscriptionPlan }>;
  onTogglePlanStatus: (planId: string) => Promise<{ success: boolean; message: string; plan?: SubscriptionPlan }>;
  onClose: () => void;
}

export const SubscriptionPlansManagement: React.FC<SubscriptionPlansManagementProps> = ({
  plans,
  onAddPlan,
  onUpdatePlan,
  onTogglePlanStatus,
  onClose
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState({
    name: '',
    value: 0,
    periodicity: 'monthly' as SubscriptionPlan['periodicity'],
    features: [''],
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      value: 0,
      periodicity: 'monthly',
      features: [''],
      description: ''
    });
    setEditingPlan(null);
    setError('');
    setSuccess('');
  };

  const openForm = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        value: plan.value,
        periodicity: plan.periodicity,
        features: [...plan.features],
        description: plan.description || ''
      });
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ 
      ...prev, 
      features: [...prev.features, ''] 
    }));
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, features: newFeatures }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (!formData.name || formData.value <= 0 || formData.features.some(f => !f.trim())) {
      setError('Por favor, preencha todos os campos obrigatórios');
      setIsLoading(false);
      return;
    }

    const planData = {
      name: formData.name,
      value: formData.value,
      periodicity: formData.periodicity,
      features: formData.features.filter(f => f.trim()),
      description: formData.description || undefined
    };

    try {
      let result;
      if (editingPlan) {
        result = await onUpdatePlan(editingPlan.id, planData);
      } else {
        result = await onAddPlan(planData);
      }

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          closeForm();
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (planId: string) => {
    try {
      const result = await onTogglePlanStatus(planId);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Erro ao alterar status do plano');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getPeriodicityLabel = (periodicity: SubscriptionPlan['periodicity']) => {
    const labels = {
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      annually: 'Anual'
    };
    return labels[periodicity];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filter plans
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && plan.isActive) ||
                         (statusFilter === 'inactive' && !plan.isActive);
    
    return matchesSearch && matchesStatus;
  });

  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPlan ? 'Editar Plano' : 'Novo Plano'}
              </h2>
            </div>
            <button
              onClick={closeForm}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Plano *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Ex: Plano Premium"
                  required
                />
              </div>

              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                  Valor *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="29.90"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="periodicity" className="block text-sm font-medium text-gray-700 mb-2">
                Periodicidade *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="periodicity"
                  value={formData.periodicity}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    periodicity: e.target.value as SubscriptionPlan['periodicity'] 
                  }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="annually">Anual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recursos Inclusos *
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Ex: Até 50 usuários"
                      required
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addFeature}
                className="mt-2 text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Recurso</span>
              </button>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows={3}
                placeholder="Descrição do plano..."
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={closeForm}
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
                    <span>{editingPlan ? 'Atualizando...' : 'Criando...'}</span>
                  </>
                ) : (
                  <span>{editingPlan ? 'Atualizar Plano' : 'Criar Plano'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-900">Gerenciar Planos de Assinatura</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar planos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
              <button
                onClick={() => openForm()}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Plano</span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openForm(plan)}
                      className="text-gray-600 hover:text-teal-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(plan.id)}
                      className={`transition-colors ${
                        plan.isActive ? 'text-teal-600 hover:text-teal-800' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {plan.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(plan.value)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getPeriodicityLabel(plan.periodicity)}
                  </div>
                </div>

                {plan.description && (
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Check className="h-4 w-4 text-teal-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded-full ${
                    plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {plan.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  <span>Criado em {plan.createdAt.toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredPlans.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece criando seu primeiro plano de assinatura'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => openForm()}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Criar Primeiro Plano
                </button>
              )}
            </div>
          )}

          {/* Success/Error Messages */}
          {(success || error) && (
            <div className="fixed bottom-4 right-4 z-50">
              <div className={`p-4 rounded-lg shadow-lg ${
                success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {success || error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};