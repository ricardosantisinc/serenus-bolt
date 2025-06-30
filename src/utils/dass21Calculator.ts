import { Dass21Response, Dass21Scores, Dass21Classification, MentalHealthClassificationResult } from '../types';

export const calculateDass21Scores = (responses: Dass21Response[]): Dass21Scores => {
  // Stress questions: 1, 2, 3, 4, 5, 6, 7
  const stressQuestions = [1, 2, 3, 4, 5, 6, 7];
  // Anxiety questions: 8, 9, 10, 11, 12, 13, 14
  const anxietyQuestions = [8, 9, 10, 11, 12, 13, 14];
  // Depression questions: 15, 16, 17, 18, 19, 20, 21
  const depressionQuestions = [15, 16, 17, 18, 19, 20, 21];

  const stressSum = responses
    .filter(r => stressQuestions.includes(r.questionId))
    .reduce((sum, r) => sum + r.value, 0);

  const anxietySum = responses
    .filter(r => anxietyQuestions.includes(r.questionId))
    .reduce((sum, r) => sum + r.value, 0);

  const depressionSum = responses
    .filter(r => depressionQuestions.includes(r.questionId))
    .reduce((sum, r) => sum + r.value, 0);

  // Multiply by 2 as per DASS-21 scoring rules
  return {
    stress: stressSum * 2,
    anxiety: anxietySum * 2,
    depression: depressionSum * 2
  };
};

export const classifyDass21Scores = (scores: Dass21Scores): Dass21Classification => {
  const classifyDepression = (score: number) => {
    if (score <= 9) return 'normal';
    if (score <= 13) return 'leve';
    if (score <= 20) return 'moderado';
    if (score <= 27) return 'severo';
    return 'extremamente_severo';
  };

  const classifyAnxiety = (score: number) => {
    if (score <= 7) return 'normal';
    if (score <= 9) return 'leve';
    if (score <= 14) return 'moderado';
    if (score <= 19) return 'severo';
    return 'extremamente_severo';
  };

  const classifyStress = (score: number) => {
    if (score <= 14) return 'normal';
    if (score <= 18) return 'leve';
    if (score <= 25) return 'moderado';
    if (score <= 33) return 'severo';
    return 'extremamente_severo';
  };

  return {
    depression: classifyDepression(scores.depression),
    anxiety: classifyAnxiety(scores.anxiety),
    stress: classifyStress(scores.stress)
  };
};

export const getHighestSeverityLevel = (classifications: Dass21Classification): 'normal' | 'leve' | 'moderado' | 'severo' | 'extremamente_severo' => {
  const severityOrder = ['normal', 'leve', 'moderado', 'severo', 'extremamente_severo'];
  const values = Object.values(classifications);
  
  let maxSeverity = 'normal';
  for (const classification of values) {
    if (severityOrder.indexOf(classification) > severityOrder.indexOf(maxSeverity)) {
      maxSeverity = classification;
    }
  }
  
  return maxSeverity as 'normal' | 'leve' | 'moderado' | 'severo' | 'extremamente_severo';
};

export const calculateNextCheckupDate = (
  severityLevel: 'normal' | 'leve' | 'moderado' | 'severo' | 'extremamente_severo',
  settings: { normalIntervalDays: number; severeIntervalDays: number }
): Date => {
  const isSevere = severityLevel === 'severo' || severityLevel === 'extremamente_severo';
  const intervalDays = isSevere ? settings.severeIntervalDays : settings.normalIntervalDays;
  
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate;
};

export const getClassificationLabel = (classification: string): string => {
  const labels = {
    normal: 'Normal',
    leve: 'Leve',
    moderado: 'Moderado',
    severo: 'Severo',
    extremamente_severo: 'Extremamente Severo'
  };
  return labels[classification as keyof typeof labels] || classification;
};

export const getClassificationColor = (classification: string): string => {
  const colors = {
    normal: 'text-green-600 bg-green-100',
    leve: 'text-yellow-600 bg-yellow-100',
    moderado: 'text-orange-600 bg-orange-100',
    severo: 'text-red-600 bg-red-100',
    extremamente_severo: 'text-red-800 bg-red-200'
  };
  return colors[classification as keyof typeof colors] || 'text-gray-600 bg-gray-100';
};

export const getSeverityUrgencyLevel = (severityLevel: string): 'low' | 'medium' | 'high' | 'critical' => {
  switch (severityLevel) {
    case 'normal':
      return 'low';
    case 'leve':
      return 'low';
    case 'moderado':
      return 'medium';
    case 'severo':
      return 'high';
    case 'extremamente_severo':
      return 'critical';
    default:
      return 'low';
  }
};

export const getCheckupFrequencyMessage = (severityLevel: string, nextCheckupDate: Date): string => {
  const daysUntilNext = Math.ceil((nextCheckupDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isSevere = severityLevel === 'severo' || severityLevel === 'extremamente_severo';
  
  if (isSevere) {
    return `Próximo checkup recomendado em ${daysUntilNext} dias (acompanhamento intensivo devido à gravidade detectada)`;
  } else {
    return `Próximo checkup recomendado em ${daysUntilNext} dias (acompanhamento regular)`;
  }
};

export const getRecommendations = (classifications: Dass21Classification): string[] => {
  const recommendations: string[] = [];
  
  const hasAnyElevated = Object.values(classifications).some(c => c !== 'normal');
  
  if (!hasAnyElevated) {
    recommendations.push('Parabéns! Você não apresenta sintomas significativos de estresse, ansiedade ou depressão.');
    recommendations.push('Continue mantendo seus hábitos saudáveis e práticas de bem-estar.');
  } else {
    if (classifications.stress !== 'normal') {
      if (classifications.stress === 'leve') {
        recommendations.push('Pequenos sinais de estresse detectados. Cuide da sua rotina e adote hábitos saudáveis.');
      } else if (classifications.stress === 'moderado') {
        recommendations.push('Sinais evidentes de estresse. Busque relaxamento e avalie se precisa de ajuda profissional.');
      } else {
        recommendations.push('Níveis elevados de estresse detectados. É recomendável procurar apoio especializado.');
      }
    }

    if (classifications.anxiety !== 'normal') {
      if (classifications.anxiety === 'leve') {
        recommendations.push('Pequenos sinais de ansiedade detectados. Pratique técnicas de respiração e relaxamento.');
      } else if (classifications.anxiety === 'moderado') {
        recommendations.push('Sinais evidentes de ansiedade. Considere buscar apoio profissional.');
      } else {
        recommendations.push('Níveis elevados de ansiedade detectados. É importante procurar ajuda especializada.');
      }
    }

    if (classifications.depression !== 'normal') {
      if (classifications.depression === 'leve') {
        recommendations.push('Pequenos sinais de depressão detectados. Mantenha atividades prazerosas e contato social.');
      } else if (classifications.depression === 'moderado') {
        recommendations.push('Sinais evidentes de depressão. É recomendável buscar apoio profissional.');
      } else {
        recommendations.push('Níveis elevados de depressão detectados. Procure um profissional de saúde mental urgentemente.');
      }
    }

    // General recommendations
    recommendations.push('Pratique atividades físicas regularmente para liberar endorfinas e melhorar o bem-estar.');
    recommendations.push('Adote técnicas de relaxamento, como meditação ou respiração profunda.');
    recommendations.push('Melhore sua rotina de sono, garantindo um descanso adequado.');
    recommendations.push('Converse com amigos ou familiares sobre o que está sentindo.');
    
    if (Object.values(classifications).some(c => ['severo', 'extremamente_severo'].includes(c))) {
      recommendations.push('⚠️ IMPORTANTE: Seus resultados indicam a necessidade de buscar ajuda profissional imediatamente.');
    }
  }

  return recommendations;
};

/**
 * Classifica avaliações de saúde mental (DASS-21) e determina trilhas de tratamento
 * @param depressionScore - Score de depressão do DASS-21
 * @param anxietyScore - Score de ansiedade do DASS-21
 * @param stressScore - Score de estresse do DASS-21
 * @returns Resultado da classificação com trilhas recomendadas e necessidade de encaminhamento
 */
export const classifyMentalHealthAssessment = (
  depressionScore: number,
  anxietyScore: number,
  stressScore: number
): MentalHealthClassificationResult => {
  const recommendedPaths: string[] = [];
  let psychologistReferralNeeded = false;
  const justifications: string[] = [];
  const recommendations: string[] = [];
  
  // Classificar Depressão
  let depressionPath = '';
  let depressionLevel = 'baixo';
  
  if (depressionScore >= 21) {
    depressionPath = "Trilha Depressão Alerta";
    depressionLevel = 'crítico';
    psychologistReferralNeeded = true;
    justifications.push(`Depressão (score ${depressionScore}) indica nível crítico - ${depressionPath} com encaminhamento psicológico urgente.`);
    recommendations.push('Busque apoio psicológico imediatamente para tratar sintomas depressivos severos.');
  } else if (depressionScore >= 14) {
    depressionPath = "Trilha Depressão Moderado";
    depressionLevel = 'moderado';
    justifications.push(`Depressão (score ${depressionScore}) indica nível moderado - ${depressionPath}.`);
    recommendations.push('Considere buscar apoio profissional e adote práticas de autocuidado para sintomas depressivos.');
  } else {
    depressionPath = "Trilha Manutenção da SM";
    justifications.push(`Depressão (score ${depressionScore}) dentro da normalidade - ${depressionPath}.`);
  }

  // Classificar Estresse
  let stressPath = '';
  let stressLevel = 'baixo';
  
  if (stressScore >= 26) {
    stressPath = "Trilha Estresse Alerta";
    stressLevel = 'crítico';
    psychologistReferralNeeded = true;
    justifications.push(`Estresse (score ${stressScore}) indica nível crítico - ${stressPath} com encaminhamento psicológico urgente.`);
    recommendations.push('Procure apoio psicológico imediato para manejo de estresse severo.');
  } else if (stressScore >= 19) {
    stressPath = "Trilha Estresse Moderado";
    stressLevel = 'moderado';
    justifications.push(`Estresse (score ${stressScore}) indica nível moderado - ${stressPath}.`);
    recommendations.push('Implemente técnicas de relaxamento e considere apoio profissional para manejo do estresse.');
  } else {
    stressPath = "Trilha Manutenção da SM";
    justifications.push(`Estresse (score ${stressScore}) dentro da normalidade - ${stressPath}.`);
  }

  // Classificar Ansiedade
  let anxietyPath = '';
  let anxietyLevel = 'baixo';
  
  if (anxietyScore >= 15) {
    anxietyPath = "Trilha Ansiedade Alerta";
    anxietyLevel = 'crítico';
    psychologistReferralNeeded = true;
    justifications.push(`Ansiedade (score ${anxietyScore}) indica nível crítico - ${anxietyPath} com encaminhamento psicológico urgente.`);
    recommendations.push('Busque ajuda psicológica urgente para tratamento de sintomas ansiosos severos.');
  } else if (anxietyScore >= 10) {
    anxietyPath = "Trilha Ansiedade Moderado";
    anxietyLevel = 'moderado';
    justifications.push(`Ansiedade (score ${anxietyScore}) indica nível moderado - ${anxietyPath}.`);
    recommendations.push('Pratique técnicas de respiração e relaxamento, considere apoio profissional.');
  } else {
    anxietyPath = "Trilha Manutenção da SM";
    justifications.push(`Ansiedade (score ${anxietyScore}) dentro da normalidade - ${anxietyPath}.`);
  }

  // Determinar nível crítico geral (priorizar o mais alto)
  const levels = [depressionLevel, stressLevel, anxietyLevel];
  let overallCriticalLevel: 'baixo' | 'moderado' | 'alto' | 'crítico' = 'baixo';
  
  if (levels.includes('crítico')) {
    overallCriticalLevel = 'crítico';
  } else if (levels.includes('moderado')) {
    overallCriticalLevel = 'moderado';
  }

  // Coletar trilhas recomendadas (priorizar níveis mais críticos)
  const alertPaths = [depressionPath, stressPath, anxietyPath].filter(path => path.includes("Alerta"));
  const moderatePaths = [depressionPath, stressPath, anxietyPath].filter(path => path.includes("Moderado"));
  
  if (alertPaths.length > 0) {
    recommendedPaths.push(...alertPaths);
  } else if (moderatePaths.length > 0) {
    recommendedPaths.push(...moderatePaths);
  } else {
    recommendedPaths.push("Trilha Manutenção da SM");
  }

  // Adicionar recomendações gerais baseadas no nível crítico
  if (overallCriticalLevel === 'crítico') {
    recommendations.push('⚠️ URGENTE: Procure ajuda psicológica imediatamente.');
    recommendations.push('Evite tomar decisões importantes sozinho neste momento.');
    recommendations.push('Mantenha contato próximo com familiares e amigos.');
  } else if (overallCriticalLevel === 'moderado') {
    recommendations.push('Considere buscar apoio profissional preventivo.');
    recommendations.push('Adote práticas regulares de autocuidado e bem-estar.');
    recommendations.push('Monitore seus sintomas e procure ajuda se piorarem.');
  } else {
    recommendations.push('Continue mantendo hábitos saudáveis de vida.');
    recommendations.push('Pratique exercícios físicos regularmente.');
    recommendations.push('Mantenha uma boa qualidade de sono.');
  }

  return {
    recommendedPaths: [...new Set(recommendedPaths)], // Remove duplicatas
    psychologistReferralNeeded,
    justification: justifications.join(' '),
    criticalLevel: overallCriticalLevel,
    recommendations: [...new Set(recommendations)] // Remove duplicatas
  };
};