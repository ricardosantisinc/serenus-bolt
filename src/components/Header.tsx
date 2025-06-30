import React, { useState, useEffect } from 'react';
import { Bell, LogOut, Settings, Users, BarChart3, Shield, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { usePhotoUpload } from '../hooks/usePhotoUpload';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenProfile: () => void;
  hasPermission: (permission: string) => boolean;
  getRoleDisplayName: (role: User['role']) => string;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenProfile, hasPermission, getRoleDisplayName }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>(user.avatar || '');

  // Hook para gerenciamento de fotos
  const { getUserPhoto, getPhotoUrl } = usePhotoUpload({
    userId: user.id
  });

  // Carregar foto atual do usuário
  useEffect(() => {
    const loadUserPhoto = async () => {
      try {
        const photo = await getUserPhoto(user.id);
        if (photo) {
          const photoUrl = getPhotoUrl(photo.id);
          setCurrentPhotoUrl(photoUrl);
        } else {
          // Usar avatar padrão se não houver foto
          setCurrentPhotoUrl(user.avatar || 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400');
        }
      } catch (error) {
        console.error('Erro ao carregar foto do usuário:', error);
        // Fallback para avatar padrão
        setCurrentPhotoUrl(user.avatar || 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400');
      }
    };

    loadUserPhoto();
  }, [user.id, user.avatar, getUserPhoto, getPhotoUrl]);

  const getRoleBadgeColor = (role: User['role']) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      gerente: 'bg-blue-100 text-blue-800',
      colaborador: 'bg-gray-100 text-gray-800'
    };
    return colors[role];
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/serenus.png" 
              alt="Serenus Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-900">Serenus</span>
          </div>

          {/* Navigation for Admin/Manager */}
          {(hasPermission('view_all_data') || hasPermission('view_team_data')) && (
            <nav className="hidden md:flex space-x-6">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <BarChart3 className="h-4 w-4" />
                <span>Relatórios</span>
              </button>
              {hasPermission('manage_users') && (
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Users className="h-4 w-4" />
                  <span>Usuários</span>
                </button>
              )}
              {hasPermission('system_settings') && (
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Shield className="h-4 w-4" />
                  <span>Sistema</span>
                </button>
              )}
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {user.role !== 'colaborador' && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notificações</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {user.role === 'gerente' && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">5 colaboradores precisam de atenção</p>
                        <p className="text-xs text-gray-500">Há 2 horas</p>
                      </div>
                    )}
                    {user.role === 'gerente' && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Relatório semanal da equipe disponível</p>
                        <p className="text-xs text-gray-500">Há 1 hora</p>
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Novo conteúdo de bem-estar disponível</p>
                      <p className="text-xs text-gray-500">Há 3 horas</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Settings/Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onOpenProfile();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>Meu Perfil</span>
                    </button>
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Configurações</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <div className="flex items-center space-x-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                  {user.department && (
                    <span className="text-xs text-gray-500">{user.department}</span>
                  )}
                </div>
              </div>
              
              {/* Avatar atualizado com sistema de fotos */}
              <div className="relative">
                <img
                  src={currentPhotoUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-gray-200 bg-gray-100"
                  onError={(e) => {
                    // Fallback para imagem padrão em caso de erro
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
                
                {/* Indicador visual se há foto personalizada */}
                {currentPhotoUrl !== user.avatar && currentPhotoUrl.includes('photo_') && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-teal-500 border-2 border-white rounded-full"></div>
                )}
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};