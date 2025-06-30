import { Dass21Question } from '../types';

export const dass21Questions: Dass21Question[] = [
  // SEÇÃO 1: ESTRESSE
  { id: 1, text: "Achei difícil relaxar.", category: "stress" },
  { id: 2, text: "Senti que não conseguia lidar com as coisas que tinha para fazer.", category: "stress" },
  { id: 3, text: "Achei difícil desacelerar.", category: "stress" },
  { id: 4, text: "Senti que estava no limite.", category: "stress" },
  { id: 5, text: "Fiquei irritado com situações do dia a dia.", category: "stress" },
  { id: 6, text: "Senti que estava muito impaciente.", category: "stress" },
  { id: 7, text: "Senti que estava prestes a perder o controle emocional.", category: "stress" },

  // SEÇÃO 2: ANSIEDADE
  { id: 8, text: "Senti boca seca.", category: "anxiety" },
  { id: 9, text: "Tive dificuldade em respirar (por exemplo, sentia que não conseguia puxar ar suficiente, sem estar fazendo esforço físico).", category: "anxiety" },
  { id: 10, text: "Senti tremores nas mãos.", category: "anxiety" },
  { id: 11, text: "Fiquei muito preocupado com coisas sem motivo aparente.", category: "anxiety" },
  { id: 12, text: "Senti tensão muscular ou inquietação.", category: "anxiety" },
  { id: 13, text: "Senti vertigem ou tontura sem razão aparente.", category: "anxiety" },
  { id: 14, text: "Tive palpitações ou batimentos cardíacos acelerados sem estar me exercitando.", category: "anxiety" },

  // SEÇÃO 3: DEPRESSÃO
  { id: 15, text: "Não consegui sentir prazer em atividades que normalmente gosto.", category: "depression" },
  { id: 16, text: "Achei que tudo era muito difícil e cansativo.", category: "depression" },
  { id: 17, text: "Senti-me sem energia e sem disposição.", category: "depression" },
  { id: 18, text: "Senti-me desmotivado, sem propósito.", category: "depression" },
  { id: 19, text: "Senti-me deprimido e triste sem motivo aparente.", category: "depression" },
  { id: 20, text: "Achei que não valia a pena continuar vivendo.", category: "depression" },
  { id: 21, text: "Senti que estava completamente desanimado.", category: "depression" }
];

export const responseOptions = [
  { value: 0, label: "Não se aplicou a mim de forma alguma" },
  { value: 1, label: "Aplicou-se a mim em algum grau, ou por pouco tempo" },
  { value: 2, label: "Aplicou-se a mim em um grau considerável, ou por uma boa parte do tempo" },
  { value: 3, label: "Aplicou-se a mim muito, ou na maioria do tempo" }
];