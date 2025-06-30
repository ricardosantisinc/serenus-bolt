import { IasResponse, IasResult } from '../types';
import { getIasClassification, getIasRecommendations } from '../data/iasQuestions';

/**
 * Calcula o score total do IAS baseado nas respostas
 * @param responses - Array de respostas do usuário
 * @returns IasResult com score, classificação e recomendações
 */
export const calculateIasScore = (responses: IasResponse[]): IasResult => {
  // Calcular score total
  const totalScore = responses.reduce((sum, response) => sum + response.value, 0);
  
  // Obter classificação baseada no score
  const classification = getIasClassification(totalScore);
  
  // Obter recomendações baseadas na classificação
  const recommendations = getIasRecommendations(classification);
  
  return {
    totalScore,
    classification,
    recommendations
  };
};

/**
 * Obtém o rótulo amigável para a classificação IAS
 * @param classification - Classificação do IAS
 * @returns String com rótulo amigável
 */
export const getIasClassificationLabel = (classification: string): string => {
  const labels = {
    alto_risco: 'Alto Risco',
    desbalanceada: 'Desbalanceada',
    razoavel: 'Razoável',
    saudavel: 'Saudável'
  };
  return labels[classification as keyof typeof labels] || classification;
};

/**
 * Obtém a cor para exibição da classificação IAS
 * @param classification - Classificação do IAS
 * @returns String com classes CSS para cor
 */
export const getIasClassificationColor = (classification: string): string => {
  const colors = {
    alto_risco: 'text-red-800 bg-red-100',
    desbalanceada: 'text-orange-800 bg-orange-100',
    razoavel: 'text-yellow-800 bg-yellow-100',
    saudavel: 'text-green-800 bg-green-100'
  };
  return colors[classification as keyof typeof colors] || 'text-gray-800 bg-gray-100';
};

/**
 * Obtém a descrição detalhada da classificação IAS
 * @param classification - Classificação do IAS
 * @returns String com descrição
 */
export const getIasClassificationDescription = (classification: string): string => {
  const descriptions = {
    alto_risco: 'Sua alimentação apresenta alto risco para a saúde e requer mudanças urgentes.',
    desbalanceada: 'Sua alimentação está desbalanceada e precisa de ajustes importantes.',
    razoavel: 'Sua alimentação está razoável, mas ainda há espaço para melhorias.',
    saudavel: 'Parabéns! Você mantém uma alimentação saudável e equilibrada.'
  };
  return descriptions[classification as keyof typeof descriptions] || '';
};

/**
 * Calcula a porcentagem do score IAS
 * @param score - Score total do IAS
 * @returns Porcentagem (0-100)
 */
export const calculateIasPercentage = (score: number): number => {
  const maxScore = 100; // Score máximo possível no IAS
  return Math.round((score / maxScore) * 100);
};