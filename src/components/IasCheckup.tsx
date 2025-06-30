import React, { useState, useEffect } from 'react';
import { Utensils, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { iasQuestions } from '../data/iasQuestions';
import { IasResponse } from '../types';
import { calculateIasScore } from '../utils/iasCalculator';

interface IasCheckupProps {
  userId: string;
  companyId: string;
  onComplete: (iasResult: { responses: IasResponse[]; totalScore: number; classification: string; recommendations: string[] }) => void;
  onClose: () => void;
}

export const IasCheckup: React.FC<IasCheckupProps> = ({ 
  userId, 
  companyId, 
  onComplete, 
  onClose 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<IasResponse[]>([]);

  const currentQuestion = iasQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === iasQuestions.length - 1;
  const progress = ((currentQuestionIndex + 1) / iasQuestions.length) * 100;

  // Efeito para inicializar a resposta para cada nova pergunta
  useEffect(() => {
    // Verificar se já existe uma resposta para a pergunta atual
    const existingResponse = responses.find(r => r.questionId === currentQuestion.id);
    
    // Se não existir resposta, inicializar com a primeira opção
    if (!existingResponse) {
      const firstOptionValue = currentQuestion.options[0].value;
      const newResponses = [...responses, { 
        questionId: currentQuestion.id, 
        value: firstOptionValue 
      }];
      setResponses(newResponses);
    }
  }, [currentQuestionIndex, currentQuestion, responses]);

  // Obter resposta atual como índice da opção (para o slider)
  const getCurrentResponseIndex = () => {
    const response = responses.find(r => r.questionId === currentQuestion.id);
    if (!response) return 0; // Retorna 0 (primeira opção) se não houver resposta
    
    // Retornar o índice da opção com base no valor da resposta
    const optionIndex = currentQuestion.options.findIndex(option => option.value === response.value);
    return optionIndex !== -1 ? optionIndex : 0;
  };

  const currentOptionIndex = getCurrentResponseIndex();

  const handleResponseChange = (optionIndex: number) => {
    const newResponses = responses.filter(r => r.questionId !== currentQuestion.id);
    const value = currentQuestion.options[optionIndex].value;
    newResponses.push({ questionId: currentQuestion.id, value });
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
    const iasResult = calculateIasScore(responses);
    
    onComplete({
      responses,
      totalScore: iasResult.totalScore,
      classification: iasResult.classification,
      recommendations: iasResult.recommendations
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Utensils className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Avaliação Alimentar - IAS</h2>
              <p className="text-sm text-gray-600">Índice de Alimentação Saudável</p>
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
              Pergunta {currentQuestionIndex + 1} de {iasQuestions.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <div className="rounded-lg border-2 border-green-200 p-6 mb-8 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center mb-4">
              <span className="text-sm font-medium text-green-600 uppercase tracking-wide">
                Hábitos Alimentares
              </span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-6 leading-relaxed">
              {currentQuestion.text}
            </h3>

            {/* Slider para respostas */}
            <div className="mt-8">
              {/* Current Response Display */}
              <div className="text-center mb-8">
                <div className="text-lg font-semibold text-gray-900 bg-white/80 rounded-lg p-4 border border-gray-200">
                  {currentQuestion.options[currentOptionIndex].text}
                </div>
              </div>

              {/* Slider Container */}
              <div className="relative px-4">
                {/* Slider Track Markers */}
                <div className="flex justify-between items-center mb-4">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                          currentOptionIndex === index 
                            ? 'bg-green-600 border-green-600 scale-125' 
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
                    max={currentQuestion.options.length - 1}
                    step="1"
                    value={currentOptionIndex}
                    onChange={(e) => handleResponseChange(parseInt(e.target.value))}
                    className="w-full h-12 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #10B981 0%, #10B981 ${(currentOptionIndex / (currentQuestion.options.length - 1)) * 100}%, #E5E7EB ${(currentOptionIndex / (currentQuestion.options.length - 1)) * 100}%, #E5E7EB 100%)`
                    }}
                  />
                </div>

                {/* Extremes Labels */}
                <div className="flex justify-between mt-4 px-2">
                  <span className="text-sm text-gray-600 font-medium">Raramente/Nunca</span>
                  <span className="text-sm text-gray-600 font-medium">Diariamente</span>
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
              className="flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors min-h-[44px] font-medium"
            >
              <span>{isLastQuestion ? 'Finalizar Avaliação' : 'Próxima'}</span>
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