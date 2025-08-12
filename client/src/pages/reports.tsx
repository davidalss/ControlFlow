import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('quality');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const qualityData = [
    { month: 'Jan', approvalRate: 95, defectRate: 2.1, costOfQuality: 3.2 },
    { month: 'Fev', approvalRate: 96, defectRate: 1.8, costOfQuality: 2.9 },
    { month: 'Mar', approvalRate: 94, defectRate: 2.3, costOfQuality: 3.5 },
    { month: 'Abr', approvalRate: 97, defectRate: 1.5, costOfQuality: 2.7 },
    { month: 'Mai', approvalRate: 98, defectRate: 1.2, costOfQuality: 2.4 },
    { month: 'Jun', approvalRate: 96, defectRate: 1.9, costOfQuality: 3.1 },
  ];

  const supplierData = [
    { name: 'TechParts Inc.', performance: 92, delivery: 95, quality: 88 },
    { name: 'EuroComponents', performance: 98, delivery: 99, quality: 97 },
    { name: 'LatinMotores', performance: 85, delivery: 88, quality: 82 },
    { name: 'AsianElectronics', performance: 78, delivery: 80, quality: 75 },
  ];

  const defectTypes = [
    { name: 'Design', value: 30, color: '#8884d8' },
    { name: 'Processo', value: 50, color: '#82ca9d' },
    { name: 'Fornecedor', value: 20, color: '#ffc658' },
    { name: 'Manuseio', value: 10, color: '#ff7300' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios de Qualidade</h1>
            <p className="text-gray-600 mt-2">Análise detalhada e insights de qualidade</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Ano</SelectItem>
              </SelectContent>
            </Select>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Report Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex space-x-2"
      >
        {[
          { id: 'quality', label: 'Qualidade Geral', icon: '📊' },
          { id: 'suppliers', label: 'Fornecedores', icon: '🏭' },
          { id: 'defects', label: 'Análise de Defeitos', icon: '🔍' },
          { id: 'trends', label: 'Tendências', icon: '📈' },
        ].map((report) => (
          <motion.div
            key={report.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={selectedReport === report.id ? "default" : "outline"}
              onClick={() => setSelectedReport(report.id)}
              className="flex items-center space-x-2"
            >
              <span>{report.icon}</span>
              <span>{report.label}</span>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* Quality Metrics */}
      {selectedReport === 'quality' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Taxa de Aprovação vs Taxa de Defeitos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="approvalRate" stroke="#8884d8" strokeWidth={3} name="Taxa Aprovação (%)" />
                  <Line type="monotone" dataKey="defectRate" stroke="#82ca9d" strokeWidth={3} name="Taxa Defeitos (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Custo da Qualidade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="costOfQuality" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Custo Qualidade (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Supplier Performance */}
      {selectedReport === 'suppliers' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Performance dos Fornecedores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={supplierData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="performance" fill="#8884d8" name="Performance (%)" />
                  <Bar dataKey="delivery" fill="#82ca9d" name="Entrega (%)" />
                  <Bar dataKey="quality" fill="#ffc658" name="Qualidade (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Defect Analysis */}
      {selectedReport === 'defects' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Distribuição de Defeitos por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={defectTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {defectTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Top 5 Defeitos Mais Frequentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Vazamento', count: 45, percentage: 35 },
                  { name: 'Ruído Excessivo', count: 32, percentage: 25 },
                  { name: 'Falha Elétrica', count: 28, percentage: 22 },
                  { name: 'Acabamento', count: 15, percentage: 12 },
                  { name: 'Emperramento', count: 8, percentage: 6 },
                ].map((defect, index) => (
                  <div key={defect.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full bg-${COLORS[index % COLORS.length]}`}></div>
                      <span className="font-medium">{defect.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{defect.count} ocorrências</span>
                      <span className="text-sm font-medium">{defect.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Trends */}
      {selectedReport === 'trends' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Tendência de Melhoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="approvalRate" stroke="#8884d8" strokeWidth={3} name="Taxa Aprovação (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Redução de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="costOfQuality" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Custo Qualidade (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
