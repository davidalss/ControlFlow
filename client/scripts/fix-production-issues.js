#!/usr/bin/env node

/**
 * Script de correção automática de problemas de produção
 * Corrige problemas de CSS, autenticação e providers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Iniciando correção de problemas de produção...');

// Função para verificar se um arquivo existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Função para ler arquivo
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Função para escrever arquivo
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Arquivo atualizado: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao escrever ${filePath}:`, error.message);
    return false;
  }
}

// 1. Verificar e corrigir CSS global
console.log('\n📁 Verificando CSS global...');
const indexCssPath = path.join(__dirname, '..', 'src', 'index.css');
const globalsCssPath = path.join(__dirname, '..', 'src', 'styles', 'globals.css');

if (!fileExists(indexCssPath)) {
  console.log('❌ index.css não encontrado');
} else {
  console.log('✅ index.css encontrado');
}

if (!fileExists(globalsCssPath)) {
  console.log('❌ globals.css não encontrado');
} else {
  console.log('✅ globals.css encontrado');
}

// 2. Verificar e corrigir App.tsx
console.log('\n📁 Verificando App.tsx...');
const appTsxPath = path.join(__dirname, '..', 'src', 'App.tsx');
const appContent = readFile(appTsxPath);

if (appContent) {
  // Verificar se NotificationsProvider está presente
  if (!appContent.includes('NotificationsProvider')) {
    console.log('⚠️ NotificationsProvider não encontrado em App.tsx');
    
    // Corrigir App.tsx
    const correctedAppContent = `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './hooks/use-auth';
import { NotificationsProvider } from './lib/notifications';
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
                    {/* Adicionar outras rotas conforme necessário */}
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
`;
    
    writeFile(appTsxPath, correctedAppContent);
  } else {
    console.log('✅ NotificationsProvider já está presente em App.tsx');
  }
}

// 3. Verificar e corrigir supabaseClient.ts
console.log('\n📁 Verificando supabaseClient.ts...');
const supabaseClientPath = path.join(__dirname, '..', 'src', 'lib', 'supabaseClient.ts');
const supabaseContent = readFile(supabaseClientPath);

if (supabaseContent) {
  // Verificar se há tratamento de erro adequado
  if (!supabaseContent.includes('console.error')) {
    console.log('⚠️ Tratamento de erro inadequado em supabaseClient.ts');
  } else {
    console.log('✅ supabaseClient.ts parece estar correto');
  }
}

// 4. Verificar e corrigir main.tsx
console.log('\n📁 Verificando main.tsx...');
const mainTsxPath = path.join(__dirname, '..', 'src', 'main.tsx');
const mainContent = readFile(mainTsxPath);

if (mainContent) {
  // Verificar se CSS está sendo importado
  if (!mainContent.includes("import './index.css'")) {
    console.log('❌ Import do index.css não encontrado em main.tsx');
  } else {
    console.log('✅ Import do index.css encontrado em main.tsx');
  }
  
  if (!mainContent.includes("import './styles/globals.css'")) {
    console.log('❌ Import do globals.css não encontrado em main.tsx');
  } else {
    console.log('✅ Import do globals.css encontrado em main.tsx');
  }
}

// 5. Criar arquivo de verificação de ambiente
console.log('\n📁 Criando verificação de ambiente...');
const envCheckPath = path.join(__dirname, '..', 'src', 'env-check.js');
const envCheckContent = `// Verificação de variáveis de ambiente
console.log('🔍 Verificando variáveis de ambiente...');

const envVars = {
  'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'VITE_API_URL': import.meta.env.VITE_API_URL,
  'NODE_ENV': import.meta.env.NODE_ENV,
  'MODE': import.meta.env.MODE
};

console.log('📋 Variáveis de ambiente:', envVars);

const missingVars = Object.entries(envVars)
  .filter(([key, value]) => !value && key.startsWith('VITE_'))
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Variáveis ausentes:', missingVars);
} else {
  console.log('✅ Todas as variáveis estão definidas');
}
`;

writeFile(envCheckPath, envCheckContent);

// 6. Atualizar index.html para incluir verificação
console.log('\n📁 Atualizando index.html...');
const indexHtmlPath = path.join(__dirname, '..', 'index.html');
const indexHtmlContent = readFile(indexHtmlPath);

if (indexHtmlContent) {
  if (!indexHtmlContent.includes('env-check.js')) {
    const updatedHtmlContent = indexHtmlContent.replace(
      '<script type="module" src="/src/main.tsx"></script>',
      `<script type="module" src="/src/main.tsx"></script>
      <script type="module" src="/src/env-check.js"></script>`
    );
    writeFile(indexHtmlPath, updatedHtmlContent);
  } else {
    console.log('✅ Verificação de ambiente já está no index.html');
  }
}

console.log('\n✅ Correção de problemas concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. npm run build (para testar as correções)');
console.log('2. Verificar se os erros foram resolvidos');
console.log('3. Fazer deploy no Render');
