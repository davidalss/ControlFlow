import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  FileText,
  AlertTriangle,
  History,
  Send,
  Edit,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface SGQReview {
  id: string;
  version: string;
  reviewer: string;
  reviewerRole: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  rejectionReason?: string;
  reviewedAt: string;
  documentNumber?: string;
}

export interface InspectionPlan {
  id: string;
  name: string;
  productId: string;
  productName: string;
  status: 'draft' | 'pending_sgq' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  currentVersion: string;
  reviews: SGQReview[];
  documentNumber?: string;
}

interface SGQApprovalWorkflowProps {
  plan: InspectionPlan;
  onStatusChange: (status: string, review: SGQReview) => void;
  onDocumentNumberAssign: (documentNumber: string) => void;
  disabled?: boolean;
}

export default function SGQApprovalWorkflow({
  plan,
  onStatusChange,
  onDocumentNumberAssign,
  disabled = false
}: SGQApprovalWorkflowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalComments, setApprovalComments] = useState('');
  const [documentNumber, setDocumentNumber] = useState(plan.documentNumber || '');

  const isSGQUser = user?.role === 'sgq' || user?.department === 'SGQ';
  const canReview = isSGQUser && plan.status === 'pending_sgq';
  const canAssignDocumentNumber = isSGQUser && !plan.documentNumber;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="outline">Rascunho</Badge>;
      case 'pending_sgq': return <Badge className="bg-yellow-100 text-yellow-800">Aguardando SGQ</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'pending_sgq': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleAssignDocumentNumber = () => {
    if (!documentNumber.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o número do documento.",
        variant: "destructive",
      });
      return;
    }

    onDocumentNumberAssign(documentNumber);
    toast({
      title: "Sucesso",
      description: "Número do documento atribuído com sucesso.",
    });
  };

  const handleApprove = () => {
    if (!approvalComments.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe os comentários de aprovação.",
        variant: "destructive",
      });
      return;
    }

    const newReview: SGQReview = {
      id: Date.now().toString(),
      version: plan.currentVersion,
      reviewer: user?.name || 'Usuário SGQ',
      reviewerRole: 'SGQ',
      status: 'approved',
      comments: approvalComments,
      reviewedAt: new Date().toISOString(),
      documentNumber: plan.documentNumber
    };

    onStatusChange('approved', newReview);
    setShowApproveDialog(false);
    setApprovalComments('');

    toast({
      title: "Aprovado",
      description: "Plano de inspeção aprovado com sucesso.",
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o motivo da rejeição.",
        variant: "destructive",
      });
      return;
    }

    const newReview: SGQReview = {
      id: Date.now().toString(),
      version: plan.currentVersion,
      reviewer: user?.name || 'Usuário SGQ',
      reviewerRole: 'SGQ',
      status: 'rejected',
      rejectionReason: rejectionReason,
      reviewedAt: new Date().toISOString(),
      documentNumber: plan.documentNumber
    };

    onStatusChange('rejected', newReview);
    setShowRejectDialog(false);
    setRejectionReason('');

    toast({
      title: "Rejeitado",
      description: "Plano de inspeção rejeitado. Notificação enviada ao criador.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Status e Informações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Workflow de Aprovação SGQ</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status atual */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(plan.status)}
              <div>
                <p className="font-medium">Status Atual</p>
                <p className="text-sm text-gray-600">Versão {plan.currentVersion}</p>
              </div>
            </div>
            {getStatusBadge(plan.status)}
          </div>

          {/* Informações do plano */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Plano</Label>
              <p className="font-medium">{plan.name}</p>
            </div>
            <div className="space-y-2">
              <Label>Produto</Label>
              <p className="font-medium">{plan.productName}</p>
            </div>
            <div className="space-y-2">
              <Label>Criado por</Label>
              <p className="text-sm text-gray-600">{plan.createdBy}</p>
            </div>
            <div className="space-y-2">
              <Label>Data de Criação</Label>
              <p className="text-sm text-gray-600">{formatDate(plan.createdAt)}</p>
            </div>
          </div>

          {/* Número do documento */}
          {plan.documentNumber && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Número do Documento:</span>
                <Badge variant="outline" className="font-mono">
                  {plan.documentNumber}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações SGQ */}
      {isSGQUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Ações SGQ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Atribuir número do documento */}
            {canAssignDocumentNumber && (
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Atribuir Número do Documento</Label>
                <div className="flex space-x-2">
                  <Input
                    id="documentNumber"
                    placeholder="Ex: INS-2024-001"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    disabled={disabled}
                  />
                  <Button 
                    onClick={handleAssignDocumentNumber}
                    disabled={disabled || !documentNumber.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Atribuir
                  </Button>
                </div>
              </div>
            )}

            {/* Botões de aprovação/rejeição */}
            {canReview && (
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowApproveDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={disabled}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
                <Button
                  onClick={() => setShowRejectDialog(true)}
                  variant="destructive"
                  disabled={disabled}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Histórico de Revisões */}
      {plan.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Histórico de Revisões</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plan.reviews.map((review, index) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {review.status === 'approved' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          Revisão {review.version} - {review.reviewer}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(review.reviewedAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={review.status === 'approved' ? 'default' : 'destructive'}>
                      {review.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </Badge>
                  </div>
                  
                  {review.comments && (
                    <div className="mb-3">
                      <Label className="text-sm font-medium">Comentários:</Label>
                      <p className="text-sm text-gray-700 mt-1">{review.comments}</p>
                    </div>
                  )}
                  
                  {review.rejectionReason && (
                    <div className="mb-3">
                      <Label className="text-sm font-medium text-red-600">Motivo da Rejeição:</Label>
                      <p className="text-sm text-red-700 mt-1">{review.rejectionReason}</p>
                    </div>
                  )}
                  
                  {review.documentNumber && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Documento:</span> {review.documentNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Aprovação */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Aprovar Plano de Inspeção</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Confirme a aprovação do plano de inspeção. Esta ação será registrada no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approvalComments">Comentários de Aprovação</Label>
              <Textarea
                id="approvalComments"
                placeholder="Informe os comentários sobre a aprovação..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              Confirmar Aprovação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Rejeição */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>Rejeitar Plano de Inspeção</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Informe o motivo da rejeição. Uma notificação será enviada ao criador do plano.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Motivo da Rejeição</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Descreva o motivo da rejeição..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
              Confirmar Rejeição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
