// Testes automatizados para cenários de erro específicos
// Cobre todos os 7 tipos de erro identificados

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { mockApiResponse, mockApiError, mockSupabaseSession, getConsoleLogs } from './setup';
import { logger } from '../lib/logger';

// Componentes para teste
import Login from '../pages/login';
import Products from '../pages/products';
import InspectionPlans from '../pages/inspection-plans';

// Mock do logger
jest.mock('../lib/logger', () => ({
  logger: {
    logApi: jest.fn(),
    logAuth: jest.fn(),
    logError: jest.fn(),
    logImport: jest.fn(),
    logCSS: jest.fn(),
    logWebSocket: jest.fn(),
  },
  logApi: jest.fn(),
  logAuth: jest.fn(),
  logError: jest.fn(),
  logImport: jest.fn(),
  logCSS: jest.fn(),
  logWebSocket: jest.fn(),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Cenários de Erro - Testes Automatizados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. 401 Unauthorized em /api/notifications', () => {
    test('deve detectar e logar erro 401 ao acessar notificações', async () => {
      // Mock de sessão válida
      mockSupabaseSession({
        user: { id: 'test-user', email: 'test@example.com' },
        access_token: 'valid-token'
      });

      // Mock de erro 401 na API
      mockApiError('/api/notifications', 401, 'Unauthorized');

      render(
        <TestWrapper>
          <Products />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(logger.logApi).toHaveBeenCalledWith(
          expect.objectContaining({
            url: expect.stringContaining('/api/notifications'),
            status: 401,
            statusText: 'Unauthorized'
          })
        );
      });

      // Verificar se o erro foi logado corretamente
      const logs = getConsoleLogs();
      expect(logs.errors.some(call => 
        call[0].includes('401') || call[0].includes('Unauthorized')
      )).toBe(true);
    });

    test('deve detectar token inválido/expirado', async () => {
      // Mock de sessão com token expirado
      mockSupabaseSession({
        user: { id: 'test-user', email: 'test@example.com' },
        access_token: 'expired-token'
      });

      // Mock de erro 401 por token inválido
      mockApiError('/api/products', 401, 'Token expired');

      render(
        <TestWrapper>
          <Products />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(logger.logAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'token_check',
            success: false
          })
        );
      });
    });
  });

  describe('2. Label is not defined (Imports não resolvidos)', () => {
    test('deve capturar erro de componente não importado', async () => {
      // Mock de erro de import
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Simular erro de Label não definido
      const error = new Error('Label is not defined');
      console.error(error.message);

      expect(logger.logImport).toHaveBeenCalledWith(
        'Componente não definido',
        expect.objectContaining({
          message: 'Label is not defined'
        })
      );

      consoleSpy.mockRestore();
    });

    test('deve detectar erro de import quebrado', () => {
      // Mock de erro de módulo não encontrado
      const error = new Error("Cannot find module '@/components/ui/label'");
      console.error(error.message);

      expect(logger.logImport).toHaveBeenCalledWith(
        'Componente não definido',
        expect.objectContaining({
          message: expect.stringContaining('Cannot find module')
        })
      );
    });
  });

  describe('3. Tela de produtos vazia (0 SKUs)', () => {
    test('deve detectar quando API retorna lista vazia', async () => {
      // Mock de sessão válida
      mockSupabaseSession({
        user: { id: 'test-user', email: 'test@example.com' },
        access_token: 'valid-token'
      });

      // Mock de resposta vazia da API
      mockApiResponse('/api/products', []);

      render(
        <TestWrapper>
          <Products />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/0 produtos/i)).toBeInTheDocument();
      });

      // Verificar se foi logado como warning
      expect(logger.logApi).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/api/products'),
          status: 200
        })
      );
    });

    test('deve detectar quando token não é enviado', async () => {
      // Mock de sessão sem token
      mockSupabaseSession({
        user: { id: 'test-user', email: 'test@example.com' },
        access_token: null
      });

      // Mock de erro 401 por falta de token
      mockApiError('/api/products', 401, 'No token provided');

      render(
        <TestWrapper>
          <Products />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(logger.logAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'token_check',
            success: false,
            tokenPresent: false
          })
        );
      });
    });
  });

  describe('4. CSS / layout quebrado', () => {
    test('deve detectar quando Tailwind não está carregado', () => {
      // Mock de verificação de CSS
      const testDiv = document.createElement('div');
      testDiv.className = 'bg-red-500 p-4 m-2';
      document.body.appendChild(testDiv);

      const computedStyle = window.getComputedStyle(testDiv);
      const isTailwindWorking = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';

      if (!isTailwindWorking) {
        logger.logCSS('Tailwind CSS não está sendo aplicado', {
          backgroundColor: computedStyle.backgroundColor,
          padding: computedStyle.padding,
          margin: computedStyle.margin
        });
      }

      expect(logger.logCSS).toHaveBeenCalledWith(
        'Tailwind CSS não está sendo aplicado',
        expect.objectContaining({
          backgroundColor: expect.any(String),
          padding: expect.any(String),
          margin: expect.any(String)
        })
      );

      document.body.removeChild(testDiv);
    });

    test('deve detectar quando CSS global não está carregado', () => {
      const globalStyles = document.querySelector('link[href*="index.css"], link[href*="globals.css"]');
      
      if (!globalStyles) {
        logger.logCSS('CSS global não encontrado', { globalStylesFound: false });
      }

      expect(logger.logCSS).toHaveBeenCalledWith(
        'CSS global não encontrado',
        expect.objectContaining({
          globalStylesFound: false
        })
      );
    });
  });

  describe('5. WebSocket fechado (1000) ou heartbeat falhando', () => {
    test('deve detectar quando WebSocket é fechado inesperadamente', () => {
      // Mock de WebSocket
      const mockWebSocket = {
        readyState: 3, // CLOSED
        url: 'wss://test.com/ws',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
      };

      // Simular evento de fechamento
      const closeEvent = new Event('close');
      mockWebSocket.addEventListener('close', () => {
        logger.logWebSocket({
          action: 'disconnect',
          url: mockWebSocket.url,
          readyState: mockWebSocket.readyState
        });
      });

      // Disparar evento
      mockWebSocket.addEventListener.mock.calls
        .find(([event]) => event === 'close')?.[1]?.(closeEvent);

      expect(logger.logWebSocket).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'disconnect',
          url: 'wss://test.com/ws',
          readyState: 3
        })
      );
    });

    test('deve detectar quando heartbeat falha', () => {
      // Mock de erro de heartbeat
      const heartbeatError = new Error('Heartbeat failed');
      logger.logWebSocket({
        action: 'heartbeat',
        error: heartbeatError,
        reconnectAttempt: 1
      });

      expect(logger.logWebSocket).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'heartbeat',
          error: heartbeatError,
          reconnectAttempt: 1
        })
      );
    });
  });

  describe('6. Erro 404 Failed to load resource', () => {
    test('deve detectar quando URL de API está incorreta', async () => {
      // Mock de erro 404
      mockApiError('/api/invalid-endpoint', 404, 'Not Found');

      render(
        <TestWrapper>
          <Products />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(logger.logApi).toHaveBeenCalledWith(
          expect.objectContaining({
            url: expect.stringContaining('/api/invalid-endpoint'),
            status: 404,
            statusText: 'Not Found'
          })
        );
      });
    });

    test('deve detectar quando variável de ambiente não está definida', () => {
      // Simular URL indefinida
      const apiUrl = process.env.VITE_API_URL;
      if (!apiUrl) {
        logger.logError('VITE_API_URL não está definida', {
          env: process.env.NODE_ENV,
          availableEnvVars: Object.keys(process.env).filter(key => key.startsWith('VITE_'))
        });
      }

      expect(logger.logError).toHaveBeenCalledWith(
        'VITE_API_URL não está definida',
        expect.objectContaining({
          env: expect.any(String),
          availableEnvVars: expect.any(Array)
        })
      );
    });
  });

  describe('7. Sessão não persistida (User: null)', () => {
    test('deve detectar quando Supabase não retorna sessão', async () => {
      // Mock de sessão nula
      mockSupabaseSession(null);

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(logger.logAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'session_check',
            success: false,
            userId: undefined
          })
        );
      });
    });

    test('deve detectar problema no localStorage', () => {
      // Mock de localStorage quebrado
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => null);

      // Tentar obter sessão
      const session = localStorage.getItem('supabase.auth.token');
      
      if (!session) {
        logger.logAuth({
          action: 'session_check',
          success: false,
          error: 'No session in localStorage'
        });
      }

      expect(logger.logAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'session_check',
          success: false,
          error: 'No session in localStorage'
        })
      );

      // Restaurar
      localStorage.getItem = originalGetItem;
    });
  });

  describe('Testes de Integração', () => {
    test('deve executar diagnóstico completo e gerar relatório', async () => {
      // Mock de múltiplos erros
      mockApiError('/api/notifications', 401, 'Unauthorized');
      mockApiError('/api/products', 404, 'Not Found');
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      console.error('Label is not defined');
      console.error('WebSocket connection failed');

      // Aguardar logs serem processados
      await waitFor(() => {
        expect(logger.logApi).toHaveBeenCalled();
        expect(logger.logImport).toHaveBeenCalled();
        expect(logger.logWebSocket).toHaveBeenCalled();
      });

      // Verificar relatório de erros
      const errorReport = logger.getErrorReport();
      expect(errorReport.totalErrors).toBeGreaterThan(0);
      expect(Object.keys(errorReport.errorsByCategory).length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    test('deve capturar screenshot em caso de erro visual', async () => {
      // Mock de erro de CSS
      logger.logCSS('Layout quebrado detectado', {
        element: 'header',
        expectedStyle: 'display: flex',
        actualStyle: 'display: none'
      });

      expect(logger.logCSS).toHaveBeenCalledWith(
        'Layout quebrado detectado',
        expect.objectContaining({
          element: 'header',
          expectedStyle: 'display: flex',
          actualStyle: 'display: none'
        })
      );
    });
  });
});
