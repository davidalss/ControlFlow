import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Phone, Mail, Globe, MapPin, Star, Calendar, Package } from 'lucide-react';
import { Supplier } from '@/hooks/use-suppliers';

interface SupplierDetailsProps {
  supplier: Supplier;
  onClose: () => void;
  onEdit: () => void;
}

export function SupplierDetails({ supplier, onClose, onEdit }: SupplierDetailsProps) {
  const getStatusBadge = (status: Supplier['status']) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'suspended': return <Badge variant="destructive">Suspenso</Badge>;
      case 'under_review': return <Badge className="bg-yellow-100 text-yellow-800">Em Revisão</Badge>;
      case 'blacklisted': return <Badge className="bg-red-100 text-red-800">Lista Negra</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definida';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Detalhes do Fornecedor</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{supplier.name}</span>
                {getStatusBadge(supplier.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Código</label>
                  <p className="text-lg font-semibold">{supplier.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo</label>
                  <p className="text-lg">
                    {supplier.type === 'imported' ? 'Importado' : 'Nacional'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">País</label>
                  <p className="text-lg">{supplier.country}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Categoria</label>
                  <p className="text-lg">{supplier.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Star className={`h-5 w-5 ${getRatingColor(supplier.rating)}`} />
                <span className={`text-xl font-bold ${getRatingColor(supplier.rating)}`}>
                  {supplier.rating.toFixed(1)}
                </span>
                <span className="text-gray-600">/ 5.0</span>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contato</label>
                    <p className="text-lg">{supplier.contactPerson}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telefone</label>
                    <p className="text-lg">{supplier.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg">{supplier.email}</p>
                  </div>
                </div>
                {supplier.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Website</label>
                      <a 
                        href={supplier.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lg text-blue-600 hover:underline"
                      >
                        {supplier.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              {supplier.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Endereço</label>
                    <p className="text-lg">{supplier.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auditorias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Controle de Auditorias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Última Auditoria</label>
                  <p className="text-lg">{formatDate(supplier.lastAudit)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Próxima Auditoria</label>
                  <p className="text-lg">{formatDate(supplier.nextAudit)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Score da Auditoria</label>
                  <p className="text-lg font-semibold">{supplier.auditScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Produtos Vinculados */}
          {supplier.products && supplier.products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos Vinculados ({supplier.products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {supplier.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.product?.code || 'Produto não encontrado'}</p>
                        <p className="text-sm text-gray-600">
                          {product.product?.description || 'Descrição não disponível'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {supplier.observations && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{supplier.observations}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar com Métricas */}
        <div className="space-y-6">
          {/* Performance */}
          {supplier.performance && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(supplier.performance).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{key}</span>
                      <span className="text-sm font-semibold">{value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          value >= 90 ? 'bg-green-500' :
                          value >= 80 ? 'bg-blue-500' :
                          value >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Métricas */}
          {supplier.metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 border rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {supplier.metrics.defectRate}%
                  </div>
                  <div className="text-sm text-gray-600">Taxa de Defeitos</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {supplier.metrics.onTimeDelivery}%
                  </div>
                  <div className="text-sm text-gray-600">Entrega no Prazo</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {supplier.metrics.costVariance}%
                  </div>
                  <div className="text-sm text-gray-600">Variação de Custo</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {supplier.metrics.responseTime} dias
                  </div>
                  <div className="text-sm text-gray-600">Tempo de Resposta</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Criado em</label>
                <p className="text-sm">{formatDate(supplier.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Atualizado em</label>
                <p className="text-sm">{formatDate(supplier.updatedAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">{getStatusBadge(supplier.status)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
