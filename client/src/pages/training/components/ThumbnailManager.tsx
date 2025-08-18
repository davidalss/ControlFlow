import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Image, 
  Upload, 
  Edit, 
  Crop, 
  RotateCw, 
  Palette,
  Type,
  Download,
  Trash2,
  Eye,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Thumbnail {
  id: string;
  trainingId: string;
  trainingTitle: string;
  currentThumbnail: string;
  category: string;
  lastUpdated: string;
}

const mockThumbnails: Thumbnail[] = [
  {
    id: '1',
    trainingId: '1',
    trainingTitle: 'Controle Estatístico de Processo (SPC)',
    currentThumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
    category: 'Qualidade',
    lastUpdated: '2024-02-15'
  },
  {
    id: '2',
    trainingId: '2',
    trainingTitle: 'Inspeção de Qualidade Avançada',
    currentThumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=225&fit=crop',
    category: 'Inspeção',
    lastUpdated: '2024-02-10'
  },
  {
    id: '3',
    trainingId: '3',
    trainingTitle: 'Gestão de Fornecedores',
    currentThumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=225&fit=crop',
    category: 'Gestão',
    lastUpdated: '2024-02-08'
  },
  {
    id: '4',
    trainingId: '4',
    trainingTitle: 'ISO 9001:2015 - Implementação',
    currentThumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=225&fit=crop',
    category: 'Certificação',
    lastUpdated: '2024-02-12'
  },
  {
    id: '5',
    trainingId: '5',
    trainingTitle: 'Análise de Causa Raiz',
    currentThumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop',
    category: 'Análise',
    lastUpdated: '2024-02-05'
  },
  {
    id: '6',
    trainingId: '6',
    trainingTitle: 'Auditoria Interna de Qualidade',
    currentThumbnail: 'https://images.unsplash.com/photo-1556761175-4f9a5eb9e4b5?w=400&h=225&fit=crop',
    category: 'Auditoria',
    lastUpdated: '2024-02-18'
  }
];

const templates = [
  { id: '1', name: 'Padrão Enso', preview: 'bg-gradient-to-br from-stone-600 to-stone-800' },
  { id: '2', name: 'Profissional', preview: 'bg-gradient-to-br from-stone-700 to-stone-900' },
  { id: '3', name: 'Energético', preview: 'bg-gradient-to-br from-orange-500 to-red-500' },
  { id: '4', name: 'Sucesso', preview: 'bg-gradient-to-br from-green-500 to-emerald-600' },
  { id: '5', name: 'Tecnologia', preview: 'bg-gradient-to-br from-stone-500 to-stone-700' },
  { id: '6', name: 'Minimalista', preview: 'bg-gradient-to-br from-stone-300 to-stone-500' }
];

export default function ThumbnailManager() {
  const [selectedThumbnail, setSelectedThumbnail] = useState<Thumbnail | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('1');
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState('24');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', 'Qualidade', 'Inspeção', 'Gestão', 'Certificação', 'Análise', 'Auditoria'];

  const filteredThumbnails = mockThumbnails.filter(thumbnail => 
    filterCategory === 'all' || thumbnail.category === filterCategory
  );

  const handleEditThumbnail = (thumbnail: Thumbnail) => {
    setSelectedThumbnail(thumbnail);
    setCustomText(thumbnail.trainingTitle);
    setIsEditorOpen(true);
  };

  const handleSaveThumbnail = () => {
    console.log('Salvando thumbnail:', {
      thumbnail: selectedThumbnail,
      template: selectedTemplate,
      customText,
      textColor,
      textSize
    });
    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Gerenciar Thumbnails</h2>
          <p className="text-slate-600 mt-1">Personalize as imagens dos seus treinamentos</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'Todas as Categorias' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Galeria de Thumbnails */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThumbnails.map((thumbnail, index) => (
          <motion.div
            key={thumbnail.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Thumbnail Preview */}
              <div className="relative aspect-video">
                <img
                  src={thumbnail.currentThumbnail}
                  alt={thumbnail.trainingTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200" />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditThumbnail(thumbnail)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-slate-900 line-clamp-2">
                    {thumbnail.trainingTitle}
                  </h3>
                  <Badge variant="outline">{thumbnail.category}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Atualizado: {new Date(thumbnail.lastUpdated).toLocaleDateString('pt-BR')}</span>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Editor de Thumbnail */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editor de Thumbnail</DialogTitle>
            <DialogDescription>
              Personalize a thumbnail do treinamento "{selectedThumbnail?.trainingTitle}"
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="space-y-4">
              <Label>Preview</Label>
              <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative">
                <div className={cn(
                  "w-full h-full flex items-center justify-center",
                  templates.find(t => t.id === selectedTemplate)?.preview
                )}>
                  <div 
                    className="text-center p-6"
                    style={{ 
                      color: textColor,
                      fontSize: `${textSize}px`
                    }}
                  >
                    <h3 className="font-bold mb-2">Enso</h3>
                    <p className="font-medium">{customText}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="space-y-6">
              {/* Upload de Imagem */}
              <div>
                <Label>Upload de Imagem</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center mt-1">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">Arraste uma imagem ou clique para selecionar</p>
                  <p className="text-xs text-slate-500">Recomendado: 400x225px, JPG ou PNG</p>
                  <Button variant="outline" className="mt-3">
                    <Image className="w-4 h-4 mr-2" />
                    Selecionar Imagem
                  </Button>
                </div>
              </div>

              {/* Templates */}
              <div>
                <Label>Templates</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        "aspect-video rounded-lg border-2 transition-all duration-200",
                        selectedTemplate === template.id
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className={cn("w-full h-full rounded", template.preview)} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Texto Personalizado */}
              <div>
                <Label>Texto Personalizado</Label>
                <Input
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Digite o texto da thumbnail..."
                  className="mt-1"
                />
              </div>

              {/* Configurações de Texto */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cor do Texto</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-10 rounded border border-slate-300"
                    />
                    <Input
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Tamanho do Texto</Label>
                  <Input
                    type="number"
                    min="12"
                    max="48"
                    value={textSize}
                    onChange={(e) => setTextSize(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Ferramentas */}
              <div>
                <Label>Ferramentas</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Button variant="outline" size="sm">
                    <Crop className="w-4 h-4 mr-1" />
                    Crop
                  </Button>
                  <Button variant="outline" size="sm">
                    <RotateCw className="w-4 h-4 mr-1" />
                    Rotacionar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Palette className="w-4 h-4 mr-1" />
                    Filtros
                  </Button>
                  <Button variant="outline" size="sm">
                    <Type className="w-4 h-4 mr-1" />
                    Texto
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveThumbnail}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Thumbnail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {filteredThumbnails.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum thumbnail encontrado</h3>
          <p className="text-slate-600">Tente ajustar os filtros ou criar novos treinamentos.</p>
        </div>
      )}
    </div>
  );
}
