import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  FileText, 
  Image, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Tag,
  Camera,
  FileImage,
  Link,
  Copy,
  History
} from "lucide-react";

interface InspectionPlan {
  id: string;
  planCode: string;
  planName: string;
  planType: 'product' | 'parts';
  version: string;
  status: 'active' | 'inactive' | 'draft';
  productName: string;
  productCode: string;
  businessUnit: string;
  inspectionType: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  photos: PlanPhoto[];
  files: PlanFile[];
}

interface PlanPhoto {
  id: string;
  type: 'product' | 'accessory' | 'packaging' | 'label' | 'manual';
  url: string;
  description: string;
  isRequired: boolean;
}

interface PlanFile {
  id: string;
  type: 'label' | 'manual' | 'packaging' | 'artwork' | 'additional';
  url: string;
  name: string;
  description: string;
}

export default function InspectionPlansPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [plans, setPlans] = useState<InspectionPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<InspectionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InspectionPlan | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [businessUnitFilter, setBusinessUnitFilter] = useState('all');

  // Mock data baseado no PCG02.049
  const mockPlans: InspectionPlan[] = [
    {
      id: '1',
      planCode: 'PCG02.049',
      planName: 'Plano de Inspeção - Air Fryer Barbecue',
      planType: 'product',
      version: 'Rev. 01',
      status: 'active',
      productName: 'Air Fryer Barbecue',
      productCode: 'AFB001',
      businessUnit: 'KITCHEN_BEAUTY',
      inspectionType: 'mixed',
      createdBy: 'Engenheiro João Silva',
      approvedBy: 'Coordenador Maria Santos',
      approvedAt: new Date('2024-01-15'),
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15'),
      photos: [
        {
          id: '1',
          type: 'product',
          url: '/uploads/air-fryer-product.jpg',
          description: 'Foto do produto Air Fryer Barbecue',
          isRequired: true
        },
        {
          id: '2',
          type: 'accessory',
          url: '/uploads/air-fryer-accessories.jpg',
          description: 'Acessórios incluídos (cesta, pinças, manual)',
          isRequired: true
        },
        {
          id: '3',
          type: 'packaging',
          url: '/uploads/air-fryer-packaging.jpg',
          description: 'Embalagem do produto',
          isRequired: true
        },
        {
          id: '4',
          type: 'label',
          url: '/uploads/air-fryer-label.jpg',
          description: 'Etiqueta com informações técnicas',
          isRequired: true
        }
      ],
      files: [
        {
          id: '1',
          type: 'label',
          url: '/uploads/air-fryer-label.pdf',
          name: 'Etiqueta Air Fryer.pdf',
          description: 'Arquivo PDF da etiqueta'
        },
        {
          id: '2',
          type: 'manual',
          url: '/uploads/air-fryer-manual.pdf',
          name: 'Manual do Usuário.pdf',
          description: 'Manual de instruções'
        },
        {
          id: '3',
          type: 'packaging',
          url: '/uploads/air-fryer-packaging.pdf',
          name: 'Especificação Embalagem.pdf',
          description: 'Especificações da embalagem'
        }
      ]
    },
    {
      id: '2',
      planCode: 'PCG02.052',
      planName: 'Plano de Inspeção - Torradeira Elétrica',
      planType: 'product',
      version: 'Rev. 02',
      status: 'active',
      productName: 'Torradeira Elétrica Premium',
      productCode: 'TEP002',
      businessUnit: 'KITCHEN_BEAUTY',
      inspectionType: 'functional',
      createdBy: 'Engenheiro Carlos Lima',
      approvedBy: 'Coordenador Ana Costa',
      approvedAt: new Date('2024-01-20'),
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-20'),
      photos: [
        {
          id: '1',
          type: 'product',
          url: '/uploads/toaster-product.jpg',
          description: 'Foto da torradeira elétrica',
          isRequired: true
        },
        {
          id: '2',
          type: 'accessory',
          url: '/uploads/toaster-accessories.jpg',
          description: 'Acessórios da torradeira',
          isRequired: true
        }
      ],
      files: [
        {
          id: '1',
          type: 'label',
          url: '/uploads/toaster-label.pdf',
          name: 'Etiqueta Torradeira.pdf',
          description: 'Arquivo PDF da etiqueta'
        }
      ]
    }
  ];

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setPlans(mockPlans);
      setFilteredPlans(mockPlans);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Aplicar filtros
    let filtered = plans;

    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.planCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(plan => plan.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(plan => plan.planType === typeFilter);
    }

    if (businessUnitFilter !== 'all') {
      filtered = filtered.filter(plan => plan.businessUnit === businessUnitFilter);
    }

    setFilteredPlans(filtered);
  }, [plans, searchTerm, statusFilter, typeFilter, businessUnitFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'product':
        return <Badge className="bg-blue-100 text-blue-800">Produto</Badge>;
      case 'parts':
        return <Badge className="bg-purple-100 text-purple-800">Peças</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleViewPlan = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
    setShowViewDialog(true);
  };

  const handleEditPlan = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
    setShowEditDialog(true);
  };

  const handleDeletePlan = (plan: InspectionPlan) => {
    if (confirm(`Tem certeza que deseja excluir o plano ${plan.planCode}?`)) {
      setPlans(plans.filter(p => p.id !== plan.id));
      toast({
        title: "Plano excluído",
        description: `O plano ${plan.planCode} foi excluído com sucesso.`,
      });
    }
  };

  const canEditPlans = ['admin', 'engineering', 'coordenador', 'analista', 'tecnico', 'p&d'].includes(user?.role || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando planos de inspeção...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos de Inspeção</h1>
          <p className="text-gray-600 mt-2">
            Gerencie os planos de inspeção baseados no documento PCG02.049
          </p>
        </div>
        {canEditPlans && (
          <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Código, nome ou produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="product">Produto</SelectItem>
                  <SelectItem value="parts">Peças</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="businessUnit">Unidade de Negócio</Label>
              <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="DIY">DIY</SelectItem>
                  <SelectItem value="TECH">TECH</SelectItem>
                  <SelectItem value="KITCHEN_BEAUTY">Kitchen & Beauty</SelectItem>
                  <SelectItem value="MOTOR_COMFORT">Motor & Comfort</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Planos */}
      <Card>
        <CardHeader>
          <CardTitle>Planos de Inspeção ({filteredPlans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome do Plano</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.planCode}</TableCell>
                  <TableCell>{plan.planName}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.productName}</div>
                      <div className="text-sm text-gray-500">{plan.productCode}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(plan.planType)}</TableCell>
                  <TableCell>{plan.version}</TableCell>
                  <TableCell>{getStatusBadge(plan.status)}</TableCell>
                  <TableCell>{plan.businessUnit}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPlan(plan)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canEditPlans && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePlan(plan)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Visualização */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedPlan?.planCode} - {selectedPlan?.planName}
            </DialogTitle>
            <DialogDescription>
              Detalhes completos do plano de inspeção
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="photos">Fotos</TabsTrigger>
                <TabsTrigger value="files">Arquivos</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Código do Plano</Label>
                    <p className="text-sm text-gray-600">{selectedPlan.planCode}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Versão</Label>
                    <p className="text-sm text-gray-600">{selectedPlan.version}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Tipo</Label>
                    <p className="text-sm text-gray-600">{getTypeBadge(selectedPlan.planType)}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Status</Label>
                    <p className="text-sm text-gray-600">{getStatusBadge(selectedPlan.status)}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Produto</Label>
                    <p className="text-sm text-gray-600">{selectedPlan.productName}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Código do Produto</Label>
                    <p className="text-sm text-gray-600">{selectedPlan.productCode}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Unidade de Negócio</Label>
                    <p className="text-sm text-gray-600">{selectedPlan.businessUnit}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Tipo de Inspeção</Label>
                    <p className="text-sm text-gray-600">{selectedPlan.inspectionType}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">Criado por</Label>
                  <p className="text-sm text-gray-600">{selectedPlan.createdBy}</p>
                </div>
                
                {selectedPlan.approvedBy && (
                  <div>
                    <Label className="font-medium">Aprovado por</Label>
                    <p className="text-sm text-gray-600">{selectedPlan.approvedBy}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="photos" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedPlan.photos.map((photo) => (
                    <div key={photo.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="w-4 h-4" />
                        <span className="font-medium capitalize">{photo.type}</span>
                        {photo.isRequired && (
                          <Badge className="bg-red-100 text-red-800 text-xs">Obrigatória</Badge>
                        )}
                      </div>
                      <div className="aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">{photo.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="files" className="space-y-4">
                <div className="space-y-2">
                  {selectedPlan.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-600">{file.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <History className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">Versão {selectedPlan.version}</p>
                      <p className="text-sm text-gray-600">
                        Aprovado em {selectedPlan.approvedAt?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Criação/Edição */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        setShowEditDialog(open);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showCreateDialog ? 'Novo Plano de Inspeção' : 'Editar Plano de Inspeção'}
            </DialogTitle>
            <DialogDescription>
              {showCreateDialog 
                ? 'Crie um novo plano baseado no documento PCG02.049' 
                : 'Edite as informações do plano de inspeção'
              }
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="photos">Fotos</TabsTrigger>
              <TabsTrigger value="files">Arquivos</TabsTrigger>
              <TabsTrigger value="steps">Etapas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planCode">Código do Plano</Label>
                  <Input id="planCode" placeholder="Ex: PCG02.049" />
                </div>
                <div>
                  <Label htmlFor="planName">Nome do Plano</Label>
                  <Input id="planName" placeholder="Ex: Plano de Inspeção - Air Fryer Barbecue" />
                </div>
                <div>
                  <Label htmlFor="planType">Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="parts">Peças</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="productName">Nome do Produto</Label>
                  <Input id="productName" placeholder="Nome do produto" />
                </div>
                <div>
                  <Label htmlFor="productCode">Código do Produto</Label>
                  <Input id="productCode" placeholder="Código do produto" />
                </div>
                <div>
                  <Label htmlFor="businessUnit">Unidade de Negócio</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIY">DIY</SelectItem>
                      <SelectItem value="TECH">TECH</SelectItem>
                      <SelectItem value="KITCHEN_BEAUTY">Kitchen & Beauty</SelectItem>
                      <SelectItem value="MOTOR_COMFORT">Motor & Comfort</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="photos" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Fotos do Produto</h3>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Foto
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Foto do Produto</p>
                    <p className="text-xs text-gray-500">Obrigatória</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Foto dos Acessórios</p>
                    <p className="text-xs text-gray-500">Obrigatória</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Foto da Embalagem</p>
                    <p className="text-xs text-gray-500">Obrigatória</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Foto da Etiqueta</p>
                    <p className="text-xs text-gray-500">Obrigatória</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="files" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Arquivos Complementares</h3>
                  <Button size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload de Arquivo
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Etiqueta do Produto</p>
                      <p className="text-sm text-gray-600">Arquivo PDF da etiqueta</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Manual do Usuário</p>
                      <p className="text-sm text-gray-600">Manual de instruções</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Especificação da Embalagem</p>
                      <p className="text-sm text-gray-600">Especificações da embalagem</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="steps" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Etapas de Inspeção</h3>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Etapa
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">1. Materiais Gráficos</span>
                      <Badge className="bg-orange-100 text-orange-800">30% da amostra</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Verificação da qualidade visual e impressão do produto
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">2. Medições</span>
                      <Badge className="bg-orange-100 text-orange-800">30% da amostra</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Dimensões, peso e tolerâncias conforme especificação
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">3. Parâmetros Elétricos</span>
                      <Badge className="bg-green-100 text-green-800">100% da amostra</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Tensão, corrente, potência e funcionalidade básica
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">4. Etiquetas</span>
                      <Badge className="bg-orange-100 text-orange-800">30% da amostra</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      EAN, DUN, selo ANATEL e fixação das etiquetas
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">5. Integridade</span>
                      <Badge className="bg-orange-100 text-orange-800">30% da amostra</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Embalagem intacta, produto sem danos e componentes completos
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
            }}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast({
                title: "Plano salvo",
                description: "O plano de inspeção foi salvo com sucesso.",
              });
              setShowCreateDialog(false);
              setShowEditDialog(false);
            }}>
              Salvar Plano
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}