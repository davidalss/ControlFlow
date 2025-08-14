import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Filter,
  Search,
  Eye,
  PieChart,
  LineChart,
  Activity,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Target,
  Percent,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface TrainingReport {
  id: string;
  title: string;
  category: string;
  totalUsers: number;
  completedUsers: number;
  inProgressUsers: number;
  notStartedUsers: number;
  averageScore: number;
  averageTime: number; // em minutos
  completionRate: number;
  certificateIssued: number;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface UserProgress {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  assignedTrainings: number;
  completedTrainings: number;
  inProgressTrainings: number;
  averageScore: number;
  totalTime: number; // em minutos
  certificates: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'overdue';
}

export default function TrainingReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [reportType, setReportType] = useState('overview');

  // Mock data
  const mockTrainingReports: TrainingReport[] = [
    {
      id: '1',
      title: 'Normas ISO 9001:2015',
      category: 'Normas e Certificações',
      totalUsers: 45,
      completedUsers: 32,
      inProgressUsers: 8,
      notStartedUsers: 5,
      averageScore: 87.5,
      averageTime: 420,
      completionRate: 71.1,
      certificateIssued: 28,
      lastUpdated: '2024-01-20T10:30:00Z',
      trend: 'up',
      trendValue: 12.5
    },
    {
      id: '2',
      title: 'Inspeção de Qualidade',
      category: 'Inspeção e Controle',
      totalUsers: 38,
      completedUsers: 25,
      inProgressUsers: 10,
      notStartedUsers: 3,
      averageScore: 92.3,
      averageTime: 360,
      completionRate: 65.8,
      certificateIssued: 22,
      lastUpdated: '2024-01-19T14:15:00Z',
      trend: 'up',
      trendValue: 8.2
    },
    {
      id: '3',
      title: 'Processos de Qualidade',
      category: 'Processos',
      totalUsers: 52,
      completedUsers: 18,
      inProgressUsers: 15,
      notStartedUsers: 19,
      averageScore: 78.9,
      averageTime: 480,
      completionRate: 34.6,
      certificateIssued: 15,
      lastUpdated: '2024-01-18T09:45:00Z',
      trend: 'down',
      trendValue: 5.3
    }
  ];

  const mockUserProgress: UserProgress[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      role: 'Engenheiro de Qualidade',
      department: 'Qualidade',
      assignedTrainings: 5,
      completedTrainings: 4,
      inProgressTrainings: 1,
      averageScore: 89.2,
      totalTime: 1800,
      certificates: 3,
      lastActivity: '2024-01-20T10:30:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      role: 'Inspetora',
      department: 'Inspeção',
      assignedTrainings: 3,
      completedTrainings: 2,
      inProgressTrainings: 1,
      averageScore: 94.5,
      totalTime: 1200,
      certificates: 2,
      lastActivity: '2024-01-19T14:15:00Z',
      status: 'active'
    },
    {
      id: '3',
      name: 'Carlos Lima',
      email: 'carlos.lima@empresa.com',
      role: 'Técnico',
      department: 'Produção',
      assignedTrainings: 4,
      completedTrainings: 1,
      inProgressTrainings: 2,
      averageScore: 72.8,
      totalTime: 900,
      certificates: 1,
      lastActivity: '2024-01-17T16:20:00Z',
      status: 'overdue'
    }
  ];

  const getStatusBadge = (status: UserProgress['status']) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive': return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTrendIcon = (trend: TrainingReport['trend']) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <div className="w-4 h-4 text-gray-600">—</div>;
      default: return null;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const totalUsers = mockTrainingReports.reduce((acc, report) => acc + report.totalUsers, 0);
  const totalCompleted = mockTrainingReports.reduce((acc, report) => acc + report.completedUsers, 0);
  const totalCertificates = mockTrainingReports.reduce((acc, report) => acc + report.certificateIssued, 0);
  const averageCompletionRate = mockTrainingReports.reduce((acc, report) => acc + report.completionRate, 0) / mockTrainingReports.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Relatórios de Treinamentos</h1>
          <p className="text-gray-600 dark:text-gray-400">Análises e métricas de desempenho dos treinamentos</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="w-full sm:w-48">
                <Label htmlFor="period">Período</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="365">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-48">
                <Label htmlFor="category">Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="Normas e Certificações">Normas e Certificações</SelectItem>
                    <SelectItem value="Inspeção e Controle">Inspeção e Controle</SelectItem>
                    <SelectItem value="Processos">Processos</SelectItem>
                    <SelectItem value="Segurança">Segurança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-48">
                <Label htmlFor="department">Departamento</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os departamentos</SelectItem>
                    <SelectItem value="Qualidade">Qualidade</SelectItem>
                    <SelectItem value="Inspeção">Inspeção</SelectItem>
                    <SelectItem value="Produção">Produção</SelectItem>
                    <SelectItem value="Engenharia">Engenharia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-48">
                <Label htmlFor="reportType">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Visão Geral</SelectItem>
                    <SelectItem value="detailed">Detalhado</SelectItem>
                    <SelectItem value="comparative">Comparativo</SelectItem>
                    <SelectItem value="trends">Tendências</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalUsers}</p>
                <p className="text-xs text-gray-500">Ativos no período</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Treinamentos Concluídos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCompleted}</p>
                <p className="text-xs text-gray-500">
                  {((totalCompleted / totalUsers) * 100).toFixed(1)}% do total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificados Emitidos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCertificates}</p>
                <p className="text-xs text-gray-500">No período selecionado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {averageCompletionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Média geral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatório por Treinamento */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Treinamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Treinamento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Conclusão</TableHead>
                  <TableHead>Nota Média</TableHead>
                  <TableHead>Tempo Médio</TableHead>
                  <TableHead>Certificados</TableHead>
                  <TableHead>Tendência</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTrainingReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.title}</div>
                        <div className="text-sm text-gray-500">
                          Atualizado: {new Date(report.lastUpdated).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{report.totalUsers}</div>
                        <div className="text-gray-500">
                          {report.completedUsers} concluídos • {report.inProgressUsers} em progresso
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${report.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{report.completionRate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.averageScore.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">/100</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatTime(report.averageTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{report.certificateIssued}</div>
                        <div className="text-gray-500">
                          {((report.certificateIssued / report.completedUsers) * 100).toFixed(1)}% dos concluídos
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(report.trend)}
                        <span className={`text-sm font-medium ${
                          report.trend === 'up' ? 'text-green-600' : 
                          report.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {report.trendValue.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Progresso dos Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso dos Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Treinamentos</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Nota Média</TableHead>
                  <TableHead>Tempo Total</TableHead>
                  <TableHead>Certificados</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Atividade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUserProgress.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.role}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{user.assignedTrainings}</div>
                        <div className="text-gray-500">
                          {user.completedTrainings} concluídos • {user.inProgressTrainings} em progresso
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(user.completedTrainings / user.assignedTrainings) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {((user.completedTrainings / user.assignedTrainings) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{user.averageScore.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">/100</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatTime(user.totalTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{user.certificates}</div>
                        <div className="text-gray-500">
                          {((user.certificates / user.completedTrainings) * 100).toFixed(1)}% dos concluídos
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.lastActivity).toLocaleDateString('pt-BR')}
                        <div className="text-gray-500">
                          {new Date(user.lastActivity).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Gráfico de Pizza</p>
                <p className="text-sm">Distribuição de treinamentos por categoria</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução da Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <LineChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Gráfico de Linha</p>
                <p className="text-sm">Evolução da taxa de conclusão ao longo do tempo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
