import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, Menu, Wifi, WifiOff, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications.tsx';
import { useTheme } from '@/contexts/ThemeContext';
import EnsoSnakeLogo from '@/components/EnsoSnakeLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { cn } from '@/lib/utils';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Função para obter a URL da foto do usuário
  const getUserPhotoUrl = () => {
    if (!user?.id) return '';
    
    // Se já tem uma URL completa, retorna ela
    if (user.photo && (user.photo.startsWith('http') || user.photo.startsWith('/uploads'))) {
      return user.photo;
    }
    
    // Se não tem foto, retorna string vazia para usar o fallback
    return '';
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-stone-200/50 px-6 py-4 dark:bg-stone-900/90 dark:border-stone-700/50 header-responsive shadow-sm">
      <div className="flex items-center justify-between header-content">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden text-stone-600 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="lg:hidden">
            <EnsoSnakeLogo size={32} showText={false} variant="animated" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4 header-actions">
          <ThemeToggle />
          
          {/* Central de Notificações */}
          <NotificationCenter 
            isOpen={showNotifications}
            onToggle={() => setShowNotifications(!showNotifications)}
          />
          
          {/* Avatar do Usuário */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8 ring-2 ring-stone-200 dark:ring-stone-700 rounded-full overflow-hidden">
              <AvatarImage 
                src={getUserPhotoUrl()} 
                alt={user?.name || 'Usuário'} 
                className="w-full h-full object-cover rounded-full"
              />
              <AvatarFallback className="bg-gradient-to-br from-stone-600 to-stone-700 text-stone-100 rounded-full">
                {user?.name ? (user.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U') : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="hidden md:block user-info-desktop">
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {user?.role || 'Perfil'}
              </p>
            </div>
            
            <div className="md:hidden user-info-mobile">
              <p className="text-xs font-medium text-stone-900 dark:text-stone-100">
                {user?.name ? user.name.split(' ')[0] : 'Usuário'}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
