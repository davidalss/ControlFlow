import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TrainingPage from '@/pages/training';

// Mock do useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TrainingPage Component', () => {
  test('renderiza a página de treinamentos corretamente', () => {
    renderWithRouter(<TrainingPage />);

    expect(screen.getByText('Treinamentos')).toBeInTheDocument();
    expect(screen.getByText('Gerencie treinamentos, acompanhe progresso e gere relatórios de auditoria')).toBeInTheDocument();
    expect(screen.getByText('Novo Treinamento')).toBeInTheDocument();
  });

  test('exibe estatísticas corretamente', () => {
    renderWithRouter(<TrainingPage />);

    expect(screen.getByText('Total de Treinamentos')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Total de treinamentos
    expect(screen.getByText('Usuários Enrolados')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument(); // Total de usuários
    expect(screen.getByText('Taxa de Conclusão')).toBeInTheDocument();
    expect(screen.getByText('78.5%')).toBeInTheDocument();
    expect(screen.getByText('Nota Média')).toBeInTheDocument();
    expect(screen.getByText('85.2')).toBeInTheDocument();
  });

  test('exibe treinamentos na visualização grid', () => {
    renderWithRouter(<TrainingPage />);

    expect(screen.getByText('ISO 9001:2015 - Fundamentos')).toBeInTheDocument();
    expect(screen.getByText('Curso completo sobre os fundamentos da norma ISO 9001:2015')).toBeInTheDocument();
    expect(screen.getByText('intermediate')).toBeInTheDocument(); // Dificuldade
    expect(screen.getByText('120 min')).toBeInTheDocument(); // Duração
  });

  test('filtros funcionam corretamente', () => {
    renderWithRouter(<TrainingPage />);

    const searchInput = screen.getByPlaceholderText('Buscar treinamentos...');
    fireEvent.change(searchInput, { target: { value: 'ISO' } });

    expect(screen.getByText('ISO 9001:2015 - Fundamentos')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Treinamento inexistente' } });
    expect(screen.queryByText('ISO 9001:2015 - Fundamentos')).not.toBeInTheDocument();
  });

  test('muda entre visualização grid e lista', () => {
    renderWithRouter(<TrainingPage />);

    const viewToggleButton = screen.getByRole('button', { name: /list/i });
    fireEvent.click(viewToggleButton);

    // Verifica se mudou para visualização de lista
    expect(screen.getByText('Treinamento')).toBeInTheDocument();
    expect(screen.getByText('Categoria')).toBeInTheDocument();
    expect(screen.getByText('Duração')).toBeInTheDocument();
  });

  test('abre modal de criação de treinamento', () => {
    renderWithRouter(<TrainingPage />);

    const createButton = screen.getByText('Novo Treinamento');
    fireEvent.click(createButton);

    expect(screen.getByText('Novo Treinamento')).toBeInTheDocument();
    expect(screen.getByText('Configure o treinamento com materiais, testes e prazo de conclusão')).toBeInTheDocument();
  });

  test('modal de criação tem todas as abas', () => {
    renderWithRouter(<TrainingPage />);

    const createButton = screen.getByText('Novo Treinamento');
    fireEvent.click(createButton);

    expect(screen.getByText('Básico')).toBeInTheDocument();
    expect(screen.getByText('Materiais')).toBeInTheDocument();
    expect(screen.getByText('Testes')).toBeInTheDocument();
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });

  test('aba básico tem todos os campos necessários', () => {
    renderWithRouter(<TrainingPage />);

    const createButton = screen.getByText('Novo Treinamento');
    fireEvent.click(createButton);

    expect(screen.getByLabelText(/título do treinamento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duração/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dificuldade/i)).toBeInTheDocument();
  });

  test('dropdown menu funciona corretamente', () => {
    renderWithRouter(<TrainingPage />);

    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);

    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Ver Usuários')).toBeInTheDocument();
    expect(screen.getByText('Baixar Lista')).toBeInTheDocument();
    expect(screen.getByText('Excluir')).toBeInTheDocument();
  });

  test('abre modal de lista de usuários', () => {
    renderWithRouter(<TrainingPage />);

    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);

    const viewUsersButton = screen.getByText('Ver Usuários');
    fireEvent.click(viewUsersButton);

    expect(screen.getByText('Usuários do Treinamento - ISO 9001:2015 - Fundamentos')).toBeInTheDocument();
    expect(screen.getByText('Visualize e gerencie usuários inscritos no treinamento')).toBeInTheDocument();
  });

  test('modal de usuários tem todas as abas', () => {
    renderWithRouter(<TrainingPage />);

    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);

    const viewUsersButton = screen.getByText('Ver Usuários');
    fireEvent.click(viewUsersButton);

    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Em Andamento')).toBeInTheDocument();
    expect(screen.getByText('Concluídos')).toBeInTheDocument();
    expect(screen.getByText('Atrasados')).toBeInTheDocument();
  });

  test('exibe usuários corretamente na lista', () => {
    renderWithRouter(<TrainingPage />);

    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);

    const viewUsersButton = screen.getByText('Ver Usuários');
    fireEvent.click(viewUsersButton);

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText('Em Andamento')).toBeInTheDocument();
  });

  test('progresso é exibido corretamente', () => {
    renderWithRouter(<TrainingPage />);

    expect(screen.getByText('71%')).toBeInTheDocument(); // Progresso calculado
    expect(screen.getByText('85.5%')).toBeInTheDocument(); // Nota média
  });

  test('badges de status são exibidos corretamente', () => {
    renderWithRouter(<TrainingPage />);

    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('intermediate')).toBeInTheDocument();
  });

  test('materiais são exibidos corretamente', () => {
    renderWithRouter(<TrainingPage />);

    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('+0')).toBeInTheDocument(); // Indicador de materiais adicionais
  });

  test('testes são exibidos corretamente', () => {
    renderWithRouter(<TrainingPage />);

    expect(screen.getByText('1 teste')).toBeInTheDocument();
  });
});
