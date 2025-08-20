import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Eye, FileText, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export interface ProductDetails {
  id: string;
  code: string;
  description: string;
  ean?: string;
  category: string;
  family?: string;
  businessUnit: 'DIY' | 'TECH' | 'KITCHEN_BEAUTY' | 'MOTOR_COMFORT' | 'N/A';
  technicalParameters?: {
    voltagem?: string;
    familia_grupos?: string;
    peso_bruto?: string;
    tipo_exclusividade?: string;
    origem?: string;
    familia_comercial?: string;
    classificacao_fiscal?: string;
    aliquota_ipi?: number;
    multiplo_pedido?: number;
    dt_implant?: string;
  };
  createdAt: string;
}

interface RelatedData {
  inspectionPlans: Array<{
    id: string;
    planCode: string;
    planName: string;
    status: string;
    version: string;
    createdAt: string;
  }>;
  inspections: Array<{
    id: string;
    inspectionId: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    inspectorName: string;
  }>;
  blocks: Array<{
    id: string;
    quantity: number;
    reason: string;
    status: string;
    createdAt: string;
  }>;
}

interface ProductDetailsDialogProps {
  product: ProductDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const businessUnitLabels: { [key: string]: string } = {
  'DIY': 'DIY',
  'TECH': 'TECH',
  'KITCHEN_BEAUTY': 'Cozinha & Beleza',
  'MOTOR_COMFORT': 'Motores & Conforto',
  'N/A': 'Não Classificado'
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  draft: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  conditionally_approved: 'bg-orange-100 text-orange-800',
  pending_engineering_analysis: 'bg-purple-100 text-purple-800'
};

export default function ProductDetailsDialog({ product, open, onOpenChange }: ProductDetailsDialogProps) {
  const [relatedData, setRelatedData] = useState<RelatedData>({
    inspectionPlans: [],
    inspections: [],
    blocks: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && open) {
      loadRelatedData();
    }
  }, [product, open]);

  const loadRelatedData = async () => {
    if (!product) return;
    
    setLoading(true);
    try {
      // Buscar dados relacionados
      const [plansResponse, inspectionsResponse, blocksResponse] = await Promise.all([
        apiRequest('GET', `/inspection-plans?productId=${product.id}`),
        apiRequest('GET', `/api/inspections?productId=${product.id}`),
        apiRequest('GET', `/api/blocks?productId=${product.id}`)
      ]);

      const plans = await plansResponse.json();
      const inspections = await inspectionsResponse.json();
      const blocks = await blocksResponse.json();

      setRelatedData({
        inspectionPlans: plans || [],
        inspections: inspections || [],
        blocks: blocks || []
      });
    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error);
      // Em caso de erro, manter arrays vazios
      setRelatedData({
        inspectionPlans: [],
        inspections: [],
        blocks: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderTechnicalParameter = (label: string, value: any) => {
    if (!value) return null;
    return (
      <div className="flex justify-between py-2">
        <span className="text-sm font-medium text-gray-600">{label}:</span>
        <span className="text-sm text-gray-900">{value}</span>
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
      case 'pending_engineering_analysis':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'draft':
        return <FileText className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <span>Detalhes do Produto</span>
            <Badge variant="outline" className="text-sm">
              {product.code}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="technical">Parâmetros Técnicos</TabsTrigger>
            <TabsTrigger value="related">Dados Relacionados</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Código</h4>
                    <p className="text-lg font-semibold">{product.code}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">EAN</h4>
                    <p className="text-lg">{product.ean || 'Não informado'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Descrição</h4>
                  <p className="text-lg">{product.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Categoria</h4>
                    <Badge variant="secondary" className="text-sm">
                      {product.category}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Família</h4>
                    <p className="text-sm">{product.family || 'Não informado'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Business Unit</h4>
                    <Badge variant="outline" className="text-sm">
                      {businessUnitLabels[product.businessUnit] || product.businessUnit}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Data de Criação</h4>
                  <p className="text-sm">{formatDate(product.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            {product.technicalParameters && Object.keys(product.technicalParameters).length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parâmetros Técnicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {renderTechnicalParameter('Voltagem', product.technicalParameters.voltagem)}
                    {renderTechnicalParameter('Família (Grupos)', product.technicalParameters.familia_grupos)}
                    {renderTechnicalParameter('Peso Bruto', product.technicalParameters.peso_bruto ? `${product.technicalParameters.peso_bruto} kg` : null)}
                    {renderTechnicalParameter('Tipo de Exclusividade', product.technicalParameters.tipo_exclusividade)}
                    {renderTechnicalParameter('Origem', product.technicalParameters.origem)}
                    {renderTechnicalParameter('Família Comercial', product.technicalParameters.familia_comercial)}
                    {renderTechnicalParameter('Classificação Fiscal', product.technicalParameters.classificacao_fiscal)}
                    {renderTechnicalParameter('Alíquota IPI', product.technicalParameters.aliquota_ipi ? `${product.technicalParameters.aliquota_ipi}%` : null)}
                    {renderTechnicalParameter('Múltiplo do Pedido', product.technicalParameters.multiplo_pedido)}
                    {renderTechnicalParameter('Data de Implantação', product.technicalParameters.dt_implant ? formatDate(product.technicalParameters.dt_implant) : null)}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum parâmetro técnico</h3>
                  <p className="text-gray-600">Este produto não possui parâmetros técnicos cadastrados.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="related" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{relatedData.inspectionPlans.length}</div>
                  <div className="text-sm text-blue-600">Planos de Inspeção</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{relatedData.inspections.length}</div>
                  <div className="text-sm text-green-600">Inspeções Realizadas</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{relatedData.blocks.length}</div>
                  <div className="text-sm text-purple-600">Bloqueios Ativos</div>
                </CardContent>
              </Card>
            </div>

            {/* Planos de Inspeção */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Planos de Inspeção
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Carregando...</p>
                  </div>
                ) : relatedData.inspectionPlans.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Versão</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data Criação</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedData.inspectionPlans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-mono">{plan.planCode}</TableCell>
                          <TableCell>{plan.planName}</TableCell>
                          <TableCell>{plan.version}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[plan.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                              {plan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(plan.createdAt)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Nenhum plano de inspeção encontrado para este produto.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Inspeções Realizadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Inspeções Realizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Carregando...</p>
                  </div>
                ) : relatedData.inspections.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Inspeção</TableHead>
                        <TableHead>Inspetor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Conclusão</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedData.inspections.map((inspection) => (
                        <TableRow key={inspection.id}>
                          <TableCell className="font-mono">{inspection.inspectionId}</TableCell>
                          <TableCell>{inspection.inspectorName}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[inspection.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                              {inspection.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(inspection.startedAt)}</TableCell>
                          <TableCell>{inspection.completedAt ? formatDate(inspection.completedAt) : '-'}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Nenhuma inspeção encontrada para este produto.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bloqueios Ativos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Bloqueios Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Carregando...</p>
                  </div>
                ) : relatedData.blocks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data Bloqueio</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedData.blocks.map((block) => (
                        <TableRow key={block.id}>
                          <TableCell>{block.quantity}</TableCell>
                          <TableCell>{block.reason}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[block.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                              {block.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(block.createdAt)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Nenhum bloqueio ativo encontrado para este produto.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Alterações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 text-center text-gray-500">
                  Histórico de alterações será implementado em breve.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}