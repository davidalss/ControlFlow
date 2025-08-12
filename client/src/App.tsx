import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import Layout from '@/components/Layout';

// Pages
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import SpcControlPage from '@/pages/spc-control';
import SupplierManagementPage from '@/pages/supplier-management';
import UsersPage from '@/pages/users';
import ProductsPage from '@/pages/products';
import InspectionsPage from '@/pages/inspections';
import ReportsPage from '@/pages/reports';
import SettingsPage from '@/pages/settings';
import ProfilePage from '@/pages/profile';

// Create a client
const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

// App Routes
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/spc-control"
        element={
          <ProtectedRoute>
            <SpcControlPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier-management"
        element={
          <ProtectedRoute>
            <SupplierManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspections"
        element={
          <ProtectedRoute>
            <InspectionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    document.title = 'QualiHub - Plataforma Completa para Gestão da Qualidade';
    
    // Add meta theme-color for mobile browsers
    const metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    metaThemeColor.content = '#FFFFFF';
    document.head.appendChild(metaThemeColor);
    
    // Set initial theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme: 'light' | 'dark' = 'light';
    if (savedTheme) {
      initialTheme = savedTheme;
    } else if (prefersDark) {
      initialTheme = 'dark';
    }
    
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.documentElement.style.colorScheme = initialTheme;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;