import React, { useState, useEffect } from 'react';
import { Brain, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { dass21Questions, responseOptions } from '../data/dass21Questions';
import { 
  calculateDass21Scores, 
  classifyDass21Scores, 
  getHighestSeverityLevel,
  calculateNextCheckupDate,
} from '../utils/dass21Calculator';
import { Dass21Response, CheckupResult, CompanyCheckupSettings } from '../types';

interface Dass21CheckupProps {
  userId: string;
  companyId: string;
  onComplete: (result: CheckupResult) => void;
  onClose: () => void;
  getCompanyCheckupSettings: (companyId: string) => Promise<CompanyCheckupSettings | null>;
}

export const Dass21Checkup: React.FC<Dass21CheckupProps> = ({ 
  userId, 
  companyId, 
  onComplete, 
  onClose,
  getCompanyCheckupSettings
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Dass21Response[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanyCheckupSettings | null>(null);

  const currentQuestion = dass21Questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === dass21Questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / dass21Questions.length) * 100;

  useEffect(() => {
    const loadCompanySettings = async () => {
      try {
        const settings = await getCompanyCheckupSettings(companyId);
        setCompanySettings(settings);
      } catch (error) {
        console.error('Erro ao carregar configurações da empresa:', error);
      }
    };

    loadCompanySettings();
  }, [companyId, getCompanyCheckupSettings]);

  const getCurrentResponse = () => {
    return responses.find(r => r.questionId === currentQuestion.id);
  };

  const handleResponseChange = (value: number) => {
    const newResponses = responses.filter(r => r.questionId !== currentQuestion.id);
    newResponses.push({ questionId: currentQuestion.id, value: value as 0 | 1 | 2 | 3 });
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const scores = calculateDass21Scores(responses);
    const classifications = classifyDass21Scores(scores);
    const severityLevel = getHighestSeverityLevel(classifications);
    const overallScore = Math.round((scores.depression + scores.anxiety + scores.stress) / 3);

    // Calcular próxima data do checkup baseada nas configurações da empresa
    const defaultSettings = { normalIntervalDays: 90, severeIntervalDays: 30 };
    const settings = companySettings || defaultSettings;
    const nextCheckupDate = calculateNextCheckupDate(severityLevel, settings);

    const result: CheckupResult = {
      id: `checkup_${Date.now()}`,
      userId,
      companyId,
      date: new Date(),
      responses,
      scores,
      classifications,
      overallScore,
      severityLevel,
      nextCheckupDate
    };

    // Passar diretamente para o próximo teste sem mostrar resultados intermediários
    onComplete(result);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      stress: 'from-red-100 to-red-50 border-red-200',
      anxiety: 'from-yellow-100 to-yellow-50 border-yellow-200',
      depression: 'from-purple-100 to-purple-50 border-purple-200'
    };
    return colors[category as keyof typeof colors] || 'from-gray-100 to-gray-50 border-gray-200';
  };

  const getCategoryTitle = (category: string) => {
    const titles = {
      stress: 'Estresse',
      anxiety: 'Ansiedade',
      depression: 'Depressão'
    };
    return titles[category as keyof typeof titles] || category;
  };

  const getSliderColor = (category: string) => {
    const colors = {
      stress: 'accent-red-500',
      anxiety: 'accent-yellow-500', 
      depression: 'accent-purple-500'
    };
    return colors[category as keyof typeof colors] || 'accent-gray-500';
  };

  const currentValue = getCurrentResponse()?.value ?? 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-teal-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Check-up DASS-21</h2>
              <p className="text-sm text-gray-600">Avaliação de Depressão, Ansiedade e Estresse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Pergunta {currentQuestionIndex + 1} de {dass21Questions.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <div className={`rounded-lg border-2 p-6 mb-8 bg-gradient-to-r ${getCategoryColor(currentQuestion.category)}`}>
            <div className="flex items-center mb-4">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {getCategoryTitle(currentQuestion.category)}
              </span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-6 leading-relaxed">
              {currentQuestion.text}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Nos últimos 7 dias, esta situação:
            </p>

            {/* Mobile-Optimized Slider */}
            <div className="mt-8">
              {/* Current Response Display */}
              <div className="text-center mb-8">
                <div className="text-lg font-semibold text-gray-900 bg-white/80 rounded-lg p-4 border border-gray-200">
                  {responseOptions[currentValue].label}
                </div>
              </div>

              {/* Slider Container */}
              <div className="relative px-4">
                {/* Slider Track Markers */}
                <div className="flex justify-between items-center mb-4">
                  {responseOptions.map((option, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                          currentValue === index 
                            ? 'bg-teal-600 border-teal-600 scale-125' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Custom Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="1"
                    value={currentValue}
                    onChange={(e) => handleResponseChange(parseInt(e.target.value))}
                    className={`w-full h-12 bg-gray-200 rounded-lg appearance-none cursor-pointer ${getSliderColor(currentQuestion.category)} slider-thumb`}
                    style={{
                      background: `linear-gradient(to right, #0D9488 0%, #0D9488 ${(currentValue / 3) * 100}%, #E5E7EB ${(currentValue / 3) * 100}%, #E5E7EB 100%)`
                    }}
                  />
                </div>

                {/* Extremes Labels */}
                <div className="flex justify-between mt-4 px-2">
                  <span className="text-sm text-gray-600 font-medium">Não se aplica</span>
                  <span className="text-sm text-gray-600 font-medium">Sempre</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Anterior</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors min-h-[44px] font-medium"
            >
              <span>{isLastQuestion ? 'Finalizar' : 'Próxima'}</span>
              {!isLastQuestion && <ArrowRight className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #0F172A;
          border: 3px solid #FFFFFF;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }

        .slider-thumb::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }

        .slider-thumb::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #0F172A;
          border: 3px solid #FFFFFF;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          border: none;
        }

        .slider-thumb::-moz-range-track {
          height: 8px;
          background: #E5E7EB;
          border-radius: 4px;
        }

        @media (hover: none) and (pointer: coarse) {
          .slider-thumb::-webkit-slider-thumb {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </div>
  );
};