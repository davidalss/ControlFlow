import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface ProductDetails {
  id: string;
  code: string;
  description: string;
  ean?: string;
  category: string;
  family?: string;
  businessUnit: string;
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

export default function ProductDetailsDialog({ product, open, onOpenChange }: ProductDetailsDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <span>Detalhes do Produto</span>
            <Badge variant="outline" className="text-sm">
              {product.code}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
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

          {/* Technical Parameters */}
          {product.technicalParameters && Object.keys(product.technicalParameters).length > 0 && (
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
          )}

          {/* Related Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-blue-600">Planos de Inspeção</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-green-600">Inspeções Realizadas</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-purple-600">Bloqueios Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}