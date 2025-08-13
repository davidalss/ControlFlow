import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Search, Filter, Download, Eye, Edit, Trash2, Plus, TrendingUp, AlertTriangle, Clock, CheckCircle, Camera, Image, X, FileImage } from "lucide-react";
import InspectionWizard from "@/components/inspection/InspectionWizard";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function InspectionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showWizard, setShowWizard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [editingInspection, setEditingInspection] = useState<any>(null);
  const [inspections, setInspections] = useState([
    {
      id: "INS-001",
      product: "Lavadora Pro 3000",
      productCode: "LVP3000",
      eanCode: "7891234567890",
      inspector: "João Silva",
      date: "2025-01-15",
      status: "APROVADO",
      result: "APROVADO",
      defects: 0,
      defectList: [],
      photos: 5,
      videos: 2,
      lotSize: 1000,
      sampleSize: 80,
      observations: "Inspeção realizada com sucesso. Produto aprovado sem defeitos.",
      photosList: [
        { id: 1, url: "/uploads/photo-1755002790709-442517485.png", description: "Foto frontal do produto" },
        { id: 2, url: "/uploads/photo-1755004912949-560841435.png", description: "Foto lateral esquerda" },
        { id: 3, url: "/uploads/photo-1755007110001-370660792.jpg", description: "Foto da embalagem" }
      ]
    },
    {
      id: "INS-002",
      product: "Aspirador Compact",
      productCode: "ASC001",
      eanCode: "7891234567891",
      inspector: "Maria Santos",
      date: "2025-01-14",
      status: "EM ANÁLISE",
      result: "EM ANÁLISE",
      defects: 2,
      defectList: [
        { type: "MAIOR", description: "Raspão na superfície", quantity: 1 },
        { type: "MENOR", description: "Etiqueta mal posicionada", quantity: 1 }
      ],
      photos: 3,
      videos: 1,
      lotSize: 500,
      sampleSize: 50,
      observations: "Encontrados 2 defeitos menores. Aguardando análise do supervisor.",
      photosList: [
        { id: 1, url: "/uploads/photo-1755009560583-302896005.jpg", description: "Defeito identificado" }
      ]
    },
    {
      id: "INS-003",
      product: "Liquidificador Turbo",
      productCode: "LT2000",
      eanCode: "7891234567892",
      inspector: "Pedro Costa",
      date: "2025-01-13",
      status: "REPROVADO",
      result: "REPROVADO",
      defects: 5,
      defectList: [
        { type: "CRÍTICO", description: "Cabo elétrico danificado", quantity: 1 },
        { type: "MAIOR", description: "Motor com ruído anormal", quantity: 2 },
        { type: "MENOR", description: "Imperfeições na superfície", quantity: 2 }
      ],
      photos: 8,
      videos: 3,
      lotSize: 2000,
      sampleSize: 125,
      observations: "Produto reprovado devido a defeitos críticos de segurança.",
      photosList: [
        { id: 1, url: "/uploads/photo-1755009869700-623241185.jpg", description: "Cabo elétrico danificado" },
        { id: 2, url: "/uploads/photo-1755011009783-661858697.jpg", description: "Motor com defeito" }
      ]
    },
    {
      id: "INS-004",
      product: "Microondas Digital",
      productCode: "MD3500",
      eanCode: "7891234567893",
      inspector: "Ana Oliveira",
      date: "2025-01-12",
      status: "APROVADO CONDICIONAL",
      result: "APROVADO CONDICIONAL",
      defects: 1,
      defectList: [
        { type: "MENOR", description: "Pequena marca na porta", quantity: 1 }
      ],
      photos: 4,
      videos: 0,
      lotSize: 800,
      sampleSize: 80,
      observations: "Aprovado condicionalmente. Defeito menor não afeta funcionalidade.",
      photosList: [
        { id: 1, url: "/uploads/photo-1755011053261-992207809.jpg", description: "Marca na porta" }
      ]
    },
    {
      id: "INS-005",
      product: "Forno Elétrico",
      productCode: "FE4500",
      eanCode: "7891234567894",
      inspector: "Carlos Lima",
      date: "2025-01-11",
      status: "APROVADO",
      result: "APROVADO",
      defects: 0,
      defectList: [],
      photos: 6,
      videos: 2,
      lotSize: 1500,
      sampleSize: 125,
      observations: "Inspeção concluída com sucesso. Produto aprovado.",
      photosList: [
        { id: 1, url: "/uploads/photo-1755011065135-163433134.jpg", description: "Foto geral do produto" }
      ]
    }
  ]);

  // Calcular KPIs dinâmicos
  const totalInspections = inspections.length;
  const completedInspections = inspections.filter(i => i.status === 'APROVADO' || i.status === 'REPROVADO' || i.status === 'APROVADO CONDICIONAL').length;
  const approvedInspections = inspections.filter(i => i.result === 'APROVADO').length;
  const rejectedInspections = inspections.filter(i => i.result === 'REPROVADO').length;
  const pendingInspections = inspections.filter(i => i.status === 'EM ANÁLISE').length;
  const approvalRate = completedInspections > 0 ? ((approvedInspections / completedInspections) * 100).toFixed(1) : '0';

  // Filtrar inspeções
  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Aprovado
        </Badge>;
      case 'REPROVADO':
        return <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Reprovado
        </Badge>;
      case 'APROVADO CONDICIONAL':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Aprovado Condicional
        </Badge>;
      case 'EM ANÁLISE':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Em Análise
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'APROVADO':
        return <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Aprovado
        </Badge>;
      case 'REPROVADO':
        return <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Reprovado
        </Badge>;
      case 'APROVADO CONDICIONAL':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Aprovado Condicional
        </Badge>;
      case 'EM ANÁLISE':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Em Análise
        </Badge>;
      default:
        return <Badge>{result}</Badge>;
    }
  };

  const handleViewInspection = (inspection: any) => {
    setSelectedInspection(inspection);
    setShowViewDialog(true);
  };

  const handleEditInspection = (inspection: any) => {
    setEditingInspection({ ...inspection });
    setShowEditDialog(true);
  };

  const handleDeleteInspection = (inspection: any) => {
    if (window.confirm(`Tem certeza que deseja excluir a inspeção ${inspection.id}?`)) {
      setInspections(prev => prev.filter(i => i.id !== inspection.id));
      toast({
        title: "Inspeção excluída",
        description: `Inspeção ${inspection.id} foi removida com sucesso`,
      });
    }
  };

  const handleViewPhotos = (inspection: any) => {
    setSelectedInspection(inspection);
    setShowPhotoDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingInspection) {
      setInspections(prev => prev.map(i => 
        i.id === editingInspection.id ? editingInspection : i
      ));
      setShowEditDialog(false);
      setEditingInspection(null);
      toast({
        title: "Inspeção atualizada",
        description: "Dados da inspeção foram salvos com sucesso",
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Exportar dados",
      description: "Funcionalidade de exportação será implementada em breve",
    });
  };

  const getDefectTypeColor = (type: string) => {
    switch (type) {
      case 'CRÍTICO':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MAIOR':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MENOR':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6 overflow-y-auto pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inspeções de Qualidade</h1>
            <p className="text-gray-600 mt-2">Gerencie e acompanhe todas as inspeções de qualidade do sistema</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                onClick={() => setShowWizard(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Inspeção
              </Button>
            </motion.div>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="border-gray-300 hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Inspeções</p>
                <p className="text-2xl font-bold text-blue-900">{totalInspections}</p>
                <p className="text-xs text-blue-600 mt-1">Este mês</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Aprovadas</p>
                <p className="text-2xl font-bold text-green-900">{approvedInspections}</p>
                <p className="text-xs text-green-600 mt-1">{approvalRate}% taxa</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Reprovadas</p>
                <p className="text-2xl font-bold text-red-900">{rejectedInspections}</p>
                <p className="text-xs text-red-600 mt-1">Rejeitadas</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingInspections}</p>
                <p className="text-xs text-yellow-600 mt-1">Aguardando</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Concluídas</p>
                <p className="text-2xl font-bold text-purple-900">{completedInspections}</p>
                <p className="text-xs text-purple-600 mt-1">Finalizadas</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por produto, código ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="APROVADO">Aprovadas</SelectItem>
                <SelectItem value="REPROVADO">Reprovadas</SelectItem>
                <SelectItem value="APROVADO CONDICIONAL">Aprovadas Condicional</SelectItem>
                <SelectItem value="EM ANÁLISE">Em Análise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-500">
            {filteredInspections.length} de {inspections.length} inspeções
          </div>
        </div>
      </motion.div>

      {/* Inspections Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Inspeções Recentes
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto w-full border rounded-lg">
          <Table className="w-full min-w-[1400px]">
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-32 bg-gray-50 font-semibold text-gray-900 border-r">ID</TableHead>
                <TableHead className="w-64 bg-gray-50 font-semibold text-gray-900 border-r">Produto</TableHead>
                <TableHead className="w-40 bg-gray-50 font-semibold text-gray-900 border-r">Inspetor</TableHead>
                <TableHead className="w-32 bg-gray-50 font-semibold text-gray-900 border-r">Data</TableHead>
                <TableHead className="w-40 bg-gray-50 font-semibold text-gray-900 border-r">Status</TableHead>
                <TableHead className="w-40 bg-gray-50 font-semibold text-gray-900 border-r">Resultado</TableHead>
                <TableHead className="w-48 bg-gray-50 font-semibold text-gray-900 border-r">Defeitos</TableHead>
                <TableHead className="w-40 bg-gray-50 font-semibold text-gray-900 border-r">Amostragem</TableHead>
                <TableHead className="w-32 bg-gray-50 font-semibold text-gray-900 border-r">Mídia</TableHead>
                <TableHead className="w-48 sticky right-0 bg-gray-50 font-semibold text-gray-900 shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInspections.map((inspection, index) => (
                <motion.tr
                  key={inspection.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 border-b border-gray-100"
                >
                  <TableCell className="font-medium text-blue-600 w-32 border-r align-top py-3">{inspection.id}</TableCell>
                  <TableCell className="w-64 border-r align-top py-3">
                    <div>
                      <div className="font-medium text-gray-900 truncate">{inspection.product}</div>
                      <div className="text-sm text-gray-500 truncate">{inspection.productCode}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 w-40 border-r align-top py-3">{inspection.inspector}</TableCell>
                  <TableCell className="text-gray-700 w-32 border-r align-top py-3">{inspection.date}</TableCell>
                  <TableCell className="w-40 border-r align-top py-3">{getStatusBadge(inspection.status)}</TableCell>
                  <TableCell className="w-40 border-r align-top py-3">{getResultBadge(inspection.result)}</TableCell>
                  <TableCell className="w-48 border-r align-top py-3">
                    <div className="space-y-1">
                      <div className={`px-2 py-1 rounded text-xs font-medium text-center ${
                        inspection.defects === 0 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : inspection.defects <= 2 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {inspection.defects} defeito{inspection.defects !== 1 ? 's' : ''}
                      </div>
                      {inspection.defectList.length > 0 && (
                        <div className="text-xs text-gray-500 max-w-32">
                          {inspection.defectList.slice(0, 2).map((defect: any, idx: number) => (
                            <div key={idx} className="truncate">
                              {defect.type}: {defect.description}
                            </div>
                          ))}
                          {inspection.defectList.length > 2 && (
                            <div className="text-gray-400">+{inspection.defectList.length - 2} mais</div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-40 border-r align-top py-3">
                    <div className="text-sm text-gray-600">
                      <div>{inspection.sampleSize}/{inspection.lotSize}</div>
                      <div className="text-xs text-gray-400">
                        {((inspection.sampleSize / inspection.lotSize) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="w-32 border-r align-top py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        📷 {inspection.photos}
                      </span>
                      <span className="flex items-center gap-1">
                        🎥 {inspection.videos}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="w-48 sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.1)] align-top py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewInspection(inspection)}
                        className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-md"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditInspection(inspection)}
                        className="h-9 w-9 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 hover:border-green-300 rounded-md"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewPhotos(inspection)}
                        className="h-9 w-9 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-purple-200 hover:border-purple-300 rounded-md"
                        title="Ver Fotos"
                      >
                        <Image className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteInspection(inspection)}
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-md"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredInspections.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">Nenhuma inspeção encontrada</p>
            <p className="text-sm text-gray-400">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </motion.div>

      {/* View Inspection Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Inspeção - {selectedInspection?.id}</DialogTitle>
            <DialogDescription>
              Informações completas da inspeção de qualidade
            </DialogDescription>
          </DialogHeader>
          {selectedInspection && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Informações do Produto</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Produto:</span>
                      <span className="font-medium">{selectedInspection.product}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Código:</span>
                      <span className="font-medium">{selectedInspection.productCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">EAN:</span>
                      <span className="font-medium">{selectedInspection.eanCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Inspetor:</span>
                      <span className="font-medium">{selectedInspection.inspector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Data:</span>
                      <span className="font-medium">{selectedInspection.date}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Resultados</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      {getStatusBadge(selectedInspection.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Resultado:</span>
                      {getResultBadge(selectedInspection.result)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Defeitos:</span>
                      <span className="font-medium">{selectedInspection.defects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amostragem:</span>
                      <span className="font-medium">{selectedInspection.sampleSize}/{selectedInspection.lotSize}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedInspection.defectList.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Defeitos Identificados</h3>
                  <div className="space-y-2">
                    {selectedInspection.defectList.map((defect: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Badge className={getDefectTypeColor(defect.type)}>
                          {defect.type}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{defect.description}</div>
                          <div className="text-xs text-gray-500">Quantidade: {defect.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedInspection.observations && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Observações</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedInspection.observations}
                  </p>
                </div>
              )}

              {selectedInspection.photosList.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Fotos ({selectedInspection.photosList.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedInspection.photosList.map((photo: any) => (
                      <div key={photo.id} className="relative group">
                        <img 
                          src={photo.url} 
                          alt={photo.description}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs text-center p-2">
                            {photo.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Inspection Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Inspeção - {editingInspection?.id}</DialogTitle>
            <DialogDescription>
              Atualize as informações da inspeção
            </DialogDescription>
          </DialogHeader>
          {editingInspection && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select 
                    value={editingInspection.status} 
                    onValueChange={(value) => setEditingInspection({...editingInspection, status: value, result: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APROVADO">Aprovado</SelectItem>
                      <SelectItem value="REPROVADO">Reprovado</SelectItem>
                      <SelectItem value="APROVADO CONDICIONAL">Aprovado Condicional</SelectItem>
                      <SelectItem value="EM ANÁLISE">Em Análise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Número de Defeitos</label>
                  <Input
                    type="number"
                    value={editingInspection.defects}
                    onChange={(e) => setEditingInspection({...editingInspection, defects: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Observações</label>
                <Textarea
                  value={editingInspection.observations}
                  onChange={(e) => setEditingInspection({...editingInspection, observations: e.target.value})}
                  rows={4}
                  placeholder="Adicione observações sobre a inspeção..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photos Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fotos da Inspeção - {selectedInspection?.id}</DialogTitle>
            <DialogDescription>
              Visualize todas as fotos anexadas a esta inspeção
            </DialogDescription>
          </DialogHeader>
          {selectedInspection && (
            <div className="space-y-4">
              {selectedInspection.photosList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedInspection.photosList.map((photo: any) => (
                    <div key={photo.id} className="space-y-2">
                      <img 
                        src={photo.url} 
                        alt={photo.description}
                        className="w-full h-48 object-cover rounded-lg border shadow-sm"
                      />
                      <div className="text-sm text-gray-600 text-center">
                        {photo.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma foto anexada a esta inspeção</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Inspection Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="h-full overflow-y-auto">
              <InspectionWizard
                onComplete={(inspectionData) => {
                  console.log('Inspection completed:', inspectionData);
                  setShowWizard(false);
                  toast({
                    title: "Inspeção concluída",
                    description: "Inspeção foi salva com sucesso no sistema",
                  });
                }}
                onCancel={() => setShowWizard(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
