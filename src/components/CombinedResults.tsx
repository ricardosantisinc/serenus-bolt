import React from 'react';
import { CheckCircle, X, Brain, Utensils, AlertTriangle, TrendingUp, Heart, BookOpen } from 'lucide-react';
import { CombinedAssessmentResult } from '../types';
import { 
  getClassificationLabel, 
  getClassificationColor 
} from '../utils/dass21Calculator';
import { 
  getIasClassificationLabel, 
  getIasClassificationColor,
  calculateIasPercentage 
} from '../utils/iasCalculator';

interface CombinedResultsProps {
  result: CombinedAssessmentResult;
  onClose: () => void;
  onFinish: () => void;
}

export const CombinedResults: React.FC<CombinedResultsProps> = ({
  result,
  onClose,
  onFinish
}) => {
  const getCriticalLevelColor = (level: string) => {
    const colors = {
      baixo: 'text-green-600 bg-green-50 border-green-200',
      moderado: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      alto: 'text-orange-600 bg-orange-50 border-orange-200',
      crítico: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getCriticalLevelIcon = (level: string) => {
    switch (level) {
      case 'baixo':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'moderado':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'alto':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'crítico':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-gray-600" />;
    }
  };

  // Função melhorada para categorizar recomendações
  const categorizeRecommendations = (recommendations: string[]) => {
    const categories = {
      mentalHealth: [] as string[],
      nutrition: [] as string[],
      integrated: [] as string[],
      universal: [] as string[]
    };
    
    let currentCategory = '';
    
    for (const rec of recommendations) {
      if (rec.includes('=== SAÚDE MENTAL ===')) {
        currentCategory = 'mentalHealth';
        continue;
      } else if (rec.includes('=== ALIMENTAÇÃO SAUDÁVEL ===')) {
        currentCategory = 'nutrition';
        continue;
      } else if (rec.includes('=== RECOMENDAÇÕES INTEGRADAS ===')) {
        currentCategory = 'integrated';
        continue;
      } else if (rec.includes('=== PRÁTICAS UNIVERSAIS ===')) {
        currentCategory = 'universal';
        continue;
      }
      
      // Pular strings vazias ou apenas com cabeçalhos
      if (rec.trim() === '' || rec.includes('===')) {
        continue;
      }
      
      // Adicionar recomendação à categoria atual se tivermos uma
      if (currentCategory && categories[currentCategory as keyof typeof categories]) {
        categories[currentCategory as keyof typeof categories].push(rec);
      }
    }
    
    return categories;
  };

  // Categorizar as recomendações
  const { mentalHealth, nutrition, integrated, universal } = categorizeRecommendations(result.recommendations);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Resultados da Avaliação Integrada</h2>
              <p className="text-sm text-gray-600">Análise completa de bem-estar mental e nutricional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Nível Crítico Geral */}
          <div className={`border rounded-lg p-6 ${getCriticalLevelColor(result.criticalLevel)}`}>
            <div className="flex items-center space-x-3 mb-4">
              {getCriticalLevelIcon(result.criticalLevel)}
              <h3 className="text-xl font-bold">
                Nível Geral: {result.criticalLevel.charAt(0).toUpperCase() + result.criticalLevel.slice(1)}
              </h3>
            </div>
            <p className="text-sm leading-relaxed">{result.justification}</p>
            {result.psychologistReferralNeeded && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-800 font-medium">
                  🏥 Recomendação de Encaminhamento: Apoio psicológico profissional recomendado
                </p>
              </div>
            )}
          </div>

          {/* Resultados Individuais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DASS-21 Results */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="h-6 w-6 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900">Saúde Mental (DASS-21)</h3>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600 mb-1">
                    {result.dass21.overallScore}%
                  </div>
                  <p className="text-sm text-gray-600">Score Geral</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Depressão</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{result.dass21.scores.depression}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getClassificationColor(result.dass21.classifications.depression)}`}>
                        {getClassificationLabel(result.dass21.classifications.depression)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Ansiedade</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{result.dass21.scores.anxiety}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getClassificationColor(result.dass21.classifications.anxiety)}`}>
                        {getClassificationLabel(result.dass21.classifications.anxiety)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Estresse</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{result.dass21.scores.stress}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getClassificationColor(result.dass21.classifications.stress)}`}>
                        {getClassificationLabel(result.dass21.classifications.stress)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* IAS Results */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Utensils className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Alimentação (IAS)</h3>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {calculateIasPercentage(result.ias.totalScore)}%
                  </div>
                  <p className="text-sm text-gray-600">Score: {result.ias.totalScore}/100</p>
                </div>

                <div className="text-center">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getIasClassificationColor(result.ias.classification)}`}>
                    {getIasClassificationLabel(result.ias.classification)}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${calculateIasPercentage(result.ias.totalScore)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trilhas Recomendadas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Trilhas de Tratamento Recomendadas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.recommendedPaths.map((path, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-800">{path}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recomendações Detalhadas */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Plano de Ação Personalizado</h3>
            
            {/* Recomendações de Saúde Mental */}
            {mentalHealth.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  Saúde Mental
                </h4>
                <ul className="space-y-2">
                  {mentalHealth.map((rec, index) => (
                    <li key={index} className="text-sm text-purple-800 flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recomendações de Alimentação */}
            {nutrition.length > 0 || result.ias.recommendations.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <Utensils className="h-4 w-4 mr-2" />
                  Alimentação Saudável
                </h4>
                <ul className="space-y-2">
                  {/* Se tivermos recomendações da categoria de nutrição da avaliação combinada */}
                  {nutrition.map((rec, index) => (
                    <li key={`comb-${index}`} className="text-sm text-green-800 flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                  
                  {/* Se não houver na avaliação combinada, usamos as do IAS diretamente */}
                  {nutrition.length === 0 && result.ias.recommendations.slice(0, 5).map((rec, index) => (
                    <li key={`ias-${index}`} className="text-sm text-green-800 flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Recomendações Integradas */}
            {integrated.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Abordagem Integrada
                </h4>
                <ul className="space-y-2">
                  {integrated.map((rec, index) => (
                    <li key={index} className="text-sm text-orange-800 flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Práticas Universais */}
            {universal.length > 0 && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="font-semibold text-teal-900 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Práticas de Bem-estar Geral
                </h4>
                <ul className="space-y-2">
                  {universal.map((rec, index) => (
                    <li key={index} className="text-sm text-teal-800 flex items-start">
                      <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Próximos Passos */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Próximos Passos</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✅ Sua avaliação foi salva e será revisada pela equipe de RH e saúde</p>
              <p>📅 Seu próximo checkup será agendado automaticamente baseado nos resultados</p>
              {result.psychologistReferralNeeded && (
                <p>🏥 Nossa equipe entrará em contato para agendar apoio psicológico especializado</p>
              )}
              <p>📊 Use esses resultados para desenvolver seu plano pessoal de bem-estar</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onFinish}
              className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Finalizar Avaliação</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};