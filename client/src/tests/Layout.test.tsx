import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/hooks/use-auth';

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock do useAuth
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'João Silva',
      role: 'admin'
    },
    logout: jest.fn(),
    loading: false
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Layout Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  test('renderiza o layout corretamente', () => {
    renderWithRouter(
      <Layout>
        <div>Conteúdo de teste</div>
      </Layout>
    );

    expect(screen.getByText('QualiHUB')).toBeInTheDocument();
    expect(screen.getByText('Gestão da Qualidade')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo de teste')).toBeInTheDocument();
  });

  test('sidebar colapsa e expande corretamente', async () => {
    renderWithRouter(
      <Layout>
        <div>Conteúdo de teste</div>
      </Layout>
    );

    const toggleButton = screen.getByRole('button', { name: /chevron/i });
    
    // Verifica se a sidebar está expandida inicialmente
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Clica no botão para colapsar
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
    
    // Clica novamente para expandir
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  test('salva estado da sidebar no localStorage', async () => {
    renderWithRouter(
      <Layout>
        <div>Conteúdo de teste</div>
      </Layout>
    );

    const toggleButton = screen.getByRole('button', { name: /chevron/i });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sidebar-state-1',
        expect.stringContaining('"collapsed":true')
      );
    });
  });

  test('carrega estado da sidebar do localStorage', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ collapsed: true, expanded: ['quality'] })
    );

    renderWithRouter(
      <Layout>
        <div>Conteúdo de teste</div>
      </Layout>
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('sidebar-state-1');
  });

  test('exibe informações do usuário corretamente', () => {
    renderWithRouter(
      <Layout>
        <div>Conteúdo de teste</div>
      </Layout>
    );

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  test('menu items são renderizados corretamente', () => {
    renderWithRouter(
      <Layout>
        <div>Conteúdo de teste</div>
      </Layout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Inspeções')).toBeInTheDocument();
    expect(screen.getByText('Planos de Inspeção')).toBeInTheDocument();
    expect(screen.getByText('Treinamentos')).toBeInTheDocument();
    expect(screen.getByText('Gestão da Qualidade')).toBeInTheDocument();
  });

  test('badges são exibidos corretamente', () => {
    renderWithRouter(
      <Layout>
        <div>Conteúdo de teste</div>
      </Layout>
    );

    expect(screen.getByText('3')).toBeInTheDocument(); // Badge de Inspeções
    expect(screen.getByText('2')).toBeInTheDocument(); // Badge de Treinamentos
  });

  test('submenu expande e colapsa corretamente', async () => {
    renderWithRouter(
      <Layout>
        <div>Conteúdo de teste</div>
      </Layout>
    );

    const qualityMenu = screen.getByText('Gestão da Qualidade');
    fireEvent.click(qualityMenu);

    await waitFor(() => {
      expect(screen.getByText('Processos')).toBeInTheDocument();
      expect(screen.getByText('Normas')).toBeInTheDocument();
      expect(screen.getByText('Auditorias')).toBeInTheDocument();
    });

    // Clica novamente para colapsar
    fireEvent.click(qualityMenu);

    await waitFor(() => {
      expect(screen.queryByText('Processos')).not.toBeInTheDocument();
    });
  });
});
