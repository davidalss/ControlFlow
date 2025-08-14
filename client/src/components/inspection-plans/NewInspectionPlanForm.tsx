import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Package, 
  Plus, 
  Save, 
  Send, 
  Eye, 
  Edit,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import ProductSelector, { Product } from './ProductSelector';
import SGQApprovalWorkflow, { SGQReview, InspectionPlan } from './SGQApprovalWorkflow';

interface NewInspectionPlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: InspectionPlan) => void;
}

export default function NewInspectionPlanForm({
  isOpen,
  onClose,
  onSave
}: NewInspectionPlanFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [currentPlan, setCurrentPlan] = useState<InspectionPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gerar nome automático do plano quando produto for selecionado
  useEffect(() => {
    if (selectedProduct) {
      const autoName = `PLANO DE INSPEÇÃO - ${selectedProduct.description}`;
      setPlanName(autoName);
    }
  }, [selectedProduct]);

  // Criar plano inicial quando produto for selecionado
  useEffect(() => {
    if (selectedProduct) {
      const newPlan: InspectionPlan = {
        id: Date.now().toString(),
        name: planName || `PLANO DE INSPEÇÃO - ${selectedProduct.description}`,
        productId: selectedProduct.id,
        productName: selectedProduct.description,
        status: 'draft',
        createdBy: user?.name || 'Usuário',
        createdAt: new Date().toISOString(),
        currentVersion: '00',
        reviews: [],
        documentNumber: undefined
      };
      setCurrentPlan(newPlan);
    }
  }, [selectedProduct, planName, user]);

  const handleSaveDraft = async () => {
    if (!currentPlan) return;

    setIsSubmitting(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Rascunho Salvo",
        description: "Plano de inspeção salvo como rascunho.",
      });
      
      onSave(currentPlan);
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar rascunho.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitToSGQ = async () => {
    if (!currentPlan) return;

    if (!description.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe a descrição do plano.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simular envio para SGQ
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedPlan = {
        ...currentPlan,
        status: 'pending_sgq' as const,
        description: description
      };
      
      toast({
        title: "Enviado para SGQ",
        description: "Plano de inspeção enviado para aprovação do SGQ.",
      });
      
      onSave(updatedPlan);
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar para SGQ.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (status: string, review: SGQReview) => {
    if (!currentPlan) return;

    const updatedPlan = {
      ...currentPlan,
      status: status as any,
      reviews: [...currentPlan.reviews, review]
    };

    if (status === 'rejected') {
      // Incrementar versão quando rejeitado
      const currentVersion = parseInt(currentPlan.currentVersion);
      updatedPlan.currentVersion = String(currentVersion + 1).padStart(2, '0');
      updatedPlan.status = 'draft';
    }

    setCurrentPlan(updatedPlan);
  };

  const handleDocumentNumberAssign = (documentNumber: string) => {
    if (!currentPlan) return;

    setCurrentPlan({
      ...currentPlan,
      documentNumber: documentNumber
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="outline">Rascunho</Badge>;
      case 'pending_sgq': return <Badge className="bg-yellow-100 text-yellow-800">Aguardando SGQ</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const canSubmitToSGQ = selectedProduct && planName.trim() && description.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Novo Plano de Inspeção</span>
          </DialogTitle>
          <DialogDescription>
            Crie um novo plano de inspeção selecionando um produto e configurando os parâmetros.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="workflow">Workflow SGQ</TabsTrigger>
            <TabsTrigger value="preview">Visualização</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            {/* Seletor de Produto */}
            <ProductSelector
              onProductSelect={setSelectedProduct}
              selectedProduct={selectedProduct}
            />

            {/* Informações do Plano */}
            {selectedProduct && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Informações do Plano</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="planName">Nome do Plano</Label>
                    <Input
                      id="planName"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="Nome do plano de inspeção"
                    />
                    <p className="text-sm text-gray-600">
                      Nome gerado automaticamente baseado no produto selecionado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva os objetivos e escopo do plano de inspeção..."
                      rows={4}
                    />
                  </div>

                  {/* Informações do Produto Selecionado */}
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <h4 className="font-medium mb-2">Produto Selecionado</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Código:</span>
                        <span className="font-mono">{selectedProduct.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Descrição:</span>
                        <span>{selectedProduct.description}</span>
                      </div>
                      {selectedProduct.ean && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">EAN:</span>
                          <span>{selectedProduct.ean}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categoria:</span>
                        <span>{selectedProduct.category}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            {currentPlan ? (
              <SGQApprovalWorkflow
                plan={currentPlan}
                onStatusChange={handleStatusChange}
                onDocumentNumberAssign={handleDocumentNumberAssign}
                disabled={isSubmitting}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    Selecione um produto primeiro para configurar o workflow SGQ
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {currentPlan ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Visualização do Plano</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Plano</Label>
                      <p className="font-medium">{currentPlan.name}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(currentPlan.status)}
                        <span className="text-sm text-gray-600">
                          Versão {currentPlan.currentVersion}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Produto</Label>
                      <p className="font-medium">{currentPlan.productName}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Criado por</Label>
                      <p className="text-sm text-gray-600">{currentPlan.createdBy}</p>
                    </div>
                  </div>

                  {description && (
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <p className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        {description}
                      </p>
                    </div>
                  )}

                  {currentPlan.documentNumber && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Número do Documento:</span>
                        <Badge variant="outline" className="font-mono">
                          {currentPlan.documentNumber}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {currentPlan.reviews.length > 0 && (
                    <div className="space-y-2">
                      <Label>Histórico de Revisões</Label>
                      <div className="space-y-2">
                        {currentPlan.reviews.map((review) => (
                          <div key={review.id} className="flex items-center space-x-2 text-sm">
                            {review.status === 'approved' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span>
                              {review.reviewer} - {review.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                            </span>
                            <span className="text-gray-500">
                              ({new Date(review.reviewedAt).toLocaleDateString('pt-BR')})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    Configure o plano primeiro para visualizar
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          
          {currentPlan && (
            <>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting || !selectedProduct}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Rascunho
              </Button>
              
              <Button
                onClick={handleSubmitToSGQ}
                disabled={isSubmitting || !canSubmitToSGQ}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar para SGQ
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}