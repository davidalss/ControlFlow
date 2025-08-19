import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Zap, Settings } from "lucide-react";
import { LinkedProduct, VoltageConfiguration } from "@/hooks/use-inspection-plans";

interface VoltageConfigurationPanelProps {
  selectedProducts: LinkedProduct[];
  voltageConfig: VoltageConfiguration;
}

export default function VoltageConfigurationPanel({ 
  selectedProducts, 
  voltageConfig 
}: VoltageConfigurationPanelProps) {
  
  // Determinar configuração automaticamente baseada nos produtos
  const autoConfig = useMemo(() => {
    const uniqueVoltages = [...new Set(selectedProducts.map(p => p.voltage))];
    
    if (selectedProducts.length === 0) {
      return {
        hasSingleVoltage: true,
        voltageType: 'BIVOLT' as const,
        supports127V: true,
        supports220V: true,
        description: 'Nenhum produto selecionado'
      };
    }
    
    if (selectedProducts.length === 1) {
      // 1 produto = BIVOLT ou voltagem única
      const voltage = selectedProducts[0].voltage;
      return {
        hasSingleVoltage: true,
        voltageType: voltage,
        supports127V: voltage === '127V' || voltage === 'BIVOLT',
        supports220V: voltage === '220V' || voltage === 'BIVOLT',
        description: voltage === 'BIVOLT' ? 'Produto bivolt (127V/220V)' : `Produto ${voltage}`
      };
    } else if (selectedProducts.length === 2) {
      // 2 produtos = DUAL (127V + 220V)
      const voltages = selectedProducts.map(p => p.voltage);
      return {
        hasSingleVoltage: false,
        voltageType: 'DUAL' as const,
        supports127V: voltages.includes('127V'),
        supports220V: voltages.includes('220V'),
        description: 'Dois produtos com voltagens diferentes'
      };
    } else {
      // Mais de 2 produtos
      return {
        hasSingleVoltage: false,
        voltageType: 'MULTIPLE' as const,
        supports127V: uniqueVoltages.includes('127V'),
        supports220V: uniqueVoltages.includes('220V'),
        description: `${selectedProducts.length} produtos com diferentes voltagens`
      };
    }
  }, [selectedProducts]);
  
  const getVoltageTypeColor = (type: string) => {
    switch (type) {
      case '127V': return 'bg-blue-100 text-blue-800';
      case '220V': return 'bg-green-100 text-green-800';
      case 'BIVOLT': return 'bg-purple-100 text-purple-800';
      case 'DUAL': return 'bg-orange-100 text-orange-800';
      case 'MULTIPLE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getVoltageTypeIcon = (type: string) => {
    switch (type) {
      case '127V': return <Zap className="h-4 w-4 text-blue-500" />;
      case '220V': return <Zap className="h-4 w-4 text-green-500" />;
      case 'BIVOLT': return <Zap className="h-4 w-4 text-purple-500" />;
      case 'DUAL': return <Settings className="h-4 w-4 text-orange-500" />;
      case 'MULTIPLE': return <Settings className="h-4 w-4 text-gray-500" />;
      default: return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configuração de Voltagens</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuração Detectada */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            {getVoltageTypeIcon(autoConfig.voltageType)}
            <h4 className="font-medium text-blue-800">Configuração Detectada</h4>
          </div>
          <div className="space-y-1 text-sm text-blue-700">
            <div>• {autoConfig.description}</div>
            <div>• Tipo: <Badge className={getVoltageTypeColor(autoConfig.voltageType)}>
              {autoConfig.voltageType}
            </Badge></div>
            <div>• Suporta 127V: {autoConfig.supports127V ? 'Sim' : 'Não'}</div>
            <div>• Suporta 220V: {autoConfig.supports220V ? 'Sim' : 'Não'}</div>
          </div>
        </div>
        
        {/* Produtos Vinculados */}
        {selectedProducts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Produtos vinculados ao plano:</h4>
            {selectedProducts.map(product => (
              <div key={product.productId} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                <Package className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <div className="font-medium">{product.productName}</div>
                  <div className="text-sm text-gray-500">{product.productCode}</div>
                </div>
                <Badge className={getVoltageTypeColor(product.voltage)}>
                  {product.voltage}
                </Badge>
              </div>
            ))}
          </div>
        )}
        
        {/* Resumo da Configuração */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Resumo da Configuração:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Produtos:</div>
              <div className="text-gray-600">{selectedProducts.length}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Voltagens:</div>
              <div className="text-gray-600">
                {[...new Set(selectedProducts.map(p => p.voltage))].join(', ')}
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Tipo:</div>
              <div className="text-gray-600">{autoConfig.voltageType}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Configuração:</div>
              <div className="text-gray-600">
                {autoConfig.hasSingleVoltage ? 'Voltagem única' : 'Múltiplas voltagens'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Informações Adicionais */}
        {autoConfig.voltageType === 'BIVOLT' && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-purple-800">Produto Bivolt</span>
            </div>
            <p className="text-sm text-purple-700">
              Este produto funciona tanto em 127V quanto em 220V. O sistema detectará automaticamente 
              a voltagem correta durante a inspeção baseado no EAN escaneado.
            </p>
          </div>
        )}
        
        {autoConfig.voltageType === 'DUAL' && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Settings className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-800">Configuração Dual</span>
            </div>
            <p className="text-sm text-orange-700">
              Dois produtos com voltagens diferentes. Cada produto terá suas próprias perguntas 
              e etiquetas específicas para sua voltagem.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
