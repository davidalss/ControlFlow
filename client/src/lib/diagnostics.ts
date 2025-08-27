// Sistema de Diagnóstico Automático para ControlFlow
// Detecta e reporta problemas de 401, imports não resolvidos e CSS

interface DiagnosticResult {
  type: 'auth' | 'import' | 'css' | 'network';
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: any;
  timestamp: string;
}

class DiagnosticsManager {
  private results: DiagnosticResult[] = [];
  private isRunning = false;

  // 1. Diagnóstico de Autenticação (401)
  async checkAuthentication(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];
    
    try {
      console.log('🔍 DIAGNÓSTICO: Verificando autenticação...');
      
      // Verificar se Supabase está disponível
      if (typeof window !== 'undefined' && window.supabase) {
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
          results.push({
            type: 'auth',
            severity: 'error',
            message: 'Erro ao obter sessão do Supabase',
            details: error,
            timestamp: new Date().toISOString()
          });
        } else if (!session) {
          results.push({
            type: 'auth',
            severity: 'info',
            message: 'Usuário não autenticado (normal na página de login)',
            details: { userId: null, email: null, status: 'ready_for_login' },
            timestamp: new Date().toISOString()
          });
        } else {
          // Testar token com API
          const token = session.access_token;
          const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
          
          try {
            const response = await fetch(`${apiUrl}/api/notifications`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.status === 401) {
              results.push({
                type: 'auth',
                severity: 'error',
                message: 'Token rejeitado pelo backend (401 Unauthorized)',
                details: {
                  status: response.status,
                  statusText: response.statusText,
                  tokenPresent: !!token,
                  tokenLength: token?.length || 0
                },
                timestamp: new Date().toISOString()
              });
            } else if (response.status === 200) {
              results.push({
                type: 'auth',
                severity: 'info',
                message: 'Autenticação funcionando corretamente',
                details: { status: response.status },
                timestamp: new Date().toISOString()
              });
            } else {
              results.push({
                type: 'auth',
                severity: 'warning',
                message: `Resposta inesperada do backend: ${response.status}`,
                details: { status: response.status, statusText: response.statusText },
                timestamp: new Date().toISOString()
              });
            }
          } catch (fetchError) {
            results.push({
              type: 'network',
              severity: 'error',
              message: 'Erro de rede ao testar autenticação',
              details: fetchError,
              timestamp: new Date().toISOString()
            });
          }
        }
      } else {
        results.push({
          type: 'auth',
          severity: 'error',
          message: 'Cliente Supabase não disponível',
          details: { windowSupabase: !!window.supabase },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      results.push({
        type: 'auth',
        severity: 'error',
        message: 'Erro geral no diagnóstico de autenticação',
        details: error,
        timestamp: new Date().toISOString()
      });
    }
    
    return results;
  }

  // 2. Diagnóstico de Imports (Label is not defined)
  checkImports(): DiagnosticResult[] {
    const results: DiagnosticResult[] = [];
    
    try {
      console.log('🔍 DIAGNÓSTICO: Verificando imports...');
      
      // Verificar se há erros de JavaScript no console
      const originalError = console.error;
      const errors: string[] = [];
      
      console.error = (...args) => {
        const errorMessage = args.join(' ');
        if (errorMessage.includes('is not defined') || errorMessage.includes('ReferenceError')) {
          errors.push(errorMessage);
        }
        originalError.apply(console, args);
      };
      
      // Restaurar console.error após um tempo
      setTimeout(() => {
        console.error = originalError;
        
        if (errors.length > 0) {
          results.push({
            type: 'import',
            severity: 'error',
            message: 'Imports não resolvidos detectados',
            details: { errors },
            timestamp: new Date().toISOString()
          });
        } else {
          results.push({
            type: 'import',
            severity: 'info',
            message: 'Nenhum erro de import detectado',
            details: { errorsCount: 0 },
            timestamp: new Date().toISOString()
          });
        }
      }, 1000);
      
    } catch (error) {
      results.push({
        type: 'import',
        severity: 'error',
        message: 'Erro ao verificar imports',
        details: error,
        timestamp: new Date().toISOString()
      });
    }
    
    return results;
  }

  // 3. Diagnóstico de CSS
  checkCSS(): DiagnosticResult[] {
    const results: DiagnosticResult[] = [];
    
    try {
      console.log('🔍 DIAGNÓSTICO: Verificando CSS...');
      
      // Verificar se Tailwind está carregado
      const testDiv = document.createElement('div');
      testDiv.className = 'bg-red-500 p-4 m-2';
      testDiv.style.position = 'absolute';
      testDiv.style.top = '-9999px';
      testDiv.style.left = '-9999px';
      testDiv.textContent = 'CSS Test';
      
      document.body.appendChild(testDiv);
      
      const computedStyle = window.getComputedStyle(testDiv);
      const backgroundColor = computedStyle.backgroundColor;
      const padding = computedStyle.padding;
      const margin = computedStyle.margin;
      
      document.body.removeChild(testDiv);
      
      // Verificar se estilos foram aplicados
      const isTailwindWorking = backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                               backgroundColor !== 'transparent' &&
                               (padding !== '0px' || margin !== '0px');
      
      if (!isTailwindWorking) {
        results.push({
          type: 'css',
          severity: 'error',
          message: 'Tailwind CSS não está sendo aplicado',
          details: {
            backgroundColor,
            padding,
            margin,
            isTailwindWorking
          },
          timestamp: new Date().toISOString()
        });
      } else {
        results.push({
          type: 'css',
          severity: 'info',
          message: 'Tailwind CSS funcionando corretamente',
          details: {
            backgroundColor,
            padding,
            margin,
            isTailwindWorking
          },
          timestamp: new Date().toISOString()
        });
      }
      
      // Verificar se CSS global está carregado (melhor verificação)
      const globalStyles = document.querySelector('link[href*="index.css"], link[href*="globals.css"], style[data-vite-dev-id]');
      const hasTailwindClasses = document.querySelector('.bg-red-500, .p-4, .m-2');
      
      if (!globalStyles && !hasTailwindClasses) {
        results.push({
          type: 'css',
          severity: 'warning',
          message: 'CSS global não encontrado',
          details: { globalStylesFound: false },
          timestamp: new Date().toISOString()
        });
      } else {
        results.push({
          type: 'css',
          severity: 'info',
          message: 'CSS global funcionando corretamente',
          details: { globalStylesFound: true },
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      results.push({
        type: 'css',
        severity: 'error',
        message: 'Erro ao verificar CSS',
        details: error,
        timestamp: new Date().toISOString()
      });
    }
    
    return results;
  }

  // Executar todos os diagnósticos
  async runFullDiagnostic(): Promise<DiagnosticResult[]> {
    if (this.isRunning) {
      console.log('⚠️ Diagnóstico já em execução...');
      return this.results;
    }
    
    this.isRunning = true;
    console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO...');
    
    try {
      // Executar diagnósticos em paralelo
      const [authResults, importResults, cssResults] = await Promise.all([
        this.checkAuthentication(),
        Promise.resolve(this.checkImports()),
        Promise.resolve(this.checkCSS())
      ]);
      
      this.results = [...authResults, ...importResults, ...cssResults];
      
      // Log dos resultados
      this.logResults();
      
      return this.results;
    } catch (error) {
      console.error('❌ Erro no diagnóstico completo:', error);
      return [];
    } finally {
      this.isRunning = false;
    }
  }

  // Log dos resultados
  private logResults(): void {
    console.log('\n📊 RESULTADOS DO DIAGNÓSTICO');
    console.log('=============================');
    
    const errors = this.results.filter(r => r.severity === 'error');
    const warnings = this.results.filter(r => r.severity === 'warning');
    const infos = this.results.filter(r => r.severity === 'info');
    
    console.log(`❌ Erros: ${errors.length}`);
    console.log(`⚠️ Avisos: ${warnings.length}`);
    console.log(`ℹ️ Informações: ${infos.length}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 ERROS ENCONTRADOS:');
      errors.forEach(error => {
        console.log(`  ${error.type.toUpperCase()}: ${error.message}`);
        if (error.details) {
          console.log(`    Detalhes:`, error.details);
        }
      });
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ AVISOS:');
      warnings.forEach(warning => {
        console.log(`  ${warning.type.toUpperCase()}: ${warning.message}`);
      });
    }
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    if (errors.length === 0) {
      console.log('✅ Todos os sistemas funcionando corretamente!');
    } else {
      console.log('🔧 Execute as correções sugeridas acima');
    }
  }

  // Obter resultados
  getResults(): DiagnosticResult[] {
    return this.results;
  }

  // Limpar resultados
  clearResults(): void {
    this.results = [];
  }
}

// Instância global
export const diagnostics = new DiagnosticsManager();

// Função para executar diagnóstico manual
export const runDiagnostic = () => {
  return diagnostics.runFullDiagnostic();
};

// Auto-diagnóstico na inicialização
if (typeof window !== 'undefined') {
  // Executar após 3 segundos para dar tempo do app carregar
  setTimeout(() => {
    console.log('🔍 Executando diagnóstico automático...');
    diagnostics.runFullDiagnostic();
  }, 3000);
}
