import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/hooks/use-auth';

import { NotificationsProvider } from '@/hooks/use-notifications.tsx';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import DashboardLayout from '@/components/DashboardLayout';
import { UpdateNotification } from '@/components/UpdateNotification';

// Páginas públicas
import LoginPage from '@/pages/login';
import ResetPasswordPage from '@/pages/reset-password';
import NotFoundPage from '@/pages/not-found';

// Lazy loading para páginas protegidas (otimização de performance)
const DashboardNew = lazy(() => import('@/pages/dashboard-new'));
const InspectionPlansPage = lazy(() => import('@/pages/inspection-plans-simple'));
const TrainingPage = lazy(() => import('@/pages/training'));
const InspectionsPage = lazy(() => import('@/pages/inspections'));
const ProductsPage = lazy(() => import('@/pages/products'));
const UsersPage = lazy(() => import('@/pages/users'));
const ReportsPage = lazy(() => import('@/pages/reports'));
const IndicatorsPage = lazy(() => import('@/pages/indicators'));
const SpcControlPage = lazy(() => import('@/pages/spc-control'));
const SupplierManagementPage = lazy(() => import('@/pages/supplier-management'));
const ApprovalQueuePage = lazy(() => import('@/pages/approval-queue'));
const SettingsPage = lazy(() => import('@/pages/settings'));
const ProfilePage = lazy(() => import('@/pages/profile'));
const SolicitationPage = lazy(() => import('@/pages/solicitation'));
const LogsPage = lazy(() => import('@/pages/logs'));
const BlocksPage = lazy(() => import('@/pages/blocks'));
const TrainingCoursesPage = lazy(() => import('@/pages/training/courses'));
const TrainingIndexPage = lazy(() => import('@/pages/training/index'));
const TrainingAdminPage = lazy(() => import('@/pages/training/admin'));
const TrainingPlayerPage = lazy(() => import('@/pages/training/player'));
const TrainingDownloadsPage = lazy(() => import('@/pages/training/downloads'));
const QualityEngineeringPage = lazy(() => import('@/pages/quality-engineering'));
const SGQPage = lazy(() => import('@/pages/sgq'));

// Componente de loading para lazy loading
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
      <p className="text-stone-600 dark:text-stone-400">Carregando...</p>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Rota raiz - Redireciona para login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Rotas protegidas com lazy loading */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoading />}>
                <DashboardNew />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoading />}>
                <DashboardNew />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection-plans"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <InspectionPlansPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <TrainingPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspections"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <InspectionsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <ProductsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <UsersPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <ReportsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/indicators"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <IndicatorsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/spc-control"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <SpcControlPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier-management"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <SupplierManagementPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/approval-queue"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <ApprovalQueuePage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <SettingsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <ProfilePage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/solicitation"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <SolicitationPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/logs"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <LogsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/blocks"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <BlocksPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training/courses"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <TrainingCoursesPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training/index"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <TrainingIndexPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training/admin"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <TrainingAdminPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/training/player"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <TrainingPlayerPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training/downloads"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <TrainingDownloadsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quality-engineering"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <QualityEngineeringPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sgq"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoading />}>
                <SGQPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
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
                <UpdateNotification />
              </div>
            </Router>
          </QueryClientProvider>
        </ThemeProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;