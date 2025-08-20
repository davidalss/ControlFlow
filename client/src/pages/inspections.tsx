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
import { Search, Filter, Download, Eye, Edit, Trash2, Plus, TrendingUp, AlertTriangle, Clock, CheckCircle, Camera, Image, X, FileImage, Loader2 } from "lucide-react";
import InspectionWizard from "@/components/inspection/InspectionWizard";
import InspectionReportsList from "@/components/inspection/InspectionReportsList";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useInspections, type Inspection } from "@/hooks/use-inspections";

export default function InspectionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    inspections,
    loading,
    error,
    operationLoading,
    fetchInspections,
    createInspection,
    updateInspection,
    deleteInspection,
    getInspectionDetails,
  } = useInspections();
  
  const [showWizard, setShowWizard] = useState(false);
  const [showReportsList, setShowReportsList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);


  // Calcular KPIs dinâmicos baseados nos dados reais do Supabase
  const totalInspections = inspections.length;
  const completedInspections = inspections.filter(i => i.status === 'completed' || i.status === 'approved' || i.status === 'rejected').length;
  const approvedInspections = inspections.filter(i => i.inspectorDecision === 'approved').length;
  const rejectedInspections = inspections.filter(i => i.inspectorDecision === 'rejected').length;
  const pendingInspections = inspections.filter(i => i.status === 'in_progress').length;
  const approvalRate = completedInspections > 0 ? ((approvedInspections / completedInspections) * 100).toFixed(1) : '0';

  // Filtrar inspeções
  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspectionCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Aprovado
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Reprovado
        </Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Concluído
        </Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Em Andamento
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Aprovado
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Reprovado
        </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pendente
        </Badge>;
    }
  };

  // Funções CRUD integradas ao Supabase
  
  // 1. Ver inspeção (buscar detalhes do Supabase)
  const handleViewInspection = async (inspection: Inspection) => {
    try {
      const details = await getInspectionDetails(inspection.id);
      if (details) {
        setSelectedInspection(details);
        setShowViewDialog(true);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da inspeção:', error);
    }
  };

  // 2. Editar inspeção
  const handleEditInspection = (inspection: Inspection) => {
    setEditingInspection({ ...inspection });
    setShowEditDialog(true);
  };

  // 3. Salvar edição
  const handleSaveEdit = async () => {
    if (editingInspection) {
      const success = await updateInspection(editingInspection.id, {
        status: editingInspection.status,
        inspectorDecision: editingInspection.inspectorDecision,
        minorDefects: editingInspection.minorDefects,
        majorDefects: editingInspection.majorDefects,
        criticalDefects: editingInspection.criticalDefects,
        totalDefects: editingInspection.totalDefects,
        notes: editingInspection.notes,
      });
      
      if (success) {
        setShowEditDialog(false);
        setEditingInspection(null);
      }
    }
  };

  // 4. Cancelar edição
  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingInspection(null);
  };

  // 5. Deletar inspeção
  const handleDeleteInspection = async (inspection: Inspection) => {
    if (window.confirm(`Tem certeza que deseja excluir a inspeção ${inspection.inspectionCode}?`)) {
      const success = await deleteInspection(inspection.id);
      if (success) {
        // A lista será atualizada automaticamente pelo hook
      }
    }
  };



  const handleViewPhotos = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setShowPhotoDialog(true);
  };

  const handleExportData = () => {
    setShowReportsList(true);
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto inspections-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 inspections-header">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inspeções de Qualidade</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Gerencie e acompanhe todas as inspeções de qualidade do sistema</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 inspections-actions">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg w-full sm:w-auto"
                onClick={() => setShowWizard(true)}
                disabled={operationLoading}
              >
                {operationLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Nova Inspeção
              </Button>
            </motion.div>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Relatórios de Inspeção
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 inspections-stats"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Inspeções</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-900">{totalInspections}</p>
                <p className="text-xs text-blue-600 mt-1">Este mês</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Aprovadas</p>
                <p className="text-xl sm:text-2xl font-bold text-green-900">{approvedInspections}</p>
                <p className="text-xs text-green-600 mt-1">{approvalRate}% taxa</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Reprovadas</p>
                <p className="text-xl sm:text-2xl font-bold text-red-900">{rejectedInspections}</p>
                <p className="text-xs text-red-600 mt-1">Rejeitadas</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pendentes</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-900">{pendingInspections}</p>
                <p className="text-xs text-yellow-600 mt-1">Aguardando</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Concluídas</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">{completedInspections}</p>
                <p className="text-xs text-purple-600 mt-1">Finalizadas</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between inspections-filters">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            <div className="relative flex-1 max-w-md inspections-search">
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
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="approved">Aprovadas</SelectItem>
                <SelectItem value="rejected">Reprovadas</SelectItem>
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
        <div className="overflow-x-auto w-full border rounded-lg table-responsive">
          <Table className="w-full min-w-[1200px] lg:min-w-[1400px]">
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
                  <TableCell className="font-medium text-blue-600 w-32 border-r align-top py-3">{inspection.inspectionCode}</TableCell>
                  <TableCell className="w-64 border-r align-top py-3">
                    <div>
                      <div className="font-medium text-gray-900 truncate">{inspection.productName}</div>
                      <div className="text-sm text-gray-500 truncate">{inspection.productCode}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 w-40 border-r align-top py-3">{inspection.inspectorName}</TableCell>
                  <TableCell className="text-gray-700 w-32 border-r align-top py-3">{new Date(inspection.inspectionDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="w-40 border-r align-top py-3">{getStatusBadge(inspection.status)}</TableCell>
                  <TableCell className="w-40 border-r align-top py-3">{getResultBadge(inspection.inspectorDecision || 'pending')}</TableCell>
                  <TableCell className="w-48 border-r align-top py-3">
                    <div className="space-y-1">
                      <div className={`px-2 py-1 rounded text-xs font-medium text-center ${
                        inspection.totalDefects === 0 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : inspection.totalDefects <= 2 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {inspection.totalDefects} defeito{inspection.totalDefects !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500 max-w-32">
                        <div>Menores: {inspection.minorDefects}</div>
                        <div>Maiores: {inspection.majorDefects}</div>
                        <div>Críticos: {inspection.criticalDefects}</div>
                      </div>
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
                        📷 {inspection.photos?.length || 0}
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
                        disabled={operationLoading}
                      >
                        {operationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditInspection(inspection)}
                        className="h-9 w-9 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 hover:border-green-300 rounded-md"
                        title="Editar"
                        disabled={operationLoading}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewPhotos(inspection)}
                        className="h-9 w-9 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-purple-200 hover:border-purple-300 rounded-md"
                        title="Ver Fotos"
                        disabled={operationLoading}
                      >
                        <Image className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteInspection(inspection)}
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-md"
                        title="Excluir"
                        disabled={operationLoading}
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
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin" />
            </div>
            <p className="text-gray-500">Carregando inspeções...</p>
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">Nenhuma inspeção encontrada</p>
            <p className="text-sm text-gray-400">Tente ajustar os filtros de busca</p>
          </div>
        ) : null}
      </motion.div>

      {/* View Inspection Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="inspection-details-description">
          <DialogHeader>
            <DialogTitle>Detalhes da Inspeção - {selectedInspection?.id}</DialogTitle>
            <DialogDescription id="inspection-details-description">
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
                    <span className="font-medium">{selectedInspection.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Código:</span>
                    <span className="font-medium">{selectedInspection.productCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fornecedor:</span>
                    <span className="font-medium">{selectedInspection.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Inspetor:</span>
                    <span className="font-medium">{selectedInspection.inspectorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data:</span>
                    <span className="font-medium">{new Date(selectedInspection.inspectionDate).toLocaleDateString('pt-BR')}</span>
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
                    {getResultBadge(selectedInspection.inspectorDecision || 'pending')}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Defeitos:</span>
                    <span className="font-medium">{selectedInspection.totalDefects}</span>
                  </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amostragem:</span>
                      <span className="font-medium">{selectedInspection.sampleSize}/{selectedInspection.lotSize}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedInspection.totalDefects > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Defeitos Identificados</h3>
                  <div className="space-y-2">
                    {selectedInspection.minorDefects > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          MENOR
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Defeitos Menores</div>
                          <div className="text-xs text-gray-500">Quantidade: {selectedInspection.minorDefects}</div>
                        </div>
                      </div>
                    )}
                    {selectedInspection.majorDefects > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          MAIOR
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Defeitos Maiores</div>
                          <div className="text-xs text-gray-500">Quantidade: {selectedInspection.majorDefects}</div>
                        </div>
                      </div>
                    )}
                    {selectedInspection.criticalDefects > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          CRÍTICO
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Defeitos Críticos</div>
                          <div className="text-xs text-gray-500">Quantidade: {selectedInspection.criticalDefects}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedInspection.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Observações</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedInspection.notes}
                  </p>
                </div>
              )}

              {selectedInspection.photos && selectedInspection.photos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Fotos ({selectedInspection.photos.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedInspection.photos.map((photo: any, index: number) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo.url || photo} 
                          alt={`Foto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
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
                    onValueChange={(value) => setEditingInspection({...editingInspection, status: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Reprovado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Decisão do Inspetor</label>
                  <Select 
                    value={editingInspection.inspectorDecision || ''} 
                    onValueChange={(value) => setEditingInspection({...editingInspection, inspectorDecision: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Reprovado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Observações</label>
                <Textarea
                  value={editingInspection.notes || ''}
                  onChange={(e) => setEditingInspection({...editingInspection, notes: e.target.value})}
                  rows={4}
                  placeholder="Adicione observações sobre a inspeção..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancelEdit} disabled={operationLoading}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} disabled={operationLoading}>
                  {operationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
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
              {selectedInspection.photos && selectedInspection.photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedInspection.photos.map((photo: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <img 
                        src={photo.url || photo} 
                        alt={`Foto ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border shadow-sm"
                      />
                      <div className="text-sm text-gray-600 text-center">
                        Foto {index + 1}
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
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
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
        </DialogContent>
      </Dialog>



      {/* Inspection Reports List Modal */}
      {showReportsList && (
        <InspectionReportsList
          onClose={() => setShowReportsList(false)}
          onViewReport={(report) => {
            console.log('Visualizando relatório:', report);
            setShowReportsList(false);
            // Aqui você pode implementar a visualização do relatório específico
            toast({
              title: "Visualizando relatório",
              description: `${report.product.code} - ${report.product.description}`,
            });
          }}
        />
      )}
    </div>
  );
}
