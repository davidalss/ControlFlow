import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { usePhotoUpload } from '@/hooks/use-photo-upload';
import { useUserPhoto } from '@/hooks/use-user-photo';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Building, 
  Shield, 
  Camera, 
  Trash2, 
  Edit3, 
  Save, 
  LogOut,
  Calendar
} from "lucide-react";
import PhotoEditorModal from "@/components/PhotoEditorModal";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const { uploadProfilePhoto, getProfilePhotoUrl, deleteProfilePhoto, isUploading } = usePhotoUpload();
  const { photoUrl, refreshPhoto } = useUserPhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    sector: user?.businessUnit || '',
    photo: photoUrl || ''
  });

  // Sincronizar profileData.photo com photoUrl quando ela mudar
  useEffect(() => {
    setProfileData(prev => ({ ...prev, photo: photoUrl || '' }));
  }, [photoUrl]);

  // Atualizar profileData quando user mudar
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || prev.name,
        sector: user.businessUnit || prev.sector
      }));
    }
  }, [user]);

  // Role definitions para exibir informações do usuário
  const roleDefinitions = {
    admin: { label: 'Administrador', icon: Shield, color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    manager: { label: 'Gerente', icon: User, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
    engineering: { label: 'Engenharia', icon: Building, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    inspector: { label: 'Inspetor', icon: User, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
    block_control: { label: 'Controle de Blocos', icon: Shield, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' }
  };

  const currentRole = roleDefinitions[user?.role as keyof typeof roleDefinitions] || roleDefinitions.inspector;
  const RoleIcon = currentRole?.icon || User;

  // Setores disponíveis
  const setores = {
    'QUALIDADE': 'Qualidade',
    'P&D': 'P&D',
    'TEMPORARIO': 'Temporário'
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro", 
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Abrir editor de foto
    setSelectedImageFile(file);
    setIsPhotoEditorOpen(true);
  };

  const handlePhotoSave = async (croppedImageUrl: string) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não identificado",
        variant: "destructive"
      });
      return;
    }

    try {
      // Converter URL do blob para File
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });

      // Upload usando o hook personalizado
      const newPhotoUrl = await uploadProfilePhoto(file, user.id);
      
      if (newPhotoUrl) {
        // Atualizar estado local
        setProfileData(prev => ({ ...prev, photo: newPhotoUrl }));
        
        // Atualiza o contexto de autenticação
        updateUser({ photo: newPhotoUrl });
        
        // Atualizar foto no hook
        refreshPhoto();
        
        toast({
          title: "Sucesso",
          description: "Foto do perfil atualizada com sucesso!"
        });
      }
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar foto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSelectedImageFile(null);
      setIsPhotoEditorOpen(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.id) return;

    try {
      const success = await deleteProfilePhoto(user.id);
      if (success) {
        setProfileData(prev => ({ ...prev, photo: '' }));
        updateUser({ photo: '' });
        refreshPhoto();
      }
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Obter token do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com'}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileData.name,
          businessUnit: profileData.sector
        })
      });

      if (response.ok) {
        setIsEditingProfile(false);
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!"
        });
      } else {
        throw new Error('Erro ao atualizar perfil');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive"
      });
    }
  };



  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Meu Perfil
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          className="flex items-center gap-2 hover-lift transition-all duration-200"
          style={{
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="shadow-md hover-lift transition-all duration-200" style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <User className="w-5 h-5" />
              Informações do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Foto do Perfil */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 rounded-full overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                  <AvatarImage 
                    src={profileData.photo} 
                    alt={user.name} 
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      // Se a imagem falhar ao carregar, limpar o src para mostrar o fallback
                      const target = e.target as HTMLImageElement;
                      target.src = '';
                    }}
                  />
                  <AvatarFallback className="text-xl font-bold rounded-full" style={{
                    backgroundColor: 'var(--accent-color)',
                    color: 'var(--text-primary)'
                  }}>
                    {user.name ? (user.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U') : 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{
                    backgroundColor: 'var(--btn-bg)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <Camera className="w-4 h-4" />
                </Button>
                {profileData.photo && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={handleDeletePhoto}
                    disabled={isUploading}
                    style={{
                      backgroundColor: 'var(--destructive-bg)',
                      border: '1px solid var(--destructive-color)',
                      color: 'var(--destructive-color)'
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  aria-label="Upload de foto de perfil"
                  title="Selecionar foto de perfil"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {user.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {user.email}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={currentRole?.color || 'bg-gray-100 text-gray-800'}>
                    <RoleIcon className="w-3 h-3 mr-1" />
                    {currentRole?.label || user.role}
                  </Badge>
                  {user.businessUnit && (
                    <Badge variant="outline" style={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}>
                      <Building className="w-3 h-3 mr-1" />
                      {setores[user.businessUnit as keyof typeof setores] || user.businessUnit}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                variant="outline"
                className="flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <Edit3 className="w-4 h-4" />
                {isEditingProfile ? 'Cancelar' : 'Editar'}
              </Button>
            </div>

            {/* Edição do Perfil */}
            {isEditingProfile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid gap-4 p-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="name" style={{ color: 'var(--text-primary)' }}>Nome</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sector" style={{ color: 'var(--text-primary)' }}>Setor</Label>
                  <select
                    id="sector"
                    value={profileData.sector}
                    onChange={(e) => setProfileData(prev => ({ ...prev, sector: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--text-primary)'
                    }}
                    aria-label="Selecionar setor"
                    title="Selecionar setor"
                  >
                    {Object.entries(setores).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  className="w-full flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Informações da Conta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-md hover-lift transition-all duration-200" style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Mail className="w-5 h-5" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg" style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)'
            }}>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  Conta ativa desde {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Photo Editor Modal */}
      <PhotoEditorModal
        isOpen={isPhotoEditorOpen}
        onClose={() => {
          setIsPhotoEditorOpen(false);
          setSelectedImageFile(null);
        }}
        onSave={handlePhotoSave}
        imageFile={selectedImageFile || undefined}
      />
    </div>
  );
}
