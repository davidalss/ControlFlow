import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  disabled?: boolean;
  minPhotos?: number;
  label?: string;
  buttonText?: string;
}

export default function PhotoUpload({
  photos,
  onPhotosChange,
  disabled = false,
  minPhotos = 3,
  label = "Adicionar fotos",
  buttonText = "Selecionar Fotos"
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com'}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro no upload');
      }

      const data = await response.json();
      onPhotosChange([...photos, ...data.files]);

      toast({
        title: "Upload realizado com sucesso",
        description: `${data.files.length} foto(s) adicionada(s)`,
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload das fotos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div>
      {/* Upload Area */}
      <div className={`border-2 border-dashed rounded-lg p-6 text-center mb-3 ${
        disabled ? 'border-neutral-200 bg-neutral-50' : 'border-neutral-300'
      }`}>
        <span className="material-icons text-4xl text-neutral-400 mb-2">
          {disabled ? 'block' : 'cloud_upload'}
        </span>
        <p className="text-sm text-neutral-600 mb-2">{label}</p>
        {!disabled && (
          <>
            <p className="text-xs text-neutral-500">Mínimo {minPhotos} fotos • JPG, PNG até 5MB</p>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading || disabled}
                className="hidden"
                id={`file-input-${Math.random()}`}
              />
              <Button
                type="button"
                size="sm"
                disabled={uploading || disabled}
                onClick={() => {
                  const input = document.querySelector(`input[type="file"]`) as HTMLInputElement;
                  input?.click();
                }}
                className="bg-primary hover:bg-primary/90"
              >
                {uploading ? "Fazendo upload..." : buttonText}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Photos Preview */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img 
                src={photo} 
                alt={`Foto ${index + 1}`} 
                className="w-full h-20 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-icons text-xs">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Status */}
      <p className={`text-xs flex items-center ${
        photos.length >= minPhotos ? 'text-secondary' : 'text-accent'
      }`}>
        <span className="material-icons mr-1 text-xs">
          {photos.length >= minPhotos ? 'check_circle' : 'warning'}
        </span>
        {photos.length}/{minPhotos} fotos {photos.length >= minPhotos ? 'obrigatórias enviadas' : 'obrigatórias'}
      </p>
    </div>
  );
}
