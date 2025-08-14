import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InspectionPlansPage from '@/pages/inspection-plans';

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

describe('InspectionPlansPage Component', () => {
  test('renderiza a página de planos de inspeção corretamente', () => {
    renderWithRouter(<InspectionPlansPage />);

    expect(screen.getByText('Planos de Inspeção')).toBeInTheDocument();
    expect(screen.getByText('Gerencie planos de inspeção para produtos específicos com campos condicionais e histórico completo')).toBeInTheDocument();
    expect(screen.getByText('Novo Plano')).toBeInTheDocument();
  });

  test('exibe estatísticas corretamente', () => {
    renderWithRouter(<InspectionPlansPage />);

    expect(screen.getByText('Total de Planos')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Total de planos
    expect(screen.getByText('Planos Ativos')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Planos ativos
    expect(screen.getByText('Tempo Médio')).toBeInTheDocument();
    expect(screen.getByText('12.5 min')).toBeInTheDocument();
    expect(screen.getByText('Taxa de Reprovação')).toBeInTheDocument();
    expect(screen.getByText('2.3%')).toBeInTheDocument();
  });

  test('exibe planos na visualização grid', () => {
    renderWithRouter(<InspectionPlansPage />);

    expect(screen.getByText('Plano de Inspeção - Air Fryer')).toBeInTheDocument();
    expect(screen.getByText('Air Fryer Premium')).toBeInTheDocument();
    expect(screen.getByText('Rev. 3')).toBeInTheDocument();
  });

  test('filtros funcionam corretamente', () => {
    renderWithRouter(<InspectionPlansPage />);

    const searchInput = screen.getByPlaceholderText('Buscar planos...');
    fireEvent.change(searchInput, { target: { value: 'Air Fryer' } });

    expect(screen.getByText('Plano de Inspeção - Air Fryer')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Plano inexistente' } });
    expect(screen.queryByText('Plano de Inspeção - Air Fryer')).not.toBeInTheDocument();
  });

  test('muda entre visualização grid e lista', () => {
    renderWithRouter(<InspectionPlansPage />);

    const viewToggleButton = screen.getByRole('button', { name: /list/i });
    fireEvent.click(viewToggleButton);

    // Verifica se mudou para visualização de lista
    expect(screen.getByText('Plano')).toBeInTheDocument();
    expect(screen.getByText('Produto')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('abre modal de criação de plano', () => {
    renderWithRouter(<InspectionPlansPage />);

    const createButton = screen.getByText('Novo Plano');
    fireEvent.click(createButton);

    expect(screen.getByText('Novo Plano de Inspeção')).toBeInTheDocument();
    expect(screen.getByText('Configure os campos e etapas do plano de inspeção')).toBeInTheDocument();
  });

  test('modal de criação tem todas as abas', () => {
    renderWithRouter(<InspectionPlansPage />);

    const createButton = screen.getByText('Novo Plano');
    fireEvent.click(createButton);

    expect(screen.getByText('Básico')).toBeInTheDocument();
    expect(screen.getByText('Etapas')).toBeInTheDocument();
    expect(screen.getByText('Campos')).toBeInTheDocument();
    expect(screen.getByText('Acesso')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  test('aba básico tem todos os campos necessários', () => {
    renderWithRouter(<InspectionPlansPage />);

    const createButton = screen.getByText('Novo Plano');
    fireEvent.click(createButton);

    expect(screen.getByLabelText(/nome do plano/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/produto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de validade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
  });

  test('dropdown menu funciona corretamente', () => {
    renderWithRouter(<InspectionPlansPage />);

    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);

    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Histórico')).toBeInTheDocument();
    expect(screen.getByText('Duplicar')).toBeInTheDocument();
    expect(screen.getByText('Excluir')).toBeInTheDocument();
  });

  test('abre modal de histórico', () => {
    renderWithRouter(<InspectionPlansPage />);

    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);

    const historyButton = screen.getByText('Histórico');
    fireEvent.click(historyButton);

    expect(screen.getByText('Histórico de Revisões - Plano de Inspeção - Air Fryer')).toBeInTheDocument();
    expect(screen.getByText('Visualize todas as alterações e revisões do plano de inspeção')).toBeInTheDocument();
  });

  test('modal de histórico tem todas as abas', () => {
    renderWithRouter(<InspectionPlansPage />);

    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);

    const historyButton = screen.getByText('Histórico');
    fireEvent.click(historyButton);

    expect(screen.getByText('Linha do Tempo')).toBeInTheDocument();
    expect(screen.getByText('Alterações')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  test('exibe informações do plano corretamente', () => {
    renderWithRouter(<InspectionPlansPage />);

    expect(screen.getByText('2')).toBeInTheDocument(); // Número de etapas
    expect(screen.getByText('15 min')).toBeInTheDocument(); // Tempo estimado
    expect(screen.getByText('31/12/2025')).toBeInTheDocument(); // Data de validade
  });

  test('badges de status são exibidos corretamente', () => {
    renderWithRouter(<InspectionPlansPage />);

    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('Rev. 3')).toBeInTheDocument();
  });

  test('tags são exibidas corretamente', () => {
    renderWithRouter(<InspectionPlansPage />);

    expect(screen.getByText('Eletrônicos')).toBeInTheDocument();
    expect(screen.getByText('Cozinha')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument(); // Indicador de tags adicionais
  });

  test('informações de usuário são exibidas corretamente', () => {
    renderWithRouter(<InspectionPlansPage />);

    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('10/08/2024')).toBeInTheDocument(); // Data de atualização
  });

  test('controle de acesso é exibido corretamente', () => {
    renderWithRouter(<InspectionPlansPage />);

    expect(screen.getByText('3 perfis')).toBeInTheDocument(); // Número de perfis com acesso
  });

  test('etapas são exibidas corretamente', () => {
    renderWithRouter(<InspectionPlansPage />);

    expect(screen.getByText('Inspeção Visual')).toBeInTheDocument();
    expect(screen.getByText('Testes Funcionais')).toBeInTheDocument();
  });

  test('campos condicionais são identificados', () => {
    renderWithRouter(<InspectionPlansPage />);

    // Verifica se há campos condicionais no plano
    const conditionalBadges = screen.getAllByText('Condicional');
    expect(conditionalBadges.length).toBeGreaterThan(0);
  });

  test('configuração de fotos é exibida', () => {
    renderWithRouter(<InspectionPlansPage />);

    // Verifica se há configuração de fotos
    const photoBadges = screen.getAllByText('4 fotos');
    expect(photoBadges.length).toBeGreaterThan(0);
  });

  test('indicadores de eficiência são exibidos', () => {
    renderWithRouter(<InspectionPlansPage />);

    expect(screen.getByText('12.5 min')).toBeInTheDocument(); // Tempo médio
    expect(screen.getByText('2.3%')).toBeInTheDocument(); // Taxa de reprovação
  });
});
