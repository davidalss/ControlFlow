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
  BarChart3,
  AlertCircle
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
          total: 125,
          ok: 120,
          nok: 5,
          critical: 1,
          minor: 4,
          photos: 12
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
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.fresNf.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.inspector.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.inspectionType === typeFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, typeFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(filteredReports.map(report => report.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId: string, checked: boolean) => {
    if (checked) {
      setSelectedReports(prev => [...prev, reportId]);
    } else {
      setSelectedReports(prev => prev.filter(id => id !== reportId));
    }
  };

  const handleExportSelected = () => {
    if (selectedReports.length === 0) {
      return;
    }
    
    // Implementar exportação dos relatórios selecionados
    console.log('Exportando relatórios:', selectedReports);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Em Andamento</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'bonification':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Bonificação</Badge>;
      case 'container':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Container</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header com filtros */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col lg:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar relatórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="bonification">Bonificação</SelectItem>
                  <SelectItem value="container">Container</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSelected}
              disabled={selectedReports.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar ({selectedReports.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de relatórios */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Nenhum relatório encontrado</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Checkbox
                        checked={selectedReports.includes(report.id)}
                        onCheckedChange={(checked) => handleSelectReport(report.id, checked as boolean)}
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">
                            {report.product.code} - {report.product.description}
                          </h3>
                          {getStatusBadge(report.status)}
                          {getTypeBadge(report.inspectionType)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">FRES/NF:</span> {report.fresNf}
                          </div>
                          <div>
                            <span className="font-medium">Inspetor:</span> {report.inspector.name}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span> {new Date(report.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Amostras:</span> {report.results.total}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{report.results.ok} OK</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span>{report.results.nok} NOK</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span>{report.results.critical} Críticos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="w-4 h-4 text-blue-500" />
                            <span>{report.results.photos} Fotos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
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
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
