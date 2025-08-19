import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { 
  User, Mail, Camera, Lock, Save, 
  Edit3, Shield, Calendar, Building,
  LogOut, RefreshCw, UserCheck, Settings, Trash2
} from "lucide-react";
import PhotoEditor from "@/components/PhotoEditor";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const { uploadProfilePhoto, getProfilePhotoUrl, deleteProfilePhoto, isUploading } = usePhotoUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    sector: user?.businessUnit || '',
    photo: user?.photo || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });

  // Role definitions para exibir informações do usuário
  const roleDefinitions = {
    'admin': { name: 'Administrador', color: 'bg-red-100 text-red-800', icon: Shield },
    'inspector': { name: 'Inspetor', color: 'bg-green-100 text-green-800', icon: UserCheck },
    'engineering': { name: 'Engenharia', color: 'bg-blue-100 text-blue-800', icon: Settings },
    'coordenador': { name: 'Coordenador', color: 'bg-purple-100 text-purple-800', icon: User },
    'manager': { name: 'Gerente', color: 'bg-amber-100 text-amber-800', icon: Building },
    'analista': { name: 'Analista', color: 'bg-indigo-100 text-indigo-800', icon: User },
    'lider': { name: 'Líder', color: 'bg-cyan-100 text-cyan-800', icon: User },
    'supervisor': { name: 'Supervisor', color: 'bg-pink-100 text-pink-800', icon: User },
    'block_control': { name: 'Controle de Bloqueio', color: 'bg-red-100 text-red-800', icon: Lock },
    'temporary_viewer': { name: 'Visualizador Temporário', color: 'bg-gray-100 text-gray-800', icon: User },
    'tecnico': { name: 'Técnico', color: 'bg-orange-100 text-orange-800', icon: User },
    'assistente': { name: 'Assistente', color: 'bg-blue-100 text-blue-800', icon: User },
    'p&d': { name: 'P&D', color: 'bg-cyan-100 text-cyan-800', icon: User }
  };

  const setores = {
    'DIY': 'DIY',
    'TECH': 'TECH', 
    'KITCHEN_BEAUTY': 'COZINHA & BELEZA',
    'MOTOR_COMFORT': 'MOTOR & CONFORTO',
    'N/A': 'N/A'
  };

  const currentRole = roleDefinitions[user?.role as keyof typeof roleDefinitions];
  const RoleIcon = currentRole?.icon || User;

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
      const photoUrl = await uploadProfilePhoto(file, user.id);
      
      if (photoUrl) {
        setProfileData(prev => ({ ...prev, photo: photoUrl }));
        
        // Atualiza o contexto de autenticação
        updateUser({ photo: photoUrl });
      }
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
    } finally {
      setSelectedImageFile(null);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não identificado",
        variant: "destructive"
      });
      return;
    }

    const success = await deleteProfilePhoto(user.id);
    if (success) {
      setProfileData(prev => ({ ...prev, photo: '' }));
      updateUser({ photo: '' });
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Obter token do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/users/profile', {
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

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro", 
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Obter token do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setIsChangePasswordOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast({
          title: "Sucesso",
          description: "Senha alterada com sucesso!"
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao alterar senha');
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleChangeEmail = async () => {
    try {
      // Obter token do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/users/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          password: emailData.password
        })
      });

      if (response.ok) {
        setIsChangeEmailOpen(false);
        setEmailData({ newEmail: '', password: '' });
        toast({
          title: "Sucesso",
          description: "Email alterado com sucesso! Faça login novamente."
        });
        // Logout após alterar email
        setTimeout(() => logout(), 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao alterar email');
      }
    } catch (error: any) {
      toast({
        title: "Erro", 
        description: error.message || "Erro ao alterar email. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleRequestPasswordReset = async () => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user?.email
        })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Email de recuperação enviado! Verifique sua caixa de entrada."
        });
      } else {
        throw new Error('Erro ao enviar email de recuperação');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar email de recuperação. Tente novamente.",
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
                  <AvatarImage src={profileData.photo} alt={user.name} className="w-full h-full object-cover rounded-full" />
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
                    {currentRole?.name || user.role}
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

      {/* Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Segurança */}
        <Card className="shadow-md hover-lift transition-all duration-200" style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Lock className="w-5 h-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  style={{
                    backgroundColor: 'var(--btn-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar Senha
                </Button>
              </DialogTrigger>
              <DialogContent style={{
                backgroundColor: 'var(--modal-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <DialogHeader>
                  <DialogTitle style={{ color: 'var(--text-primary)' }}>Alterar Senha</DialogTitle>
                  <DialogDescription style={{ color: 'var(--text-secondary)' }}>
                    Digite sua senha atual e a nova senha.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword" style={{ color: 'var(--text-primary)' }}>Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword" style={{ color: 'var(--text-primary)' }}>Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" style={{ color: 'var(--text-primary)' }}>Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsChangePasswordOpen(false)}
                    style={{
                      backgroundColor: 'var(--btn-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleChangePassword}
                    style={{
                      backgroundColor: 'var(--accent-color)',
                      color: 'white'
                    }}
                  >
                    Alterar Senha
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleRequestPasswordReset}
              style={{
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Solicitar Reset de Senha
            </Button>
          </CardContent>
        </Card>

        {/* Conta */}
        <Card className="shadow-md hover-lift transition-all duration-200" style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Mail className="w-5 h-5" />
              Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Dialog open={isChangeEmailOpen} onOpenChange={setIsChangeEmailOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  style={{
                    backgroundColor: 'var(--btn-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Alterar Email
                </Button>
              </DialogTrigger>
              <DialogContent style={{
                backgroundColor: 'var(--modal-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <DialogHeader>
                  <DialogTitle style={{ color: 'var(--text-primary)' }}>Alterar Email</DialogTitle>
                  <DialogDescription style={{ color: 'var(--text-secondary)' }}>
                    Digite o novo email e sua senha para confirmar.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="newEmail" style={{ color: 'var(--text-primary)' }}>Novo Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={emailData.newEmail}
                      onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="passwordConfirm" style={{ color: 'var(--text-primary)' }}>Confirmar Senha</Label>
                    <Input
                      id="passwordConfirm"
                      type="password"
                      value={emailData.password}
                      onChange={(e) => setEmailData(prev => ({ ...prev, password: e.target.value }))}
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsChangeEmailOpen(false)}
                    style={{
                      backgroundColor: 'var(--btn-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleChangeEmail}
                    style={{
                      backgroundColor: 'var(--accent-color)',
                      color: 'white'
                    }}
                  >
                    Alterar Email
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="p-3 rounded-lg" style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)'
            }}>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  Conta criada em: {new Date(user.createdAt || '').toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Photo Editor */}
      <PhotoEditor
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
