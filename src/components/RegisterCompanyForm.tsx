import React, { useState } from 'react';
import { Building2, X, Loader2, Upload } from 'lucide-react';
import { Company } from '../types';
import { PhotoUpload } from './PhotoUpload';
import { usePhotoUpload } from '../hooks/usePhotoUpload';

interface RegisterCompanyFormProps {
  onRegisterCompany: (companyData: {
    name: string;
    domain: string;
    contactPerson: string;
    corporateEmail: string;
    landlinePhone?: string;
    mobilePhone: string;
    plan: Company['plan'];
    maxUsers: number;
    logoData?: string;
  }) => Promise<{ success: boolean; message: string; company?: Company }>;
  onClose: () => void;
}

export const RegisterCompanyForm: React.FC<RegisterCompanyFormProps> = ({
  onRegisterCompany,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    contactPerson: '',
    corporateEmail: '',
    landlinePhone: '',
    mobilePhone: '',
    plan: 'basic' as Company['plan'],
    maxUsers: 50
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoData, setLogoData] = useState<string | null>(null);
  
  // Usar o hook de PhotoUpload para gerenciar o logo
  const { isUploading } = usePhotoUpload({
    userId: 'company',
    onSuccess: (photo) => {
      console.log('Logo processado com sucesso', photo);
    },
    onError: (error) => {
      setError(error);
    }
  });

  const planOptions = [
    { value: 'basic', label: 'Básico', maxUsers: 50, price: 'R$ 29,90/mês' },
    { value: 'premium', label: 'Premium', maxUsers: 200, price: 'R$ 79,90/mês' },
    { value: 'enterprise', label: 'Enterprise', maxUsers: 1000, price: 'R$ 199,90/mês' }
  ];

  const handlePlanChange = (plan: Company['plan']) => {
    const selectedPlan = planOptions.find(p => p.value === plan);
    setFormData(prev => ({
      ...prev,
      plan,
      maxUsers: selectedPlan?.maxUsers || 50
    }));
  };

  const formatPhoneInput = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, '');
    
    // Aplica uma formatação simples
    let formatted = cleaned;
    
    if (cleaned.length > 2) {
      formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
      
      if (cleaned.length > 7) {
        formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
      }
    }
    
    return formatted;
  };

  // Handler para processar o upload do logo
  const handleLogoUpload = async (photoData: any) => {
    if (!photoData.success || !photoData.photo) {
      setError('Erro ao processar logo da empresa');
      return { success: false, message: 'Erro ao processar logo' };
    }

    // Armazenar os dados da imagem
    setLogoData(photoData.photo.imageData);
    setLogoPreview(`data:${photoData.photo.fileType};base64,${photoData.photo.imageData}`);
    
    return { success: true, message: 'Logo carregado com sucesso!' };
  };

  // Handler para remover o logo
  const handleLogoRemove = async () => {
    setLogoPreview(null);
    setLogoData(null);
    return { success: true, message: 'Logo removido com sucesso!' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (!formData.name || !formData.domain || !formData.contactPerson || 
        !formData.corporateEmail || !formData.mobilePhone) {
      setError('Por favor, preencha todos os campos obrigatórios');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.corporateEmail)) {
      setError('Email corporativo inválido');
      setIsLoading(false);
      return;
    }

    try {
      const result = await onRegisterCompany({
        ...formData,
        landlinePhone: formData.landlinePhone || undefined,
        logoData: logoData || undefined
      });
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-900">Nova Empresa</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Logo da Empresa */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Logo da Empresa
            </h3>
            <div className="flex justify-center">
              <PhotoUpload
                currentPhotoUrl={logoPreview || '/serenus.png'}
                isUploading={isUploading}
                onUpload={handleLogoUpload}
                onRemove={logoPreview ? handleLogoRemove : undefined}
                size="lg"
                className="mx-auto"
              />
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Ex: TechCorp Solutions"
                  required
                />
              </div>

              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                  Domínio *
                </label>
                <input
                  id="domain"
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Ex: techcorp.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Informações de Contato
            </h3>
            
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                Pessoa de Contato *
              </label>
              <input
                id="contactPerson"
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Ex: João Silva"
                required
              />
            </div>

            <div>
              <label htmlFor="corporateEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Corporativo *
              </label>
              <input
                id="corporateEmail"
                type="email"
                value={formData.corporateEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, corporateEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Ex: contato@techcorp.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="landlinePhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone Fixo
                </label>
                <input
                  id="landlinePhone"
                  type="text"
                  value={formData.landlinePhone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    landlinePhone: formatPhoneInput(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="(00) 0000-0000"
                  maxLength={14}
                />
              </div>

              <div>
                <label htmlFor="mobilePhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Celular/WhatsApp *
                </label>
                <input
                  id="mobilePhone"
                  type="text"
                  value={formData.mobilePhone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    mobilePhone: formatPhoneInput(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                  maxLength={16}
                  required
                />
              </div>
            </div>
          </div>

          {/* Plan Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Plano de Assinatura
            </h3>
            
            <div className="space-y-3">
              {planOptions.map((option) => (
                <div
                  key={option.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.plan === option.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePlanChange(option.value as Company['plan'])}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600">
                        Até {option.maxUsers} usuários
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{option.price}</p>
                      <input
                        type="radio"
                        name="plan"
                        value={option.value}
                        checked={formData.plan === option.value}
                        onChange={() => handlePlanChange(option.value as Company['plan'])}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="maxUsers" className="block text-sm font-medium text-gray-700 mb-2">
                Limite de Usuários
              </label>
              <input
                id="maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                min="1"
                max="10000"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Definido automaticamente pelo plano selecionado
              </p>
            </div>
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
                  <span>Cadastrando...</span>
                </>
              ) : (
                <span>Registrar Empresa</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};