import React from 'react';
import { Play, BookOpen, Activity, Monitor } from 'lucide-react';
import { wellnessContent } from '../data/mockData';

export const RecommendedContent: React.FC = () => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'article':
        return <BookOpen className="h-4 w-4" />;
      case 'exercise':
        return <Activity className="h-4 w-4" />;
      case 'training':
        return <Monitor className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-700';
      case 'article':
        return 'bg-blue-100 text-blue-700';
      case 'exercise':
        return 'bg-green-100 text-green-700';
      case 'training':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Indicações para você</h3>
        <p className="text-sm text-gray-600">Conteúdo personalizado para seu bem-estar</p>
      </div>

      <div className="space-y-4">
        {wellnessContent.map((content) => (
          <div key={content.id} className="group cursor-pointer">
            <div className="flex space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <img
                src={content.image}
                alt={content.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(content.type)}`}>
                    {getTypeIcon(content.type)}
                    <span className="capitalize">{content.type}</span>
                  </span>
                  {content.duration && (
                    <span className="text-xs text-gray-500">{content.duration}</span>
                  )}
                </div>
                
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {content.title}
                </h4>
                
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {content.description}
                </p>
                
                <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {content.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          Inscrever-se
        </button>
      </div>
    </div>
  );
};