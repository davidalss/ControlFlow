import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './hooks/use-auth';
import { DiagnosticErrorBoundary } from './components/DiagnosticErrorBoundary';
import { diagnostics } from './lib/diagnostics';

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
                  {/* Adicionar outras rotas conforme necessário */}
                </Routes>
              </Router>
            </DiagnosticWrapper>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </DiagnosticErrorBoundary>
  );
}

export default App;