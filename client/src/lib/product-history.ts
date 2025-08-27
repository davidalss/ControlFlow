// Sistema de Histórico de Versões para Produtos
import { Product, CreateProductData, UpdateProductData } from '@/hooks/use-products';

export interface ProductVersion {
  id: string;
  productId: string;
  productCode: string;
  version: number;
  action: 'create' | 'update' | 'delete';
  changes: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];
  userId?: string;
  userName?: string;
  timestamp: Date;
  description: string;
  data: Partial<Product>;
}

export interface ProductHistoryEntry {
  id: string;
  productId: string;
  productCode: string;
  action: 'create' | 'update' | 'delete';
  changes: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];
  userId?: string;
  userName?: string;
  timestamp: Date;
  description: string;
  data: Partial<Product>;
}

class ProductHistoryService {
  private history: ProductHistoryEntry[] = [];
  private listeners: ((history: ProductHistoryEntry[]) => void)[] = [];

  // Registrar criação de produto
  recordProductCreated(product: Product, userId?: string, userName?: string): ProductHistoryEntry {
    const entry: ProductHistoryEntry = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productCode: product.code,
      action: 'create',
      changes: [
        { field: 'code', newValue: product.code },
        { field: 'description', newValue: product.description },
        { field: 'category', newValue: product.category },
        { field: 'ean', newValue: product.ean },
        { field: 'family', newValue: product.family },
        { field: 'businessUnit', newValue: product.businessUnit },
        { field: 'technicalParameters', newValue: product.technicalParameters }
      ],
      userId,
      userName,
      timestamp: new Date(),
      description: `Produto "${product.code}" criado`,
      data: product
    };

    this.history.unshift(entry);
    this.notifyListeners();
    this.saveToLocalStorage();

    return entry;
  }

  // Registrar atualização de produto
  recordProductUpdated(
    productId: string, 
    productCode: string, 
    oldData: Partial<Product>, 
    newData: Partial<Product>, 
    userId?: string, 
    userName?: string
  ): ProductHistoryEntry {
    const changes: { field: string; oldValue?: any; newValue?: any }[] = [];
    
    // Comparar campos alterados
    const fields = ['code', 'description', 'category', 'ean', 'family', 'businessUnit', 'technicalParameters'] as const;
    
    fields.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes.push({
          field,
          oldValue: oldData[field],
          newValue: newData[field]
        });
      }
    });

    if (changes.length === 0) {
      throw new Error('Nenhuma alteração detectada');
    }

    const entry: ProductHistoryEntry = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      productCode,
      action: 'update',
      changes,
      userId,
      userName,
      timestamp: new Date(),
      description: `Produto "${productCode}" atualizado - ${changes.length} campo(s) alterado(s)`,
      data: newData
    };

    this.history.unshift(entry);
    this.notifyListeners();
    this.saveToLocalStorage();

    return entry;
  }

  // Registrar exclusão de produto
  recordProductDeleted(product: Product, userId?: string, userName?: string): ProductHistoryEntry {
    const entry: ProductHistoryEntry = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productCode: product.code,
      action: 'delete',
      changes: [
        { field: 'status', oldValue: 'active', newValue: 'deleted' }
      ],
      userId,
      userName,
      timestamp: new Date(),
      description: `Produto "${product.code}" excluído`,
      data: product
    };

    this.history.unshift(entry);
    this.notifyListeners();
    this.saveToLocalStorage();

    return entry;
  }

  // Obter histórico de um produto específico
  getProductHistory(productId: string): ProductHistoryEntry[] {
    return this.history.filter(entry => entry.productId === productId);
  }

  // Obter histórico por código do produto
  getProductHistoryByCode(productCode: string): ProductHistoryEntry[] {
    return this.history.filter(entry => entry.productCode === productCode);
  }

  // Obter todas as versões de um produto
  getProductVersions(productId: string): ProductVersion[] {
    const history = this.getProductHistory(productId);
    return history.map((entry, index) => ({
      ...entry,
      version: history.length - index
    }));
  }

  // Obter última versão de um produto
  getLatestVersion(productId: string): ProductHistoryEntry | null {
    const history = this.getProductHistory(productId);
    return history.length > 0 ? history[0] : null;
  }

  // Obter histórico completo
  getAllHistory(): ProductHistoryEntry[] {
    return [...this.history];
  }

  // Obter histórico filtrado por ação
  getHistoryByAction(action: 'create' | 'update' | 'delete'): ProductHistoryEntry[] {
    return this.history.filter(entry => entry.action === action);
  }

  // Obter histórico por usuário
  getHistoryByUser(userId: string): ProductHistoryEntry[] {
    return this.history.filter(entry => entry.userId === userId);
  }

  // Obter histórico por período
  getHistoryByPeriod(startDate: Date, endDate: Date): ProductHistoryEntry[] {
    return this.history.filter(entry => 
      entry.timestamp >= startDate && entry.timestamp <= endDate
    );
  }

  // Buscar no histórico
  searchHistory(query: string): ProductHistoryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.history.filter(entry => 
      entry.productCode.toLowerCase().includes(lowerQuery) ||
      entry.description.toLowerCase().includes(lowerQuery) ||
      entry.userName?.toLowerCase().includes(lowerQuery) ||
      entry.changes.some(change => 
        change.field.toLowerCase().includes(lowerQuery) ||
        String(change.oldValue).toLowerCase().includes(lowerQuery) ||
        String(change.newValue).toLowerCase().includes(lowerQuery)
      )
    );
  }

  // Obter estatísticas do histórico
  getHistoryStats() {
    const total = this.history.length;
    const creates = this.history.filter(h => h.action === 'create').length;
    const updates = this.history.filter(h => h.action === 'update').length;
    const deletes = this.history.filter(h => h.action === 'delete').length;
    
    const uniqueProducts = new Set(this.history.map(h => h.productId)).size;
    const uniqueUsers = new Set(this.history.filter(h => h.userId).map(h => h.userId)).size;

    return {
      total,
      creates,
      updates,
      deletes,
      uniqueProducts,
      uniqueUsers,
      averageChangesPerUpdate: updates > 0 ? 
        this.history
          .filter(h => h.action === 'update')
          .reduce((sum, h) => sum + h.changes.length, 0) / updates : 0
    };
  }

  // Limpar histórico antigo (mais de 90 dias)
  clearOldHistory() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    this.history = this.history.filter(entry => entry.timestamp > ninetyDaysAgo);
    this.notifyListeners();
    this.saveToLocalStorage();
  }

  // Limpar todo o histórico
  clearAllHistory() {
    this.history = [];
    this.notifyListeners();
    this.saveToLocalStorage();
  }

  // Exportar histórico
  exportHistory(): string {
    return JSON.stringify(this.history, null, 2);
  }

  // Importar histórico
  importHistory(historyData: string) {
    try {
      const parsed = JSON.parse(historyData);
      if (Array.isArray(parsed)) {
        this.history = parsed.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        this.notifyListeners();
        this.saveToLocalStorage();
        return true;
      }
    } catch (error) {
      console.error('Erro ao importar histórico:', error);
    }
    return false;
  }

  // Adicionar listener
  addListener(listener: (history: ProductHistoryEntry[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.history]));
  }

  // Salvar no localStorage
  private saveToLocalStorage() {
    try {
      localStorage.setItem('product_history', JSON.stringify(this.history));
    } catch (error) {
      console.error('Erro ao salvar histórico no localStorage:', error);
    }
  }

  // Carregar do localStorage
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('product_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.history = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do localStorage:', error);
    }
  }

  // Inicializar serviço
  init() {
    this.loadFromLocalStorage();
    this.clearOldHistory();
    
    // Limpar histórico antigo a cada dia
    setInterval(() => {
      this.clearOldHistory();
    }, 24 * 60 * 60 * 1000);
  }
}

// Instância singleton
export const productHistoryService = new ProductHistoryService();

// Inicializar automaticamente e disponibilizar no window
if (typeof window !== 'undefined') {
  productHistoryService.init();
  
  // Disponibilizar no window para debug
  (window as any).productHistoryService = productHistoryService;
  
  console.log('🔧 ProductHistoryService inicializado e disponível no window');
}

export default productHistoryService;
