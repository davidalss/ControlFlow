import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Camera, RotateCcw, Download, Upload, Crop, Filter, Settings, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImageUrl: string) => void;
  imageFile?: File;
}

// Função para otimizar imagem
const optimizeImage = (file: File, quality: number = 0.8, maxWidth: number = 1920): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular dimensões mantendo proporção
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Aplicar suavização para melhor qualidade
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
      }
      
      // Converter para WebP se suportado, senão JPEG
      const format = 'image/webp';
      const optimizedDataUrl = canvas.toDataURL(format, quality);
      
      resolve(optimizedDataUrl);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Função para aplicar filtros
const applyFilter = (imageData: ImageData, filter: string): ImageData => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return imageData;
  
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  
  ctx.putImageData(imageData, 0, 0);
  
  switch (filter) {
    case 'grayscale':
      ctx.filter = 'grayscale(100%)';
      break;
    case 'sepia':
      ctx.filter = 'sepia(50%)';
      break;
    case 'blur':
      ctx.filter = 'blur(2px)';
      break;
    case 'brightness':
      ctx.filter = 'brightness(120%)';
      break;
    case 'contrast':
      ctx.filter = 'contrast(120%)';
      break;
    default:
      return imageData;
  }
  
  ctx.drawImage(canvas, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

export default function PhotoEditorModal({ 
  isOpen, 
  onClose, 
  onSave, 
  imageFile 
}: PhotoEditorModalProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [quality, setQuality] = useState([80]);
  const [filter, setFilter] = useState<string>('none');
  const [rotation, setRotation] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Carregar imagem quando o modal abrir
  React.useEffect(() => {
    if (isOpen && imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [isOpen, imageFile]);

  // Limpar estado quando fechar
  React.useEffect(() => {
    if (!isOpen) {
      setPhoto(null);
      setQuality([80]);
      setFilter('none');
      setRotation(0);
      setIsOptimizing(false);
    }
  }, [isOpen]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsOptimizing(true);
    try {
      const optimizedUrl = await optimizeImage(file, quality[0] / 100);
      setPhoto(optimizedUrl);
    } catch (error) {
      console.error('Erro ao otimizar imagem:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [quality]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Configurar canvas com dimensões do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Capturar frame do vídeo
    ctx.drawImage(video, 0, 0);

    // Converter para data URL
    const dataUrl = canvas.toDataURL('image/jpeg', quality[0] / 100);
    setPhoto(dataUrl);

    // Parar stream da câmera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [quality]);

  const rotateImage = useCallback(() => {
    if (!photo) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const newRotation = (rotation + 90) % 360;
      setRotation(newRotation);

      // Calcular novas dimensões
      const isVertical = newRotation === 90 || newRotation === 270;
      canvas.width = isVertical ? img.height : img.width;
      canvas.height = isVertical ? img.width : img.height;

      if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((newRotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
      }

      const rotatedDataUrl = canvas.toDataURL('image/jpeg', quality[0] / 100);
      setPhoto(rotatedDataUrl);
    };

    img.src = photo;
  }, [photo, rotation, quality]);

  const downloadPhoto = useCallback(() => {
    if (!photo) return;

    const link = document.createElement('a');
    link.download = 'profile-photo.jpg';
    link.href = photo;
    link.click();
  }, [photo]);

  const handleSave = useCallback(() => {
    if (photo) {
      onSave(photo);
    }
  }, [photo, onSave]);

  const handleClose = useCallback(() => {
    // Parar stream da câmera se estiver ativo
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Editor de Foto de Perfil</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview da imagem */}
          {photo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crop className="w-5 h-5" />
                  Preview da Imagem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img
                    src={photo}
                    alt="Preview"
                    className="max-w-full max-h-64 object-contain rounded-lg border"
                    style={{
                      filter: filter !== 'none' ? `url(#${filter})` : 'none',
                      transform: `rotate(${rotation}deg)`
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Controles de edição */}
          {photo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Controles de Edição
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Qualidade */}
                <div>
                  <label className="text-sm font-medium">Qualidade: {quality[0]}%</label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={100}
                    min={10}
                    step={5}
                    className="mt-2"
                  />
                </div>

                {/* Filtros */}
                <div>
                  <label className="text-sm font-medium">Filtros</label>
                  <div className="flex gap-2 mt-2">
                    {['none', 'grayscale', 'sepia', 'blur', 'brightness', 'contrast'].map((filterOption) => (
                      <Button
                        key={filterOption}
                        variant={filter === filterOption ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(filterOption)}
                      >
                        {filterOption === 'none' ? 'Normal' : 
                         filterOption === 'grayscale' ? 'Preto e Branco' :
                         filterOption === 'sepia' ? 'Sépia' :
                         filterOption === 'blur' ? 'Desfoque' :
                         filterOption === 'brightness' ? 'Brilho' :
                         filterOption === 'contrast' ? 'Contraste' : filterOption}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={rotateImage}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Rotacionar
                  </Button>
                  
                  <Button
                    onClick={downloadPhoto}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Captura/Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Capturar ou Fazer Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Área da câmera */}
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover rounded-lg border"
                />
                
                {/* Botões da câmera */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                  <Button
                    onClick={startCamera}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Iniciar Câmera
                  </Button>
                  
                  <Button
                    onClick={capturePhoto}
                    disabled={!streamRef.current || isOptimizing}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Capturar
                  </Button>
                </div>
              </div>

              {/* Upload de arquivo */}
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex items-center gap-2 mx-auto"
                  disabled={isOptimizing}
                >
                  <Upload className="w-4 h-4" />
                  Fazer Upload
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!photo || isOptimizing}
            >
              Salvar Foto
            </Button>
          </div>
        </div>

        {/* Canvas oculto para captura */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
