import { IasQuestion } from '../types';

export const iasQuestions: IasQuestion[] = [
  {
    id: 1,
    text: "Com que frequência você come frutas frescas?",
    options: [
      { text: "Raramente ou nunca", value: 0 },
      { text: "1-2 vezes por semana", value: 2 },
      { text: "3-4 vezes por semana", value: 5 },
      { text: "5-6 vezes por semana", value: 8 },
      { text: "Diariamente", value: 10 }
    ]
  },
  {
    id: 2,
    text: "Com que frequência você come vegetais e verduras?",
    options: [
      { text: "Raramente ou nunca", value: 0 },
      { text: "1-2 vezes por semana", value: 2 },
      { text: "3-4 vezes por semana", value: 5 },
      { text: "5-6 vezes por semana", value: 8 },
      { text: "Diariamente", value: 10 }
    ]
  },
  {
    id: 3,
    text: "Com que frequência você consome cereais integrais (aveia, quinoa, arroz integral)?",
    options: [
      { text: "Raramente ou nunca", value: 0 },
      { text: "1-2 vezes por semana", value: 2 },
      { text: "3-4 vezes por semana", value: 5 },
      { text: "5-6 vezes por semana", value: 8 },
      { text: "Diariamente", value: 10 }
    ]
  },
  {
    id: 4,
    text: "Com que frequência você consume proteínas magras (peixe, frango, leguminosas)?",
    options: [
      { text: "Raramente ou nunca", value: 0 },
      { text: "1-2 vezes por semana", value: 2 },
      { text: "3-4 vezes por semana", value: 5 },
      { text: "5-6 vezes por semana", value: 8 },
      { text: "Diariamente", value: 10 }
    ]
  },
  {
    id: 5,
    text: "Com que frequência você bebe água (pelo menos 8 copos por dia)?",
    options: [
      { text: "Raramente ou nunca", value: 0 },
      { text: "1-2 vezes por semana", value: 2 },
      { text: "3-4 vezes por semana", value: 5 },
      { text: "5-6 vezes por semana", value: 8 },
      { text: "Diariamente", value: 10 }
    ]
  },
  {
    id: 6,
    text: "Com que frequência você consome alimentos processados (fast food, salgadinhos, doces)?",
    options: [
      { text: "Diariamente", value: 0 },
      { text: "5-6 vezes por semana", value: 2 },
      { text: "3-4 vezes por semana", value: 5 },
      { text: "1-2 vezes por semana", value: 8 },
      { text: "Raramente ou nunca", value: 10 }
    ]
  },
  {
    id: 7,
    text: "Com que frequência você consume bebidas açucaradas (refrigerantes, sucos industrializados)?",
    options: [
      { text: "Diariamente", value: 0 },
      { text: "5-6 vezes por semana", value: 2 },
      { text: "3-4 vezes por semana", value: 5 },
      { text: "1-2 vezes por semana", value: 8 },
      { text: "Raramente ou nunca", value: 10 }
    ]
  },
  {
    id: 8,
    text: "Você faz refeições regulares (café da manhã, almoço e jantar)?",
    options: [
      { text: "Raramente faço refeições regulares", value: 0 },
      { text: "Faço 1 refeição regular por dia", value: 3 },
      { text: "Faço 2 refeições regulares por dia", value: 6 },
      { text: "Faço 3 refeições regulares por dia", value: 10 }
    ]
  },
  {
    id: 9,
    text: "Você controla o tamanho das porções das suas refeições?",
    options: [
      { text: "Nunca presto atenção", value: 0 },
      { text: "Raramente controlo", value: 3 },
      { text: "Às vezes controlo", value: 6 },
      { text: "Sempre controlo", value: 10 }
    ]
  },
  {
    id: 10,
    text: "Com que frequência você consome laticínios com baixo teor de gordura?",
    options: [
      { text: "Raramente ou nunca", value: 0 },
      { text: "1-2 vezes por semana", value: 3 },
      { text: "3-4 vezes por semana", value: 6 },
      { text: "Diariamente", value: 10 }
    ]
  }
];

export const getIasClassification = (totalScore: number): 'alto_risco' | 'desbalanceada' | 'razoavel' | 'saudavel' => {
  if (totalScore <= 30) return 'alto_risco';
  if (totalScore <= 50) return 'desbalanceada';
  if (totalScore <= 70) return 'razoavel';
  return 'saudavel';
};

export const getIasRecommendations = (classification: string): string[] => {
  const recommendations: string[] = [];

  switch (classification) {
    case 'alto_risco':
      recommendations.push('⚠️ URGENTE: Sua alimentação apresenta alto risco para a saúde. Procure um nutricionista imediatamente.');
      recommendations.push('Elimine completamente alimentos processados e bebidas açucaradas.');
      recommendations.push('Faça pelo menos 3 refeições balanceadas por dia.');
      recommendations.push('Aumente drasticamente o consumo de frutas e vegetais.');
      recommendations.push('Beba pelo menos 2 litros de água por dia.');
      break;

    case 'desbalanceada':
      recommendations.push('Sua alimentação está desbalanceada e precisa de ajustes importantes.');
      recommendations.push('Considere consultar um nutricionista para orientação personalizada.');
      recommendations.push('Reduza significativamente o consumo de alimentos processados.');
      recommendations.push('Inclua mais frutas e vegetais nas suas refeições diárias.');
      recommendations.push('Estabeleça horários regulares para as refeições.');
      break;

    case 'razoavel':
      recommendations.push('Sua alimentação está razoável, mas ainda há espaço para melhorias.');
      recommendations.push('Continue reduzindo alimentos processados e bebidas açucaradas.');
      recommendations.push('Tente incluir mais cereais integrais na sua dieta.');
      recommendations.push('Mantenha a regularidade das refeições.');
      recommendations.push('Aumente a variedade de frutas e vegetais consumidos.');
      break;

    case 'saudavel':
      recommendations.push('Parabéns! Você mantém uma alimentação saudável.');
      recommendations.push('Continue mantendo os bons hábitos alimentares.');
      recommendations.push('Varie os tipos de frutas e vegetais para obter diferentes nutrientes.');
      recommendations.push('Mantenha a hidratação adequada.');
      recommendations.push('Continue evitando alimentos processados e bebidas açucaradas.');
      break;
  }

  // Recomendações gerais
  recommendations.push('Pratique atividade física regularmente para complementar uma alimentação saudável.');
  recommendations.push('Durma pelo menos 7-8 horas por noite para melhor metabolismo.');
  recommendations.push('Gerencie o estresse, pois ele pode afetar seus hábitos alimentares.');

  return recommendations;
};