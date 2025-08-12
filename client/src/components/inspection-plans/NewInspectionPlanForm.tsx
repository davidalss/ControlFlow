import { useState } from 'react';
import InspectionPlanHeader from './InspectionPlanHeader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AQLTable from './AQLTable';

const NewInspectionPlanForm = ({ onSubmit, onCancel, isLoading }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [planData, setPlanData] = useState({
    header: {},
    product: {
      name: '',
      type: '',
      specs: [],
    },
    samplingPlan: {
      levels: [
        { lotSize: '2 a 8', sampleSize: '2', aql1: '0/1', aql2: '0/1', aql3: '0/1' },
        { lotSize: '9 a 15', sampleSize: '3', aql1: '0/1', aql2: '0/1', aql3: '1/2' },
        { lotSize: '16 a 25', sampleSize: '5', aql1: '0/1', aql2: '1/2', aql3: '1/2' },
        { lotSize: '26 a 50', sampleSize: '8', aql1: '0/1', aql2: '1/2', aql3: '2/3' },
        { lotSize: '51 a 90', sampleSize: '13', aql1: '0/1', aql2: '1/2', aql3: '3/4' },
        { lotSize: '91 a 150', sampleSize: '20', aql1: '0/1', aql2: '1/2', aql3: '5/6' },
        { lotSize: '151 a 280', sampleSize: '32', aql1: '0/1', aql2: '2/3', aql3: '7/8' },
        { lotSize: '281 a 500', sampleSize: '50', aql1: '0/1', aql2: '3/4', aql3: '10/11' },
        { lotSize: '501 a 1200', sampleSize: '80', aql1: '1/2', aql2: '5/6', aql3: '14/15' },
        { lotSize: '1201 a 3200', sampleSize: '125', aql1: '1/2', aql2: '7/8', aql3: '21/22' },
        { lotSize: '3201 a 10000', sampleSize: '200', aql1: '2/3', aql2: '10/11', aql3: '21/22' },
      ],
      notes: '',
    },
  });

  const handleSaveHeader = (headerData) => {
    setPlanData(prev => ({ ...prev, header: headerData }));
  };

  const handleProductChange = (field, value) => {
    setPlanData(prev => ({ ...prev, product: { ...prev.product, [field]: value } }));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...planData.product.specs];
    newSpecs[index][field] = value;
    setPlanData(prev => ({ ...prev, product: { ...prev.product, specs: newSpecs } }));
  };

  const addSpec = () => {
    setPlanData(prev => ({ ...prev, product: { ...prev.product, specs: [...prev.product.specs, { parameter: '', tolerance: '', observations: '' }] } }));
  };

  const handleSamplingPlanLevelChange = (index, field, value) => {
    const newLevels = [...planData.samplingPlan.levels];
    newLevels[index][field] = value;
    setPlanData(prev => ({ ...prev, samplingPlan: { ...prev.samplingPlan, levels: newLevels } }));
  };

  const handleSubmit = () => {
    onSubmit(planData);
  };

  return (
    <div className="w-full h-full py-10 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl rounded-lg p-8 overflow-y-auto">
      <InspectionPlanHeader
        plan={null}
        onSave={handleSaveHeader}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
      
      <Card className="mt-6 rounded-lg shadow-lg p-8 transition-all duration-300 ease-in-out hover:shadow-2xl">
        <CardHeader>
          <CardTitle className="font-poppins text-xl font-bold text-indigo-700">1. Ficha Técnica do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              className="focus:ring focus:ring-blue-300 focus:border-blue-500"
              placeholder="Nome do Produto"
              value={planData.product.name}
              onChange={(e) => handleProductChange('name', e.target.value)}
            />
            <Input
              className="focus:ring focus:ring-blue-300 focus:border-blue-500"
              placeholder="Tipo (eletrodoméstico, ferramenta, etc.)"
              value={planData.product.type}
              onChange={(e) => handleProductChange('type', e.target.value)}
            />
          </div>
          <CardTitle className="font-poppins text-lg font-bold text-indigo-700 mt-6 mb-4">Especificações Técnicas</CardTitle>
          {planData.product.specs.map((spec, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 mt-2">
              <Input
                className="focus:ring focus:ring-blue-300 focus:border-blue-500"
                placeholder="Parâmetro"
                value={spec.parameter}
                onChange={(e) => handleSpecChange(index, 'parameter', e.target.value)}
              />
              <Input
                className="focus:ring focus:ring-blue-300 focus:border-blue-500"
                placeholder="Tolerância"
                value={spec.tolerance}
                onChange={(e) => handleSpecChange(index, 'tolerance', e.target.value)}
              />
              <Input
                className="focus:ring focus:ring-blue-300 focus:border-blue-500"
                placeholder="Observações"
                value={spec.observations}
                onChange={(e) => handleSpecChange(index, 'observations', e.target.value)}
              />
            </div>
          ))}
          <Button onClick={addSpec} className="mt-4 bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 ease-in-out hover:scale-105">Adicionar Especificação</Button>
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-lg shadow-lg p-8 transition-all duration-300 ease-in-out hover:shadow-2xl">
        <CardHeader>
          <CardTitle className="font-poppins text-xl font-bold text-indigo-700">2. Nível de Qualidade Aceitável (NQA)</CardTitle>
        </CardHeader>
        <CardContent>
          <AQLTable lotSize={1250} />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="outline" onClick={onCancel} disabled={isLoading} className="hover:bg-gray-200 transition-all duration-300 ease-in-out hover:scale-105">Cancelar</Button>
        <Button onClick={handleSubmit} disabled={isLoading || isEditing} className="bg-green-500 text-white hover:bg-green-600 transition-all duration-300 ease-in-out hover:scale-105">
          {isLoading ? 'Salvando...' : 'Salvar Plano'}
        </Button>
      </div>
    </div>
  );
};

export default NewInspectionPlanForm;