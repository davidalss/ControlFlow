import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface PlanFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: any;
}

export default function PlanForm({ onSubmit, onCancel, isLoading = false, initialData }: PlanFormProps) {
  const [formData, setFormData] = useState({
    productId: initialData?.productId || '',
    version: initialData?.version || '',
    isActive: initialData?.isActive || false,
    checklists: initialData?.checklists || [{ title: '', description: '' }],
  });
  const [showSection2, setShowSection2] = useState(true); // Changed from showFullAQLTable
  const [showSection3, setShowSection3] = useState(true); // New state

  const { data: products } = useQuery({ queryKey: ['/api/products'] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChecklistChange = (index: number, field: string, value: string) => {
    const newChecklists = [...formData.checklists];
    newChecklists[index] = { ...newChecklists[index], [field]: value };
    setFormData({ ...formData, checklists: newChecklists });
  };

  const addChecklistItem = () => {
    setFormData({ ...formData, checklists: [...formData.checklists, { title: '', description: '' }] });
  };

  const removeChecklistItem = (index: number) => {
    const newChecklists = formData.checklists.filter((_, i) => i !== index);
    setFormData({ ...formData, checklists: newChecklists });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>PLANO DE INSPEÇÃO - TORRADEIRA ELÉTRICA</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><strong>Documento:</strong> PCG02.053</div>
          <div><strong>Revisão:</strong> 00</div>
          <div><strong>Data:</strong> 15/07/2024</div>
          <div><strong>Página:</strong> 1 de 8</div>
          <div><strong>Elaborado por:</strong> João Silva (10/07/2024)</div>
          <div><strong>Revisado por:</strong> Maria Santos (12/07/2024)</div>
          <div><strong>Aprovado por:</strong> Carlos Ferreira (15/07/2024)</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Plano</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="productId">Produto*</Label>
            <Select
              value={formData.productId}
              onValueChange={(value) => setFormData({ ...formData, productId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product: any) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.code} - {product.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="version">Versão*</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="Ex: 1.0"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Plano Ativo</Label>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Plano de Amostragem */}
      <Card>
        <CardHeader>
          <CardTitle>2. Plano de Amostragem (Níveis AQL 1, 2, 3 - Tabela Normal)</CardTitle>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSection2(!showSection2)}
            className="mt-4"
          >
            {showSection2 ? 'Ocultar Seção 2' : 'Mostrar Seção 2'}
          </Button>
        </CardHeader>
        {showSection2 && (
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho do Lote</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho da Amostra</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AQL 1,0% (Críticos)<br/>Ac/Re</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AQL 2,5% (Maiores)<br/>Ac/Re</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AQL 4,0% (Menores)<br/>Ac/Re</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr><td>2 a 8</td><td>2</td><td>0/1</td><td>0/1</td><td>0/1</td></tr>
                  <tr><td>9 a 15</td><td>3</td><td>0/1</td><td>0/1</td><td>1/2</td></tr>
                  <tr><td>16 a 25</td><td>5</td><td>0/1</td><td>1/2</td><td>1/2</td></tr>
                  <tr><td>26 a 50</td><td>8</td><td>0/1</td><td>1/2</td><td>2/3</td></tr>
                  <tr><td>51 a 90</td><td>13</td><td>0/1</td><td>1/2</td><td>3/4</td></tr>
                  <tr><td>91 a 150</td><td>20</td><td>0/1</td><td>1/2</td><td>5/6</td></tr>
                  <tr><td>151 a 280</td><td>32</td><td>0/1</td><td>2/3</td><td>7/8</td></tr>
                  <tr><td>281 a 500</td><td>50</td><td>0/1</td><td>3/4</td><td>10/11</td></tr>
                  <tr><td>501 a 1200</td><td>80</td><td>1/2</td><td>5/6</td><td>14/15</td></tr>
                  <tr><td>1201 a 3200</td><td>125</td><td>1/2</td><td>7/8</td><td>21/22</td></tr>
                  <tr><td>3201 a 10000</td><td>200</td><td>2/3</td><td>10/11</td><td>21/22</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-700">
              <p><strong>Nível de Inspeção:</strong> II (Normal)</p>
              <p><strong>AQL - Acceptable Quality Limit:</strong></p>
              <ul className="ml-5 list-disc">
                <li><strong>AQL 1,0%:</strong> Defeitos críticos (afetam segurança, função ou conformidade regulatória)</li>
                <li><strong>AQL 2,5%:</strong> Defeitos maiores (afetam funcionalidade ou aparência significativa)</li>
                <li><strong>AQL 4,0%:</strong> Defeitos menores (afetam aparência, mas não funcionalidade)</li>
              </ul>
              <p><strong>Ac = Aceitável | Re = Rejeitável</strong></p>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-200 text-blue-800">
              <h4 className="font-semibold mb-2">Entendendo a Norma ISO 2859 (AQL)</h4>
              <p className="mb-2">A norma ISO 2859 (AQL) é usada para determinar se um lote de produtos é aceitável inspecionando apenas uma amostra.</p>
              <p className="mb-2"><strong>Como usar a tabela:</strong></p>
              <ol className="ml-5 list-decimal">
                <li><strong>Tamanho do Lote:</strong> Encontre a linha que corresponde ao tamanho total do seu lote.</li>
                <li><strong>Tamanho da Amostra:</strong> A tabela indicará quantas unidades você deve inspecionar.</li>
                <li><strong>Ac/Re:</strong> Para cada tipo de defeito (Crítico, Maior, Menor), você verá dois números:
                  <ul className="ml-5 list-disc">
                    <li><strong>Ac (Aceitação):</strong> O número máximo de defeitos permitidos na amostra para o lote ser aceito.</li>
                    <li><strong>Re (Rejeição):</strong> Se o número de defeitos for igual ou maior que este, o lote é rejeitado.</li>
                  </ul>
                </li>
              </ol>
              <p><strong>Exemplo:</strong> Se o lote tem entre 91 e 150 unidades, você inspeciona 20. Para defeitos maiores (AQL 2,5%), se encontrar 1 defeito, o lote é aceito (Ac=1). Se encontrar 2 ou mais, o lote é rejeitado (Re=2).</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Section 3: Fluxo de Ação para Não Conformidades */}
      <Card>
        <CardHeader>
          <CardTitle>3. Fluxo de Ação para Não Conformidades</CardTitle>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSection3(!showSection3)}
            className="mt-4"
          >
            {showSection3 ? 'Ocultar Seção 3' : 'Mostrar Seção 3'}
          </Button>
        </CardHeader>
        {showSection3 && (
          <CardContent>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Responsabilidades da Equipe de Qualidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold text-primary mb-2">Inspetor/Assistente de Qualidade</h4>
                <p className="text-sm text-neutral-600">Responsável pela inspeção inicial e identificação de não conformidades. Documenta defeitos com fotos e descrições detalhadas. Classifica defeitos como críticos, maiores ou menores. Ambos têm as mesmas responsabilidades e nível de decisão.</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold text-primary mb-2">Técnico de Qualidade</h4>
                <p className="text-sm text-neutral-600">Realiza testes mais complexos e análises técnicas. Pode aprovar condicionalmente produtos com qualquer tipo de defeito (menor, maior ou crítico). Participa da análise de causas raiz e elaboração de relatórios. Pode tomar decisões finais em casos específicos.</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold text-primary mb-2">Analista de Qualidade</h4>
                <p className="text-sm text-neutral-600">Analisa os dados de não conformidade, investiga causas raiz e propõe ações corretivas. Pode aprovar condicionalmente produtos com qualquer tipo de defeito. Emite recomendações de aprovação condicional ou reprovação. Pode tomar decisões finais em casos complexos.</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold text-primary mb-2">Líder de Qualidade</h4>
                <p className="text-sm text-neutral-600">Supervisiona a equipe, aprova ações corretivas e toma decisões sobre o destino do produto. Responsável por aprovações condicionadas em casos mais complexos. Pode aprovar qualquer tipo de defeito. Pode tomar decisões finais em casos estratégicos.</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold text-primary mb-2">Supervisor de Qualidade</h4>
                <p className="text-sm text-neutral-600">Gerencia o setor, toma decisões estratégicas e aprova reprovações em casos complexos. Pode assumir responsabilidade por decisões finais mesmo sendo de outro setor. Pode aprovar qualquer tipo de defeito. Pode tomar decisões finais em casos críticos.</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold text-primary mb-2">Coordenador de Qualidade</h4>
                <p className="text-sm text-neutral-600">Responsável pela gestão do sistema de qualidade e conformidade regulatória. Aprova procedimentos e políticas de qualidade. É a autoridade final em decisões quando outros setores assumem responsabilidade ou em casos não resolvidos.</p>
              </Card>
            </div>

            <h3 className="text-lg font-semibold text-neutral-800 mt-6 mb-4">Fluxo Detalhado de Ação</h3>
            <div className="space-y-2">
              <p className="text-sm text-neutral-600"><strong>1. N/C Encontrada:</strong> Inspetor/Assistente de Qualidade</p>
              <p className="text-sm text-neutral-600"><strong>2. Ajusta Motivo:</strong> Inspetor/Assistente de Qualidade</p>
              <p className="text-sm text-neutral-600"><strong>3. Vai para GSA:</strong> Inspetor/Assistente de Qualidade</p>
              <p className="text-sm text-neutral-600"><strong>4. Análise por Cargos:</strong> Técnico/Analista/Líder/Supervisor</p>
              <p className="text-sm text-neutral-600"><strong>5. Decisão Final:</strong> Técnico/Analista/Líder/Supervisor/Coordenador</p>
              <p className="text-sm text-neutral-600"><strong>6. Destino do Produto:</strong> Execução</p>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Inspeção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.checklists.map((item, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 border rounded-md">
              <div className="flex-grow space-y-2">
                <div>
                  <Label>Título do Passo</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => handleChecklistChange(index, 'title', e.target.value)}
                    placeholder="Ex: Verificar Embalagem"
                  />
                </div>
                <div>
                  <Label>Descrição do Passo</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => handleChecklistChange(index, 'description', e.target.value)}
                    placeholder="Ex: Inspecionar a embalagem quanto a integridade..."
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeChecklistItem(index)}
                disabled={formData.checklists.length === 1}
              >
                Remover
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addChecklistItem}>
            Adicionar Passo
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Plano'}
        </Button>
      </div>
    </form>
  );
}