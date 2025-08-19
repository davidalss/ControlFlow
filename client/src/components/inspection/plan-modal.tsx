import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InspectionPlanModalProps {
  plan: any;
  product: any;
  onClose: () => void;
}

export default function InspectionPlanModal({ plan, product, onClose }: InspectionPlanModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="inspection-plan-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-neutral-800">
                Plano de Inspeção
              </DialogTitle>
              <DialogDescription id="inspection-plan-description" className="text-sm text-neutral-600">
                {product.code} - {product.description} • Versão {plan.version}
              </DialogDescription>
            </div>
            <Button variant="ghost" onClick={onClose} aria-label="Fechar">
              <span className="material-icons">close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Steps */}
          {plan.steps?.map((step: any, index: number) => (
            <div key={index} className="border border-neutral-200 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-800 mb-2">
                {index + 1}. {step.title}
              </h4>
              {step.description && (
                <p className="text-sm text-neutral-600 mb-3">{step.description}</p>
              )}
              {step.items && step.items.length > 0 && (
                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                  {(step.items || []).map((item: string, itemIndex: number) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              )}
              {step.media && step.media.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-neutral-500 mb-2">Materiais de apoio:</p>
                  <div className="flex flex-wrap gap-2">
                    {(step.media || []).map((media: any, mediaIndex: number) => (
                      <Button
                        key={mediaIndex}
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(media.url, '_blank')}
                      >
                        <span className="material-icons mr-1 text-sm">
                          {media.type === 'video' ? 'play_circle' : 'image'}
                        </span>
                        {media.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )) || (
            // Default steps if no custom steps defined
            <>
              <div className="border border-neutral-200 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-800 mb-2">1. Preparação Inicial</h4>
                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                  <li>Verificar se o produto está desligado e desconectado</li>
                  <li>Preparar ambiente de teste limpo e adequado</li>
                  <li>Separar todos os instrumentos de medição calibrados</li>
                </ul>
              </div>
              <div className="border border-neutral-200 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-800 mb-2">2. Inspeção Visual Completa</h4>
                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                  <li>Verificar integridade de todas as etiquetas obrigatórias</li>
                  <li>Documentar com fotos todos os componentes externos</li>
                  <li>Verificar acabamento, cor e montagem</li>
                  <li>Inspecionar embalagem e acessórios</li>
                </ul>
              </div>
              <div className="border border-neutral-200 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-800 mb-2">3. Testes Funcionais</h4>
                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                  <li>Testar todas as funções de aspiração</li>
                  <li>Verificar sistema de filtragem</li>
                  <li>Medir parâmetros técnicos conforme especificação</li>
                  <li>Documentar resultados com precisão</li>
                </ul>
              </div>
            </>
          )}

          {/* Checklists */}
          {plan.checklists && plan.checklists.length > 0 && (
            <div className="border border-neutral-200 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-800 mb-2">Lista de Verificação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.checklists.map((checklist: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <h5 className="font-medium text-neutral-700">{checklist.category}</h5>
                    <ul className="space-y-1">
                      {(checklist.items || []).map((item: string, itemIndex: number) => (
                        <li key={itemIndex} className="flex items-center text-sm text-neutral-600">
                          <span className="material-icons mr-2 text-sm text-neutral-400">check_box_outline_blank</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Parameters */}
          {plan.requiredParameters && Object.keys(plan.requiredParameters).length > 0 && (
            <div className="border border-neutral-200 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-800 mb-2">Parâmetros Obrigatórios</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(plan.requiredParameters).map(([param, config]: [string, any]) => (
                  <div key={param} className="text-sm">
                    <p className="font-medium text-neutral-700">{param}</p>
                    <p className="text-neutral-600">
                      Limite: {config.min}-{config.max} {config.unit}
                    </p>
                    {config.critical && (
                      <p className="text-orange-600 text-xs">⚠ Parâmetro crítico</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Photos */}
        {plan.photos && plan.photos.length > 0 && (
          <div className="border border-neutral-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-neutral-800 mb-2">Fotos do Produto</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(plan.photos || []).map((photoUrl: string, index: number) => (
                <div key={index} className="relative w-full h-32 bg-neutral-100 rounded-md overflow-hidden">
                  <img src={photoUrl} alt={`Product Photo ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
