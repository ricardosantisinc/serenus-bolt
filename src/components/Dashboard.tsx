import React, { useState, useEffect } from 'react';
import { User, Company, CheckupResult, CompanyCheckupSettings, UserProfileUpdate, IasResponse, CombinedAssessmentResult, CompanyRecommendation } from '../types';
import { Header } from './Header';
import { MetricsGrid } from './MetricsGrid';
import { ManagerDashboard } from './ManagerDashboard';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { Dass21Checkup } from './Dass21Checkup';
import { IasCheckup } from './IasCheckup';
import { CombinedResults } from './CombinedResults';
import { UserProfile } from './UserProfile';
import { getCheckupFrequencyMessage } from '../utils/dass21Calculator';
import { calculateCombinedAssessment } from '../utils/combinedAssessmentCalculator';
import { UserRecommendations } from './UserRecommendations';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  hasPermission: (permission: string) => boolean;
  getRoleDisplayName: (role: User['role']) => string;
  getCompanies: () => Company[];
  getCompanyById: (companyId: string) => Company | undefined;
  registerCompany: (companyData: {
    name: string;
    domain: string;
    contactPerson: string;
    corporateEmail: string;
    landlinePhone?: string;
    mobilePhone: string;
    plan: Company['plan'];
    maxUsers: number;
    logoData?: string;
  }) => Promise<{ success: boolean; message: string; company?: Company }>;
  deleteCompany: (companyId: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (userData: {
    name: string;
    email: string;
    password: string;
    role: User['role'];
    department?: string;
    companyId: string;
  }) => Promise<{ success: boolean; message: string; user?: User }>;
  saveCheckupResult: (checkupResult: CheckupResult) => Promise<boolean>;
  getSubscriptionPlans: () => any[];
  addSubscriptionPlan: (planData: any) => Promise<any>;
  updateSubscriptionPlan: (planId: string, planData: any) => Promise<any>;
  togglePlanStatus: (planId: string) => Promise<any>;
  getCompanyCheckupSettings: (companyId: string) => Promise<CompanyCheckupSettings | null>;
  saveCompanyCheckupSettings: (settings: Omit<CompanyCheckupSettings, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; message: string }>;
  getCompanyRecommendations: (companyId: string) => Promise<CompanyRecommendation[]>;
  saveCompanyRecommendation: (recommendation: Omit<CompanyRecommendation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<{ success: boolean; message: string; recommendation?: CompanyRecommendation }>;
  deleteCompanyRecommendation: (id: string, companyId: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (profileData: UserProfileUpdate) => Promise<{ success: boolean; message: string }>;
  // Funções de gerenciamento de usuários
  createUser: (userData: any) => Promise<any>;
  updateUser: (userId: string, userData: any) => Promise<any>;
  toggleUserStatus: (userId: string) => Promise<any>;
  deleteUser: (userId: string) => Promise<any>;
  getAllUsers: () => User[];
}

type CheckupFlow = 'dass21' | 'ias' | 'results' | null;

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLogout, 
  hasPermission, 
  getRoleDisplayName,
  getCompanies,
  getCompanyById,
  registerCompany,
  deleteCompany,
  registerUser,
  saveCheckupResult,
  getSubscriptionPlans,
  addSubscriptionPlan,
  updateSubscriptionPlan,
  togglePlanStatus,
  getCompanyCheckupSettings,
  saveCompanyCheckupSettings,
  getCompanyRecommendations,
  saveCompanyRecommendation,
  deleteCompanyRecommendation,
  updateProfile,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAllUsers
}) => {
  const [checkupFlow, setCheckupFlow] = useState<CheckupFlow>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [companyRecommendations, setCompanyRecommendations] = useState<CompanyRecommendation[]>([]);
  
  // Estados para armazenar resultados intermediários
  const [dass21Result, setDass21Result] = useState<CheckupResult | null>(null);
  const [iasResult, setIasResult] = useState<{
    responses: IasResponse[];
    totalScore: number;
    classification: string;
    recommendations: string[];
  } | null>(null);
  const [combinedResult, setCombinedResult] = useState<CombinedAssessmentResult | null>(null);
  // Estado para controlar se o resultado já foi salvo
  const [resultSaved, setResultSaved] = useState(false);
  
  const daysSinceLastCheckup = user.lastCheckup 
    ? Math.floor((Date.now() - user.lastCheckup.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const daysUntilNextCheckup = user.nextCheckup
    ? Math.ceil((user.nextCheckup.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isCheckupOverdue = daysUntilNextCheckup !== null && daysUntilNextCheckup < 0;
  const isCheckupDueSoon = daysUntilNextCheckup !== null && daysUntilNextCheckup <= 7 && daysUntilNextCheckup >= 0;

  // Carregar recomendações da empresa quando o componente montar
  useEffect(() => {
    const loadCompanyRecommendations = async () => {
      if (user.companyId) {
        try {
          const recommendations = await getCompanyRecommendations(user.companyId);
          setCompanyRecommendations(recommendations);
        } catch (error) {
          console.error('Erro ao carregar recomendações:', error);
        }
      }
    };
    
    loadCompanyRecommendations();
  }, [user.companyId, getCompanyRecommendations]);

  // Efeito para salvar o resultado quando combinedResult é definido
  useEffect(() => {
    const saveResult = async () => {
      if (combinedResult && dass21Result && iasResult && !resultSaved) {
        try {
          // Marcar como salvo para evitar múltiplas tentativas
          setResultSaved(true);
          
          // Criar resultado final combinado para salvar no banco
          const finalCheckupResult: CheckupResult = {
            ...dass21Result,
            // Adicionar dados do IAS
            iasResponses: iasResult.responses,
            iasTotalScore: iasResult.totalScore,
            iasClassification: iasResult.classification as 'alto_risco' | 'desbalanceada' | 'razoavel' | 'saudavel',
            // Adicionar dados da avaliação combinada
            combinedRecommendedPaths: combinedResult.recommendedPaths,
            combinedPsychologistReferralNeeded: combinedResult.psychologistReferralNeeded,
            combinedJustification: combinedResult.justification,
            combinedCriticalLevel: combinedResult.criticalLevel,
            combinedRecommendations: combinedResult.recommendations
          };

          // Salvar resultado combinado no banco de dados
          const saved = await saveCheckupResult(finalCheckupResult);
          if (saved) {
            console.log('✅ Resultado combinado salvo no banco de dados');
          } else {
            console.error('❌ Erro ao salvar resultado combinado');
          }
        } catch (error) {
          console.error('❌ Erro ao processar ou salvar resultado', error);
        }
      }
    };
    
    saveResult();
  }, [combinedResult, dass21Result, iasResult, resultSaved, saveCheckupResult]);

  const handleStartCheckup = () => {
    setCheckupFlow('dass21');
    setDass21Result(null);
    setIasResult(null);
    setCombinedResult(null);
    setResultSaved(false);
  };

  const handleDass21Complete = async (result: CheckupResult) => {
    console.log('✅ DASS-21 concluído:', result);
    setDass21Result(result);
    setCheckupFlow('ias');
  };

  const handleIasComplete = async (result: {
    responses: IasResponse[];
    totalScore: number;
    classification: string;
    recommendations: string[];
  }) => {
    console.log('✅ IAS concluído:', result);
    setIasResult(result);
    
    if (dass21Result) {
      // Calcular resultado combinado
      const combined = calculateCombinedAssessment(
        dass21Result.scores,
        dass21Result.classifications,
        {
          totalScore: result.totalScore,
          classification: result.classification as 'alto_risco' | 'desbalanceada' | 'razoavel' | 'saudavel',
          recommendations: result.recommendations
        }
      );

      // Primeiro definir o combinedResult e mudar para a tela de resultados
      // antes de tentar salvar no banco de dados
      setCombinedResult(combined);
      setCheckupFlow('results');
    }
  };

  const handleFinishCheckup = () => {
    setCheckupFlow(null);
    setDass21Result(null);
    setIasResult(null);
    setCombinedResult(null);
    setResultSaved(false);
    // A página será recarregada automaticamente através do useAuth quando o checkup for salvo
  };

  const handleCloseCheckup = () => {
    setCheckupFlow(null);
    setDass21Result(null);
    setIasResult(null);
    setCombinedResult(null);
    setResultSaved(false);
  };

  const getCheckupStatusMessage = () => {
    if (!user.lastCheckup) {
      return {
        type: 'info' as const,
        title: 'Bem-vindo ao Serenus!',
        message: 'Faça seu primeiro checkup de bem-estar completo. Leva menos de 10 minutos.',
        action: 'Fazer primeiro checkup'
      };
    }

    if (isCheckupOverdue) {
      const overdueDays = Math.abs(daysUntilNextCheckup!);
      return {
        type: 'urgent' as const,
        title: `Checkup atrasado há ${overdueDays} dias`,
        message: 'Seu checkup está atrasado. É importante manter o acompanhamento regular do seu bem-estar.',
        action: 'Fazer checkup agora'
      };
    }

    if (isCheckupDueSoon) {
      return {
        type: 'warning' as const,
        title: `Checkup devido em ${daysUntilNextCheckup} dias`,
        message: 'Seu próximo checkup está se aproximando. Mantenha seu acompanhamento em dia.',
        action: 'Fazer checkup'
      };
    }

    if (user.nextCheckup && user.checkupHistory && user.checkupHistory.length > 0) {
      const lastResult = user.checkupHistory[user.checkupHistory.length - 1];
      return {
        type: 'success' as const,
        title: `Último checkup: ${user.lastCheckup?.toLocaleDateString('pt-BR')}`,
        message: getCheckupFrequencyMessage(lastResult.severityLevel, user.nextCheckup),
        action: 'Novo checkup'
      };
    }

    return null;
  };

  const getCheckupStatusStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getCheckupButtonStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const renderRoleSpecificDashboard = () => {
    switch (user.role) {
      case 'super_admin':
        return (
          <SuperAdminDashboard 
            user={user} 
            hasPermission={hasPermission}
            companies={getCompanies()}
            users={getAllUsers()}
            onRegisterCompany={registerCompany}
            onDeleteCompany={deleteCompany}
            getSubscriptionPlans={getSubscriptionPlans}
            onAddSubscriptionPlan={addSubscriptionPlan}
            onUpdateSubscriptionPlan={updateSubscriptionPlan}
            onTogglePlanStatus={togglePlanStatus}
            createUser={createUser}
            updateUser={updateUser}
            toggleUserStatus={toggleUserStatus}
            deleteUser={deleteUser}
          />
        );
      case 'gerente':
        return (
          <ManagerDashboard 
            user={user} 
            hasPermission={hasPermission}
            onRegisterUser={registerUser}
            getCompanyCheckupSettings={getCompanyCheckupSettings}
            onSaveCompanyCheckupSettings={saveCompanyCheckupSettings}
            getCompanyRecommendations={getCompanyRecommendations}
            onSaveCompanyRecommendation={saveCompanyRecommendation}
            onDeleteCompanyRecommendation={deleteCompanyRecommendation}
            createUser={createUser}
            updateUser={updateUser}
            toggleUserStatus={toggleUserStatus}
            deleteUser={deleteUser}
            getAllUsers={getAllUsers}
          />
        );
      default:
        return (
          <>
            {/* Employee Dashboard */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Olá, {user.name.split(' ')[0]}!
              </h1>
              <p className="text-gray-600">Aqui está seu relatório de bem-estar</p>
              
              {/* Checkup Status */}
              {(() => {
                const statusInfo = getCheckupStatusMessage();
                if (!statusInfo) return null;

                return (
                  <div className={`mt-4 border rounded-lg p-4 ${getCheckupStatusStyle(statusInfo.type)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${
                          statusInfo.type === 'urgent' ? 'text-red-800' :
                          statusInfo.type === 'warning' ? 'text-amber-800' :
                          statusInfo.type === 'success' ? 'text-green-800' :
                          'text-blue-800'
                        }`}>
                          {statusInfo.title}
                        </p>
                        <p className={`text-sm mt-1 ${
                          statusInfo.type === 'urgent' ? 'text-red-700' :
                          statusInfo.type === 'warning' ? 'text-amber-700' :
                          statusInfo.type === 'success' ? 'text-green-700' :
                          'text-blue-700'
                        }`}>
                          {statusInfo.message}
                        </p>
                      </div>
                      <button 
                        onClick={handleStartCheckup}
                        className={`text-white px-4 py-2 rounded-lg font-medium transition-colors ${getCheckupButtonStyle(statusInfo.type)}`}
                      >
                        {statusInfo.action}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Company Recommendations */}
            {companyRecommendations.length > 0 && (
              <UserRecommendations recommendations={companyRecommendations} />
            )}

            <MetricsGrid />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onLogout={onLogout} 
        onOpenProfile={() => setShowProfile(true)}
        hasPermission={hasPermission}
        getRoleDisplayName={getRoleDisplayName}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderRoleSpecificDashboard()}
      </main>

      {/* Checkup Flow */}
      {checkupFlow === 'dass21' && user.companyId && (
        <Dass21Checkup
          userId={user.id}
          companyId={user.companyId}
          onComplete={handleDass21Complete}
          onClose={handleCloseCheckup}
          getCompanyCheckupSettings={getCompanyCheckupSettings}
        />
      )}

      {checkupFlow === 'ias' && user.companyId && (
        <IasCheckup
          userId={user.id}
          companyId={user.companyId}
          onComplete={handleIasComplete}
          onClose={handleCloseCheckup}
        />
      )}

      {checkupFlow === 'results' && combinedResult && (
        <CombinedResults
          result={combinedResult}
          onFinish={handleFinishCheckup}
          onClose={handleCloseCheckup}
        />
      )}

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile
          user={user}
          onUpdateProfile={updateProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};