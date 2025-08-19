import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { useAuth } from "@/hooks/use-auth";
import UserAvatar from "@/components/UserAvatar";
import { Camera, Trash2 } from "lucide-react";

export default function PhotoUploadExample() {
  const { user } = useAuth();
  const { uploadProfilePhoto, deleteProfilePhoto, isUploading } = usePhotoUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return;

    const photoUrl = await uploadProfilePhoto(selectedFile, user.id);
    if (photoUrl) {
      console.log('Foto enviada com sucesso:', photoUrl);
      setSelectedFile(null);
    }
  };

  const handleDelete = async () => {
    if (!user?.id) return;

    const success = await deleteProfilePhoto(user.id);
    if (success) {
      console.log('Foto deletada com sucesso');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Exemplo de Upload de Foto</h2>
      
      {/* Avatar atual */}
      <div className="flex items-center gap-4">
        <UserAvatar 
          userId={user?.id || ''} 
          userName={user?.name} 
          size="xl" 
        />
        <div>
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Upload de nova foto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upload de Nova Foto</h3>
        
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            {isUploading ? 'Enviando...' : 'Enviar Foto'}
          </Button>
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-600">
            Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>

      {/* Deletar foto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Gerenciar Foto</h3>
        
        <Button 
          onClick={handleDelete}
          variant="destructive"
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Deletar Foto
        </Button>
      </div>

      {/* Informações do sistema */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Informações do Sistema</h3>
        <ul className="text-sm space-y-1">
          <li>• Bucket: ENSOS</li>
          <li>• Estrutura: FOTOS_PERFIL/{user?.id}/avatar.jpg</li>
          <li>• Tamanho máximo: 5MB</li>
          <li>• Tipos permitidos: JPEG, PNG, GIF</li>
          <li>• Conversão automática para JPEG</li>
        </ul>
      </div>
    </div>
  );
}
