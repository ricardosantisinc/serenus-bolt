import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { mentalHealthMetrics } from '../data/mockData';

export const MetricsGrid: React.FC = () => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {mentalHealthMetrics.map((metric) => (
        <div key={metric.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{metric.name}</h3>
            {getTrendIcon(metric.trend)}
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold" style={{ color: metric.color }}>
                {metric.value}%
              </span>
              <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                {metric.trend === 'up' ? '+5%' : metric.trend === 'down' ? '-3%' : '0%'}
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${metric.value}%`, 
                backgroundColor: metric.color 
              }}
            />
          </div>

          <p className="text-sm text-gray-600">{metric.description}</p>
        </div>
      ))}
    </div>
  );
};