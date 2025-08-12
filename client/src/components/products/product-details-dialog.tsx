import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@/shared/schema";
import { Badge } from "@/components/ui/badge";
import { BUSINESS_UNITS } from "@/lib/constants";

interface ProductDetailsDialogProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onEditClick: (product: Product) => void;
}

export default function ProductDetailsDialog({ productId, isOpen, onClose, canEdit, onEditClick }: ProductDetailsDialogProps) {
  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    queryFn: () => apiRequest('GET', `/api/products/${productId}`).then(res => res.json()),
    enabled: !!productId && isOpen, // Only fetch if productId is available and dialog is open
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Produto</DialogTitle>
        </DialogHeader>
        {isLoading && <div className="p-4 text-center">Carregando detalhes do produto...</div>}
        {isError && <div className="p-4 text-center text-red-500">Erro ao carregar detalhes do produto.</div>}
        {product && (
          <div className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-800 mb-1">{product.code}</h3>
                <p className="text-md text-neutral-600 mb-2">{product.description}</p>
                {product.ean && (
                  <p className="text-sm text-neutral-500">
                    <span className="font-medium">EAN:</span> {product.ean}
                  </p>
                )}
                <p className="text-sm text-neutral-500">
                  <span className="font-medium">Categoria:</span> {product.category}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`
                  ${product.businessUnit === 'DIY' ? 'border-orange-200 text-orange-700 bg-orange-50' : ''}
                  ${product.businessUnit === 'TECH' ? 'border-blue-200 text-blue-700 bg-blue-50' : ''}
                  ${product.businessUnit === 'KITCHEN_BEAUTY' ? 'border-pink-200 text-pink-700 bg-pink-50' : ''}
                  ${product.businessUnit === 'MOTOR_COMFORT' ? 'border-green-200 text-green-700 bg-green-50' : ''}
                `}
              >
                {BUSINESS_UNITS[product.businessUnit as keyof typeof BUSINESS_UNITS]}
              </Badge>
            </div>

            {product.technicalParameters && Object.keys(product.technicalParameters).length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-neutral-700 mb-2">Parâmetros Técnicos:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(product.technicalParameters).map(([param, value]) => (
                    <div key={param} className="flex justify-between border-b border-neutral-100 pb-1">
                      <span className="text-neutral-500">{param}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-400">
                Criado em: {new Date(product.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>

            {canEdit && (
              <DialogFooter className="mt-4">
                <Button onClick={() => onEditClick(product)}>
                  <span className="material-icons mr-2">edit</span>
                  Editar Produto
                </Button>
              </DialogFooter>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}