import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from "@/hooks/use-theme";

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dados fictícios para o dashboard
  const qualityMetrics = {
    overall: {
      approvalRate: 96.8,
      defectRate: 3.2,
      costOfQuality: 2.8,
      supplierPerformance: 88.3
    },
    trends: [
      { month: 'Jan', approval: 94, defects: 4.2, cost: 3.1 },
      { month: 'Fev', approval: 95, defects: 3.8, cost: 2.9 },
      { month: 'Mar', approval: 96, defects: 3.5, cost: 2.7 },
      { month: 'Abr', approval: 97, defects: 3.2, cost: 2.5 },
      { month: 'Mai', approval: 96, defects: 3.0, cost: 2.3 },
      { month: 'Jun', approval: 97, defects: 2.8, cost: 2.1 },
    ],
    defects: [
      { name: 'Design', value: 30, color: '#8884d8' },
      { name: 'Processo', value: 50, color: '#82ca9d' },
      { name: 'Fornecedor', value: 20, color: '#ffc658' },
    ],
    suppliers: [
      { name: 'TechParts Inc.', performance: 92, delivery: 95 },
      { name: 'EuroComponents', performance: 98, delivery: 99 },
      { name: 'LatinMotores', performance: 85, delivery: 88 },
      { name: 'AsianElectronics', performance: 78, delivery: 80 },
    ]
  };

  const recentActivities = [
    { id: 1, type: 'inspection', message: 'Inspeção concluída - Lavadora Pro 3000', time: '2 min atrás', status: 'success' },
    { id: 2, type: 'alert', message: 'Defeito crítico detectado - Aspirador Compact', time: '15 min atrás', status: 'warning' },
    { id: 3, type: 'supplier', message: 'Fornecedor TechParts Inc. atualizado', time: '1 hora atrás', status: 'info' },
    { id: 4, type: 'report', message: 'Relatório mensal gerado automaticamente', time: '2 horas atrás', status: 'success' },
  ];

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'inspection': return '🔍';
      case 'alert': return '⚠️';
      case 'supplier': return '🏭';
      case 'report': return '📊';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header com Relógio Digital */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
                  <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-primary-light shadow-2xl">
                <h1 className="text-title-primary mb-2">QualiHub – Plataforma Completa para Gestão da Qualidade</h1>
      <p className="text-body text-primary-light mb-4">Controle e Inovação na Gestão da Qualidade</p>
                      <div className="text-3xl font-mono font-bold text-primary-light">
            {currentTime.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
                      <div className="text-lg text-blue-200 mt-2">
              {currentTime.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="mt-4 flex items-center justify-center space-x-2">
                             <div className="flex items-center space-x-1 text-primary-light text-caption">
                <span>🌓</span>
                <span>Tema: {theme === 'light' ? 'Claro' : 'Escuro'}</span>
              </div>
          </div>
        </div>
      </motion.div>

      {/* KPIs Principais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Taxa de Aprovação</p>
                  <p className="text-3xl font-bold text-green-900">{qualityMetrics.overall.approvalRate}%</p>
                  <p className="text-xs text-green-700">Meta: 95%</p>
                </div>
                <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
      </div>
        </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Taxa de Defeitos</p>
                  <p className="text-3xl font-bold text-red-900">{qualityMetrics.overall.defectRate}%</p>
                  <p className="text-xs text-red-700">Meta: &lt; 5%</p>
                </div>
                <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Custo da Qualidade</p>
                  <p className="text-3xl font-bold text-blue-900">{qualityMetrics.overall.costOfQuality}%</p>
                  <p className="text-xs text-blue-700">Meta: &lt; 3%</p>
                    </div>
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Performance Fornecedores</p>
                  <p className="text-3xl font-bold text-purple-900">{qualityMetrics.overall.supplierPerformance}%</p>
                  <p className="text-xs text-purple-700">Meta: 90%</p>
                    </div>
                <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Gráficos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="shadow-xl">
                <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Tendência de Qualidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
              <LineChart data={qualityMetrics.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                <Line type="monotone" dataKey="approval" stroke="#10b981" strokeWidth={3} name="Taxa Aprovação (%)" />
                <Line type="monotone" dataKey="defects" stroke="#ef4444" strokeWidth={3} name="Taxa Defeitos (%)" />
              </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

        <Card className="shadow-xl">
                <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Distribuição de Defeitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                  data={qualityMetrics.defects}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                  {qualityMetrics.defects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
      </motion.div>

      {/* Performance dos Fornecedores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Card className="shadow-xl">
                <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Performance dos Fornecedores</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
              <BarChart data={qualityMetrics.suppliers}>
                      <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                <Bar dataKey="performance" fill="#3b82f6" name="Performance (%)" />
                <Bar dataKey="delivery" fill="#10b981" name="Entrega (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
      </motion.div>

      {/* Atividades Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="shadow-xl">
                <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-2xl">{getStatusIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                  <Badge className={`${getStatusColor(activity.status)} bg-opacity-10`}>
                    {activity.status}
                  </Badge>
                </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

        <Card className="shadow-xl">
                <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="w-full h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🔍</div>
                    <div className="text-sm">Nova Inspeção</div>
                        </div>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="w-full h-20 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl mb-1">📊</div>
                    <div className="text-sm">Relatórios</div>
                        </div>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="w-full h-20 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🏭</div>
                    <div className="text-sm">Fornecedores</div>
                      </div>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="w-full h-20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl mb-1">⚙️</div>
                    <div className="text-sm">Configurações</div>
                  </div>
                </Button>
              </motion.div>
            </div>
            </CardContent>
          </Card>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="text-center py-8"
      >
        <p className="text-gray-500 text-sm">
          © 2025 ControlFlow - Sistema de Gestão da Qualidade WAP & WAAW
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Dados atualizados em tempo real • Última atualização: {currentTime.toLocaleTimeString('pt-BR')}
        </p>
      </motion.div>
    </div>
  );
}