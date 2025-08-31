import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, Menu, Wifi, WifiOff, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/lib/notifications';
import { useTheme } from '@/contexts/ThemeContext';
import EnsoSnakeLogo from '@/components/EnsoSnakeLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { cn } from '@/lib/utils';
import { useUserPhoto } from '@/hooks/use-user-photo';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const { photoUrl } = useUserPhoto();

  // Log removido para reduzir spam

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header 
      className="ds-header w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado esquerdo - Logo mobile e título */}
          <div className="flex items-center space-x-3">
            {/* Botão de menu mobile - VISÍVEL APENAS EM MOBILE */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuClick}
                className="h-10 w-10 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                title="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="lg:hidden">
              <EnsoSnakeLogo size={36} showText={false} variant="animated" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Sistema de Qualidade
              </h1>
            </div>
          </div>
          
          {/* Centro - Título mobile */}
          <div className="lg:hidden absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              ENSO
            </h1>
          </div>
          
          {/* Lado direito - Ações */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemeToggle />
            </motion.div>
            
            {/* Central de Notificações */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <NotificationCenter 
                isOpen={showNotifications}
                onToggle={() => setShowNotifications(!showNotifications)}
              />
            </motion.div>
            
            {/* Divisor */}
            <div className="hidden sm:block h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            
            {/* Perfil do usuário */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="w-8 h-8 sm:w-9 sm:h-9 ring-2 ring-blue-200 dark:ring-blue-700 shadow-lg">
                  <AvatarImage 
                    src={photoUrl} 
                    alt={user?.name || 'Usuário'} 
                    className="w-full h-full object-cover"
                    key={photoUrl}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
                    {user?.name ? (user.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U') : 'U'}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              {/* Info do usuário - Desktop */}
              <div className="hidden md:flex flex-col">
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  {user?.role === 'admin' ? 'Administrador' : 
                   user?.role === 'inspector' ? 'Inspetor' :
                   user?.role === 'supervisor' ? 'Supervisor' : 'Usuário'}
                </p>
              </div>
              
              {/* Info do usuário - Mobile (apenas primeiro nome) */}
              <div className="md:hidden flex flex-col">
                <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight">
                  {user?.name ? user.name.split(' ')[0] : 'Usuário'}
                </p>
              </div>
              
              {/* Botão de logout */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200 rounded-lg"
                  title="Sair do sistema"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:ml-2 sm:inline text-sm font-medium">Sair</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
