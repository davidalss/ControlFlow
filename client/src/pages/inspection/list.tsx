import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { INSPECTION_STATUS } from "@/lib/constants";

export default function InspectionListPage() {
  const { user } = useAuth();

  const { data: inspections, isLoading } = useQuery({
    queryKey: ['/api/inspections', user?.id],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-neutral-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Minhas Inspeções</h2>
          <p className="text-neutral-600">Histórico completo das suas inspeções</p>
        </div>
        <Link href="/inspections/new">
          <Button className="flex items-center">
            <span className="material-icons mr-2">add_circle</span>
            Nova Inspeção
          </Button>
        </Link>
      </div>

      {/* Inspections List */}
      <div className="space-y-4">
        {inspections?.length > 0 ? inspections.map((inspection: any) => (
          <Card key={inspection.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    inspection.status === 'approved' ? 'bg-secondary/10 text-secondary' :
                    inspection.status === 'pending' ? 'bg-accent/10 text-accent' :
                    inspection.status === 'conditionally_approved' ? 'bg-yellow-100 text-yellow-600' :
                    inspection.status === 'draft' ? 'bg-neutral-100 text-neutral-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <span className="material-icons">
                      {inspection.status === 'approved' ? 'check_circle' :
                       inspection.status === 'pending' ? 'pending' :
                       inspection.status === 'conditionally_approved' ? 'warning' :
                       inspection.status === 'draft' ? 'edit' :
                       'cancel'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800">
                      {inspection.product?.code} - {inspection.product?.description}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      ID: {inspection.inspectionId}
                    </p>
                    <p className="text-sm text-neutral-600">
                      Série: {inspection.serialNumber || 'N/A'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <p className="text-xs text-neutral-500">
                        Iniciado: {new Date(inspection.startedAt).toLocaleString('pt-BR')}
                      </p>
                      {inspection.completedAt && (
                        <p className="text-xs text-neutral-500">
                          Concluído: {new Date(inspection.completedAt).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={
                      inspection.status === 'approved' ? 'default' :
                      inspection.status === 'pending' ? 'secondary' :
                      inspection.status === 'conditionally_approved' ? 'outline' :
                      inspection.status === 'draft' ? 'secondary' :
                      'destructive'
                    }
                  >
                    {INSPECTION_STATUS[inspection.status] || inspection.status}
                  </Badge>
                  {inspection.defectType && (
                    <p className="text-xs text-red-600 mt-1">
                      Defeito: {inspection.defectType}
                    </p>
                  )}
                </div>
              </div>

              {/* Observations */}
              {inspection.observations && (
                <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                  <p className="text-sm font-medium text-neutral-700 mb-1">Observações:</p>
                  <p className="text-sm text-neutral-600">{inspection.observations}</p>
                </div>
              )}

              {/* Technical Parameters Summary */}
              {inspection.technicalParameters && Object.keys(inspection.technicalParameters).length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-neutral-700 mb-2">Parâmetros Técnicos:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(inspection.technicalParameters).map(([param, value]) => (
                      <div key={param} className="text-xs">
                        <span className="text-neutral-500">{param}:</span>
                        <span className="ml-1 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <span className="material-icons mr-1 text-sm">visibility</span>
                  Ver Detalhes
                </Button>
                {inspection.status === 'draft' && (
                  <Button variant="outline" size="sm">
                    <span className="material-icons mr-1 text-sm">edit</span>
                    Editar
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <span className="material-icons mr-1 text-sm">download</span>
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card>
            <CardContent className="p-12 text-center">
              <span className="material-icons text-6xl text-neutral-300 mb-4 block">assignment</span>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">Nenhuma inspeção encontrada</h3>
              <p className="text-neutral-600 mb-4">Você ainda não realizou nenhuma inspeção.</p>
              <Link href="/inspections/new">
                <Button>
                  <span className="material-icons mr-2">add_circle</span>
                  Criar Primeira Inspeção
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
