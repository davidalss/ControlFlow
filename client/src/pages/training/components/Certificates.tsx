import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Eye,
  Linkedin,
  Calendar,
  Award,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  FileText,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

// Mock data para certificados
const mockCertificates = [
  {
    id: 1,
    title: 'Gestão da Qualidade ISO 9001',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
    issueDate: '2024-01-15',
    certificateNumber: 'CERT-2024-001',
    score: 95,
    status: 'verified',
    validUntil: '2025-01-15',
    category: 'Gestão da Qualidade',
    instructor: 'Dr. Maria Silva',
    duration: '4h 30min',
    completionDate: '2024-01-15',
    pdfUrl: '/certificates/cert-001.pdf',
            verificationUrl: 'https://verify.enso.com/cert-001'
  },
  {
    id: 2,
    title: 'Controle Estatístico de Processo (SPC)',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=225&fit=crop',
    issueDate: '2024-02-20',
    certificateNumber: 'CERT-2024-002',
    score: 88,
    status: 'verified',
    validUntil: '2025-02-20',
    category: 'Análise de Dados',
    instructor: 'Prof. João Santos',
    duration: '6h 15min',
    completionDate: '2024-02-20',
    pdfUrl: '/certificates/cert-002.pdf',
            verificationUrl: 'https://verify.enso.com/cert-002'
  },
  {
    id: 3,
    title: 'Auditoria Interna de Qualidade',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=225&fit=crop',
    issueDate: '2024-03-10',
    certificateNumber: 'CERT-2024-003',
    score: 92,
    status: 'expiring_soon',
    validUntil: '2024-12-10',
    category: 'Auditoria',
    instructor: 'Auditor Carlos Lima',
    duration: '3h 45min',
    completionDate: '2024-03-10',
    pdfUrl: '/certificates/cert-003.pdf',
            verificationUrl: 'https://verify.enso.com/cert-003'
  },
  {
    id: 4,
    title: 'Gestão de Fornecedores',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop',
    issueDate: '2023-11-05',
    certificateNumber: 'CERT-2023-004',
    score: 85,
    status: 'expired',
    validUntil: '2024-11-05',
    category: 'Gestão de Fornecedores',
    instructor: 'Eng. Ana Costa',
    duration: '5h 20min',
    completionDate: '2023-11-05',
    pdfUrl: '/certificates/cert-004.pdf',
            verificationUrl: 'https://verify.enso.com/cert-004'
  },
  {
    id: 5,
    title: 'Análise de Riscos em Qualidade',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-4f9a5eb9e4b5?w=400&h=225&fit=crop',
    issueDate: '2024-04-01',
    certificateNumber: 'CERT-2024-005',
    score: 90,
    status: 'verified',
    validUntil: '2025-04-01',
    category: 'Gestão de Riscos',
    instructor: 'Dr. Pedro Oliveira',
    duration: '4h 10min',
    completionDate: '2024-04-01',
    pdfUrl: '/certificates/cert-005.pdf',
            verificationUrl: 'https://verify.enso.com/cert-005'
  }
];

export default function Certificates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'verified':
        return { label: 'Válido', icon: CheckCircle, color: 'bg-green-100 text-green-800' };
      case 'expiring_soon':
        return { label: 'Expira em breve', icon: Clock, color: 'bg-yellow-100 text-yellow-800' };
      case 'expired':
        return { label: 'Expirado', icon: AlertTriangle, color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Desconhecido', icon: AlertTriangle, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleLinkedInShare = (certificate: any) => {
    const title = `Fico feliz de compartilhar que conclui o treinamento "${certificate.title}" no dia de hoje, e com as infos sobre o treinamento`;
    const url = encodeURIComponent(window.location.href);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${encodeURIComponent(title)}`;
    window.open(linkedinUrl, '_blank');
  };

  const handleDownload = (certificate: any) => {
    console.log('Baixando certificado:', certificate.certificateNumber);
    // Simular download
    const link = document.createElement('a');
    link.href = certificate.pdfUrl;
    link.download = `certificado-${certificate.certificateNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerify = (certificate: any) => {
    window.open(certificate.verificationUrl, '_blank');
  };

  const handlePrint = (certificate: any) => {
    setSelectedCertificate(certificate);
    setIsPrintModalOpen(true);
  };

  const filteredCertificates = mockCertificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || cert.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || !selectedStatus || cert.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(mockCertificates.map(cert => cert.category))];
  const statuses = ['verified', 'expiring_soon', 'expired'];

  // Estatísticas
  const totalCertificates = mockCertificates.length;
  const validCertificates = mockCertificates.filter(cert => cert.status === 'verified').length;
  const expiringSoon = mockCertificates.filter(cert => cert.status === 'expiring_soon').length;
  const expiredCertificates = mockCertificates.filter(cert => cert.status === 'expired').length;
  const averageScore = Math.round(mockCertificates.reduce((acc, cert) => acc + cert.score, 0) / totalCertificates);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Meus Certificados</h2>
          <p className="text-slate-600 mt-1">Visualize e gerencie seus certificados de treinamento</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{totalCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Válidos</p>
                <p className="text-2xl font-bold text-slate-900">{validCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Expirando</p>
                <p className="text-2xl font-bold text-slate-900">{expiringSoon}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Média</p>
                <p className="text-2xl font-bold text-slate-900">{averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar certificados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {statuses.map(status => {
                  const statusInfo = getStatusInfo(status);
                  return (
                    <SelectItem key={status} value={status}>
                      {statusInfo.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                {filteredCertificates.length} certificado{filteredCertificates.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Certificados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.map((certificate) => {
          const statusInfo = getStatusInfo(certificate.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <motion.div
              key={certificate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={certificate.thumbnail}
                    alt={certificate.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 text-slate-700">
                      {certificate.score}%
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                    {certificate.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Emitido em {new Date(certificate.issueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>{certificate.certificateNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Instrutor: {certificate.instructor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCertificate(certificate);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(certificate)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePrint(certificate)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(certificate)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLinkedInShare(certificate)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Linkedin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredCertificates.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum certificado encontrado</h3>
          <p className="text-slate-600">Complete um treinamento para obter seu primeiro certificado.</p>
        </div>
      )}

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Certificado</DialogTitle>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={selectedCertificate.thumbnail}
                  alt={selectedCertificate.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={getStatusInfo(selectedCertificate.status).color}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {getStatusInfo(selectedCertificate.status).label}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {selectedCertificate.title}
                  </h3>
                  <p className="text-slate-600">{selectedCertificate.category}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Número do Certificado:</span>
                    <p className="text-slate-600">{selectedCertificate.certificateNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Nota:</span>
                    <p className="text-slate-600">{selectedCertificate.score}%</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Data de Emissão:</span>
                    <p className="text-slate-600">
                      {new Date(selectedCertificate.issueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Válido até:</span>
                    <p className="text-slate-600">
                      {new Date(selectedCertificate.validUntil).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Instrutor:</span>
                    <p className="text-slate-600">{selectedCertificate.instructor}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Duração:</span>
                    <p className="text-slate-600">{selectedCertificate.duration}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => handleDownload(selectedCertificate)}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                  <Button variant="outline" onClick={() => handlePrint(selectedCertificate)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleVerify(selectedCertificate)}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Verificar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleLinkedInShare(selectedCertificate)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    Compartilhar no LinkedIn
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Impressão */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Imprimir Certificado</DialogTitle>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Deseja imprimir o certificado "{selectedCertificate.title}"?
              </p>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="print-color" defaultChecked />
                <label htmlFor="print-color" className="text-sm text-slate-600">
                  Imprimir em cores
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="print-background" defaultChecked />
                <label htmlFor="print-background" className="text-sm text-slate-600">
                  Incluir fundo
                </label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  console.log('Imprimindo certificado:', selectedCertificate.certificateNumber);
                  setIsPrintModalOpen(false);
                }}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
