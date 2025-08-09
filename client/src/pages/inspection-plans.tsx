import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PlanForm from "@/components/inspection-plans/plan-form";
import InspectionPlanModal from "@/components/inspection/plan-modal";

export default function InspectionPlansPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<any>(null);

  const { data: inspectionPlans, isLoading } = useQuery({
    queryKey: ['/api/inspection-plans'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const response = await apiRequest('POST', '/api/inspection-plans', planData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Plano de inspeção criado com sucesso",
        description: "O plano foi adicionado ao sistema",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inspection-plans'] });
      setShowCreateDialog(false);
    },
    onError: () => {
      toast({
        title: "Erro ao criar plano de inspeção",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  });

  const filteredPlans = inspectionPlans?.filter((plan: any) => {
    const matchesSearch = !searchTerm || 
      plan.product?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.product?.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.version.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProduct = !selectedProduct || plan.productId === selectedProduct;

    return matchesSearch && matchesProduct;
  }) || [];

  const canCreatePlans = user?.role === 'engineering' || user?.role === 'manager';

  if (user?.role !== 'engineering' && user?.role !== 'manager') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <span className="material-icons text-6xl text-neutral-300 mb-4 block">block</span>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">Acesso Negado</h3>
            <p className="text-neutral-600">Apenas usuários da Engenharia da Qualidade e Gestores podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Planos de Inspeção</h2>
          <p className="text-neutral-600">Gerenciamento dos planos de inspeção por produto</p>
        </div>
        {canCreatePlans && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <span className="material-icons mr-2">add_circle</span>
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Plano de Inspeção</DialogTitle>
              </DialogHeader>
              <PlanForm
                products={products || []}
                onSubmit={(data) => createPlanMutation.mutate(data)}
                onCancel={() => setShowCreateDialog(false)}
                isLoading={createPlanMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por produto, código ou versão..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="sm:w-64">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os produtos</SelectItem>
                  {products?.map((product: any) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.code} - {product.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlans.length > 0 ? filteredPlans.map((plan: any) => (
          <Card key={plan.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                    {plan.product?.code}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-2">
                    {plan.product?.description}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      Versão {plan.version}
                    </Badge>
                    {plan.isActive && (
                      <Badge variant="default" className="bg-secondary text-white">
                        Ativo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Plan Summary */}
              <div className="mb-4 space-y-2">
                {plan.steps && plan.steps.length > 0 && (
                  <div className="flex items-center text-sm text-neutral-600">
                    <span className="material-icons mr-2 text-sm">list_alt</span>
                    {plan.steps.length} etapa(s) definida(s)
                  </div>
                )}
                {plan.requiredParameters && Object.keys(plan.requiredParameters).length > 0 && (
                  <div className="flex items-center text-sm text-neutral-600">
                    <span className="material-icons mr-2 text-sm">science</span>
                    {Object.keys(plan.requiredParameters).length} parâmetro(s) obrigatório(s)
                  </div>
                )}
                {plan.checklists && plan.checklists.length > 0 && (
                  <div className="flex items-center text-sm text-neutral-600">
                    <span className="material-icons mr-2 text-sm">checklist</span>
                    {plan.checklists.length} checklist(s) definida(s)
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setViewingPlan(plan)}
                >
                  <span className="material-icons mr-1 text-sm">visibility</span>
                  Visualizar
                </Button>
                {canCreatePlans && (
                  <Button variant="outline" size="sm">
                    <span className="material-icons text-sm">edit</span>
                  </Button>
                )}
                {canCreatePlans && !plan.isActive && (
                  <Button variant="outline" size="sm" className="text-secondary">
                    <span className="material-icons text-sm">check_circle</span>
                  </Button>
                )}
              </div>

              {/* Creation Date */}
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>Criado em: {new Date(plan.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span>BU: {plan.product?.businessUnit}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <span className="material-icons text-6xl text-neutral-300 mb-4 block">description</span>
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  {searchTerm || selectedProduct ? 'Nenhum plano encontrado' : 'Nenhum plano de inspeção cadastrado'}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {searchTerm || selectedProduct 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Comece criando planos de inspeção para os produtos'
                  }
                </p>
                {canCreatePlans && !searchTerm && !selectedProduct && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <span className="material-icons mr-2">add_circle</span>
                    Criar Primeiro Plano
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {inspectionPlans?.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-neutral-600">
                  Total de planos: <span className="font-medium">{inspectionPlans.length}</span>
                </span>
                <span className="text-neutral-600">
                  Ativos: <span className="font-medium">{inspectionPlans.filter((p: any) => p.isActive).length}</span>
                </span>
                <span className="text-neutral-600">
                  Filtrados: <span className="font-medium">{filteredPlans.length}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Plan Modal */}
      {viewingPlan && (
        <InspectionPlanModal
          plan={viewingPlan}
          product={viewingPlan.product}
          onClose={() => setViewingPlan(null)}
        />
      )}
    </div>
  );
}
