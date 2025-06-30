import { MentalHealthMetric, WellnessContent, ChartData } from '../types';

export const mentalHealthMetrics: MentalHealthMetric[] = [
  {
    id: '1',
    name: 'Depressão',
    value: 65,
    trend: 'down',
    color: '#8B5CF6',
    description: 'Níveis de humor e energia'
  },
  {
    id: '2',
    name: 'Estresse',
    value: 78,
    trend: 'up',
    color: '#EF4444',
    description: 'Tensão e pressão diária'
  },
  {
    id: '3',
    name: 'Ansiedade',
    value: 45,
    trend: 'stable',
    color: '#F59E0B',
    description: 'Preocupações e nervosismo'
  },
  {
    id: '4',
    name: 'Bem-estar Geral',
    value: 72,
    trend: 'up',
    color: '#10B981',
    description: 'Satisfação geral com a vida'
  }
];

export const chartData: ChartData[] = [
  { name: 'Jan', depression: 70, stress: 65, anxiety: 50 },
  { name: 'Fev', depression: 68, stress: 70, anxiety: 48 },
  { name: 'Mar', depression: 72, stress: 75, anxiety: 52 },
  { name: 'Abr', depression: 65, stress: 78, anxiety: 45 },
  { name: 'Mai', depression: 60, stress: 82, anxiety: 42 },
  { name: 'Jun', depression: 65, stress: 78, anxiety: 45 }
];

export const wellnessContent: WellnessContent[] = [
  {
    id: '1',
    title: 'Treinamento: Liberdade e Agilidade Emocional',
    description: 'Desenvolva habilidades para gerenciar suas emoções de forma saudável e produtiva.',
    type: 'training',
    duration: '45 min',
    image: 'https://images.pexels.com/photos/1153213/pexels-photo-1153213.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Desenvolvimento Emocional'
  },
  {
    id: '2',
    title: 'Técnicas de Respiração para Redução do Estresse',
    description: 'Aprenda exercícios simples de respiração para diminuir o estresse no trabalho.',
    type: 'exercise',
    duration: '10 min',
    image: 'https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Relaxamento'
  },
  {
    id: '3',
    title: 'Mindfulness no Ambiente de Trabalho',
    description: 'Pratique a atenção plena para melhorar sua concentração e bem-estar.',
    type: 'article',
    duration: '8 min',
    image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Mindfulness'
  },
  {
    id: '4',
    title: 'Gestão de Tempo e Produtividade Saudável',
    description: 'Equilibre suas responsabilidades profissionais com seu bem-estar pessoal.',
    type: 'video',
    duration: '25 min',
    image: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Produtividade'
  }
];