import React, { useState, useEffect } from 'react';
import { User, X, Save, Loader2, Calendar, Users, Lock, Eye, EyeOff } from 'lucide-react';
import { User as UserType, UserProfileUpdate } from '../types';
import { PhotoUpload } from './PhotoUpload';
import { usePhotoUpload } from '../hooks/usePhotoUpload';

interface UserProfileProps {
  user: UserType;
  onUpdateProfile: (profileData: UserProfileUpdate) => Promise<{ success: boolean; message: string }>;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onUpdateProfile,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : '',
    gender: user.gender || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(user.avatar);

  // Hook para gerenciamento de fotos
  const {
    isUploading: isPhotoUploading,
    uploadPhoto,
    removePhoto,
    getUserPhoto,
    getPhotoUrl
  } = usePhotoUpload({
    userId: user.id,
    onSuccess: (photo) => {
      const newPhotoUrl = getPhotoUrl(photo.id);
      setCurrentPhotoUrl(newPhotoUrl);
      console.log('✅ Foto de perfil atualizada');
    },
    onError: (error) => {
      console.error('❌ Erro no upload da foto:', error);
    }
  });

  // Carregar foto atual do usuário
  useEffect(() => {
    const loadUserPhoto = async () => {
      try {
        const photo = await getUserPhoto(user.id);
        if (photo) {
          const photoUrl = getPhotoUrl(photo.id);
          setCurrentPhotoUrl(photoUrl);
        }
      } catch (error) {
        console.error('Erro ao carregar foto do usuário:', error);
      }
    };

    loadUserPhoto();
  }, [user.id, getUserPhoto, getPhotoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validações
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      setIsLoading(false);
      return;
    }

    if (formData.name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      setIsLoading(false);
      return;
    }

    // Validação de data de nascimento
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 16 || age > 120) {
        setError('Data de nascimento inválida. Idade deve estar entre 16 e 120 anos');
        setIsLoading(false);
        return;
      }
    }

    // Validações de senha (apenas se estiver alterando)
    if (showPasswordSection && (formData.currentPassword || formData.newPassword || formData.confirmPassword)) {
      if (!formData.currentPassword) {
        setError('Senha atual é obrigatória para alterar a senha');
        setIsLoading(false);
        return;
      }

      if (!formData.newPassword) {
        setError('Nova senha é obrigatória');
        setIsLoading(false);
        return;
      }

      if (formData.newPassword.length < 6) {
        setError('Nova senha deve ter pelo menos 6 caracteres');
        setIsLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Confirmação de senha não confere');
        setIsLoading(false);
        return;
      }

      if (formData.currentPassword === formData.newPassword) {
        setError('A nova senha deve ser diferente da senha atual');
        setIsLoading(false);
        return;
      }
    }

    try {
      const profileData: UserProfileUpdate = {
        name: formData.name.trim(),
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
        gender: formData.gender as 'male' | 'female' | 'other' | undefined,
      };

      // Incluir dados de senha apenas se estiver alterando
      if (showPasswordSection && formData.currentPassword && formData.newPassword) {
        profileData.currentPassword = formData.currentPassword;
        profileData.newPassword = formData.newPassword;
        profileData.confirmPassword = formData.confirmPassword;
      }

      const result = await onUpdateProfile(profileData);

      if (result.success) {
        setSuccess(result.message);
        // Limpar campos de senha após sucesso
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setShowPasswordSection(false);
        
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

  const handlePhotoRemove = async () => {
    // Para o mock, apenas limpar a URL atual
    setCurrentPhotoUrl(user.avatar);
    return {
      success: true,
      message: 'Foto removida com sucesso!'
    };
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const getGenderLabel = (gender: string) => {
    const labels = {
      male: 'Masculino',
      female: 'Feminino',
      other: 'Outro'
    };
    return labels[gender as keyof typeof labels] || '';
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Meu Perfil</h2>
              <p className="text-sm text-gray-600">Gerencie suas informações pessoais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo Upload Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Foto do Perfil</h3>
            <div className="flex items-center space-x-6">
              <div>
                <PhotoUpload
                  currentPhotoUrl={currentPhotoUrl}
                  isUploading={isPhotoUploading}
                  onUpload={uploadPhoto}
                  onRemove={currentPhotoUrl !== user.avatar ? handlePhotoRemove : undefined}
                  size="lg"
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1">
                <div>
                  <h4 className="font-medium text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    {user.role === 'super_admin' ? 'Super Administrador' :
                     user.role === 'admin' ? 'Administrador' :
                     user.role === 'manager' ? 'Gerente' :
                     user.role === 'hr' ? 'Recursos Humanos' :
                     user.role === 'psychologist' ? 'Psicólogo(a)' : 'Colaborador'}
                    {user.department && ` • ${user.department}`}
                  </p>
                </div>
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <p>• Arquivos aceitos: JPG, JPEG, PNG</p>
                  <p>• Tamanho máximo: 5MB</p>
                  <p>• Redimensionamento automático: 400x400px</p>
                  <p>• Compressão automática para melhor performance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Informações Básicas
            </h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                  />
                </div>
                {formData.birthDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(formData.birthDate)}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Sexo
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Selecione...</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex-1">
                Segurança
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center space-x-1"
              >
                <Lock className="h-4 w-4" />
                <span>{showPasswordSection ? 'Cancelar alteração' : 'Alterar senha'}</span>
              </button>
            </div>

            {showPasswordSection && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Importante:</strong> Você precisará inserir sua senha atual para confirmar as alterações.
                  </p>
                </div>

                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Atual *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Digite sua nova senha"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Confirme sua nova senha"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">As senhas não conferem</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm bg-green-50 border border-green-200 p-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading || isPhotoUploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || isPhotoUploading}
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
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};