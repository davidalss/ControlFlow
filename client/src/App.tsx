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
      console.log('🔍 Executando diagnóstico automático...');
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
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Gestão de Fornecedores</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
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
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Inspeções</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/spc-control"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Controle SPC</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/approval-queue"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Aprovações</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/blocks"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Gestão de Bloqueios</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/solicitation"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Solicitações</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
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
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">SGQ - Sistema de Gestão da Qualidade</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
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
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Lista de Treinamentos</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/training/admin"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Administração de Treinamentos</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/training/player"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Player de Conteúdo</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/training/downloads"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Controle de Downloads</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
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
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Relatórios</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/indicators"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Indicadores</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
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
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Usuários</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Perfil</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Configurações</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/logs"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold mb-4">Logs do Sistema</h1>
                            <p>Página em desenvolvimento...</p>
                          </div>
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