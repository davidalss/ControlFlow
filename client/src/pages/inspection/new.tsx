import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import PhotoUpload from "@/components/inspection/photo-upload";
import ParameterInput from "@/components/inspection/parameter-input";
import InspectionPlanModal from "@/components/inspection/plan-modal";
import { DEFECT_TYPES } from "@/lib/constants";

export default function NewInspectionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [productCode, setProductCode] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [inspectionPlan, setInspectionPlan] = useState<any>(null);
  const [acceptanceRecipe, setAcceptanceRecipe] = useState<any>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  const [inspectionData, setInspectionData] = useState({
    technicalParameters: {},
    visualChecks: {
      labels: {
        id: { photos: [], notApplicable: false },
        ean: { photos: [], notApplicable: false },
        dun: { photos: [], notApplicable: false },
        noise: { photos: [], notApplicable: false },
      },
      product: { photos: [], checks: {} },
      packaging: { photos: [], checks: {} },
      manual: { photos: [], checks: {} },
    },
    observations: "",
    defectType: "",
  });

  // Product lookup mutation
  const productLookupMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('GET', `/api/products/code/${code}`);
      return response.json();
    },
    onSuccess: async (product) => {
      setSelectedProduct(product);
      
      // Load inspection plan and acceptance recipe
      const [planResponse, recipeResponse] = await Promise.all([
        apiRequest('GET', `/api/inspection-plans/active/${product.id}`),
        apiRequest('GET', `/api/acceptance-recipes/active/${product.id}`)
      ]);
      
      setInspectionPlan(await planResponse.json());
      setAcceptanceRecipe(await recipeResponse.json());
    },
    onError: () => {
      toast({
        title: "Produto não encontrado",
        description: "Verifique o código do produto e tente novamente",
        variant: "destructive",
      });
    }
  });

  // Create inspection mutation
  const createInspectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/inspections', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inspeção criada com sucesso",
        description: "A inspeção foi salva como rascunho",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
    },
    onError: () => {
      toast({
        title: "Erro ao criar inspeção",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  });

  // Submit inspection mutation
  const submitInspectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/inspections', {
        ...data,
        status: 'pending'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inspeção enviada com sucesso",
        description: "A inspeção está sendo processada automaticamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
    },
    onError: () => {
      toast({
        title: "Erro ao enviar inspeção",
        description: "Verifique todos os campos obrigatórios",
        variant: "destructive",
      });
    }
  });

  const handleProductLookup = () => {
    if (productCode.trim()) {
      productLookupMutation.mutate(productCode.trim());
    }
  };

  const handleSaveAsDraft = () => {
    if (!selectedProduct) return;

    createInspectionMutation.mutate({
      productId: selectedProduct.id,
      planId: inspectionPlan?.id,
      recipeId: acceptanceRecipe?.id,
      serialNumber,
      status: 'draft',
      ...inspectionData
    });
  };

  const handleSubmitInspection = () => {
    if (!selectedProduct || !validateInspection()) return;

    submitInspectionMutation.mutate({
      productId: selectedProduct.id,
      planId: inspectionPlan?.id,
      recipeId: acceptanceRecipe?.id,
      serialNumber,
      status: 'pending',
      ...inspectionData
    });
  };

  const validateInspection = () => {
    // Check required photos for labels
    const requiredLabels = ['id', 'ean'];
    for (const label of requiredLabels) {
      if (!inspectionData.visualChecks.labels[label].notApplicable && 
          inspectionData.visualChecks.labels[label].photos.length < 3) {
        toast({
          title: "Fotos obrigatórias faltando",
          description: `São necessárias pelo menos 3 fotos para a etiqueta ${label.toUpperCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Check product photos
    if (inspectionData.visualChecks.product.photos.length < 3) {
      toast({
        title: "Fotos do produto faltando",
        description: "São necessárias pelo menos 3 fotos do produto",
        variant: "destructive",
      });
      return false;
    }

    // Check technical parameters
    if (acceptanceRecipe?.parameters) {
      for (const [param, config] of Object.entries(acceptanceRecipe.parameters as any)) {
        if (config.required && !inspectionData.technicalParameters[param]) {
          toast({
            title: "Parâmetros técnicos faltando",
            description: `O parâmetro ${param} é obrigatório`,
            variant: "destructive",
          });
          return false;
        }
      }
    }

    return true;
  };

  const currentStep = !selectedProduct ? 0 : 
                     Object.keys(inspectionData.visualChecks.labels).some(label => 
                       inspectionData.visualChecks.labels[label].photos.length > 0) ? 1 : 0;

  return (
    <div className="p-6">
      {/* Product Selection */}
      {!selectedProduct && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Nova Inspeção</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productCode">Código do Produto</Label>
                <Input
                  id="productCode"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="Ex: FW009547"
                  onKeyDown={(e) => e.key === 'Enter' && handleProductLookup()}
                />
              </div>
              <div>
                <Label htmlFor="serialNumber">Número de Série</Label>
                <Input
                  id="serialNumber"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Ex: 230815-142330-A7B9"
                />
              </div>
            </div>

            <Button 
              onClick={handleProductLookup}
              disabled={!productCode.trim() || productLookupMutation.isPending}
              className="mt-4"
            >
              {productLookupMutation.isPending ? "Buscando..." : "Buscar Produto"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Product Information */}
      {selectedProduct && (
        <>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">Nova Inspeção</h2>
                  <p className="text-neutral-600">ID será gerado automaticamente ao salvar</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent">
                  <span className="material-icons mr-1 text-sm">schedule</span>
                  Em Andamento
                </span>
              </div>

              {/* Product Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-lg">
                <div>
                  <Label className="block text-sm font-medium text-neutral-600 mb-1">Código do Produto</Label>
                  <p className="text-sm font-mono text-neutral-800">{selectedProduct.code}</p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-neutral-600 mb-1">Descrição</Label>
                  <p className="text-sm text-neutral-800">{selectedProduct.description}</p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-neutral-600 mb-1">Categoria</Label>
                  <p className="text-sm text-neutral-800">{selectedProduct.category}</p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-neutral-600 mb-1">Unidade de Negócio</Label>
                  <p className="text-sm text-neutral-800">{selectedProduct.businessUnit}</p>
                </div>
              </div>

              {/* Inspection Plan Access */}
              {inspectionPlan && (
                <div className="mt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setShowPlanModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    <span className="material-icons mr-2">description</span>
                    Visualizar Plano de Inspeção Completo
                    <span className="ml-2 text-xs bg-primary/20 px-2 py-1 rounded">
                      v{inspectionPlan.version}
                    </span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inspection Steps Progress */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Progresso da Inspeção</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="material-icons text-sm">check</span>
                  </div>
                  <span className="ml-2 text-sm font-medium text-secondary">Dados Básicos</span>
                </div>
                <div className="w-8 h-0.5 bg-secondary/20"></div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 1 ? 'bg-primary text-white' : 'bg-neutral-300 text-neutral-600'
                  }`}>
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= 1 ? 'text-primary' : 'text-neutral-500'
                  }`}>Testes Visuais</span>
                </div>
                <div className="w-8 h-0.5 bg-neutral-200"></div>
                <div className="flex items-center">
                  <div className="bg-neutral-300 text-neutral-600 w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <span className="ml-2 text-sm text-neutral-500">Testes Funcionais</span>
                </div>
                <div className="w-8 h-0.5 bg-neutral-200"></div>
                <div className="flex items-center">
                  <div className="bg-neutral-300 text-neutral-600 w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">4</span>
                  </div>
                  <span className="ml-2 text-sm text-neutral-500">Parâmetros Técnicos</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Inspection Section */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                <span className="material-icons mr-2 text-primary">visibility</span>
                Testes Visuais
              </h3>

              {/* Etiquetas Verification */}
              <div className="mb-8">
                <h4 className="font-medium text-neutral-800 mb-4">Verificação de Etiquetas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['id', 'ean', 'dun', 'noise'].map((labelType) => (
                    <div key={labelType} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-neutral-700">
                          Etiqueta {labelType.toUpperCase()}
                        </h5>
                        <Label className="flex items-center">
                          <Checkbox
                            checked={inspectionData.visualChecks.labels[labelType].notApplicable}
                            onCheckedChange={(checked) => {
                              setInspectionData(prev => ({
                                ...prev,
                                visualChecks: {
                                  ...prev.visualChecks,
                                  labels: {
                                    ...prev.visualChecks.labels,
                                    [labelType]: {
                                      ...prev.visualChecks.labels[labelType],
                                      notApplicable: checked as boolean
                                    }
                                  }
                                }
                              }));
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-neutral-600">N/A</span>
                        </Label>
                      </div>
                      
                      <PhotoUpload
                        photos={inspectionData.visualChecks.labels[labelType].photos}
                        onPhotosChange={(photos) => {
                          setInspectionData(prev => ({
                            ...prev,
                            visualChecks: {
                              ...prev.visualChecks,
                              labels: {
                                ...prev.visualChecks.labels,
                                [labelType]: {
                                  ...prev.visualChecks.labels[labelType],
                                  photos
                                }
                              }
                            }
                          }));
                        }}
                        disabled={inspectionData.visualChecks.labels[labelType].notApplicable}
                        minPhotos={3}
                        label={`Fotos da etiqueta ${labelType.toUpperCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Visual Verification */}
              <div className="mb-8">
                <h4 className="font-medium text-neutral-800 mb-4">Verificação Visual do Produto</h4>
                <div className="border border-neutral-200 rounded-lg p-4">
                  <p className="text-sm text-neutral-600 mb-4">
                    Verificar acabamento, cor, montagem e integridade geral do produto
                  </p>
                  
                  <PhotoUpload
                    photos={inspectionData.visualChecks.product.photos}
                    onPhotosChange={(photos) => {
                      setInspectionData(prev => ({
                        ...prev,
                        visualChecks: {
                          ...prev.visualChecks,
                          product: {
                            ...prev.visualChecks.product,
                            photos
                          }
                        }
                      }));
                    }}
                    minPhotos={3}
                    label="Fotos do produto"
                    buttonText="Tirar Fotos"
                  />

                  {/* Checklist */}
                  <div className="space-y-3 mt-4">
                    {[
                      { key: 'finishing', label: 'Acabamento conforme especificação' },
                      { key: 'color', label: 'Cor conforme padrão' },
                      { key: 'assembly', label: 'Montagem correta' },
                      { key: 'integrity', label: 'Integridade geral' }
                    ].map((check) => (
                      <Label key={check.key} className="flex items-center">
                        <Checkbox
                          checked={inspectionData.visualChecks.product.checks[check.key] || false}
                          onCheckedChange={(checked) => {
                            setInspectionData(prev => ({
                              ...prev,
                              visualChecks: {
                                ...prev.visualChecks,
                                product: {
                                  ...prev.visualChecks.product,
                                  checks: {
                                    ...prev.visualChecks.product.checks,
                                    [check.key]: checked
                                  }
                                }
                              }
                            }));
                          }}
                          className="mr-3 h-4 w-4"
                        />
                        <span className="text-sm text-neutral-700">{check.label}</span>
                      </Label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical Parameters */}
              {acceptanceRecipe?.parameters && (
                <div className="mb-8">
                  <h4 className="font-medium text-neutral-800 mb-4">Parâmetros Técnicos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(acceptanceRecipe.parameters).map(([param, config]: [string, any]) => (
                      <ParameterInput
                        key={param}
                        parameter={param}
                        config={config}
                        value={inspectionData.technicalParameters[param] || ''}
                        onChange={(value) => {
                          setInspectionData(prev => ({
                            ...prev,
                            technicalParameters: {
                              ...prev.technicalParameters,
                              [param]: value
                            }
                          }));
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Defect Type Selection */}
              <div className="mb-6">
                <Label htmlFor="defectType" className="block text-sm font-medium text-neutral-700 mb-2">
                  Tipo de Defeito (se houver)
                </Label>
                <Select
                  value={inspectionData.defectType}
                  onValueChange={(value) => setInspectionData(prev => ({ ...prev, defectType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de defeito" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum defeito</SelectItem>
                    {DEFECT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Observations */}
              <div className="mb-6">
                <Label htmlFor="observations" className="block text-sm font-medium text-neutral-700 mb-2">
                  Observações
                </Label>
                <Textarea
                  id="observations"
                  value={inspectionData.observations}
                  onChange={(e) => setInspectionData(prev => ({ ...prev, observations: e.target.value }))}
                  rows={4}
                  placeholder="Descreva qualquer observação relevante sobre a inspeção..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  disabled={createInspectionMutation.isPending}
                >
                  {createInspectionMutation.isPending ? "Salvando..." : "Salvar Rascunho"}
                </Button>
                <Button
                  onClick={handleSubmitInspection}
                  disabled={submitInspectionMutation.isPending}
                  className="flex items-center"
                >
                  <span className="material-icons mr-2">send</span>
                  {submitInspectionMutation.isPending ? "Enviando..." : "Enviar Inspeção"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Inspection Plan Modal */}
      {showPlanModal && inspectionPlan && (
        <InspectionPlanModal
          plan={inspectionPlan}
          product={selectedProduct}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </div>
  );
}
