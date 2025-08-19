import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export const usePhotoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadProfilePhoto = async (file: File, userId: string): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione apenas arquivos de imagem.');
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 5MB.');
      }

      // Converter para JPEG se necessário
      let imageFile = file;
      if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
        });
        
        imageFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      }

      // Upload para o Supabase Storage
      const filePath = `FOTOS_PERFIL/${userId}/avatar.jpg`;
      
      const { data, error } = await supabase.storage
        .from('ENSOS')
        .upload(filePath, imageFile, {
          upsert: true, // Substitui o arquivo se já existir
          cacheControl: '3600',
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw new Error('Erro ao fazer upload da foto para o Supabase Storage');
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('ENSOS')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Erro ao gerar URL pública da foto');
      }

      // Adicionar timestamp para evitar cache
      const photoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      toast({
        title: "Sucesso",
        description: "Foto do perfil atualizada com sucesso!"
      });

      return photoUrl;

    } catch (error) {
      console.error('Erro no upload da foto:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fazer upload da foto. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const getProfilePhotoUrl = (userId: string): string => {
    const { data } = supabase.storage
      .from('ENSOS')
      .getPublicUrl(`FOTOS_PERFIL/${userId}/avatar.jpg`);
    
    return data.publicUrl || '';
  };

  const deleteProfilePhoto = async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('ENSOS')
        .remove([`FOTOS_PERFIL/${userId}/avatar.jpg`]);

      if (error) {
        console.error('Erro ao deletar foto:', error);
        throw new Error('Erro ao deletar foto do perfil');
      }

      toast({
        title: "Sucesso",
        description: "Foto do perfil removida com sucesso!"
      });

      return true;
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao deletar foto do perfil.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    uploadProfilePhoto,
    getProfilePhotoUrl,
    deleteProfilePhoto,
    isUploading
  };
};
