import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Download, 
  FileText, 
  Video, 
  Image, 
  Link, 
  Users, 
  Calendar, 
  Clock,
  Search,
  Filter,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Settings,
  RefreshCw,
  FileCheck,
  Ban,
  Shield,
  Activity
} from 'lucide-react';

interface DownloadRecord {
  id: string;
  materialId: string;
  materialTitle: string;
  materialType: 'video' | 'pdf' | 'slides' | 'image' | 'scorm' | 'link';
  userId: string;
  userName: string;
  userEmail: string;
  downloadDate: string;
  status: 'completed' | 'failed' | 'cancelled' | 'pending';
  fileSize?: number;
  downloadTime?: number; // em segundos
  ipAddress: string;
  userAgent: string;
  watermarkApplied: boolean;
  accessLevel: 'full' | 'restricted' | 'preview';
}

interface MaterialDownloadSettings {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'slides' | 'image' | 'scorm' | 'link';
  downloadEnabled: boolean;
  watermarkEnabled: boolean;
  accessRestrictions: string[];
  maxDownloadsPerUser: number;
  downloadExpiration: number; // em dias
  requireApproval: boolean;
  totalDownloads: number;
  lastDownload?: string;
}

export default function TrainingDownloadsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Mock data
  const mockDownloadRecords: DownloadRecord[] = [
    {
      id: '1',
      materialId: '1',
      materialTitle: 'Manual ISO 9001:2015',
      materialType: 'pdf',
      userId: '1',
      userName: 'João Silva',
      userEmail: 'joao.silva@empresa.com',
      downloadDate: '2024-01-20T10:30:00Z',
      status: 'completed',
      fileSize: 2.5,
      downloadTime: 45,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      watermarkApplied: true,
      accessLevel: 'full'
    },
    {
      id: '2',
      materialId: '2',
      materialTitle: 'Vídeo - Introdução à Inspeção',
      materialType: 'video',
      userId: '2',
      userName: 'Maria Santos',
      userEmail: 'maria.santos@empresa.com',
      downloadDate: '2024-01-19T14:15:00Z',
      status: 'completed',
      fileSize: 15.2,
      downloadTime: 120,
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      watermarkApplied: false,
      accessLevel: 'restricted'
    },
    {
      id: '3',
      materialId: '1',
      materialTitle: 'Manual ISO 9001:2015',
      materialType: 'pdf',
      userId: '3',
      userName: 'Carlos Lima',
      userEmail: 'carlos.lima@empresa.com',
      downloadDate: '2024-01-18T09:45:00Z',
      status: 'failed',
      fileSize: 2.5,
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      watermarkApplied: false,
      accessLevel: 'preview'
    }
  ];

  const mockMaterialSettings: MaterialDownloadSettings[] = [
    {
      id: '1',
      title: 'Manual ISO 9001:2015',
      type: 'pdf',
      downloadEnabled: true,
      watermarkEnabled: true,
      accessRestrictions: ['Engenheiros', 'Coordenadores'],
      maxDownloadsPerUser: 3,
      downloadExpiration: 30,
      requireApproval: false,
      totalDownloads: 45,
      lastDownload: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      title: 'Vídeo - Introdução à Inspeção',
      type: 'video',
      downloadEnabled: false,
      watermarkEnabled: true,
      accessRestrictions: ['Inspetores', 'Técnicos'],
      maxDownloadsPerUser: 1,
      downloadExpiration: 7,
      requireApproval: true,
      totalDownloads: 23,
      lastDownload: '2024-01-19T14:15:00Z'
    },
    {
      id: '3',
      title: 'Slides - Processos de Qualidade',
      type: 'slides',
      downloadEnabled: true,
      watermarkEnabled: false,
      accessRestrictions: ['Todos'],
      maxDownloadsPerUser: 5,
      downloadExpiration: 60,
      requireApproval: false,
      totalDownloads: 18,
      lastDownload: '2024-01-17T16:20:00Z'
    }
  ];

  const filteredRecords = mockDownloadRecords.filter(record => {
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    const matchesMaterial = selectedMaterial === 'all' || record.materialId === selectedMaterial;
    const matchesUser = selectedUser === 'all' || record.userId === selectedUser;
    const matchesSearch = record.materialTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesMaterial && matchesUser && matchesSearch;
  });

  const getStatusBadge = (status: DownloadRecord['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">Falhou</Badge>;
      case 'cancelled': return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTypeIcon = (type: DownloadRecord['materialType']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'slides': return <FileText className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'scorm': return <FileCheck className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getAccessLevelBadge = (level: DownloadRecord['accessLevel']) => {
    switch (level) {
      case 'full': return <Badge className="bg-green-100 text-green-800">Completo</Badge>;
      case 'restricted': return <Badge className="bg-yellow-100 text-yellow-800">Restrito</Badge>;
      case 'preview': return <Badge className="bg-blue-100 text-blue-800">Preview</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatFileSize = (size?: number) => {
    if (!size) return '-';
    if (size < 1024) return `${size} KB`;
    return `${(size / 1024).toFixed(1)} MB`;
  };

  const formatDownloadTime = (time?: number) => {
    if (!time) return '-';
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Controle de Downloads</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie downloads de materiais e histórico de acesso</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Downloads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {mockDownloadRecords.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Downloads Bem-sucedidos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {mockDownloadRecords.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Downloads Falharam</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {mockDownloadRecords.filter(r => r.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuários Únicos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {new Set(mockDownloadRecords.map(r => r.userId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Buscar por material, usuário ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-48">
                <Label htmlFor="material">Material</Label>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os materiais</SelectItem>
                    <SelectItem value="1">Manual ISO 9001:2015</SelectItem>
                    <SelectItem value="2">Vídeo - Introdução à Inspeção</SelectItem>
                    <SelectItem value="3">Slides - Processos de Qualidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-48">
                <Label htmlFor="user">Usuário</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    <SelectItem value="1">João Silva</SelectItem>
                    <SelectItem value="2">Maria Santos</SelectItem>
                    <SelectItem value="3">Carlos Lima</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Downloads */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Downloads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Tempo</TableHead>
                  <TableHead>Acesso</TableHead>
                  <TableHead>Marca d'água</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(record.materialType)}
                        <div>
                          <div className="font-medium">{record.materialTitle}</div>
                          <div className="text-sm text-gray-500">
                            {record.materialType.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.userName}</div>
                        <div className="text-sm text-gray-500">{record.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(record.downloadDate).toLocaleDateString('pt-BR')}</div>
                        <div className="text-gray-500">
                          {new Date(record.downloadDate).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      {formatFileSize(record.fileSize)}
                    </TableCell>
                    <TableCell>
                      {formatDownloadTime(record.downloadTime)}
                    </TableCell>
                    <TableCell>
                      {getAccessLevelBadge(record.accessLevel)}
                    </TableCell>
                    <TableCell>
                      {record.watermarkApplied ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{record.ipAddress}</div>
                        <div className="text-gray-500 text-xs truncate max-w-32">
                          {record.userAgent}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Download */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Download por Material</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMaterialSettings.map((material) => (
              <div key={material.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(material.type)}
                    <div>
                      <h3 className="font-medium">{material.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {material.totalDownloads} downloads • Último: {material.lastDownload ? 
                          new Date(material.lastDownload).toLocaleDateString('pt-BR') : 'Nunca'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={material.downloadEnabled}
                      onCheckedChange={() => {}}
                    />
                    <span className="text-sm">
                      {material.downloadEnabled ? 'Habilitado' : 'Desabilitado'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Marca d'água</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Switch 
                        checked={material.watermarkEnabled}
                        onCheckedChange={() => {}}
                      />
                      <span className="text-sm">
                        {material.watermarkEnabled ? 'Aplicada' : 'Não aplicada'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Máximo por usuário</Label>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {material.maxDownloadsPerUser} downloads
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Expiração</Label>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {material.downloadExpiration} dias
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label className="text-sm font-medium">Restrições de Acesso</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {material.accessRestrictions.map((restriction, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {material.requireApproval && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Requer Aprovação
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Activity className="w-4 h-4 mr-2" />
                      Relatório
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
