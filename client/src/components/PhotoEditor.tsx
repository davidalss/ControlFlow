import React, { useState, useRef, useCallback } from 'react';
import { Cropper, type ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { 
  ZoomIn, ZoomOut, RotateCcw, RotateCw, 
  X, Upload, Save 
} from "lucide-react";

interface PhotoEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImage: string) => void;
  imageFile?: File;
}

export default function PhotoEditor({ isOpen, onClose, onSave, imageFile }: PhotoEditorProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);

  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  }, []);

  const handleSave = useCallback(async () => {
    setIsProcessing(true);

    try {
      const cropper = cropperRef.current?.cropper;
      if (!cropper) throw new Error('Cropper não inicializado');

      const canvas = cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      if (!canvas) throw new Error('Falha ao gerar canvas recortado');

      const croppedImageUrl: string = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Blob vazio'));
            resolve(URL.createObjectURL(blob));
          },
          'image/jpeg',
          0.9
        );
      });

      onSave(croppedImageUrl);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Erro ao processar a imagem. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  }, [onSave, onClose]);

  const handleRotate = (direction: 'left' | 'right') => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.rotate(direction === 'left' ? -90 : 90);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.zoom(direction === 'in' ? 0.1 : -0.1);
  };

  const handleReset = () => {
    const cropper = cropperRef.current?.cropper;
    cropper?.reset();
  };

  // Carregar imagem quando o componente abrir
  React.useEffect(() => {
    if (imageFile && isOpen) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-5xl max-h-[90vh] overflow-auto"
        style={{
          backgroundColor: 'var(--modal-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text-primary)' }}>
            Editar Foto do Perfil
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--text-secondary)' }}>
            Ajuste, recorte e salve sua foto de perfil
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Controles simples */}
          <div className="flex items-center justify-between p-4 rounded-lg" style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="flex items-center gap-4">
              {/* Upload de nova imagem */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--btn-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Nova Imagem
                  </Button>
                </label>
              </div>

              {/* Dica de uso */}
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Arraste para posicionar e use zoom/rotação. O recorte é quadrado.
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('out')}
                style={{
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('in')}
                style={{
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              {/* Rotação */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate('left')}
                style={{
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate('right')}
                style={{
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <RotateCw className="w-4 h-4" />
              </Button>

              {/* Reset */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                style={{
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Área de edição */}
          <div className="flex-1 min-h-[400px] max-h-[60vh] flex items-center justify-center overflow-auto rounded-lg" style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)'
          }}>
            {imageSrc ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <Cropper
                  ref={cropperRef}
                  src={imageSrc}
                  style={{ width: '100%', height: '60vh' }}
                  // Configurações para garantir comportamento estável
                  viewMode={2}
                  responsive
                  checkOrientation={false}
                  background={false}
                  autoCropArea={1}
                  aspectRatio={1}
                  guides
                  center
                  dragMode="move"
                  movable
                  zoomable
                  zoomOnWheel
                  zoomOnTouch
                  rotatable
                  scalable={false}
                  minContainerWidth={300}
                  minContainerHeight={300}
                  minCanvasWidth={100}
                  minCanvasHeight={100}
                  // Garante que o crop inicial fique centralizado e máximo possível
                  ready={() => {
                    const cropper = cropperRef.current?.cropper;
                    if (!cropper) return;
                    cropper.reset();
                    cropper.setAspectRatio(1);
                    // autoCropArea=1 com viewMode=2 já limita ao máximo dentro da imagem
                  }}
                />
              </div>
            ) : (
              <div className="text-center p-8" style={{ color: 'var(--text-secondary)' }}>
                <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Selecione uma imagem para começar a editar</p>
              </div>
            )}
          </div>

        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            style={{
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)'
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isProcessing || !imageSrc}
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'white'
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            {isProcessing ? 'Salvando...' : 'Salvar Foto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
