import { 
  Dass21Scores, 
  Dass21Classification, 
  IasResult, 
  CombinedAssessmentResult,
  MentalHealthClassificationResult
} from '../types';
import { classifyMentalHealthAssessment, getHighestSeverityLevel } from './dass21Calculator';

/**
 * Calcula a avaliação combinada DASS-21 + IAS
 * @param dass21Scores - Scores do DASS-21
 * @param dass21Classifications - Classificações do DASS-21
 * @param iasResult - Resultado do IAS
 * @returns Resultado da avaliação combinada
 */
export const calculateCombinedAssessment = (
  dass21Scores: Dass21Scores,
  dass21Classifications: Dass21Classification,
  iasResult: IasResult
): CombinedAssessmentResult => {
  // Calcular avaliação de saúde mental do DASS-21
  const mentalHealthClassification: MentalHealthClassificationResult = classifyMentalHealthAssessment(
    dass21Scores.depression,
    dass21Scores.anxiety,
    dass21Scores.stress
  );

  // Determinar nível crítico geral considerando ambos os testes
  const overallCriticalLevel = determineOverallCriticalLevel(
    mentalHealthClassification.criticalLevel,
    iasResult.classification
  );

  // Combinar trilhas recomendadas
  const combinedPaths = combineRecommendedPaths(
    mentalHealthClassification.recommendedPaths,
    iasResult.classification
  );

  // Determinar necessidade de encaminhamento psicológico
  const needsPsychologist = determineCompoundPsychologistReferral(
    mentalHealthClassification.psychologistReferralNeeded,
    iasResult.classification
  );

  // Gerar justificativa combinada
  const combinedJustification = generateCombinedJustification(
    mentalHealthClassification,
    iasResult
  );

  // Combinar recomendações
  const combinedRecommendations = combineRecommendations(
    mentalHealthClassification.recommendations,
    iasResult.recommendations,
    overallCriticalLevel
  );

  // Calcular score geral do DASS-21
  const overallDass21Score = Math.round((dass21Scores.depression + dass21Scores.anxiety + dass21Scores.stress) / 3);
  const severityLevel = getHighestSeverityLevel(dass21Classifications);

  return {
    dass21: {
      scores: dass21Scores,
      classifications: dass21Classifications,
      overallScore: overallDass21Score,
      severityLevel
    },
    ias: iasResult,
    recommendedPaths: combinedPaths,
    psychologistReferralNeeded: needsPsychologist,
    justification: combinedJustification,
    criticalLevel: overallCriticalLevel,
    recommendations: combinedRecommendations
  };
};

/**
 * Determina o nível crítico geral baseado em ambos os testes
 */
const determineOverallCriticalLevel = (
  mentalHealthLevel: 'baixo' | 'moderado' | 'alto' | 'crítico',
  iasClassification: 'alto_risco' | 'desbalanceada' | 'razoavel' | 'saudavel'
): 'baixo' | 'moderado' | 'alto' | 'crítico' => {
  // Converter classificação IAS para nível crítico
  let iasLevel: 'baixo' | 'moderado' | 'alto' | 'crítico';
  switch (iasClassification) {
    case 'alto_risco':
      iasLevel = 'crítico';
      break;
    case 'desbalanceada':
      iasLevel = 'alto';
      break;
    case 'razoavel':
      iasLevel = 'moderado';
      break;
    case 'saudavel':
      iasLevel = 'baixo';
      break;
  }

  // Retornar o nível mais crítico entre os dois
  const levels = ['baixo', 'moderado', 'alto', 'crítico'];
  const mentalIndex = levels.indexOf(mentalHealthLevel);
  const iasIndex = levels.indexOf(iasLevel);
  
  return levels[Math.max(mentalIndex, iasIndex)] as 'baixo' | 'moderado' | 'alto' | 'crítico';
};

/**
 * Combina as trilhas recomendadas dos dois testes
 */
const combineRecommendedPaths = (
  mentalHealthPaths: string[],
  iasClassification: string
): string[] => {
  const paths = [...mentalHealthPaths];

  // Adicionar trilhas relacionadas à alimentação baseadas no IAS
  switch (iasClassification) {
    case 'alto_risco':
      paths.push('Trilha Alimentação Crítica');
      break;
    case 'desbalanceada':
      paths.push('Trilha Alimentação Moderada');
      break;
    case 'razoavel':
      paths.push('Trilha Alimentação Preventiva');
      break;
    case 'saudavel':
      paths.push('Trilha Manutenção Alimentar');
      break;
  }

  // Adicionar trilha integrada se houver problemas em ambas as áreas
  if (mentalHealthPaths.some(path => path.includes('Alerta')) && 
      ['alto_risco', 'desbalanceada'].includes(iasClassification)) {
    paths.push('Trilha Bem-estar Integrado');
  }

  return [...new Set(paths)]; // Remove duplicatas
};

/**
 * Determina a necessidade de encaminhamento psicológico considerando ambos os testes
 */
const determineCompoundPsychologistReferral = (
  mentalHealthNeedsPsychologist: boolean,
  iasClassification: string
): boolean => {
  // Se já precisa por saúde mental, mantém a necessidade
  if (mentalHealthNeedsPsychologist) {
    return true;
  }

  // Se a alimentação está em alto risco, também pode indicar necessidade de apoio psicológico
  // para lidar com possíveis transtornos alimentares ou estresse relacionado
  if (iasClassification === 'alto_risco') {
    return true;
  }

  return false;
};

/**
 * Gera justificativa combinada dos dois testes
 */
const generateCombinedJustification = (
  mentalHealthClassification: MentalHealthClassificationResult,
  iasResult: IasResult
): string => {
  const parts: string[] = [];

  // Adicionar justificativa da saúde mental
  parts.push(`SAÚDE MENTAL: ${mentalHealthClassification.justification}`);

  // Adicionar justificativa da alimentação
  const iasScore = iasResult.totalScore;
  const iasClassificationLabel = {
    'alto_risco': 'Alto Risco',
    'desbalanceada': 'Desbalanceada',
    'razoavel': 'Razoável',
    'saudavel': 'Saudável'
  }[iasResult.classification];

  parts.push(`ALIMENTAÇÃO: Score IAS ${iasScore}/100 indica alimentação ${iasClassificationLabel.toLowerCase()}.`);

  // Adicionar correlação entre os dois aspectos
  if (mentalHealthClassification.criticalLevel !== 'baixo' && 
      ['alto_risco', 'desbalanceada'].includes(iasResult.classification)) {
    parts.push('CORRELAÇÃO: Identificada relação entre estado mental e hábitos alimentares inadequados, sugerindo abordagem integrada.');
  }

  return parts.join(' ');
};

/**
 * Combina as recomendações dos dois testes
 */
const combineRecommendations = (
  mentalHealthRecommendations: string[],
  iasRecommendations: string[],
  overallCriticalLevel: string
): string[] => {
  const combined: string[] = [];

  // Adicionar recomendações de saúde mental
  combined.push('=== SAÚDE MENTAL ===');
  combined.push(...mentalHealthRecommendations);

  // Adicionar recomendações de alimentação
  combined.push('=== ALIMENTAÇÃO SAUDÁVEL ===');
  combined.push(...iasRecommendations);

  // Adicionar recomendações integradas baseadas no nível crítico geral
  combined.push('=== RECOMENDAÇÕES INTEGRADAS ===');

  switch (overallCriticalLevel) {
    case 'crítico':
      combined.push('🚨 URGENTE: Busque apoio profissional imediato (psicólogo + nutricionista).');
      combined.push('Considere um programa de bem-estar integrado que aborde tanto aspectos mentais quanto nutricionais.');
      combined.push('Evite tomar decisões importantes sozinho e mantenha apoio de familiares/amigos.');
      break;

    case 'alto':
      combined.push('⚠️ IMPORTANTE: Recomenda-se apoio profissional especializado.');
      combined.push('Implemente mudanças graduais tanto nos hábitos alimentares quanto no manejo do estresse.');
      combined.push('Considere terapia comportamental para modificação de hábitos.');
      break;

    case 'moderado':
      combined.push('Adote uma abordagem preventiva focada em bem-estar integral.');
      combined.push('Estabeleça rotinas saudáveis que incluam tanto cuidados mentais quanto alimentares.');
      combined.push('Monitore seus indicadores e busque apoio se houver piora.');
      break;

    case 'baixo':
      combined.push('Continue mantendo seus bons hábitos de vida.');
      combined.push('Use este momento de estabilidade para fortalecer suas práticas de autocuidado.');
      combined.push('Compartilhe suas estratégias de bem-estar com outras pessoas.');
      break;
  }

  // Recomendações universais
  combined.push('=== PRÁTICAS UNIVERSAIS ===');
  combined.push('🏃‍♂️ Pratique atividade física regular (pelo menos 30 min, 3x por semana).');
  combined.push('😴 Mantenha uma rotina de sono adequada (7-8 horas por noite).');
  combined.push('🤝 Cultive relacionamentos sociais saudáveis e redes de apoio.');
  combined.push('🧘‍♀️ Dedique tempo para atividades de relaxamento e lazer.');
  combined.push('📱 Limite o uso de dispositivos eletrônicos, especialmente antes de dormir.');

  return combined;
};