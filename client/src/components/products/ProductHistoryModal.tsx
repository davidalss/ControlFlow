import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  History, 
  Search, 
  Download, 
  Trash2, 
  Eye,
  Plus,
  Edit,
  X,
  Calendar,
  User,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductHistoryEntry, productHistoryService } from '@/lib/product-history';
import { Product } from '@/hooks/use-products';
import { cn } from '@/lib/utils';

interface ProductHistoryModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductHistoryModal: React.FC<ProductHistoryModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const [history, setHistory] = useState<ProductHistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ProductHistoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<'all' | 'create' | 'update' | 'delete'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'action'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Carregar histórico quando o produto mudar
  useEffect(() => {
    if (product && isOpen) {
      const productHistory = productHistoryService.getProductHistory(product.id);
      setHistory(productHistory);
      setFilteredHistory(productHistory);
    }
  }, [product, isOpen]);

  // Filtrar e ordenar histórico
  useEffect(() => {
    let filtered = [...history];

    // Filtrar por ação
    if (selectedAction !== 'all') {
      filtered = filtered.filter(entry => entry.action === selectedAction);
    }

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        (entry.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (entry.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        entry.changes.some(change => 
          (change.field?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          String(change.oldValue || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(change.newValue || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'timestamp') {
        comparison = a.timestamp.getTime() - b.timestamp.getTime();
      } else if (sortBy === 'action') {
        comparison = a.action.localeCompare(b.action);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredHistory(filtered);
  }, [history, searchTerm, selectedAction, sortBy, sortOrder]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <Badge variant="default" className="bg-green-100 text-green-800">Criado</Badge>;
      case 'update':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Atualizado</Badge>;
      case 'delete':
        return <Badge variant="default" className="bg-red-100 text-red-800">Excluído</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const exportHistory = () => {
    if (!product) return;
    
    const historyData = productHistoryService.getProductHistory(product.id);
    const exportData = {
      product: {
        id: product.id,
        code: product.code,
        description: product.description
      },
      history: historyData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_produto_${product.code}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (!product) return;
    
    if (confirm('Tem certeza que deseja limpar todo o histórico deste produto? Esta ação não pode ser desfeita.')) {
      // Aqui você pode implementar a lógica para limpar apenas o histórico deste produto
      // Por enquanto, vamos apenas recarregar
      const productHistory = productHistoryService.getProductHistory(product.id);
      setHistory(productHistory);
    }
  };

  const toggleSort = (field: 'timestamp' | 'action') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Histórico de Versões - {product.code}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Filtros e Controles */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-4 flex-1">
              {/* Busca */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar no histórico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por ação */}
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todas as ações</option>
                <option value="create">Criações</option>
                <option value="update">Atualizações</option>
                <option value="delete">Exclusões</option>
              </select>

              {/* Ordenação */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSort('timestamp')}
                  className={cn(
                    "flex items-center space-x-1",
                    sortBy === 'timestamp' && "bg-blue-50 border-blue-200"
                  )}
                >
                  <Calendar className="w-4 h-4" />
                  <ArrowUpDown className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSort('action')}
                  className={cn(
                    "flex items-center space-x-1",
                    sortBy === 'action' && "bg-blue-50 border-blue-200"
                  )}
                >
                  <Eye className="w-4 h-4" />
                  <ArrowUpDown className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportHistory}
                className="flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar</span>
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{history.length}</div>
                <div className="text-gray-500">Total de entradas</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">
                  {history.filter(h => h.action === 'create').length}
                </div>
                <div className="text-gray-500">Criações</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">
                  {history.filter(h => h.action === 'update').length}
                </div>
                <div className="text-gray-500">Atualizações</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">
                  {history.filter(h => h.action === 'delete').length}
                </div>
                <div className="text-gray-500">Exclusões</div>
              </div>
            </div>
          </div>

          {/* Lista de Histórico */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {filteredHistory.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <History className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500">
                      {searchTerm || selectedAction !== 'all' 
                        ? 'Nenhuma entrada encontrada com os filtros aplicados' 
                        : 'Nenhum histórico disponível para este produto'}
                    </p>
                  </motion.div>
                ) : (
                  filteredHistory.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0">
                            {getActionIcon(entry.action)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {entry.description}
                              </h4>
                              {getActionBadge(entry.action)}
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-3">
                              {entry.changes.length > 0 && (
                                <div className="space-y-1">
                                  {entry.changes.map((change, changeIndex) => (
                                    <div key={changeIndex} className="flex items-center space-x-2">
                                      <span className="font-medium text-gray-700">
                                        {change.field}:
                                      </span>
                                      {change.oldValue !== undefined && (
                                        <span className="text-red-600 line-through">
                                          {String(change.oldValue)}
                                        </span>
                                      )}
                                      {change.oldValue !== undefined && change.newValue !== undefined && (
                                        <span className="text-gray-400">→</span>
                                      )}
                                      {change.newValue !== undefined && (
                                        <span className="text-green-600 font-medium">
                                          {String(change.newValue)}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(entry.timestamp)}</span>
                              </div>
                              {entry.userName && (
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>{entry.userName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductHistoryModal;
