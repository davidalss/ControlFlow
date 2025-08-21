import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Camera, RotateCcw, Download, Upload, Crop, Filter, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PhotoEditorProps {
  onPhotoCapture?: (photo: string) => void;
  onPhotoUpload?: (photo: string) => void;
  initialPhoto?: string;
  className?: string;
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

export default function PhotoEditor({ 
  onPhotoCapture, 
  onPhotoUpload, 
  initialPhoto, 
  className = "" 
}: PhotoEditorProps) {
  const [photo, setPhoto] = useState<string | null>(initialPhoto || null);
  const [isEditing, setIsEditing] = useState(false);
  const [quality, setQuality] = useState([80]);
  const [filter, setFilter] = useState<string>('none');
  const [rotation, setRotation] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Função para capturar foto da câmera
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Configurar canvas com dimensões do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Aplicar rotação se necessário
    if (rotation !== 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0);
    }

    // Otimizar imagem
    setIsOptimizing(true);
    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          const optimizedPhoto = await optimizeImage(file, quality[0] / 100);
          setPhoto(optimizedPhoto);
          onPhotoCapture?.(optimizedPhoto);
        }
        setIsOptimizing(false);
      }, 'image/jpeg', quality[0] / 100);
    } catch (error) {
      console.error('Erro ao otimizar foto:', error);
      setIsOptimizing(false);
    }

    // Parar stream da câmera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [rotation, quality, onPhotoCapture]);

  // Função para iniciar câmera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
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

  // Função para fazer upload de foto
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsOptimizing(true);
    try {
      const optimizedPhoto = await optimizeImage(file, quality[0] / 100);
      setPhoto(optimizedPhoto);
      onPhotoUpload?.(optimizedPhoto);
    } catch (error) {
      console.error('Erro ao otimizar foto:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [quality, onPhotoUpload]);

  // Função para aplicar filtro
  const handleFilterChange = useCallback((newFilter: string) => {
    setFilter(newFilter);
    
    if (!photo) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const filteredData = applyFilter(imageData, newFilter);
      
      ctx.putImageData(filteredData, 0, 0);
      const filteredPhoto = canvas.toDataURL('image/jpeg', quality[0] / 100);
      setPhoto(filteredPhoto);
    };
    
    img.src = photo;
  }, [photo, quality]);

  // Função para rotacionar imagem
  const rotateImage = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Função para baixar foto
  const downloadPhoto = useCallback(() => {
    if (!photo) return;
    
    const link = document.createElement('a');
    link.download = `photo-${Date.now()}.jpg`;
    link.href = photo;
    link.click();
  }, [photo]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Editor de Fotos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Área de preview da foto */}
          {photo && (
            <div className="relative">
              <img 
                src={photo} 
                alt="Foto capturada" 
                className="w-full h-64 object-cover rounded-lg border"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  filter: filter !== 'none' ? filter : 'none'
                }}
              />
              
              {/* Overlay de otimização */}
              {isOptimizing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Otimizando imagem...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controles de edição */}
          <div className="space-y-4">
            {/* Controle de qualidade */}
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
                    onClick={() => handleFilterChange(filterOption)}
                    disabled={!photo}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setIsEditing(true)}
                disabled={!photo}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Editar
              </Button>
              
              <Button
                onClick={rotateImage}
                disabled={!photo}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Rotacionar
              </Button>
              
              <Button
                onClick={downloadPhoto}
                disabled={!photo}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de captura/upload */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Capturar ou Fazer Upload de Foto</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
