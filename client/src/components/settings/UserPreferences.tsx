// Componente de configurações do usuário
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Palette, 
  Globe, 
  Grid3X3, 
  Eye, 
  Camera, 
  Sidebar, 
  MessageSquare,
  Monitor,
  RotateCcw,
  Save,
  Cookie
} from 'lucide-react';
import { useCookies } from '@/hooks/use-cookies';
import { useToast } from '@/hooks/use-toast';

export const UserPreferences: React.FC = () => {
  const { 
    preferences, 
    updateUserPreference, 
    resetUserPreferences,
    getCookieStats,
    clearAllCookies 
  } = useCookies();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'flow' | 'inspection' | 'ui' | 'advanced'>('general');

  // =====================================================
  // HANDLERS
  // =====================================================

  const handlePreferenceChange = <K extends keyof typeof preferences>(
    category: K,
    key: keyof typeof preferences[K],
    value: any
  ) => {
    updateUserPreference(category, key, value);
    toast({
      title: "Preferência atualizada",
      description: "Sua configuração foi salva automaticamente.",
    });
  };

  const handleResetPreferences = () => {
    if (confirm('Tem certeza que deseja redefinir todas as preferências?')) {
      resetUserPreferences();
      toast({
        title: "Preferências redefinidas",
        description: "Todas as configurações foram restauradas para os valores padrão.",
      });
    }
  };

  const handleClearCookies = () => {
    if (confirm('Tem certeza que deseja limpar todos os cookies? Isso irá resetar todas as suas configurações.')) {
      clearAllCookies();
      toast({
        title: "Cookies limpos",
        description: "Todos os cookies foram removidos. As configurações foram resetadas.",
      });
    }
  };

  // =====================================================
  // RENDERIZAÇÃO DAS ABAS
  // =====================================================

  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Tema */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-blue-500" />
          <Label htmlFor="theme">Tema da aplicação</Label>
        </div>
        <Select
          value={preferences.theme}
          onValueChange={(value: 'light' | 'dark' | 'auto') => 
            handlePreferenceChange('uiSettings', 'theme', value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Claro</SelectItem>
            <SelectItem value="dark">Escuro</SelectItem>
            <SelectItem value="auto">Automático (Sistema)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          O tema automático segue as configurações do seu sistema operacional.
        </p>
      </div>

      <Separator />

      {/* Idioma */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-green-500" />
          <Label htmlFor="language">Idioma</Label>
        </div>
        <Select
          value={preferences.language}
          onValueChange={(value) => 
            handlePreferenceChange('uiSettings', 'language', value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
            <SelectItem value="en-US">English (US)</SelectItem>
            <SelectItem value="es-ES">Español</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderFlowBuilderTab = () => (
    <div className="space-y-6">
      {/* Configurações do Grid */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Grid3X3 className="h-5 w-5 text-purple-500" />
          <Label>Configurações do Grid</Label>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="grid-snap">Snap ao Grid</Label>
            <p className="text-sm text-muted-foreground">
              Nós se alinham automaticamente ao grid
            </p>
          </div>
          <Switch
            id="grid-snap"
            checked={preferences.flowBuilderSettings.gridSnap}
            onCheckedChange={(checked) => 
              handlePreferenceChange('flowBuilderSettings', 'gridSnap', checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-grid">Mostrar Grid</Label>
            <p className="text-sm text-muted-foreground">
              Exibe linhas de referência no canvas
            </p>
          </div>
          <Switch
            id="show-grid"
            checked={preferences.flowBuilderSettings.showGrid}
            onCheckedChange={(checked) => 
              handlePreferenceChange('flowBuilderSettings', 'showGrid', checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-save">Auto-save</Label>
            <p className="text-sm text-muted-foreground">
              Salva automaticamente as alterações
            </p>
          </div>
          <Switch
            id="auto-save"
            checked={preferences.flowBuilderSettings.autoSave}
            onCheckedChange={(checked) => 
              handlePreferenceChange('flowBuilderSettings', 'autoSave', checked)
            }
          />
        </div>
      </div>

      <Separator />

      {/* Tipo de nó padrão */}
      <div className="space-y-4">
        <Label htmlFor="default-node-type">Tipo de nó padrão</Label>
        <Select
          value={preferences.flowBuilderSettings.defaultNodeType}
          onValueChange={(value) => 
            handlePreferenceChange('flowBuilderSettings', 'defaultNodeType', value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo padrão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="verification">Verificação</SelectItem>
            <SelectItem value="decision">Decisão</SelectItem>
            <SelectItem value="action">Ação</SelectItem>
            <SelectItem value="start">Início</SelectItem>
            <SelectItem value="end">Fim</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderInspectionTab = () => (
    <div className="space-y-6">
      {/* Configurações de execução */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-orange-500" />
          <Label>Configurações de Execução</Label>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-advance">Avanço automático</Label>
            <p className="text-sm text-muted-foreground">
              Avança automaticamente para o próximo passo
            </p>
          </div>
          <Switch
            id="auto-advance"
            checked={preferences.inspectionSettings.autoAdvance}
            onCheckedChange={(checked) => 
              handlePreferenceChange('inspectionSettings', 'autoAdvance', checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-help">Mostrar ajuda por padrão</Label>
            <p className="text-sm text-muted-foreground">
              Exibe dicas de ajuda automaticamente
            </p>
          </div>
          <Switch
            id="show-help"
            checked={preferences.inspectionSettings.showHelpByDefault}
            onCheckedChange={(checked) => 
              handlePreferenceChange('inspectionSettings', 'showHelpByDefault', checked)
            }
          />
        </div>
      </div>

      <Separator />

      {/* Qualidade de foto */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Camera className="h-5 w-5 text-red-500" />
          <Label htmlFor="photo-quality">Qualidade das fotos</Label>
        </div>
        <Select
          value={preferences.inspectionSettings.photoQuality}
          onValueChange={(value: 'low' | 'medium' | 'high') => 
            handlePreferenceChange('inspectionSettings', 'photoQuality', value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a qualidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa (Rápido)</SelectItem>
            <SelectItem value="medium">Média (Equilibrado)</SelectItem>
            <SelectItem value="high">Alta (Melhor qualidade)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Qualidade mais alta = melhor foto, mas mais lento para processar.
        </p>
      </div>
    </div>
  );

  const renderUITab = () => (
    <div className="space-y-6">
      {/* Configurações da interface */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Monitor className="h-5 w-5 text-indigo-500" />
          <Label>Configurações da Interface</Label>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sidebar-collapsed">Sidebar recolhida</Label>
            <p className="text-sm text-muted-foreground">
              Inicia com a barra lateral recolhida
            </p>
          </div>
          <Switch
            id="sidebar-collapsed"
            checked={preferences.uiSettings.sidebarCollapsed}
            onCheckedChange={(checked) => 
              handlePreferenceChange('uiSettings', 'sidebarCollapsed', checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-tooltips">Mostrar tooltips</Label>
            <p className="text-sm text-muted-foreground">
              Exibe dicas ao passar o mouse
            </p>
          </div>
          <Switch
            id="show-tooltips"
            checked={preferences.uiSettings.showTooltips}
            onCheckedChange={(checked) => 
              handlePreferenceChange('uiSettings', 'showTooltips', checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="compact-mode">Modo compacto</Label>
            <p className="text-sm text-muted-foreground">
              Interface mais compacta para telas pequenas
            </p>
          </div>
          <Switch
            id="compact-mode"
            checked={preferences.uiSettings.compactMode}
            onCheckedChange={(checked) => 
              handlePreferenceChange('uiSettings', 'compactMode', checked)
            }
          />
        </div>
      </div>
    </div>
  );

  const renderAdvancedTab = () => {
    const stats = getCookieStats();
    
    return (
      <div className="space-y-6">
        {/* Estatísticas dos cookies */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Cookie className="h-5 w-5 text-amber-500" />
            <Label>Estatísticas dos Cookies</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total de cookies</Label>
              <Badge variant="secondary">{stats.totalCookies}</Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tamanho total</Label>
              <Badge variant="secondary">{stats.totalSize} bytes</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Categorias</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.categories).map(([category, count]) => (
                <Badge key={category} variant="outline">
                  {category}: {count}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Ações avançadas */}
        <div className="space-y-4">
          <Label>Ações Avançadas</Label>
          
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              onClick={handleResetPreferences}
              className="justify-start"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Redefinir todas as preferências
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleClearCookies}
              className="justify-start"
            >
              <Cookie className="h-4 w-4 mr-2" />
              Limpar todos os cookies
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // =====================================================
  // RENDERIZAÇÃO PRINCIPAL
  // =====================================================

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'flow', label: 'Flow Builder', icon: Grid3X3 },
    { id: 'inspection', label: 'Inspeção', icon: Eye },
    { id: 'ui', label: 'Interface', icon: Monitor },
    { id: 'advanced', label: 'Avançado', icon: Cookie },
  ] as const;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configurações do Usuário</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preferências Personalizadas</CardTitle>
          <CardDescription>
            Configure suas preferências para personalizar a experiência no ControlFlow
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Abas */}
          <div className="flex space-x-1 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Conteúdo das abas */}
          <div className="min-h-[400px]">
            {activeTab === 'general' && renderGeneralTab()}
            {activeTab === 'flow' && renderFlowBuilderTab()}
            {activeTab === 'inspection' && renderInspectionTab()}
            {activeTab === 'ui' && renderUITab()}
            {activeTab === 'advanced' && renderAdvancedTab()}
          </div>

          {/* Barra de ações */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              Todas as configurações são salvas automaticamente
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleResetPreferences}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Redefinir
              </Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
