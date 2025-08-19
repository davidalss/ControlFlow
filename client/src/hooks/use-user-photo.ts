import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './use-auth';

export const useUserPhoto = (userId?: string) => {
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const currentUserId = userId || user?.id;

  const getPhotoUrl = async () => {
    if (!currentUserId) return '';

    setIsLoading(true);
    try {
      // Buscar foto do Supabase Storage
      const { data } = supabase.storage
        .from('ENSOS')
        .getPublicUrl(`FOTOS_PERFIL/${currentUserId}/avatar.jpg`);
      
      const baseUrl = data.publicUrl || '';
      const urlWithTimestamp = baseUrl ? `${baseUrl}?t=${Date.now()}` : '';
      
      setPhotoUrl(urlWithTimestamp);
      return urlWithTimestamp;
    } catch (error) {
      console.error('Erro ao buscar foto do usuário:', error);
      setPhotoUrl('');
      return '';
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar foto quando o userId mudar
  useEffect(() => {
    if (currentUserId) {
      getPhotoUrl();
    }
  }, [currentUserId]);

  // Atualizar foto quando o user.photo mudar no contexto
  useEffect(() => {
    if (user?.photo && user.photo.includes('supabase.co')) {
      setPhotoUrl(user.photo);
    }
  }, [user?.photo]);

  const refreshPhoto = () => {
    getPhotoUrl();
  };

  return {
    photoUrl,
    isLoading,
    refreshPhoto
  };
};
