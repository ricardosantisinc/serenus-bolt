import React, { useState, useEffect } from 'react';
import { Settings, Save, Clock, AlertTriangle, X, Loader2 } from 'lucide-react';
import { CompanyCheckupSettings } from '../types';

interface CompanyCheckupSettingsProps {
  companyId: string;
  settings?: CompanyCheckupSettings;
  onSave: (settings: Omit<CompanyCheckupSettings, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; message: string }>;
  onClose: () => void;
}

export const CompanyCheckupSettingsComponent: React.FC<CompanyCheckupSettingsProps> = ({
  companyId,
  settings,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    normalIntervalDays: 90,
    severeIntervalDays: 30,
    autoRemindersEnabled: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        normalIntervalDays: settings.normalIntervalDays,
        severeIntervalDays: settings.severeIntervalDays,
        autoRemindersEnabled: settings.autoRemindersEnabled
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validations
    if (formData.normalIntervalDays < 1 || formData.normalIntervalDays > 365) {
      setError('Intervalo normal deve estar entre 1 e 365 dias');
      setIsLoading(false);
      return;
    }

    if (formData.severeIntervalDays < 1 || formData.severeIntervalDays > 90) {
      setError('Intervalo para casos severos deve estar entre 1 e 90 dias');
      setIsLoading(false);
      return;
    }

    if (formData.severeIntervalDays >= formData.normalIntervalDays) {
      setError('Intervalo para casos severos deve ser menor que o intervalo normal');
      setIsLoading(false);
      return;
    }

    try {
      const result = await onSave({
        companyId,
        normalIntervalDays: formData.normalIntervalDays,
        severeIntervalDays: formData.severeIntervalDays,
        autoRemindersEnabled: formData.autoRemindersEnabled
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

  const getIntervalDescription = (days: number) => {
    if (days === 30) return '1 mês';
    if (days === 60) return '2 meses';
    if (days === 90) return '3 meses';
    if (days === 180) return '6 meses';
    if (days === 365) return '1 ano';
    return `${days} dias`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-900">Configurações de Checkup</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Explicação do Sistema */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900">Como funciona a periodicidade</h4>
                <p className="text-sm text-blue-800 mt-1">
                  O sistema define automaticamente quando cada funcionário deve fazer o próximo checkup com base no resultado anterior:
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• <strong>Casos normais/leves/moderados:</strong> Usar intervalo normal</li>
                  <li>• <strong>Casos severos/extremamente severos:</strong> Usar intervalo reduzido</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Intervalo Normal */}
          <div className="space-y-4">
            <div>
              <label htmlFor="normalInterval" className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo Normal (casos normais, leves e moderados)
              </label>
              <div className="flex items-center space-x-4">
                <Clock className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <input
                    id="normalInterval"
                    type="range"
                    min="30"
                    max="365"
                    step="30"
                    value={formData.normalIntervalDays}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      normalIntervalDays: parseInt(e.target.value) 
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>30 dias</span>
                    <span>180 dias</span>
                    <span>365 dias</span>
                  </div>
                </div>
                <div className="text-right min-w-[100px]">
                  <div className="text-lg font-semibold text-gray-900">
                    {getIntervalDescription(formData.normalIntervalDays)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formData.normalIntervalDays} dias
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="severeInterval" className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo Severo (casos severos e extremamente severos)
              </label>
              <div className="flex items-center space-x-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <input
                    id="severeInterval"
                    type="range"
                    min="7"
                    max="90"
                    step="7"
                    value={formData.severeIntervalDays}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      severeIntervalDays: parseInt(e.target.value) 
                    }))}
                    className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider-thumb-red"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>7 dias</span>
                    <span>45 dias</span>
                    <span>90 dias</span>
                  </div>
                </div>
                <div className="text-right min-w-[100px]">
                  <div className="text-lg font-semibold text-red-600">
                    {getIntervalDescription(formData.severeIntervalDays)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formData.severeIntervalDays} dias
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lembretes Automáticos */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Lembretes Automáticos</h4>
              <p className="text-sm text-gray-600">
                Enviar notificações quando o checkup estiver próximo do vencimento
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoRemindersEnabled}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  autoRemindersEnabled: e.target.checked 
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Preview das Configurações */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Resumo das Configurações</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Funcionários com resultados normais:</span>
                <span className="font-medium">Checkup a cada {getIntervalDescription(formData.normalIntervalDays)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Funcionários com resultados severos:</span>
                <span className="font-medium text-red-600">Checkup a cada {getIntervalDescription(formData.severeIntervalDays)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lembretes automáticos:</span>
                <span className="font-medium">
                  {formData.autoRemindersEnabled ? 'Ativados' : 'Desativados'}
                </span>
              </div>
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
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Configurações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0D9488;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb-red::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #EF4444;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};