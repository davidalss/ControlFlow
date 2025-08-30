import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAuthorization } from "@/hooks/use-authorization";
import { useSettings } from "@/hooks/use-settings";
import { 
  Settings, 
  Bell, 
  Shield, 
  Monitor, 
  Database, 
  Download, 
  Upload, 
  Key, 
  Eye, 
  EyeOff,
  Save,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Palette,
  Lock,
  User,
  Smartphone,
  Mail,
  Zap
} from "lucide-react";



interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { isAuthorized } = useAuthorization({ requiredRoles: ['admin', 'engineering', 'coordenador'] });
  
  // Hook de configurações
  const {
    notifications,
    system: systemSettings,
    quality: qualitySettings,
    security: securitySettings,
    isLoading,
    setNotifications,
    setSystem: setSystemSettings,
    setQuality: setQualitySettings,
    setSecurity: setSecuritySettings,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings
  } = useSettings();

  // Estados para funcionalidades
  const [activeTab, setActiveTab] = useState('notifications');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    {
      id: '1',
      device: 'Windows 10',
      browser: 'Chrome',
      ip: '192.168.1.100',
      location: 'São Paulo, BR',
      lastActive: 'Agora',
      isCurrent: true
    },
    {
      id: '2',
      device: 'iPhone 14',
      browser: 'Safari',
      ip: '192.168.1.101',
      location: 'São Paulo, BR',
      lastActive: '2 horas atrás',
      isCurrent: false
    }
  ]);



  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({ title: 'Erro', description: 'A nova senha deve ter pelo menos 8 caracteres.', variant: 'destructive' });
      return;
    }

    try {
      // Aqui você implementaria a chamada para a API para alterar a senha
      // await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      toast({ title: 'Sucesso', description: 'Senha alterada com sucesso.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível alterar a senha.', variant: 'destructive' });
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      // Aqui você implementaria a chamada para a API para terminar a sessão
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
      toast({ title: 'Sucesso', description: 'Sessão terminada com sucesso.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível terminar a sessão.', variant: 'destructive' });
    }
  };

  const handleExportData = async () => {
    try {
      const userData = {
        user: user,
        settings: {
          notifications,
          system: systemSettings,
          quality: qualitySettings,
          security: securitySettings
        },
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `controlflow-data-${user?.email}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'Sucesso', description: 'Dados exportados com sucesso.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível exportar os dados.', variant: 'destructive' });
    }
  };

  const handleClearCache = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Recarregar configurações padrão
      window.location.reload();
      toast({ title: 'Sucesso', description: 'Cache limpo com sucesso.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível limpar o cache.', variant: 'destructive' });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Usuário não autenticado</h3>
          <p className="mt-1 text-sm text-gray-500">Faça login para acessar as configurações.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400">Personalize o sistema de acordo com suas necessidades</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => saveSettings('all')}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Tudo</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Qualidade</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Dados</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Canais de Notificação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <Label className="text-sm font-medium">Notificações por Email</Label>
                      <p className="text-xs text-gray-500">Receba alertas importantes por email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <div>
                      <Label className="text-sm font-medium">Notificações Push</Label>
                      <p className="text-xs text-gray-500">Alertas em tempo real no navegador</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    <div>
                      <Label className="text-sm font-medium">Notificações no App</Label>
                      <p className="text-xs text-gray-500">Alertas dentro do aplicativo</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.inApp}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, inApp: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Tipos de Alerta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Alertas de Qualidade</Label>
                    <p className="text-xs text-gray-500">Defeitos críticos e não conformidades</p>
                  </div>
                  <Switch
                    checked={notifications.qualityAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, qualityAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Atualizações de Fornecedores</Label>
                    <p className="text-xs text-gray-500">Mudanças no status dos fornecedores</p>
                  </div>
                  <Switch
                    checked={notifications.supplierUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, supplierUpdates: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Lembretes de Treinamento</Label>
                    <p className="text-xs text-gray-500">Notificações sobre treinamentos pendentes</p>
                  </div>
                  <Switch
                    checked={notifications.trainingReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, trainingReminders: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Frequência de Notificações</Label>
                  <Select 
                    value={notifications.frequency} 
                    onValueChange={(value) => setNotifications({ ...notifications, frequency: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Imediato</SelectItem>
                      <SelectItem value="hourly">A cada hora</SelectItem>
                      <SelectItem value="daily">Diário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => saveSettings('notifications')} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Notificações
            </Button>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Preferências Regionais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings({ ...systemSettings, language: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select value={systemSettings.theme} onValueChange={(value) => setSystemSettings({ ...systemSettings, theme: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato de Data</Label>
                  <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings({ ...systemSettings, dateFormat: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Configurações de Sessão</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Logout Automático (minutos)</Label>
                  <Select value={systemSettings.autoLogout.toString()} onValueChange={(value) => setSystemSettings({ ...systemSettings, autoLogout: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Retenção de Dados (dias)</Label>
                  <Select value={systemSettings.dataRetention.toString()} onValueChange={(value) => setSystemSettings({ ...systemSettings, dataRetention: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 dias</SelectItem>
                      <SelectItem value="180">180 dias</SelectItem>
                      <SelectItem value="365">1 ano</SelectItem>
                      <SelectItem value="730">2 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => saveSettings('system')} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Sistema
            </Button>
          </div>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Thresholds de Aprovação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Aprovação Automática (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={qualitySettings.autoApprovalThreshold}
                    onChange={(e) => setQualitySettings({ ...qualitySettings, autoApprovalThreshold: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Percentual mínimo para aprovação automática</p>
                </div>
                <div className="space-y-2">
                  <Label>Threshold de Defeitos Críticos (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={qualitySettings.criticalDefectThreshold}
                    onChange={(e) => setQualitySettings({ ...qualitySettings, criticalDefectThreshold: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Percentual máximo de defeitos críticos aceitáveis</p>
                </div>
                <div className="space-y-2">
                  <Label>Performance de Fornecedores (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={qualitySettings.supplierPerformanceThreshold}
                    onChange={(e) => setQualitySettings({ ...qualitySettings, supplierPerformanceThreshold: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Threshold mínimo para aprovação de fornecedores</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Configurações de Inspeção</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Evidência Fotográfica Obrigatória</Label>
                    <p className="text-xs text-gray-500">Exigir fotos para todas as inspeções</p>
                  </div>
                  <Switch
                    checked={qualitySettings.requirePhotoEvidence}
                    onCheckedChange={(checked) => setQualitySettings({ ...qualitySettings, requirePhotoEvidence: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Análise Automática</Label>
                    <p className="text-xs text-gray-500">Usar IA para análise automática de imagens</p>
                  </div>
                  <Switch
                    checked={qualitySettings.enableAutoAnalysis}
                    onCheckedChange={(checked) => setQualitySettings({ ...qualitySettings, enableAutoAnalysis: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delay de Notificação (minutos)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={qualitySettings.notificationDelay}
                    onChange={(e) => setQualitySettings({ ...qualitySettings, notificationDelay: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Tempo de espera antes de enviar notificações</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => saveSettings('quality')} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Qualidade
            </Button>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Alterar Senha</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Senha Atual</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha atual"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nova Senha</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a nova senha"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar Nova Senha</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirme a nova senha"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={isLoading} className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Sessões Ativas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{session.device} - {session.browser}</p>
                          {session.isCurrent && <Badge variant="secondary">Atual</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">{session.ip} • {session.location}</p>
                        <p className="text-xs text-gray-400">Ativo: {session.lastActive}</p>
                      </div>
                      {!session.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => saveSettings('security')} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Segurança
            </Button>
          </div>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Exportar Dados</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-600">
                  Exporte seus dados pessoais, configurações e histórico de atividades em formato JSON.
                </p>
                <Button onClick={handleExportData} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Dados Pessoais
                </Button>
                <div className="text-xs text-gray-500">
                  <p>• Configurações do usuário</p>
                  <p>• Preferências de notificação</p>
                  <p>• Histórico de atividades</p>
                  <p>• Dados de perfil</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5" />
                  <span>Manutenção</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-600">
                  Limpe o cache do navegador e dados temporários armazenados localmente.
                </p>
                <Button onClick={handleClearCache} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpar Cache
                </Button>
                <div className="text-xs text-gray-500">
                  <p>• Dados temporários</p>
                  <p>• Cache do navegador</p>
                  <p>• Configurações locais</p>
                  <p>• Sessões antigas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
