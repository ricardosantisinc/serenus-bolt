import React from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

function App() {
  const { 
    user, 
    isLoading, 
    login, 
    logout, 
    updateProfile,
    isAuthenticated, 
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
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    getAllUsers
  } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginForm onLogin={login} isLoading={isLoading} />;
  }

  return (
    <Dashboard 
      user={user} 
      onLogout={logout}
      updateProfile={updateProfile}
      hasPermission={hasPermission}
      getRoleDisplayName={getRoleDisplayName}
      getCompanies={getCompanies}
      getCompanyById={getCompanyById}
      registerCompany={registerCompany}
      deleteCompany={deleteCompany}
      registerUser={registerUser}
      saveCheckupResult={saveCheckupResult}
      getSubscriptionPlans={getSubscriptionPlans}
      addSubscriptionPlan={addSubscriptionPlan}
      updateSubscriptionPlan={updateSubscriptionPlan}
      togglePlanStatus={togglePlanStatus}
      getCompanyCheckupSettings={getCompanyCheckupSettings}
      saveCompanyCheckupSettings={saveCompanyCheckupSettings}
      getCompanyRecommendations={getCompanyRecommendations}
      saveCompanyRecommendation={saveCompanyRecommendation}
      deleteCompanyRecommendation={deleteCompanyRecommendation}
      createUser={createUser}
      updateUser={updateUser}
      toggleUserStatus={toggleUserStatus}
      deleteUser={deleteUser}
      getAllUsers={getAllUsers}
    />
  );
}

export default App;