import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Settings, 
  Eye,
  Save,
  X,
  Plus,
  Trash2,
  Video,
  Presentation,
  File,
  Lock,
  Unlock,
  Users,
  Calendar,
  Clock,
  Target,
  Award,
  CheckCircle,
  AlertTriangle,
  Download,
  Play,
  Edit,
  Copy,
  EyeOff,
  Eye as EyeOn,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Mock data para categorias existentes
const existingCategories = [
  'Gestão da Qualidade',
  'Análise de Dados', 
  'Auditoria',
  'Gestão de Fornecedores',
  'Gestão de Riscos',
  'Inspeção',
  'Certificação',
  'Processos',
  'Segurança',
  'Compliance'
];

// Mock data para níveis
const levels = ['Básico', 'Intermediário', 'Avançado'];

// Mock data para tipos de acesso
const accessTypes = [
  { value: 'public', label: 'Público', description: 'Todos os usuários podem acessar' },
  { value: 'restricted', label: 'Restrito', description: 'Apenas usuários autorizados' },
  { value: 'department', label: 'Por Departamento', description: 'Apenas departamento específico' },
  { value: 'role', label: 'Por Função', description: 'Apenas funções específicas' }
];

export default function NewTraining() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    newCategory: '',
    level: '',
    tags: '',
    thumbnail: null as File | null,
    content: [] as File[],
    instructor: '',
    prerequisites: '',
    targetAudience: '',
    isPublished: false,
    hasTest: true,
    testDuration: 30,
    passingScore: 70,
    maxAttempts: 3,
    certificate: true,
    accessType: 'public',
    selectedDepartments: [] as string[],
    selectedRoles: [] as string[],
    downloadableContent: [] as string[],
    completionDeadline: '',
    estimatedDuration: '',
    revisionNumber: 1,
    originalDate: new Date().toISOString().split('T')[0],
    revisionDate: new Date().toISOString().split('T')[0],
    modules: [] as any[]
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [isTestConfigOpen, setIsTestConfigOpen] = useState(false);
  const [isAccessConfigOpen, setIsAccessConfigOpen] = useState(false);
  const [isModuleConfigOpen, setIsModuleConfigOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: 'thumbnail' | 'content', files: FileList | null) => {
    if (!files) return;
    
    if (field === 'thumbnail') {
      setFormData(prev => ({ ...prev, thumbnail: files[0] }));
    } else {
      const newFiles = Array.from(files);
      setFormData(prev => ({ ...prev, content: [...prev.content, ...newFiles] }));
      
      // Simular progresso de upload
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const removeContentFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (formData.tags.trim()) {
      const newTag = formData.tags.trim();
      const currentTags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (!currentTags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...currentTags, newTag].join(', ') }));
      }
    }
  };

  const handleToggleDownloadableContent = (content: string) => {
    setFormData(prev => ({
      ...prev,
      downloadableContent: prev.downloadableContent.includes(content)
        ? prev.downloadableContent.filter(c => c !== content)
        : [...prev.downloadableContent, content]
    }));
  };

  const handleSave = () => {
    console.log('Salvando treinamento:', formData);
    // Aqui você implementaria a lógica de salvamento
  };

  const handlePublish = () => {
    console.log('Publicando treinamento:', formData);
    // Aqui você implementaria a lógica de publicação
  };

  const handleCreateRevision = () => {
    setFormData(prev => ({
      ...prev,
      revisionNumber: prev.revisionNumber + 1,
      revisionDate: new Date().toISOString().split('T')[0]
    }));
  };

  const getFileTypeIcon = (file: File) => {
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (file.type.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (file.type.includes('powerpoint') || file.type.includes('presentation')) return <Presentation className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type.startsWith('video/')) return 'Vídeo';
    if (file.type.includes('pdf')) return 'PDF';
    if (file.type.includes('powerpoint') || file.type.includes('presentation')) return 'Apresentação';
    return 'Arquivo';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Novo Treinamento</h2>
          <p className="text-slate-600 mt-1">Crie um novo treinamento com todas as informações necessárias</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <EyeOn className="w-4 h-4" />}
            <span>{previewMode ? 'Editar' : 'Visualizar'}</span>
          </Button>
          <Button variant="outline" onClick={handleSave} className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Salvar Rascunho</span>
          </Button>
          <Button onClick={handlePublish} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Publicar</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Informações Básicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Treinamento *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Introdução à Gestão da Qualidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instrutor *</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => handleInputChange('instructor', e.target.value)}
                    placeholder="Ex: Dr. Maria Silva"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <div className="flex space-x-2">
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange('category', value)}
                      disabled={showNewCategoryInput}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {showNewCategoryInput && (
                    <div className="flex space-x-2 mt-2">
                      <Input
                        placeholder="Nova categoria"
                        value={formData.newCategory}
                        onChange={(e) => handleInputChange('newCategory', e.target.value)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (formData.newCategory.trim()) {
                            handleInputChange('category', formData.newCategory.trim());
                            handleInputChange('newCategory', '');
                            setShowNewCategoryInput(false);
                          }
                        }}
                      >
                        Adicionar
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Nível</Label>
                  <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva o conteúdo e objetivos do treinamento..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="Ex: qualidade, ISO, processos (separadas por vírgula)"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button type="button" onClick={handleAddTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.tags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.split(',').map((tag, index) => tag.trim() && (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5" />
                <span>Thumbnail</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 mb-2">
                    Arraste uma imagem ou clique para selecionar
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Recomendado: 400x225px, JPG ou PNG
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('thumbnail', e.target.files)}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label htmlFor="thumbnail-upload">
                    <Button variant="outline" className="cursor-pointer">
                      Selecionar Imagem
                    </Button>
                  </label>
                </div>
                {formData.thumbnail && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Thumbnail preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{formData.thumbnail.name}</p>
                      <p className="text-xs text-slate-500">
                        {(formData.thumbnail.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInputChange('thumbnail', null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Conteúdo do Treinamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 mb-2">
                    Arraste arquivos ou clique para selecionar
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Suporta: Vídeo (MP4, AVI), PDF, PPTX, SCORM, Texto
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="video/*,.pdf,.pptx,.zip,.txt,.doc,.docx"
                    onChange={(e) => handleFileUpload('content', e.target.files)}
                    className="hidden"
                    id="content-upload"
                  />
                  <label htmlFor="content-upload">
                    <Button variant="outline" className="cursor-pointer">
                      Selecionar Arquivos
                    </Button>
                  </label>
                </div>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fazendo upload...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                {formData.content.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Arquivos Selecionados:</h4>
                    {formData.content.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-white rounded-lg">
                          {getFileTypeIcon(file)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-slate-500">
                            {getFileTypeLabel(file)} • {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContentFile(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Conteúdo para Download</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['PDF', 'Slides', 'Vídeos', 'Planilhas', 'Templates', 'Manuais'].map((content) => (
                      <div key={content} className="flex items-center space-x-2">
                        <Switch
                          id={`download-${content}`}
                          checked={formData.downloadableContent.includes(content)}
                          onCheckedChange={() => handleToggleDownloadableContent(content)}
                        />
                        <Label htmlFor={`download-${content}`} className="text-sm">
                          {content}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Configurações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Duração Estimada</Label>
                  <Input
                    id="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                    placeholder="Ex: 4h 30min"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completionDeadline">Prazo de Conclusão</Label>
                  <Input
                    id="completionDeadline"
                    type="date"
                    value={formData.completionDeadline}
                    onChange={(e) => handleInputChange('completionDeadline', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prerequisites">Pré-requisitos</Label>
                <Textarea
                  id="prerequisites"
                  value={formData.prerequisites}
                  onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                  placeholder="Liste os pré-requisitos necessários..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Público-alvo</Label>
                <Textarea
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  placeholder="Descreva o público-alvo ideal..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasTest"
                    checked={formData.hasTest}
                    onCheckedChange={(checked) => handleInputChange('hasTest', checked)}
                  />
                  <Label htmlFor="hasTest">Incluir teste de avaliação</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="certificate"
                    checked={formData.certificate}
                    onCheckedChange={(checked) => handleInputChange('certificate', checked)}
                  />
                  <Label htmlFor="certificate">Emitir certificado</Label>
                </div>
              </div>

              {formData.hasTest && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">Configurações do Teste</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTestConfigOpen(true)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurar
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Duração:</span>
                      <p className="font-medium">{formData.testDuration} min</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Nota mínima:</span>
                      <p className="font-medium">{formData.passingScore}%</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Tentativas:</span>
                      <p className="font-medium">{formData.maxAttempts}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controle de Acesso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Controle de Acesso</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessType">Tipo de Acesso</Label>
                <Select value={formData.accessType} onValueChange={(value) => handleInputChange('accessType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de acesso" />
                  </SelectTrigger>
                  <SelectContent>
                    {accessTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-slate-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.accessType === 'department' && (
                <div className="space-y-2">
                  <Label>Departamentos Permitidos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Qualidade', 'Produção', 'Engenharia', 'Compras', 'RH', 'Financeiro'].map((dept) => (
                      <div key={dept} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`dept-${dept}`}
                          checked={formData.selectedDepartments.includes(dept)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('selectedDepartments', [...formData.selectedDepartments, dept]);
                            } else {
                              handleInputChange('selectedDepartments', formData.selectedDepartments.filter(d => d !== dept));
                            }
                          }}
                        />
                        <Label htmlFor={`dept-${dept}`} className="text-sm">{dept}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.accessType === 'role' && (
                <div className="space-y-2">
                  <Label>Funções Permitidas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Admin', 'Gerente', 'Coordenador', 'Analista', 'Técnico', 'Operador'].map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`role-${role}`}
                          checked={formData.selectedRoles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('selectedRoles', [...formData.selectedRoles, role]);
                            } else {
                              handleInputChange('selectedRoles', formData.selectedRoles.filter(r => r !== role));
                            }
                          }}
                        />
                        <Label htmlFor={`role-${role}`} className="text-sm">{role}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Revisões */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5" />
                <span>Histórico de Revisões</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Data Original</Label>
                  <p className="text-sm text-slate-600">{formData.originalDate}</p>
                </div>
                <div>
                  <Label>Revisão Atual</Label>
                  <p className="text-sm text-slate-600">Revisão {formData.revisionNumber}</p>
                </div>
                <div>
                  <Label>Data da Revisão</Label>
                  <p className="text-sm text-slate-600">{formData.revisionDate}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleCreateRevision}
                className="flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Criar Nova Revisão</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Preview do Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {formData.thumbnail ? (
                  <img
                    src={URL.createObjectURL(formData.thumbnail)}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {formData.title || 'Título do Treinamento'}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {formData.description || 'Descrição do treinamento aparecerá aqui...'}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">
                      {formData.category || 'Categoria'}
                    </Badge>
                    {formData.hasTest && (
                      <Badge variant="outline">Com Teste</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{formData.instructor || 'Instrutor'}</span>
                    <span>{formData.estimatedDuration || 'Duração'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Configuração de Teste */}
      <Dialog open={isTestConfigOpen} onOpenChange={setIsTestConfigOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações do Teste</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testDuration">Duração do Teste (minutos)</Label>
              <Input
                id="testDuration"
                type="number"
                value={formData.testDuration}
                onChange={(e) => handleInputChange('testDuration', parseInt(e.target.value))}
                min="5"
                max="120"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passingScore">Nota Mínima para Aprovação (%)</Label>
              <Input
                id="passingScore"
                type="number"
                value={formData.passingScore}
                onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value))}
                min="50"
                max="100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Número Máximo de Tentativas</Label>
              <Input
                id="maxAttempts"
                type="number"
                value={formData.maxAttempts}
                onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value))}
                min="1"
                max="5"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsTestConfigOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsTestConfigOpen(false)}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
