import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Download, 
  Filter, 
  Search, 
  TrendingUp,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TrainingHistory {
  id: string;
  trainingTitle: string;
  category: string;
  completionDate: string;
  score: number;
  status: 'passed' | 'failed' | 'in_progress';
  certificate: string | null;
  duration: string;
  attempts: number;
}

const mockHistory: TrainingHistory[] = [
  {
    id: '1',
    trainingTitle: 'Controle Estatístico de Processo (SPC)',
    category: 'Qualidade',
    completionDate: '2024-02-15',
    score: 85,
    status: 'passed',
    certificate: 'CERT-SPC-2024-001',
    duration: '2h 15min',
    attempts: 1
  },
  {
    id: '2',
    trainingTitle: 'Inspeção de Qualidade Avançada',
    category: 'Inspeção',
    completionDate: '2024-02-10',
    score: 92,
    status: 'passed',
    certificate: 'CERT-INS-2024-002',
    duration: '1h 45min',
    attempts: 1
  },
  {
    id: '3',
    trainingTitle: 'Gestão de Fornecedores',
    category: 'Gestão',
    completionDate: '2024-02-08',
    score: 78,
    status: 'passed',
    certificate: 'CERT-GES-2024-003',
    duration: '3h 10min',
    attempts: 2
  },
  {
    id: '4',
    trainingTitle: 'ISO 9001:2015 - Implementação',
    category: 'Certificação',
    completionDate: '2024-02-05',
    score: 65,
    status: 'failed',
    certificate: null,
    duration: '4h 20min',
    attempts: 2
  },
  {
    id: '5',
    trainingTitle: 'Análise de Causa Raiz',
    category: 'Análise',
    completionDate: '2024-02-01',
    score: 88,
    status: 'passed',
    certificate: 'CERT-ANA-2024-004',
    duration: '2h 05min',
    attempts: 1
  },
  {
    id: '6',
    trainingTitle: 'Auditoria Interna de Qualidade',
    category: 'Auditoria',
    completionDate: '2024-01-28',
    score: 95,
    status: 'passed',
    certificate: 'CERT-AUD-2024-005',
    duration: '2h 30min',
    attempts: 1
  }
];

const statusConfig = {
  passed: { label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { label: 'Reprovado', color: 'bg-red-100 text-red-800', icon: XCircle },
  in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800', icon: Clock }
};

export default function TrainingHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const categories = ['all', 'Qualidade', 'Inspeção', 'Gestão', 'Certificação', 'Análise', 'Auditoria'];

  const filteredHistory = mockHistory.filter(item => {
    const matchesSearch = item.trainingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.certificate?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime();
      case 'score':
        return b.score - a.score;
      case 'title':
        return a.trainingTitle.localeCompare(b.trainingTitle);
      default:
        return 0;
    }
  });

  const stats = {
    total: mockHistory.length,
    passed: mockHistory.filter(item => item.status === 'passed').length,
    failed: mockHistory.filter(item => item.status === 'failed').length,
    averageScore: Math.round(mockHistory.reduce((acc, item) => acc + item.score, 0) / mockHistory.length)
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exportando histórico em ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Histórico de Conclusões</h2>
          <p className="text-slate-600 mt-1">Acompanhe seu progresso nos treinamentos</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total de Treinamentos</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Aprovados</p>
              <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Reprovados</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Média de Notas</p>
              <p className="text-2xl font-bold text-slate-900">{stats.averageScore}%</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar por treinamento ou certificado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="passed">Aprovados</SelectItem>
              <SelectItem value="failed">Reprovados</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'Todas' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Data</SelectItem>
              <SelectItem value="score">Nota</SelectItem>
              <SelectItem value="title">Título</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Histórico Detalhado</h3>
            <p className="text-sm text-slate-600">
              {filteredHistory.length} registro{filteredHistory.length !== 1 ? 's' : ''} encontrado{filteredHistory.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Treinamento</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data de Conclusão</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Certificado</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Tentativas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHistory.map((item) => {
                const status = statusConfig[item.status];
                const StatusIcon = status.icon;
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{item.trainingTitle}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(item.completionDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.score}%</span>
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className={cn(
                              "h-2 rounded-full",
                              item.score >= 80 ? "bg-green-500" : 
                              item.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.certificate ? (
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-mono">{item.certificate}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{item.duration}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.attempts}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum histórico encontrado</h3>
            <p className="text-slate-600">Tente ajustar os filtros ou começar um treinamento.</p>
          </div>
        )}
      </Card>

      {/* Gráfico de Evolução */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Evolução das Notas</h3>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Ver Gráfico Completo
          </Button>
        </div>
        
        <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-slate-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
            <p>Gráfico de evolução será implementado</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
