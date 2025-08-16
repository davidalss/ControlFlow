import React from 'react';
import { Button } from '@/components/ui/button';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Brain, MessageSquare, Zap, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SeverinoButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  isProcessing?: boolean;
  className?: string;
  isMinimized?: boolean;
  hasUnreadMessages?: boolean;
  unreadCount?: number;
}

export const SeverinoButton: React.FC<SeverinoButtonProps> = ({
  isOpen,
  onToggle,
  isProcessing = false,
  className,
  isMinimized = false,
  hasUnreadMessages = false,
  unreadCount = 0
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn("fixed bottom-6 right-6 z-[9999]", className)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggle();
              }}
              size="lg"
              className={cn(
                "relative w-16 h-16 rounded-full shadow-lg border border-gray-200 dark:border-gray-600",
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                "text-white transition-all duration-200 font-medium",
                isOpen && "ring-2 ring-blue-500 ring-opacity-30"
              )}
            >
              {/* Main Icon */}
              <AnimatePresence mode="wait">
                                 {isMinimized ? (
                   <motion.div
                     key="minimized"
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.8 }}
                     transition={{ duration: 0.2 }}
                     className="relative flex items-center justify-center w-full h-full"
                   >
                     <Avatar className="w-8 h-8 bg-slate-600 border-2 border-slate-500">
                       <AvatarImage src="/severino-avatar.svg" />
                       <AvatarFallback>
                         <Brain className="w-4 h-4" />
                       </AvatarFallback>
                     </Avatar>
                   </motion.div>
                 ) : (
                  <motion.div
                    key="open"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="relative flex items-center justify-center w-full h-full"
                  >
                    {isMinimized ? (
                      // Avatar do Severino quando minimizado
                      <Avatar className="w-8 h-8 bg-slate-600 border-2 border-slate-500">
                        <AvatarImage src="/severino-avatar.svg" />
                        <AvatarFallback>
                          <Brain className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      // Ícone padrão quando fechado
                      <div className="w-8 h-8 bg-white rounded-full opacity-80 shadow-sm"></div>
                    )}
                    

                    
                    {/* Unread messages indicator */}
                    {hasUnreadMessages && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {unreadCount}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>



              {/* Processing Indicator */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"
                  />
                )}
              </AnimatePresence>

                             {/* Sparkles Effect */}
               <AnimatePresence>
                 {!isOpen && !isMinimized && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <motion.div
                      className="absolute top-0 right-0"
                      animate={{ 
                        y: [0, -10, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        delay: 0
                      }}
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                    </motion.div>
                    <motion.div
                      className="absolute bottom-0 left-0"
                      animate={{ 
                        y: [0, 10, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        delay: 1.5
                      }}
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="text-center">
            <div className="font-semibold text-blue-600 mb-1 text-sm">Severino</div>
                         <div className="text-sm text-gray-600 leading-relaxed">
               {isMinimized 
                 ? "Reabrir chat do Severino" 
                 : isOpen
                 ? "Fechar assistente virtual" 
                 : "Abrir assistente virtual de qualidade"
               }
             </div>
            

          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SeverinoButton;
