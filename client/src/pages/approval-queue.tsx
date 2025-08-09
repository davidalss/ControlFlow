import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ApprovalItem from "@/components/approval/approval-item";

export default function ApprovalQueuePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingApprovals, isLoading } = useQuery({
    queryKey: ['/api/approvals/pending'],
    enabled: user?.role === 'engineering',
  });

  const approvalMutation = useMutation({
    mutationFn: async (approvalData: any) => {
      const response = await apiRequest('POST', '/api/approvals', approvalData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Decisão registrada com sucesso",
        description: "A decisão de aprovação foi registrada",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/approvals/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
    },
    onError: () => {
      toast({
        title: "Erro ao registrar decisão",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  });

  const handleApproval = (inspectionId: string, decision: string, justification: string, evidence?: any) => {
    approvalMutation.mutate({
      inspectionId,
      decision,
      justification,
      evidence
    });
  };

  if (user?.role !== 'engineering') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <span className="material-icons text-6xl text-neutral-300 mb-4 block">block</span>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">Acesso Negado</h3>
            <p className="text-neutral-600">Apenas usuários da Engenharia da Qualidade podem acessar esta página.</p>
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
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 bg-neutral-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Fila de Aprovação - Engenharia da Qualidade</h2>
        <p className="text-neutral-600">Inspeções aguardando aprovação condicional</p>
        {pendingApprovals?.length > 0 && (
          <div className="flex items-center mt-2">
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              {pendingApprovals.length} inspeção(ões) pendente(s)
            </Badge>
          </div>
        )}
      </div>

      {/* Pending Approvals List */}
      <div className="space-y-6">
        {pendingApprovals?.length > 0 ? pendingApprovals.map((inspection: any) => (
          <ApprovalItem
            key={inspection.id}
            inspection={inspection}
            onApproval={handleApproval}
            isProcessing={approvalMutation.isPending}
          />
        )) : (
          <Card>
            <CardContent className="p-12 text-center">
              <span className="material-icons text-6xl text-neutral-300 mb-4 block">approval</span>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">Nenhuma aprovação pendente</h3>
              <p className="text-neutral-600">Todas as inspeções foram processadas automaticamente ou já foram aprovadas.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
