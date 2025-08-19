import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Mail, Phone, Building, MessageSquare, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoRequestModal({ isOpen, onClose }: DemoRequestModalProps) {
  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsSubmitted(true);
    
    // Reset após 3 segundos
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ company: '', contact: '', message: '' });
      onClose();
    }, 3000);
  };

  const handleWhatsApp = () => {
    const message = `Olá! Gostaria de solicitar uma demonstração do Enso para minha empresa.`;
    const whatsappUrl = `https://wa.me/5541999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="demo-description">
        <DialogHeader>
          <DialogTitle>Solicitar Demonstração</DialogTitle>
          <DialogDescription id="demo-description">
            Preencha os dados e entraremos em contato para agendar sua demonstração gratuita.
          </DialogDescription>
        </DialogHeader>
        
        {!isSubmitted ? (
          <>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                      Nome da Empresa *
                    </Label>
                    <div className="relative mt-1">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="company"
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="pl-10"
                        placeholder="Digite o nome da sua empresa"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact" className="text-sm font-medium text-gray-700">
                      Contato (E-mail ou Telefone) *
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="contact"
                        type="text"
                        required
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="pl-10"
                        placeholder="seu@email.com ou (41) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                      Mensagem (Opcional)
                    </Label>
                    <div className="relative mt-1">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="pl-10 min-h-[80px]"
                        placeholder="Conte-nos sobre suas necessidades..."
                      />
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col space-y-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Enviando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="w-4 h-4" />
                          <span>Solicitar Demonstração</span>
                        </div>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleWhatsApp}
                      className="w-full border-green-500 text-green-600 hover:bg-green-50"
                    >
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Falar no WhatsApp</span>
                      </div>
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Entraremos em contato em até 24 horas
                  </p>
                </form>
              </>
            ) : (
              /* Confirmação */
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold text-gray-900 mb-2"
                >
                  Solicitação Enviada!
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-6"
                >
                  Recebemos sua solicitação! Entraremos em contato o mais rápido possível.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-blue-50 rounded-lg p-4"
                >
                  <p className="text-sm text-blue-800">
                    <strong>Próximos passos:</strong><br />
                    • Nossa equipe analisará sua solicitação<br />
                    • Entraremos em contato para agendar a demonstração<br />
                    • Apresentaremos as funcionalidades específicas para sua empresa
                  </p>
                </motion.div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      );
}
