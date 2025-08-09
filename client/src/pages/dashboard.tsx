import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
  });

  const { data: recentInspections } = useQuery({
    queryKey: ['/api/inspections'],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Dashboard de Qualidade</h2>
        <p className="text-neutral-600">Visão geral das inspeções e indicadores</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Inspections Today */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center">
                  <span className="material-icons">assignment_turned_in</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Inspeções Hoje</p>
                <p className="text-2xl font-bold text-neutral-800">{metrics?.inspectionsToday || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-secondary/10 text-secondary w-12 h-12 rounded-lg flex items-center justify-center">
                  <span className="material-icons">check_circle</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-neutral-800">{metrics?.approvalRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-accent/10 text-accent w-12 h-12 rounded-lg flex items-center justify-center">
                  <span className="material-icons">pending</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Aguardando Aprovação</p>
                <p className="text-2xl font-bold text-neutral-800">{metrics?.pendingApprovals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blocked Items */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-red-100 text-red-600 w-12 h-12 rounded-lg flex items-center justify-center">
                  <span className="material-icons">block</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Itens Bloqueados</p>
                <p className="text-2xl font-bold text-neutral-800">{metrics?.blockedItems || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Inspections and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inspections */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-800">Inspeções Recentes</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentInspections?.slice(0, 3).map((inspection: any) => (
                  <div key={inspection.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        inspection.status === 'approved' ? 'bg-secondary/10 text-secondary' :
                        inspection.status === 'pending' ? 'bg-accent/10 text-accent' :
                        'bg-red-100 text-red-600'
                      }`}>
                        <span className="material-icons text-sm">
                          {inspection.status === 'approved' ? 'check_circle' :
                           inspection.status === 'pending' ? 'pending' : 'cancel'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">
                          {inspection.product?.code} - {inspection.product?.description}
                        </p>
                        <p className="text-sm text-neutral-600">Série: {inspection.inspectionId}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(inspection.startedAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inspection.status === 'approved' ? 'bg-secondary/10 text-secondary' :
                        inspection.status === 'pending' ? 'bg-accent/10 text-accent' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {inspection.status === 'approved' ? 'Aprovado' :
                         inspection.status === 'pending' ? 'Pendente' : 'Reprovado'}
                      </span>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-neutral-500">
                    <span className="material-icons text-4xl mb-2 text-neutral-300">assignment</span>
                    <p>Nenhuma inspeção recente encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-800">Ações Rápidas</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            {user?.role === 'inspector' && (
              <>
                <Link href="/inspections/new">
                  <Button className="w-full flex items-center justify-center px-4 py-3 bg-primary hover:bg-primary/90">
                    <span className="material-icons mr-2">add_circle</span>
                    Nova Inspeção
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full flex items-center justify-center px-4 py-3">
                  <span className="material-icons mr-2">qr_code_scanner</span>
                  Escanear QR Code
                </Button>

                <Link href="/inspections">
                  <Button variant="outline" className="w-full flex items-center justify-center px-4 py-3">
                    <span className="material-icons mr-2">assignment</span>
                    Minhas Inspeções
                  </Button>
                </Link>
              </>
            )}

            {user?.role === 'engineering' && (
              <>
                <Link href="/approval-queue">
                  <Button className="w-full flex items-center justify-center px-4 py-3 bg-primary hover:bg-primary/90">
                    <span className="material-icons mr-2">approval</span>
                    Fila de Aprovação
                  </Button>
                </Link>
                
                <Link href="/inspection-plans">
                  <Button variant="outline" className="w-full flex items-center justify-center px-4 py-3">
                    <span className="material-icons mr-2">description</span>
                    Planos de Inspeção
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
