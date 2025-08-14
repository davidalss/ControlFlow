import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Package, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface InspectionReport {
  id: string;
  product: {
    code: string;
    description: string;
    ean: string;
  };
  inspectionType: 'bonification' | 'container';
  quantity?: number;
  fresNf: string;
  inspector: {
    name: string;
  };
  date: string;
  status: 'completed' | 'in_progress' | 'cancelled';
  results: {
    total: number;
    ok: number;
    nok: number;
    critical: number;
    minor: number;
    photos: number;
  };
  samples: any;
  steps: any[];
}

interface InspectionReportsListProps {
  onClose: () => void;
  onViewReport: (report: InspectionReport) => void;
}

export default function InspectionReportsList({ onClose, onViewReport }: InspectionReportsListProps) {
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<InspectionReport[]>([]);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Carregar relatórios (mock data por enquanto)
  useEffect(() => {
    const mockReports: InspectionReport[] = [
      {
        id: '1',
        product: {
          code: 'FW011424',
          description: 'WAP WL 6100 ULTRA 220V',
          ean: '7899831343843'
        },
        inspectionType: 'bonification',
        quantity: 5,
        fresNf: 'NF123456',
        inspector: { name: 'João Silva' },
        date: '2024-01-15',
        status: 'completed',
        results: {
          total: 25,
          ok: 23,
          nok: 2,
          critical: 0,
          minor: 2,
          photos: 8
        },
        samples: {},
        steps: []
      },
      {
        id: '2',
        product: {
          code: 'FW011423',
          description: 'WAP WL 6100 220V',
          ean: '7899831342846'
        },
        inspectionType: 'container',
        fresNf: 'NF123457',
        inspector: { name: 'Maria Santos' },
        date: '2024-01-14',
        status: 'completed',
        results: {
          total: 50,
          ok: 48,
          nok: 2,
          critical: 1,
          minor: 1,
          photos: 15
        },
        samples: {},
        steps: []
      },
      {
        id: '3',
        product: {
          code: 'FW009484',
          description: 'WAP WL 4000 ULTRA 220V',
          ean: '7899831312610'
        },
        inspectionType: 'bonification',
        quantity: 1,
        fresNf: 'NF123458',
        inspector: { name: 'Pedro Costa' },
        date: '2024-01-13',
        status: 'in_progress',
        results: {
          total: 7,
          ok: 5,
          nok: 2,
          critical: 0,
          minor: 2,
          photos: 3
        },
        samples: {},
        steps: []
      }
    ];

    setReports(mockReports);
    setFilteredReports(mockReports);
  }, []);

  // Filtrar relatórios
  useEffect(() => {
    let filtered = reports;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.fresNf.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.inspector.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.inspectionType === typeFilter);
    }

    // Filtro por data
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date(dateFilter);
      
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.date);
        return reportDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, typeFilter, dateFilter]);

  const handleSelectReport = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report.id));
    }
  };

  const handleExportSelected = () => {
    const selectedReportsData = reports.filter(report => selectedReports.includes(report.id));
    
    // Simular exportação
    console.log('Exportando relatórios:', selectedReportsData);
    
    // Aqui você implementaria a lógica real de exportação
    alert(`Exportando ${selectedReportsData.length} relatórios...`);
  };

  const handleExportAll = () => {
    console.log('Exportando todos os relatórios:', filteredReports);
    alert(`Exportando todos os ${filteredReports.length} relatórios...`);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      completed: 'Concluída',
      in_progress: 'Em Andamento',
      cancelled: 'Cancelada'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      bonification: 'bg-blue-100 text-blue-800',
      container: 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      bonification: 'Bonificação',
      container: 'Container'
    };

    return (
      <Badge className={variants[type as keyof typeof variants]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Relatórios de Inspeção</h2>
              <p className="text-sm text-gray-600">Visualize e exporte relatórios de inspeções</p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Código, produto, FRES/NF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="bonification">Bonificação</SelectItem>
                  <SelectItem value="container">Container</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setDateFilter('all');
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  {selectedReports.length} de {filteredReports.length} selecionados
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportSelected}
                disabled={selectedReports.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Selecionados
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportAll}
                disabled={filteredReports.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Todos
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Relatórios */}
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum relatório encontrado</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredReports.map((report) => (
                <div key={report.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedReports.includes(report.id)}
                        onCheckedChange={() => handleSelectReport(report.id)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {report.product.code} - {report.product.description}
                          </h3>
                          {getStatusBadge(report.status)}
                          {getTypeBadge(report.inspectionType)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>FRES/NF: {report.fresNf}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{report.inspector.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(report.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            <span>
                              {report.results.ok} OK / {report.results.nok} N/OK 
                              ({report.results.photos} fotos)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewReport(report)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('Exportando relatório:', report);
                          alert('Exportando relatório...');
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
