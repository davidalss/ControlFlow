// Configuração de testes automatizados para ControlFlow
// Jest + React Testing Library + Supertest

import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Configurar MSW (Mock Service Worker) para interceptar requisições
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock do fetch global
global.fetch = jest.fn();

// Mock do WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1, // OPEN
}));

// Mock do console para capturar logs
const originalConsole = { ...console };
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}));

// Mock do React Query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock do React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
}));

// Configurações globais para testes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock do ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do MutationObserver
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

// Configuração de ambiente de teste
process.env.NODE_ENV = 'test';
process.env.VITE_API_URL = 'http://localhost:3001';
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-key';

// Utilitários para testes
export const mockApiResponse = (url: string, data: any, status = 200) => {
  (fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({
      ok: status < 400,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      headers: new Map(),
    })
  );
};

export const mockApiError = (url: string, status = 500, message = 'Internal Server Error') => {
  (fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({
      ok: false,
      status,
      statusText: message,
      json: () => Promise.resolve({ error: message }),
      text: () => Promise.resolve(message),
      headers: new Map(),
    })
  );
};

export const mockSupabaseSession = (session: any = null) => {
  const { createClient } = require('@supabase/supabase-js');
  const mockClient = createClient();
  mockClient.auth.getSession.mockResolvedValue({ data: { session }, error: null });
  return mockClient;
};

export const mockSupabaseAuth = (user: any = null) => {
  const { createClient } = require('@supabase/supabase-js');
  const mockClient = createClient();
  mockClient.auth.signInWithPassword.mockResolvedValue({
    data: { user, session: user ? { access_token: 'test-token' } : null },
    error: null,
  });
  return mockClient;
};

// Helper para aguardar elementos
export const waitForElement = async (callback: () => HTMLElement | null, timeout = 5000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = callback();
    if (element) return element;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error('Element not found within timeout');
};

// Helper para simular eventos
export const fireEvent = {
  click: (element: HTMLElement) => {
    element.click();
  },
  change: (element: HTMLInputElement, value: string) => {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },
  submit: (form: HTMLFormElement) => {
    form.dispatchEvent(new Event('submit', { bubbles: true }));
  },
  keyDown: (element: HTMLElement, key: string) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  },
};

// Helper para verificar se elemento está visível
export const isVisible = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
};

// Helper para capturar screenshots em testes E2E
export const captureScreenshot = async (page: any, name: string) => {
  try {
    await page.screenshot({ path: `./screenshots/${name}.png` });
  } catch (error) {
    console.warn('Failed to capture screenshot:', error);
  }
};

// Helper para verificar logs
export const getConsoleLogs = () => {
  return {
    logs: (console.log as jest.Mock).mock.calls,
    warnings: (console.warn as jest.Mock).mock.calls,
    errors: (console.error as jest.Mock).mock.calls,
  };
};

// Helper para limpar mocks
export const clearMocks = () => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
};

// Configuração de timeout para testes
jest.setTimeout(10000);

// Configuração de coverage
export const testCoverage = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**',
    '!src/mocks/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
