import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { AQLConfig } from '@/hooks/use-inspection-plans';

interface AQLTableProps {
  aqlConfig: AQLConfig;
  onAQLChange: (config: AQLConfig) => void;
}

export default function AQLTable({ aqlConfig, onAQLChange }: AQLTableProps) {
  const updateAQL = (defectType: keyof AQLConfig, field: 'aql' | 'acceptance' | 'rejection', value: number) => {
    onAQLChange({
      ...aqlConfig,
      [defectType]: {
        ...aqlConfig[defectType],
        [field]: value
      }
    });
  };

  const getDefectTypeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'major':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDefectTypeIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      case 'major':
        return <AlertTriangle className="w-4 h-4" />;
      case 'minor':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getDefectTypeLabel = (type: string) => {
    switch (type) {
      case 'critical':
        return 'CRÍTICO';
      case 'major':
        return 'MAIOR';
      case 'minor':
        return 'MENOR';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(aqlConfig).map(([defectType, config]) => (
          <Card key={defectType} className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm">
                {getDefectTypeIcon(defectType)}
                <Badge className={getDefectTypeColor(defectType)}>
                  {getDefectTypeLabel(defectType)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor={`${defectType}-aql`} className="text-xs font-medium">
                  NQA (%)
                </Label>
                <Input
                  id={`${defectType}-aql`}
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={config.aql}
                  onChange={(e) => updateAQL(defectType as keyof AQLConfig, 'aql', parseFloat(e.target.value) || 0)}
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`${defectType}-acceptance`} className="text-xs font-medium">
                  Aceite
                </Label>
                <Input
                  id={`${defectType}-acceptance`}
                  type="number"
                  min="0"
                  value={config.acceptance}
                  onChange={(e) => updateAQL(defectType as keyof AQLConfig, 'acceptance', parseInt(e.target.value) || 0)}
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`${defectType}-rejection`} className="text-xs font-medium">
                  Rejeição
                </Label>
                <Input
                  id={`${defectType}-rejection`}
                  type="number"
                  min="0"
                  value={config.rejection}
                  onChange={(e) => updateAQL(defectType as keyof AQLConfig, 'rejection', parseInt(e.target.value) || 0)}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-900">Informações sobre NQA</span>
        </div>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>CRÍTICO:</strong> Defeitos que podem causar falha total do produto ou risco à segurança.</p>
          <p><strong>MAIOR:</strong> Defeitos que afetam significativamente a funcionalidade ou aparência.</p>
          <p><strong>MENOR:</strong> Defeitos que não afetam a funcionalidade mas podem impactar a aparência.</p>
        </div>
      </div>
    </div>
  );
}