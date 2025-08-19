import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/hooks/use-auth';

import { NotificationsProvider } from '@/hooks/use-notifications.tsx';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import DashboardLayout from '@/components/DashboardLayout';

// Páginas públicas
import SalesPage from '@/pages/sales';
import LoginPage from '@/pages/login';
import ResetPasswordPage from '@/pages/reset-password';
import NotFoundPage from '@/pages/not-found';

// Páginas protegidas
import DashboardNew from '@/pages/dashboard-new';
import InspectionPlansPage from '@/pages/inspection-plans';
import TrainingPage from '@/pages/training';
import InspectionsPage from '@/pages/inspections';
import ProductsPage from '@/pages/products';
import UsersPage from '@/pages/users';
import ReportsPage from '@/pages/reports';
import IndicatorsPage from '@/pages/indicators';
import SpcControlPage from '@/pages/spc-control';
import SupplierManagementPage from '@/pages/supplier-management';
import ApprovalQueuePage from '@/pages/approval-queue';
import SettingsPage from '@/pages/settings';
import ProfilePage from '@/pages/profile';
import SolicitationPage from '@/pages/solicitation';
import LogsPage from '@/pages/logs';
import BlocksPage from '@/pages/blocks';
import TrainingCoursesPage from '@/pages/training/courses';
import TrainingIndexPage from '@/pages/training/index';
import TrainingAdminPage from '@/pages/training/admin';
import TrainingPlayerPage from '@/pages/training/player';
import TrainingDownloadsPage from '@/pages/training/downloads';
import QualityEngineeringPage from '@/pages/quality-engineering';
import SGQPage from '@/pages/sgq';

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Rotas protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardNew />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardNew />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection-plans"
        element={
          <ProtectedRoute>
            <Layout>
              <InspectionPlansPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training"
        element={
          <ProtectedRoute>
            <Layout>
              <TrainingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspections"
        element={
          <ProtectedRoute>
            <Layout>
              <InspectionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Layout>
              <ProductsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <UsersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/indicators"
        element={
          <ProtectedRoute>
            <Layout>
              <IndicatorsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/spc-control"
        element={
          <ProtectedRoute>
            <Layout>
              <SpcControlPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier-management"
        element={
          <ProtectedRoute>
            <Layout>
              <SupplierManagementPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/approval-queue"
        element={
          <ProtectedRoute>
            <Layout>
              <ApprovalQueuePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/solicitation"
        element={
          <ProtectedRoute>
            <Layout>
              <SolicitationPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/logs"
        element={
          <ProtectedRoute>
            <Layout>
              <LogsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/blocks"
        element={
          <ProtectedRoute>
            <Layout>
              <BlocksPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training/index"
        element={
          <ProtectedRoute>
            <Layout>
              <TrainingIndexPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training/courses"
        element={
          <ProtectedRoute>
            <Layout>
              <TrainingCoursesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training/admin"
        element={
          <ProtectedRoute>
            <Layout>
              <TrainingAdminPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/training/player"
        element={
          <ProtectedRoute>
            <Layout>
              <TrainingPlayerPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training/downloads"
        element={
          <ProtectedRoute>
            <Layout>
              <TrainingDownloadsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quality-engineering"
        element={
          <ProtectedRoute>
            <Layout>
              <QualityEngineeringPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sgq"
        element={
          <ProtectedRoute>
            <Layout>
              <SGQPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Rota raiz - Página de vendas */}
      <Route 
        path="/" 
        element={<SalesPage />} 
      />
      
      {/* Rota 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <ThemeProvider>
          <QueryClientProvider client={new QueryClient()}>
            <Router>
              <div className="App">
                <AppRoutes />
              </div>
            </Router>
          </QueryClientProvider>
        </ThemeProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;