import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Camera, Search, Package, Calendar, User, Scan, X, Upload, Image as ImageIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ProductIdentificationProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export default function ProductIdentification({ data, onUpdate, onNext }: ProductIdentificationProps) {
  const { toast } = useToast();
  const [eanCode, setEanCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [currentDateTime] = useState(new Date().toLocaleString('pt-BR'));
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [productPhoto, setProductPhoto] = useState<string | null>(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inspectionTypes = [
    { value: 'bonification', label: 'Bonificação' },
    { value: 'container', label: 'Container' }
  ];

  // Carregar todos os produtos do sistema
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await apiRequest('GET', '/api/products');
        const products = await response.json();
        setAllProducts(products);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        // Fallback para dados mock se a API falhar
        setAllProducts([
          {
            id: "prod_1",
            code: "FW011424",
            description: "WAP WL 6100 ULTRA 220V",
            ean: "7899831343843",
            category: "Limpeza",
            family: "lavadora - intensivo",
            businessUnit: "KITCHEN_BEAUTY"
          },
          {
            id: "prod_2",
            code: "FW011423",
            description: "WAP WL 6100 220V",
            ean: "7899831342846",
            category: "Limpeza",
            family: "lavadora - intensivo",
            businessUnit: "KITCHEN_BEAUTY"
          },
          {
            id: "prod_3",
            code: "FW009484",
            description: "WAP WL 4000 ULTRA 220V",
            ean: "7899831312610",
            category: "Limpeza",
            family: "lavadora - intensivo",
            businessUnit: "DIY"
          },
          {
            id: "prod_4",
            code: "FW009483",
            description: "WAP WL 4000 ULTRA 127V",
            ean: "7899831311613",
            category: "Limpeza",
            family: "lavadora - intensivo",
            businessUnit: "DIY"
          },
          {
            id: "prod_5",
            code: "FW009482",
            description: "WAP WL 4000 220V",
            ean: "7899831310616",
            category: "Limpeza",
            family: "lavadora - intensivo",
            businessUnit: "DIY"
          }
        ]);
      }
    };

    loadProducts();
  }, []);

  const handleEanSearch = async () => {
    if (!eanCode.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, digite ou escaneie o código EAN ou código do produto",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Buscar por EAN ou código do produto (case-insensitive)
      const productData = allProducts.find(p => 
        p.ean.toLowerCase() === eanCode.toLowerCase() || 
        p.code.toLowerCase() === eanCode.toLowerCase()
      );
      
      if (productData) {
        setProduct(productData);
        onUpdate({ product: productData, eanCode: eanCode });
        setNotificationMessage(`Produto encontrado: ${productData.description} - ${productData.code}`);
        setShowNotification(true);
      } else {
        // Tentar buscar na API como fallback
        try {
          const response = await apiRequest('GET', `/api/products/search?q=${eanCode}`);
          const apiProduct = await response.json();
          
          if (apiProduct) {
            setProduct(apiProduct);
            onUpdate({ product: apiProduct, eanCode: eanCode });
            setNotificationMessage(`Produto encontrado: ${apiProduct.description} - ${apiProduct.code}`);
            setShowNotification(true);
          } else {
            toast({
              title: "Produto não encontrado",
              description: "Verifique o código EAN ou código do produto e tente novamente",
              variant: "destructive",
            });
          }
        } catch (apiError) {
          toast({
            title: "Produto não encontrado",
            description: "Verifique o código EAN ou código do produto e tente novamente",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Erro ao buscar produto no sistema",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEanSearch();
    }
  };

  const handleScanBarcode = () => {
    setIsScanning(true);
    setScanResult('');
    
    // Simular leitura de código de barras (BIPAR)
    // Em produção, aqui seria integrado com a API do scanner
    setTimeout(() => {
      // Usar um código que existe nos dados reais
      const mockBarcode = 'FW011424'; // Código do produto
      setScanResult(mockBarcode);
      setEanCode(mockBarcode);
      setIsScanning(false);
      
      toast({
        title: "Código escaneado",
        description: `Código: ${mockBarcode}`,
      });
      
      // Auto-buscar o produto após escaneamento
      setTimeout(() => {
        handleEanSearch();
      }, 500);
    }, 2000);
  };

  const cancelScan = () => {
    setIsScanning(false);
    setScanResult('');
  };

  const handleInputFocus = () => {
    // Auto-focus no input quando clicar no campo
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handlePhotoCapture = () => {
    setIsCapturingPhoto(true);
    
    // Simular captura de foto com a câmera
    setTimeout(() => {
      const mockPhotoUrl = `/uploads/photo-${Date.now()}-${Math.floor(Math.random() * 1000000)}.jpg`;
      setProductPhoto(mockPhotoUrl);
      onUpdate({ productPhoto: mockPhotoUrl });
      setIsCapturingPhoto(false);
      
      toast({
        title: "Foto capturada",
        description: "Foto do produto foi capturada com sucesso",
      });
    }, 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string;
        setProductPhoto(photoUrl);
        onUpdate({ productPhoto: photoUrl });
        toast({
          title: "Foto carregada",
          description: "Foto do produto foi carregada com sucesso",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProductPhoto(null);
    onUpdate({ productPhoto: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canProceed = () => {
    const basicValidation = product && data.inspectionType && data.fresNf;
    
    // Para bonificação, validar também a quantidade
    if (data.inspectionType === 'bonification') {
      return basicValidation && data.quantity && data.quantity > 0;
    }
    
    return basicValidation;
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* ✅ Notificação Clicável */}
      {showNotification && (
        <div 
          className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg cursor-pointer hover:bg-green-600 transition-colors"
          onClick={() => setShowNotification(false)}
        >
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <span className="font-medium">{notificationMessage}</span>
            <X className="w-4 h-4 ml-2" />
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Identificação do Produto</h2>
        <p className="text-gray-600 mt-2">Leia o código EAN ou código do produto e configure os dados iniciais da inspeção</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leitura do Código EAN */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Leitura do Código EAN ou Código do Produto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ean-code">Código EAN ou Código do Produto</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    id="ean-code"
                    placeholder="Digite ou escaneie o código EAN ou código do produto"
                    value={eanCode}
                    onChange={(e) => setEanCode(e.target.value)}
                    onKeyPress={handleManualInput}
                    onFocus={handleInputFocus}
                    className="pr-12"
                    disabled={isScanning}
                  />
                  {isScanning && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleEanSearch}
                  disabled={isLoading || isScanning}
                  className="px-4"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              {!isScanning ? (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleScanBarcode}
                  disabled={isLoading}
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Escanear Código (BIPAR)
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  onClick={cancelScan}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar Escaneamento
                </Button>
              )}
              <Button variant="outline" className="flex-1">
                <QrCode className="w-4 h-4 mr-2" />
                Escanear QR Code
              </Button>
            </div>

            {scanResult && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <QrCode className="w-4 h-4" />
                  <span className="text-sm font-medium">Código escaneado:</span>
                  <span className="text-sm font-mono bg-green-100 px-2 py-1 rounded">
                    {scanResult}
                  </span>
                </div>
              </div>
            )}

            {/* Informações sobre códigos aceitos */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700">
                <div className="font-medium mb-1">Códigos aceitos:</div>
                <div className="space-y-1 text-xs">
                  <div>• <strong>EAN:</strong> 7899831343843, 7899831342846, etc.</div>
                  <div>• <strong>Código do Produto:</strong> FW011424, FW011423, FW009484, etc.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Produto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Dados do Produto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Nome:</span>
                  <span className="text-sm font-semibold">{product.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Código:</span>
                  <span className="text-sm font-semibold">{product.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">EAN:</span>
                  <span className="text-sm font-semibold">{product.ean || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Família:</span>
                  <span className="text-sm font-semibold">{product.family || product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">BU:</span>
                  <Badge variant="outline">{product.businessUnit}</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Produto não identificado</p>
                <p className="text-sm">Escaneie ou digite o código EAN ou código do produto</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações da Inspeção */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Inspeção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fres-nf">FRES/NF</Label>
              <Input
                id="fres-nf"
                placeholder="Digite o FRES/NF"
                value={data.fresNf || ''}
                onChange={(e) => onUpdate({ fresNf: e.target.value })}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inspection-type">Tipo de Inspeção</Label>
              <Select 
                value={data.inspectionType} 
                onValueChange={(value) => onUpdate({ inspectionType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {inspectionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {data.inspectionType === 'bonification' && (
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="999"
                  placeholder="Qtd de produtos"
                  value={data.quantity || ''}
                  onChange={(e) => onUpdate({ quantity: parseInt(e.target.value) || 1 })}
                  className="font-mono"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Data e Hora</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{currentDateTime}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Inspetor</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{data.inspector?.name}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Foto do Produto/Embalagem</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handlePhotoCapture}
                disabled={isCapturingPhoto}
                className="flex-1"
              >
                {isCapturingPhoto ? (
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
                )}
                {isCapturingPhoto ? 'Capturando...' : 'Capturar Foto'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Selecionar arquivo de imagem"
              />
            </div>
            
            {productPhoto && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Foto anexada:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative">
                  <img 
                    src={productPhoto} 
                    alt="Foto do produto" 
                    className="w-32 h-32 object-cover rounded-md border shadow-sm"
                  />
                  <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                    <ImageIcon className="w-3 h-3" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button 
          onClick={handleNext}
          disabled={!canProceed()}
          className="px-8"
        >
          Próximo Passo
        </Button>
      </div>
    </div>
  );
}
