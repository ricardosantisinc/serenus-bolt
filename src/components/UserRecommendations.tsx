import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Brain, 
  Utensils, 
  Heart, 
  Activity,
  CheckCircle
} from 'lucide-react';
import { CompanyRecommendation } from '../types';

interface UserRecommendationsProps {
  recommendations: CompanyRecommendation[];
}

export const UserRecommendations: React.FC<UserRecommendationsProps> = ({
  recommendations
}) => {
  const [expanded, setExpanded] = useState(true);

  const getRecommendationTypeIcon = (type: CompanyRecommendation['recommendationType']) => {
    switch (type) {
      case 'mental_health':
        return <Brain className="h-5 w-5 text-purple-600" />;
      case 'nutrition':
        return <Utensils className="h-5 w-5 text-green-600" />;
      case 'integrated':
        return <Heart className="h-5 w-5 text-red-600" />;
      case 'universal':
        return <Activity className="h-5 w-5 text-blue-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-teal-600" />;
    }
  };

  const getRecommendationTypeColor = (type: CompanyRecommendation['recommendationType']) => {
    switch (type) {
      case 'mental_health':
        return 'bg-purple-50 border-purple-200';
      case 'nutrition':
        return 'bg-green-50 border-green-200';
      case 'integrated':
        return 'bg-red-50 border-red-200';
      case 'universal':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-teal-50 border-teal-200';
    }
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="bg-white rounded-xl shadow-sm mb-8">
      {/* Header */}
      <div 
        className="p-6 border-b border-gray-200 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recomendações para Você</h2>
            <p className="text-sm text-gray-600">Práticas personalizadas para seu bem-estar</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-6 space-y-4">
          {sortedRecommendations.length > 0 ? (
            <div className="space-y-4">
              {sortedRecommendations.map((recommendation) => (
                <div 
                  key={recommendation.id} 
                  className={`border rounded-lg overflow-hidden ${getRecommendationTypeColor(recommendation.recommendationType)}`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {getRecommendationTypeIcon(recommendation.recommendationType)}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{recommendation.title}</h3>
                        <p className="text-gray-700">{recommendation.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma recomendação personalizada disponível.</p>
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm text-gray-600 border-t border-gray-200 pt-4 mt-6">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p>Recomendações personalizadas pela sua empresa para melhorar seu bem-estar.</p>
          </div>
        </div>
      )}
    </div>
  );
};