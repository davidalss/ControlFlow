import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  useTicketMessages, 
  useCreateMessage, 
  useUploadAttachment,
  useDeleteAttachment,
  formatFileSize,
  isImageFile,
  isVideoFile,
  isPdfFile,
  type TicketMessage,
  type TicketAttachment
} from '@/hooks/use-tickets';
import { 
  Send, 
  Paperclip, 
  Image, 
  Video, 
  FileText, 
  Download, 
  Trash2, 
  User,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketMessagesProps {
  ticketId: string;
}

const TicketMessages: React.FC<TicketMessagesProps> = ({ ticketId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries and mutations
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useTicketMessages(ticketId);
  const createMessageMutation = useCreateMessage();
  const uploadAttachmentMutation = useUploadAttachment();
  const deleteAttachmentMutation = useDeleteAttachment();

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await createMessageMutation.mutateAsync({
        ticketId,
        content: newMessage.trim(),
        messageType: 'text'
      });

      setNewMessage('');
      refetchMessages();
      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente ou entre em contato com o suporte.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadAttachmentMutation.mutateAsync({
          ticketId,
          file,
          messageId: undefined // Upload to ticket, not specific message
        });
      }

      toast({
        title: "Arquivo(s) enviado(s)!",
        description: "Seus arquivos foram enviados com sucesso.",
      });
      refetchMessages();
    } catch (error) {
      toast({
        title: "Erro ao enviar arquivo",
        description: "Tente novamente ou entre em contato com o suporte.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachmentMutation.mutateAsync({
        ticketId,
        attachmentId
      });

      toast({
        title: "Anexo removido!",
        description: "O anexo foi removido com sucesso.",
      });
      refetchMessages();
    } catch (error) {
      toast({
        title: "Erro ao remover anexo",
        description: "Tente novamente ou entre em contato com o suporte.",
        variant: "destructive",
      });
    }
  };

  const getMessageTypeIcon = (messageType: TicketMessage['messageType']) => {
    switch (messageType) {
      case 'system': return <AlertCircle className="h-4 w-4" />;
      case 'status_change': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (isImageFile(fileType)) return <Image className="h-4 w-4" />;
    if (isVideoFile(fileType)) return <Video className="h-4 w-4" />;
    if (isPdfFile(fileType)) return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const renderAttachment = (attachment: TicketAttachment) => (
    <div key={attachment.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
      {getFileIcon(attachment.fileType)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.fileName}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.fileSize)}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(attachment.fileUrl, '_blank')}
        >
          <Download className="h-4 w-4" />
        </Button>
        {user?.id === attachment.uploadedBy && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteAttachment(attachment.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens e Anexos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messagesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Carregando mensagens...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
                <p className="text-sm text-muted-foreground">Seja o primeiro a comentar!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        {getMessageTypeIcon(message.messageType)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.author?.name || 'Usuário'}
                        </span>
                        <Badge variant={message.messageType === 'system' ? 'secondary' : 'outline'}>
                          {message.messageType === 'system' ? 'Sistema' : 
                           message.messageType === 'status_change' ? 'Mudança de Status' : 'Usuário'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Message Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          <p className="text-xs text-muted-foreground">Anexos:</p>
                          {message.attachments.map(renderAttachment)}
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </div>
              ))
            )}
          </div>

          {/* New Message Input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={3}
                className="flex-1"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Paperclip className="h-4 w-4 mr-1" />
                  {isUploading ? 'Enviando...' : 'Anexar'}
                </Button>
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || createMessageMutation.isPending}
              >
                <Send className="h-4 w-4 mr-1" />
                {createMessageMutation.isPending ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketMessages;
