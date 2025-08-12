import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface SPCData {
  timestamp: string;
  value: number;
  ucl: number;
  lcl: number;
  cl: number;
  status: 'in_control' | 'out_of_control' | 'trend' | 'shift';
}

interface ProcessParameter {
  id: string;
  name: string;
  unit: string;
  target: number;
  tolerance: number;
  ucl: number;
  lcl: number;
  cl: number;
}

export default function SPCControlPage() {
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedParameter, setSelectedParameter] = useState('all');
  const [selectedChart, setSelectedChart] = useState('xbar');
  const [timeRange, setTimeRange] = useState('7d');
  const [spcData, setSpcData] = useState<SPCData[]>([]);
  const [processParameters, setProcessParameters] = useState<ProcessParameter[]>([]);

  // Mock data for SPC
  const mockSPCData: SPCData[] = Array.from({ length: 50 }, (_, i) => {
    const baseValue = 100;
    const variation = Math.random() * 10 - 5;
    const value = baseValue + variation;
    const ucl = 105;
    const lcl = 95;
    const cl = 100;
    
    let status: SPCData['status'] = 'in_control';
    if (value > ucl || value < lcl) status = 'out_of_control';
    else if (i > 30 && value > cl + 2) status = 'trend';
    else if (i > 40 && value < cl - 2) status = 'shift';

    return {
      timestamp: new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000).toISOString(),
      value: Math.round(value * 100) / 100,
      ucl,
      lcl,
      cl,
      status,
    };
  });

  const mockParameters: ProcessParameter[] = [
    {
      id: 'pressure',
      name: 'Pressão de Operação',
      unit: 'bar',
      target: 100,
      tolerance: 5,
      ucl: 105,
      lcl: 95,
      cl: 100,
    },
    {
      id: 'temperature',
      name: 'Temperatura',
      unit: '°C',
      target: 25,
      tolerance: 2,
      ucl: 27,
      lcl: 23,
      cl: 25,
    },
    {
      id: 'flow_rate',
      name: 'Taxa de Fluxo',
      unit: 'L/min',
      target: 50,
      tolerance: 3,
      ucl: 53,
      lcl: 47,
      cl: 50,
    },
    {
      id: 'vibration',
      name: 'Vibração',
      unit: 'mm/s',
      target: 2.5,
      tolerance: 0.5,
      ucl: 3.0,
      lcl: 2.0,
      cl: 2.5,
    },
  ];

  useEffect(() => {
    setSpcData(mockSPCData);
    setProcessParameters(mockParameters);
  }, []);

  const getStatusColor = (status: SPCData['status']) => {
    switch (status) {
      case 'in_control': return 'text-green-600';
      case 'out_of_control': return 'text-red-600';
      case 'trend': return 'text-yellow-600';
      case 'shift': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: SPCData['status']) => {
    switch (status) {
      case 'in_control': return <Badge className="bg-green-100 text-green-800">Sob Controle</Badge>;
      case 'out_of_control': return <Badge variant="destructive">Fora de Controle</Badge>;
      case 'trend': return <Badge className="bg-yellow-100 text-yellow-800">Tendência</Badge>;
      case 'shift': return <Badge className="bg-orange-100 text-orange-800">Mudança</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const calculateCP = (data: SPCData[]) => {
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
    const usl = Math.max(...values) + std;
    const lsl = Math.min(...values) - std;
    return (usl - lsl) / (6 * std);
  };

  const calculateCPK = (data: SPCData[]) => {
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
    const usl = Math.max(...values) + std;
    const lsl = Math.min(...values) - std;
    const cpu = (usl - mean) / (3 * std);
    const cpl = (mean - lsl) / (3 * std);
    return Math.min(cpu, cpl);
  };

  const cp = calculateCP(spcData);
  const cpk = calculateCPK(spcData);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Controle Estatístico de Processo (SPC)</h1>
        <div className="flex gap-2">
          <Button variant="outline">Exportar Relatório</Button>
          <Button>Nova Medição</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Produto</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Produtos</SelectItem>
                  <SelectItem value="wl6100">WAP WL 6100 ULTRA</SelectItem>
                  <SelectItem value="wl4000">WAP WL 4000 ULTRA</SelectItem>
                  <SelectItem value="wl2660">WAP WL 2660 TURBO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Parâmetro</Label>
              <Select value={selectedParameter} onValueChange={setSelectedParameter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar parâmetro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Parâmetros</SelectItem>
                  {processParameters.map(param => (
                    <SelectItem key={param.id} value={param.id}>{param.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Gráfico</Label>
              <Select value={selectedChart} onValueChange={setSelectedChart}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xbar">Gráfico X-Barra</SelectItem>
                  <SelectItem value="r">Gráfico R</SelectItem>
                  <SelectItem value="s">Gráfico S</SelectItem>
                  <SelectItem value="individual">Gráfico Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Período</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Último Dia</SelectItem>
                  <SelectItem value="7d">Última Semana</SelectItem>
                  <SelectItem value="30d">Último Mês</SelectItem>
                  <SelectItem value="90d">Últimos 3 Meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SPC Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Controle - {selectedChart.toUpperCase()}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={spcData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: any, name: string) => [
                  value, 
                  name === 'value' ? 'Valor' : 
                  name === 'ucl' ? 'LSC' : 
                  name === 'lcl' ? 'LIC' : 'LM'
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ucl" 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                name="LSC"
              />
              <Line 
                type="monotone" 
                dataKey="cl" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="LM"
              />
              <Line 
                type="monotone" 
                dataKey="lcl" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                name="LIC"
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Valor"
                dot={(props: any) => {
                  const data = spcData[props.payload.index];
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill={data.status === 'out_of_control' ? '#ef4444' : 
                           data.status === 'trend' ? '#f59e0b' : 
                           data.status === 'shift' ? '#f97316' : '#10b981'}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Process Capability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Capabilidade do Processo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>CP (Capabilidade do Processo):</span>
                <Badge variant={cp >= 1.33 ? "default" : cp >= 1.0 ? "secondary" : "destructive"}>
                  {cp.toFixed(2)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>CPK (Capabilidade do Processo Ajustada):</span>
                <Badge variant={cpk >= 1.33 ? "default" : cpk >= 1.0 ? "secondary" : "destructive"}>
                  {cpk.toFixed(2)}
                </Badge>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Interpretação:</strong><br/>
                  CP ≥ 1.33: Processo capaz<br/>
                  1.0 ≤ CP &lt; 1.33: Processo marginalmente capaz<br/>
                  CP &lt; 1.0: Processo incapaz
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Medições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {spcData.slice(-10).reverse().map((data, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-medium">{data.value}</span>
                    <span className="text-gray-500 ml-2">
                      {new Date(data.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {getStatusBadge(data.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistical Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Estatística</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Resumo</TabsTrigger>
              <TabsTrigger value="trends">Tendências</TabsTrigger>
              <TabsTrigger value="violations">Violações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {spcData.length}
                  </div>
                  <div className="text-sm text-gray-600">Total de Medições</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {spcData.filter(d => d.status === 'in_control').length}
                  </div>
                  <div className="text-sm text-gray-600">Sob Controle</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {spcData.filter(d => d.status === 'out_of_control').length}
                  </div>
                  <div className="text-sm text-gray-600">Fora de Controle</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-yellow-600">
                    {spcData.filter(d => d.status === 'trend' || d.status === 'shift').length}
                  </div>
                  <div className="text-sm text-gray-600">Alertas</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={spcData.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="violations">
              <div className="space-y-2">
                {spcData.filter(d => d.status !== 'in_control').map((data, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded bg-red-50">
                    <div>
                      <span className="font-medium">Valor: {data.value}</span>
                      <span className="text-gray-500 ml-4">
                        {new Date(data.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(data.status)}
                      <div className="text-sm text-gray-500">
                        LSC: {data.ucl} | LIC: {data.lcl}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
