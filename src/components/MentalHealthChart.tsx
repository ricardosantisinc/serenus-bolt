import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { chartData } from '../data/mockData';

export const MentalHealthChart: React.FC = () => {
  // Usando useMemo para evitar recriação do array a cada renderização
  const memoizedChartData = useMemo(() => chartData, []);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Estado Mental</h3>
        <p className="text-sm text-gray-600">Acompanhe sua evolução ao longo do tempo</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={memoizedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="depression" 
              name="Depressão"
              fill="#8B5CF6" 
              radius={[2, 2, 0, 0]}
              isAnimationActive={false} // Desativar animação para evitar re-renderizações
            />
            <Bar 
              dataKey="stress" 
              name="Estresse"
              fill="#EF4444" 
              radius={[2, 2, 0, 0]}
              isAnimationActive={false} // Desativar animação para evitar re-renderizações
            />
            <Bar 
              dataKey="anxiety" 
              name="Ansiedade"
              fill="#F59E0B" 
              radius={[2, 2, 0, 0]}
              isAnimationActive={false} // Desativar animação para evitar re-renderizações
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};