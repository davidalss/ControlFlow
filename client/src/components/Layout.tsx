import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoWithText } from "@/components/Logo";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Settings, UserCheck } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    ),
  },
  {
    title: "SPC Control",
    href: "/spc-control",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Supplier Management",
    href: "/supplier-management",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "Users",
    href: "/users",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    title: "Products",
    href: "/products",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: "Inspections",
    href: "/inspections",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Reports",
    href: "/reports",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Settings",
    href: "/settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
             {/* Sidebar */}
               <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="fixed inset-y-0 left-0 z-50 w-64"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderRight: '1px solid var(--border-color)',
            backdropFilter: 'blur(10px)',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
                 {/* Logo */}
         <div className="flex items-center justify-center h-16 px-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
           <LogoWithText size="md" animated={false} />
         </div>

                 {/* Navigation */}
         <nav className="flex-1 px-4 py-6 space-y-2">
           {navigationItems.map((item, index) => {
             const isActive = location.pathname === item.href;
             return (
               <motion.div
                 key={item.href}
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
               >
                                    <Link
                     to={item.href}
                     className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
                       isActive
                         ? 'shadow-md'
                         : 'hover:bg-tertiary'
                     }`}
                     style={{
                       color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                       backgroundColor: isActive ? 'var(--accent-color)' : 'transparent',
                       border: '1px solid transparent',
                       borderRadius: 'var(--radius-md)',
                       fontWeight: isActive ? '600' : '400'
                     }}
                   >
                   {item.icon}
                   <span>{item.title}</span>
                 </Link>
               </motion.div>
             );
           })}
         </nav>

                 {/* Footer */}
         <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
           <div className="text-center">
             <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
               QualiHub v1.0
             </p>
           </div>
         </div>
      </motion.div>

      {/* Main Content */}
      <div className="pl-64">
                 {/* Header */}
                   <header style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderBottom: '1px solid var(--border-color)',
            backdropFilter: 'blur(10px)',
            boxShadow: 'var(--shadow-sm)'
          }}>
           <div className="flex items-center justify-between h-16 px-6">
             <div className="flex items-center space-x-4">
                                <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setSidebarOpen(!sidebarOpen)}
                   className="lg:hidden"
                   style={{ color: 'var(--text-secondary)' }}
                 >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                 </svg>
               </Button>
                                <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                   {navigationItems.find(item => item.href === location.pathname)?.title || 'Dashboard'}
                 </h1>
             </div>

             <div className="flex items-center space-x-4">
               {/* Theme Toggle */}
               <div className="flex items-center">
                 <ThemeToggle />
               </div>

                                               {/* User Settings Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative transition-all duration-200"
                      style={{ 
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--btn-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px'
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <DropdownMenuItem onClick={goToProfile} style={{ color: 'var(--text-primary)' }}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={goToProfile} style={{ color: 'var(--text-primary)' }}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-color)' }} />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      style={{ color: 'var(--error-color)' }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                               {/* Current Time */}
                <div className="text-sm px-3 py-1 rounded-lg" style={{ 
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--btn-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}>
                 {new Date().toLocaleTimeString('pt-BR', {
                   hour: '2-digit',
                   minute: '2-digit',
                 })}
               </div>

               {/* User Avatar */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 cursor-pointer hover:scale-105 transition-transform duration-200"
                        style={{ borderColor: 'var(--accent-color)' }}
                        onClick={goToProfile}
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200"
                        style={{ 
                          backgroundColor: 'var(--accent-color)',
                          color: 'var(--bg-primary)',
                          border: '2px solid var(--border-color)'
                        }}
                        onClick={goToProfile}
                      >
                        <span className="text-sm font-bold">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    {/* Online Status Indicator */}
                    <div 
                      className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2"
                      style={{ 
                        backgroundColor: 'var(--success-color)',
                        borderColor: 'var(--bg-secondary)'
                      }}
                    ></div>
                  </div>

                                                     {/* User Info */}
                  <div className="hidden md:block">
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {user?.name || 'Usuário'}
                      </p>
                      <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                        {user?.role || 'Usuário'}
                      </p>
                    </div>
                  </div>
               </div>
             </div>
           </div>
         </header>

        {/* Page Content */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
