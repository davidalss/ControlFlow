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
import AnimatedLogo from '@/components/AnimatedLogo';
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

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 dark:bg-gray-800 dark:border-gray-700 header-responsive">
      <div className="flex items-center justify-between header-content">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="lg:hidden">
            <AnimatedLogo size="sm" showText={false} />
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
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={user?.photo} 
                alt={user?.name || 'Usuário'} 
              />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                {user?.name ? (user.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U') : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="hidden md:block user-info-desktop">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role || 'Perfil'}
              </p>
            </div>
            
            <div className="md:hidden user-info-mobile">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {user?.name ? user.name.split(' ')[0] : 'Usuário'}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
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
