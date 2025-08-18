import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Target,
  BarChart3,
  Activity,
  Shield,
  Award,
  Zap
} from 'lucide-react';

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
      { name: 'Design', value: 30, color: '#78716c' },
      { name: 'Processo', value: 50, color: '#a8a29e' },
      { name: 'Fornecedor', value: 20, color: '#d6d3d1' },
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 dark:from-stone-900 dark:via-stone-800 dark:to-stone-700 p-6">
      {/* Header com Relógio Digital */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <div className="bg-gradient-to-r from-stone-600 via-stone-700 to-stone-800 dark:from-stone-700 dark:via-stone-800 dark:to-stone-900 rounded-2xl p-8 text-white shadow-2xl border border-stone-500/20">
          <h1 className="text-3xl font-bold mb-2 text-stone-100">
            Enso – Plataforma Completa para Perfeição e Melhoria Contínua
          </h1>
          <p className="text-stone-300 mb-4 text-lg">
            Controle e Inovação na Gestão da Qualidade
          </p>
          <div className="text-4xl font-mono font-bold text-stone-200 mb-2">
            {currentTime.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <div className="text-lg text-stone-400">
            {currentTime.toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </motion.div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Taxa de Aprovação</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {qualityMetrics.overall.approvalRate}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+2.1%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Taxa de Defeitos</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {qualityMetrics.overall.defectRate}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600">-0.8%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Custo da Qualidade</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {qualityMetrics.overall.costOfQuality}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-sm text-blue-600">-0.3%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Performance Fornecedores</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {qualityMetrics.overall.supplierPerformance}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                <span className="text-sm text-purple-600">+1.2%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Tendências */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-stone-900 dark:text-stone-100 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-stone-600 dark:text-stone-400" />
                Tendências de Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={qualityMetrics.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
                  <XAxis dataKey="month" stroke="#78716c" />
                  <YAxis stroke="#78716c" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1c1917' : '#fafaf9',
                      border: '1px solid #d6d3d1',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="approval" 
                    stroke="#059669" 
                    strokeWidth={2}
                    name="Taxa de Aprovação (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="defects" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    name="Taxa de Defeitos (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Atividades Recentes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-stone-900 dark:text-stone-100 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-stone-600 dark:text-stone-400" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600"
                  >
                    <div className="text-2xl">{getStatusIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {activity.message}
                      </p>
                      <p className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráfico de Pizza - Distribuição de Defeitos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-6"
      >
        <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-stone-200 dark:border-stone-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-stone-900 dark:text-stone-100 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-stone-600 dark:text-stone-400" />
              Distribuição de Defeitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={qualityMetrics.defects}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {qualityMetrics.defects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1c1917' : '#fafaf9',
                    border: '1px solid #d6d3d1',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}