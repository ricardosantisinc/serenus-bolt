import React from 'react';
import { Calendar, Users, FileText, Clock } from 'lucide-react';
import { User } from '../types';

interface PsychologistDashboardProps {
  user: User;
  hasPermission: (permission: string) => boolean;
}

export const PsychologistDashboard: React.FC<PsychologistDashboardProps> = ({ user, hasPermission }) => {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Painel Clínico
        </h1>
        <p className="text-gray-600">Acompanhamento e suporte psicológico</p>
      </div>

      {/* Clinical Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pacientes</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-3xl font-bold text-gray-900">32</span>
          <p className="text-sm text-gray-600 mt-2">Em acompanhamento</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Consultas</h3>
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-3xl font-bold text-gray-900">8</span>
          <p className="text-sm text-gray-600 mt-2">Hoje</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Relatórios</h3>
            <FileText className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-3xl font-bold text-gray-900">5</span>
          <p className="text-sm text-gray-600 mt-2">Pendentes</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Próxima</h3>
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-3xl font-bold text-gray-900">14:30</span>
          <p className="text-sm text-gray-600 mt-2">Maria Silva</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Agenda de Hoje</h3>
        <div className="space-y-4">
          {[
            { time: '09:00', patient: 'João Santos', type: 'Consulta inicial', status: 'completed' },
            { time: '10:30', patient: 'Maria Silva', type: 'Acompanhamento', status: 'completed' },
            { time: '14:30', patient: 'Pedro Costa', type: 'Terapia cognitiva', status: 'upcoming' },
            { time: '16:00', patient: 'Ana Oliveira', type: 'Avaliação', status: 'upcoming' }
          ].map((appointment, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{appointment.time}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{appointment.patient}</h4>
                  <p className="text-sm text-gray-600">{appointment.type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {appointment.status === 'completed' ? 'Concluída' : 'Agendada'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Priority List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Pacientes Prioritários</h3>
        <div className="space-y-4">
          {[
            { name: 'Carlos Silva', department: 'TI', score: 45, lastSession: '3 dias', priority: 'high' },
            { name: 'Ana Santos', department: 'Vendas', score: 52, lastSession: '1 semana', priority: 'medium' },
            { name: 'Roberto Lima', department: 'Marketing', score: 38, lastSession: '5 dias', priority: 'high' }
          ].map((patient, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">{patient.name}</h4>
                  <p className="text-sm text-gray-600">{patient.department} • Última sessão: {patient.lastSession}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-gray-900">{patient.score}%</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  patient.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {patient.priority === 'high' ? 'Alta' : 'Média'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};