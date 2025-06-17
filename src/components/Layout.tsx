
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Building2, LogOut, User, Shield, Eye, UserCheck, RotateCcw } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, switchProfile, isAdminSwitched } = useAuth();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'user': return User;
      case 'viewer': return Eye;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-red-600 to-pink-600';
      case 'user': return 'from-blue-600 to-green-600';
      case 'viewer': return 'from-purple-600 to-indigo-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'user': return 'Usuário';
      case 'viewer': return 'Visualizador';
      default: return 'Usuário';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema de Medidores</h1>
                <p className="text-sm text-gray-600">
                  {getRoleLabel(user?.role || 'user')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isAdminSwitched && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => switchProfile('admin')}
                  className="hidden sm:flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Voltar Admin</span>
                </Button>
              )}

              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">
                  {getRoleLabel(user?.role || 'user')}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-2 hover:bg-gray-100 rounded-full">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={`bg-gradient-to-r ${getRoleColor(user?.role || 'user')} text-white text-sm`}>
                        {user?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className={`bg-gradient-to-r ${getRoleColor(user?.role || 'user')} text-white text-xs`}>
                        {user?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {getRoleLabel(user?.role || 'user')}
                      </p>
                      {isAdminSwitched && (
                        <p className="text-xs text-orange-600 font-medium">
                          Admin simulando
                        </p>
                      )}
                    </div>
                  </DropdownMenuItem>
                  
                  {(user?.role === 'admin' || isAdminSwitched) && (
                    <>
                      <DropdownMenuSeparator />
                      {isAdminSwitched && (
                        <DropdownMenuItem 
                          onClick={() => switchProfile('admin')}
                          className="flex items-center space-x-2 text-red-600"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Voltar para Admin</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => switchProfile('admin')}
                        className="flex items-center space-x-2"
                        disabled={user?.role === 'admin' && !isAdminSwitched}
                      >
                        <Shield className="w-4 h-4 text-red-600" />
                        <span>Admin</span>
                        {user?.role === 'admin' && !isAdminSwitched && <UserCheck className="w-4 h-4 ml-auto text-green-600" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => switchProfile('user')}
                        className="flex items-center space-x-2"
                        disabled={user?.role === 'user' && !isAdminSwitched}
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        <span>Usuário</span>
                        {user?.role === 'user' && <UserCheck className="w-4 h-4 ml-auto text-green-600" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => switchProfile('viewer')}
                        className="flex items-center space-x-2"
                        disabled={user?.role === 'viewer' && !isAdminSwitched}
                      >
                        <Eye className="w-4 h-4 text-purple-600" />
                        <span>Visualizador</span>
                        {user?.role === 'viewer' && <UserCheck className="w-4 h-4 ml-auto text-green-600" />}
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
