import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";

interface UserAvatarProps {
  userId: string;
  userName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackPhoto?: string;
}

export default function UserAvatar({ 
  userId, 
  userName, 
  size = 'md', 
  className = '',
  fallbackPhoto 
}: UserAvatarProps) {
  // Obter URL da foto do Supabase Storage
  const getProfilePhotoUrl = (): string => {
    const { data } = supabase.storage
      .from('ENSOS')
      .getPublicUrl(`FOTOS_PERFIL/${userId}/avatar.jpg`);
    
    return data.publicUrl || fallbackPhoto || '';
  };

  const photoUrl = getProfilePhotoUrl();

  // Gerar iniciais do nome
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  // Mapear tamanhos para classes CSS
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden`}>
      <AvatarImage 
        src={photoUrl} 
        alt={userName || 'Avatar do usuário'} 
        className="w-full h-full object-cover rounded-full"
      />
      <AvatarFallback className="font-semibold rounded-full">
        {getInitials(userName || 'Usuário')}
      </AvatarFallback>
    </Avatar>
  );
}
