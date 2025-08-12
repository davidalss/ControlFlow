import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface Supplier {
  id: string;
  code: string;
  name: string;
  country: string;
  category: string;
  status: 'active' | 'suspended' | 'under_review' | 'blacklisted';
  rating: number;
  performance: {
    quality: number;
    delivery: number;
    cost: number;
    communication: number;
    technical: number;
  };
  metrics: {
    defectRate: number;
    onTimeDelivery: number;
    costVariance: number;
    responseTime: number;
    auditScore: number;
  };
  lastAudit: string;
  nextAudit: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface SupplierAudit {
  id: string;
  supplierId: string;
  auditDate: string;
  auditor: string;
  score: number;
  findings: string[];
  recommendations: string[];
  status: 'passed' | 'failed' | 'conditional';
  nextAuditDate: string;
}

export default function SupplierManagementPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [audits, setAudits] = useState<SupplierAudit[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data
  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      code: 'SUP001',
      name: 'TechParts Inc.',
      country: 'China',
      category: 'Componentes Eletrônicos',
      status: 'active',
      rating: 4.2,
      performance: {
        quality: 92,
        delivery: 88,
        cost: 85,
        communication: 90,
        technical: 87,
      },
      metrics: {
        defectRate: 2.1,
        onTimeDelivery: 94.5,
        costVariance: -3.2,
        responseTime: 2.5,
        auditScore: 88,
      },
      lastAudit: '2024-01-15',
      nextAudit: '2024-07-15',
      contactPerson: 'Zhang Wei',
      email: 'zhang.wei@techparts.com',
      phone: '+86 138 0013 8000',
    },
    {
      id: '2',
      code: 'SUP002',
      name: 'EuroComponents GmbH',
      country: 'Alemanha',
      category: 'Motores e Bombas',
      status: 'active',
      rating: 4.8,
      performance: {
        quality: 98,
        delivery: 96,
        cost: 78,
        communication: 95,
        technical: 92,
      },
      metrics: {
        defectRate: 0.8,
        onTimeDelivery: 98.2,
        costVariance: 5.1,
        responseTime: 1.2,
        auditScore: 95,
      },
      lastAudit: '2024-02-20',
      nextAudit: '2024-08-20',
      contactPerson: 'Hans Mueller',
      email: 'h.mueller@eurocomponents.de',
      phone: '+49 30 1234 5678',
    },
    {
      id: '3',
      code: 'SUP003',
      name: 'LatinMotores Ltda.',
      country: 'Brasil',
      category: 'Componentes Mecânicos',
      status: 'under_review',
      rating: 3.5,
      performance: {
        quality: 85,
        delivery: 82,
        cost: 90,
        communication: 88,
        technical: 80,
      },
      metrics: {
        defectRate: 4.2,
        onTimeDelivery: 87.3,
        costVariance: -8.5,
        responseTime: 4.8,
        auditScore: 75,
      },
      lastAudit: '2024-03-10',
      nextAudit: '2024-06-10',
      contactPerson: 'Carlos Silva',
      email: 'carlos.silva@latinmotores.com.br',
      phone: '+55 11 98765 4321',
    },
    {
      id: '4',
      code: 'SUP004',
      name: 'AsianElectronics Co.',
      country: 'Taiwan',
      category: 'Componentes Eletrônicos',
      status: 'suspended',
      rating: 2.8,
      performance: {
        quality: 72,
        delivery: 68,
        cost: 95,
        communication: 65,
        technical: 70,
      },
      metrics: {
        defectRate: 8.5,
        onTimeDelivery: 72.1,
        costVariance: -15.2,
        responseTime: 8.3,
        auditScore: 62,
      },
      lastAudit: '2024-01-30',
      nextAudit: '2024-04-30',
      contactPerson: 'Chen Ming',
      email: 'c.ming@asianelectronics.tw',
      phone: '+886 2 2345 6789',
    },
  ];

  const mockAudits: SupplierAudit[] = [
    {
      id: '1',
      supplierId: '1',
      auditDate: '2024-01-15',
      auditor: 'João Silva',
      score: 88,
      findings: [
        'Documentação de qualidade incompleta',
        'Falta de treinamento em alguns operadores',
      ],
      recommendations: [
        'Implementar sistema de documentação digital',
        'Programar treinamento de qualidade para equipe',
      ],
      status: 'passed',
      nextAuditDate: '2024-07-15',
    },
    {
      id: '2',
      supplierId: '2',
      auditDate: '2024-02-20',
      auditor: 'Maria Santos',
      score: 95,
      findings: [
        'Processo de controle de qualidade exemplar',
        'Boa documentação e rastreabilidade',
      ],
      recommendations: [
        'Manter padrões atuais',
        'Considerar certificação ISO 9001:2015',
      ],
      status: 'passed',
      nextAuditDate: '2024-08-20',
    },
    {
      id: '3',
      supplierId: '3',
      auditDate: '2024-03-10',
      auditor: 'Pedro Costa',
      score: 75,
      findings: [
        'Falta de controle estatístico de processo',
        'Documentação desatualizada',
        'Equipamentos de medição sem calibração',
      ],
      recommendations: [
        'Implementar SPC em processos críticos',
        'Atualizar documentação técnica',
        'Calibrar equipamentos de medição',
      ],
      status: 'conditional',
      nextAuditDate: '2024-06-10',
    },
  ];

  useEffect(() => {
    setSuppliers(mockSuppliers);
    setAudits(mockAudits);
  }, []);

  const getStatusBadge = (status: Supplier['status']) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'suspended': return <Badge variant="destructive">Suspenso</Badge>;
      case 'under_review': return <Badge className="bg-yellow-100 text-yellow-800">Em Revisão</Badge>;
      case 'blacklisted': return <Badge className="bg-red-100 text-red-800">Lista Negra</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 80) return 'text-blue-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    if (filterStatus !== 'all' && supplier.status !== filterStatus) return false;
    if (filterCategory !== 'all' && supplier.category !== filterCategory) return false;
    return true;
  });

  const selectedSupplierData = suppliers.find(s => s.id === selectedSupplier);
  const supplierAudits = audits.filter(a => a.supplierId === selectedSupplier);

  const performanceData = selectedSupplierData ? [
    { name: 'Qualidade', value: selectedSupplierData.performance.quality },
    { name: 'Entrega', value: selectedSupplierData.performance.delivery },
    { name: 'Custo', value: selectedSupplierData.performance.cost },
    { name: 'Comunicação', value: selectedSupplierData.performance.communication },
    { name: 'Técnico', value: selectedSupplierData.performance.technical },
  ] : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Fornecedores</h1>
        <div className="flex gap-2">
          <Button variant="outline">Exportar Relatório</Button>
          <Button>Novo Fornecedor</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="under_review">Em Revisão</SelectItem>
                  <SelectItem value="blacklisted">Lista Negra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  <SelectItem value="Componentes Eletrônicos">Componentes Eletrônicos</SelectItem>
                  <SelectItem value="Motores e Bombas">Motores e Bombas</SelectItem>
                  <SelectItem value="Componentes Mecânicos">Componentes Mecânicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Buscar</Label>
              <Input placeholder="Nome ou código do fornecedor" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suppliers List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Fornecedores ({filteredSuppliers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredSuppliers.map(supplier => (
                  <div
                    key={supplier.id}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedSupplier === supplier.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSupplier(supplier.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{supplier.name}</h3>
                        <p className="text-sm text-gray-600">{supplier.code}</p>
                        <p className="text-sm text-gray-500">{supplier.country}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(supplier.status)}
                        <div className={`text-lg font-bold ${getRatingColor(supplier.rating)}`}>
                          {supplier.rating.toFixed(1)} ⭐
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Details */}
        <div className="lg:col-span-2">
          {selectedSupplierData ? (
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="audits">Auditorias</TabsTrigger>
                <TabsTrigger value="metrics">Métricas</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Fornecedor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome</Label>
                        <p className="font-medium">{selectedSupplierData.name}</p>
                      </div>
                      <div>
                        <Label>Código</Label>
                        <p className="font-medium">{selectedSupplierData.code}</p>
                      </div>
                      <div>
                        <Label>País</Label>
                        <p>{selectedSupplierData.country}</p>
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <p>{selectedSupplierData.category}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div>{getStatusBadge(selectedSupplierData.status)}</div>
                      </div>
                      <div>
                        <Label>Avaliação</Label>
                        <p className={`text-lg font-bold ${getRatingColor(selectedSupplierData.rating)}`}>
                          {selectedSupplierData.rating.toFixed(1)} ⭐
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contato</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Contato</Label>
                        <p>{selectedSupplierData.contactPerson}</p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p>{selectedSupplierData.email}</p>
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <p>{selectedSupplierData.phone}</p>
                      </div>
                      <div>
                        <Label>Próxima Auditoria</Label>
                        <p>{new Date(selectedSupplierData.nextAudit).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={performanceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Performance"
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedSupplierData.performance).map(([key, value]) => (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="capitalize">{key}</span>
                          <span className={`text-lg font-bold ${getPerformanceColor(value)}`}>
                            {value}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full ${
                              value >= 90 ? 'bg-green-500' :
                              value >= 80 ? 'bg-blue-500' :
                              value >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="audits" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Auditorias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {supplierAudits.map(audit => (
                        <div key={audit.id} className="border rounded p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium">Auditoria {audit.auditDate}</h3>
                              <p className="text-sm text-gray-600">Auditor: {audit.auditor}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={audit.status === 'passed' ? 'default' : audit.status === 'conditional' ? 'secondary' : 'destructive'}>
                                {audit.status === 'passed' ? 'Aprovado' : audit.status === 'conditional' ? 'Condicional' : 'Reprovado'}
                              </Badge>
                              <div className="text-lg font-bold text-blue-600">{audit.score}%</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Achados</Label>
                              <ul className="text-sm text-gray-600 mt-1">
                                {audit.findings.map((finding, index) => (
                                  <li key={index} className="list-disc list-inside">• {finding}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Recomendações</Label>
                              <ul className="text-sm text-gray-600 mt-1">
                                {audit.recommendations.map((rec, index) => (
                                  <li key={index} className="list-disc list-inside">• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Qualidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedSupplierData.metrics.defectRate}%
                        </div>
                        <div className="text-sm text-gray-600">Taxa de Defeitos</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedSupplierData.metrics.onTimeDelivery}%
                        </div>
                        <div className="text-sm text-gray-600">Entrega no Prazo</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedSupplierData.metrics.costVariance}%
                        </div>
                        <div className="text-sm text-gray-600">Variação de Custo</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedSupplierData.metrics.responseTime} dias
                        </div>
                        <div className="text-sm text-gray-600">Tempo de Resposta</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Evolução das Métricas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={[
                        { month: 'Jan', defects: 2.5, delivery: 92, cost: -2.1 },
                        { month: 'Fev', defects: 2.1, delivery: 94, cost: -3.2 },
                        { month: 'Mar', defects: 1.8, delivery: 96, cost: -1.8 },
                        { month: 'Abr', defects: 2.1, delivery: 94.5, cost: -3.2 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="defects" stroke="#ef4444" name="Taxa de Defeitos (%)" />
                        <Line type="monotone" dataKey="delivery" stroke="#10b981" name="Entrega no Prazo (%)" />
                        <Line type="monotone" dataKey="cost" stroke="#3b82f6" name="Variação de Custo (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Selecione um fornecedor para ver os detalhes</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
