import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ParameterConfig {
  min: number;
  max: number;
  unit: string;
  critical: boolean;
  required?: boolean;
}

interface ParameterInputProps {
  parameter: string;
  config: ParameterConfig;
  value: string | number;
  onChange: (value: string | number) => void;
}

export default function ParameterInput({ parameter, config, value, onChange }: ParameterInputProps) {
  const [validation, setValidation] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (value !== undefined && value !== '') {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        if (numValue >= config.min && numValue <= config.max) {
          setValidation('success');
        } else {
          setValidation('error');
        }
      } else {
        setValidation(null);
      }
    } else {
      setValidation(null);
    }
  }, [value, config]);

  const getParameterLabel = (param: string) => {
    const labels: Record<string, string> = {
      vacuum: 'Vácuo',
      voltage: 'Tensão',
      power: 'Potência',
      current: 'Corrente',
      rpm: 'RPM',
      torque: 'Torque',
      temperature: 'Temperatura',
      pressure: 'Pressão',
      flow: 'Vazão',
      autonomy: 'Autonomia'
    };
    return labels[param] || param.charAt(0).toUpperCase() + param.slice(1);
  };

  return (
    <div className="border border-neutral-200 rounded-lg p-4">
      <Label htmlFor={parameter} className="block text-sm font-medium text-neutral-700 mb-2">
        {getParameterLabel(parameter)} ({config.unit})
        {config.required && <span className="text-red-500 ml-1">*</span>}
        {config.critical && <span className="text-orange-500 ml-1">⚠</span>}
      </Label>
      <Input
        id={parameter}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step="0.1"
        className="w-full"
        placeholder={`Ex: ${((config.min + config.max) / 2).toFixed(1)}`}
      />
      <p className="text-xs text-neutral-500 mt-1">
        Limite: {config.min}-{config.max} {config.unit}
      </p>
      {validation === 'success' && (
        <p className="text-xs text-secondary mt-1 flex items-center">
          <span className="material-icons mr-1 text-xs">check_circle</span>
          Dentro do limite
        </p>
      )}
      {validation === 'error' && (
        <p className="text-xs text-red-600 mt-1 flex items-center">
          <span className="material-icons mr-1 text-xs">warning</span>
          {config.critical ? 'Fora do limite crítico' : 'Fora do limite'}
        </p>
      )}
    </div>
  );
}
