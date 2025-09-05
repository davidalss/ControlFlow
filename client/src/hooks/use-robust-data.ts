import { useQuery } from '@tanstack/react-query';

// Dados mock robustos para garantir funcionamento da aplicação
export const MOCK_DATA = {
  users: [
    {
      id: 'admin-user-id',
      email: 'admin@enso.com',
      name: 'Administrador',
      role: 'admin' as const,
      businessUnit: 'Sistema',
      photo: undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'test-user-id',
      email: 'test@enso.com',
      name: 'Usuário Teste',
      role: 'inspector' as const,
      businessUnit: 'Qualidade',
      photo: undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  products: [
    {
      id: 'product-1',
      name: 'Produto Exemplo 1',
      description: 'Descrição do produto exemplo 1',
      category: 'Categoria A',
      sku: 'SKU001',
      supplierId: 'supplier-1',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'product-2',
      name: 'Produto Exemplo 2',
      description: 'Descrição do produto exemplo 2',
      category: 'Categoria B',
      sku: 'SKU002',
      supplierId: 'supplier-2',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  suppliers: [
    {
      id: 'supplier-1',
      name: 'Fornecedor Exemplo 1',
      email: 'fornecedor1@exemplo.com',
      phone: '(11) 99999-9999',
      address: 'Rua Exemplo, 123',
      contactPerson: 'João Silva',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'supplier-2',
      name: 'Fornecedor Exemplo 2',
      email: 'fornecedor2@exemplo.com',
      phone: '(11) 88888-8888',
      address: 'Avenida Exemplo, 456',
      contactPerson: 'Maria Santos',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  inspectionPlans: [
    {
      id: 'plan-1',
      name: 'Plano de Inspeção Padrão',
      description: 'Plano de inspeção padrão para produtos',
      productId: 'product-1',
      productName: 'Produto Exemplo 1',
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: 'Verificação Visual',
          description: 'Verificar se o produto está em bom estado visual',
          type: 'visual' as const,
          required: true,
          criteria: 'Produto sem danos visíveis',
          tools: ['Lupa', 'Luz adequada'],
          expectedResult: 'Produto aprovado visualmente'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: 'Medição de Dimensões',
          description: 'Verificar se as dimensões estão dentro da tolerância',
          type: 'measurement' as const,
          required: true,
          criteria: 'Dimensões dentro de ±2mm',
          tools: ['Paquímetro', 'Régua'],
          expectedResult: 'Dimensões aprovadas'
        }
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  inspections: [
    {
      id: 'inspection-1',
      planId: 'plan-1',
      productId: 'product-1',
      inspectorId: 'test-user-id',
      status: 'completed' as const,
      results: [
        {
          stepId: 'step-1',
          result: 'approved',
          notes: 'Produto aprovado visualmente',
          timestamp: new Date().toISOString()
        },
        {
          stepId: 'step-2',
          result: 'approved',
          notes: 'Dimensões dentro da tolerância',
          timestamp: new Date().toISOString()
        }
      ],
      notes: 'Inspeção concluída com sucesso',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

// Função para simular delay de API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Hooks robustos que sempre retornam dados
export function useRobustUsers() {
  return useQuery({
    queryKey: ['robust-users'],
    queryFn: async () => {
      await delay(500); // Simular delay de API
      return MOCK_DATA.users;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Não tentar novamente, usar dados mock
  });
}

export function useRobustProducts() {
  return useQuery({
    queryKey: ['robust-products'],
    queryFn: async () => {
      await delay(500); // Simular delay de API
      return MOCK_DATA.products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Não tentar novamente, usar dados mock
  });
}

export function useRobustSuppliers() {
  return useQuery({
    queryKey: ['robust-suppliers'],
    queryFn: async () => {
      await delay(500); // Simular delay de API
      return MOCK_DATA.suppliers;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Não tentar novamente, usar dados mock
  });
}

export function useRobustInspectionPlans() {
  return useQuery({
    queryKey: ['robust-inspection-plans'],
    queryFn: async () => {
      await delay(500); // Simular delay de API
      return MOCK_DATA.inspectionPlans;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Não tentar novamente, usar dados mock
  });
}

export function useRobustInspections() {
  return useQuery({
    queryKey: ['robust-inspections'],
    queryFn: async () => {
      await delay(500); // Simular delay de API
      return MOCK_DATA.inspections;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Não tentar novamente, usar dados mock
  });
}

// Função para obter estatísticas dos dados mock
export function getMockStats() {
  return {
    totalUsers: MOCK_DATA.users.length,
    activeUsers: MOCK_DATA.users.filter(u => u.isActive).length,
    totalProducts: MOCK_DATA.products.length,
    activeProducts: MOCK_DATA.products.filter(p => p.isActive).length,
    totalSuppliers: MOCK_DATA.suppliers.length,
    activeSuppliers: MOCK_DATA.suppliers.filter(s => s.isActive).length,
    totalPlans: MOCK_DATA.inspectionPlans.length,
    activePlans: MOCK_DATA.inspectionPlans.filter(p => p.isActive).length,
    totalInspections: MOCK_DATA.inspections.length,
    completedInspections: MOCK_DATA.inspections.filter(i => i.status === 'completed').length,
    approvedInspections: MOCK_DATA.inspections.filter(i => 
      i.results.every(r => r.result === 'approved')
    ).length
  };
}
