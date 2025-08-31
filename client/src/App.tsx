import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './hooks/use-auth';
import { DiagnosticErrorBoundary } from './components/DiagnosticErrorBoundary';
import { diagnostics } from './lib/diagnostics';
import { NotificationsProvider } from './lib/notifications';

// Importar páginas
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Products from './pages/products';
import InspectionPlans from './pages/inspection-plans';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Importar páginas que realmente existem
import SupplierManagement from './pages/supplier-management';
import Inspections from './pages/inspections';
import SpcControl from './pages/spc-control';
import ApprovalQueue from './pages/approval-queue';
import Blocks from './pages/blocks';
import Solicitation from './pages/solicitation';
import Sgq from './pages/sgq';
import Training from './pages/training';
import TrainingAdmin from './pages/training/admin';
import TrainingPlayer from './pages/training/player';
import TrainingDownloads from './pages/training/downloads';
import Reports from './pages/reports';
import Indicators from './pages/indicators';
import Users from './pages/users';
import Profile from './pages/profile';
import Settings from './pages/settings';
import Tickets from './pages/tickets';
import Logs from './pages/logs';
import SystemLogsPage from './pages/system-logs';

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente de diagnóstico que executa automaticamente
const DiagnosticWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    // Executar diagnóstico após 5 segundos
    const timer = setTimeout(() => {
      // Log removido para reduzir spam
      diagnostics.runFullDiagnostic();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
};

function App() {
  return (
    <DiagnosticErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationsProvider>
              <DiagnosticWrapper>
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Products />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inspection-plans"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <InspectionPlans />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  {/* Rotas de Engenharia de Qualidade */}
                  <Route
                    path="/supplier-management"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <SupplierManagement />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Rotas de Gestão da Qualidade */}
                  <Route
                    path="/inspections"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Inspections />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/spc-control"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <SpcControl />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/approval-queue"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ApprovalQueue />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/blocks"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Blocks />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/solicitation"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Solicitation />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Rotas de SGQ */}
                  <Route
                    path="/sgq"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Sgq />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Rotas de Treinamentos */}
                  <Route
                    path="/training"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Training />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/training/admin"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <TrainingAdmin />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/training/player"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <TrainingPlayer />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/training/downloads"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <TrainingDownloads />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Rotas de Analytics */}
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Reports />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/indicators"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Indicators />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Rotas do Sistema */}
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Users />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Profile />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Settings />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tickets"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Tickets />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/logs"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Logs />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/system-logs"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <SystemLogsPage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Router>
            </DiagnosticWrapper>
            </NotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </DiagnosticErrorBoundary>
  );
}

export default App;