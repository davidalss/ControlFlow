import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Brain, MessageSquare, Zap, Sparkles, Bot } from 'lucide-react';
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
            className={cn("absolute bottom-6 right-6 z-[9999]", className)}
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
                "relative w-16 h-16 rounded-full shadow-2xl border-2",
                "bg-gradient-to-br from-stone-600 via-stone-700 to-stone-800",
                "hover:from-stone-700 hover:via-stone-800 hover:to-stone-900",
                "dark:from-stone-500 dark:via-stone-600 dark:to-stone-700",
                "dark:hover:from-stone-600 dark:hover:via-stone-700 dark:hover:to-stone-800",
                "text-white transition-all duration-300 font-semibold",
                "backdrop-blur-sm",
                isOpen && "ring-4 ring-stone-400/30 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
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
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative flex items-center justify-center w-full h-full"
                  >
                    {/* Avatar do Severino quando minimizado */}
                    <Avatar className="w-10 h-10 bg-white/20 border-2 border-white/30 backdrop-blur-sm">
                      <AvatarImage src="/severino-avatar.svg" />
                      <AvatarFallback className="bg-white/20 text-white">
                        <Bot className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Badge "IA" animado */}
                    <motion.div
                      className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <motion.div
                        className="bg-gradient-to-r from-stone-600 to-stone-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-stone-400/50 backdrop-blur-sm"
                        animate={{
                          scale: [1, 1.05, 1],
                          boxShadow: [
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                          ]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        IA
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative flex items-center justify-center w-full h-full"
                  >
                    {isOpen ? (
                      // Ícone quando aberto
                      <motion.div 
                        className="w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Brain className="w-5 h-5 text-purple-700" />
                      </motion.div>
                    ) : (
                      // Estado fechado com "IA" animado
                      <div className="relative flex items-center justify-center w-full h-full">
                        {/* Círculo central com gradiente moderno */}
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-br from-white/90 to-white/70 rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm border border-white/50"
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 3, -3, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <motion.div
                            className="text-purple-700 font-bold text-sm"
                            animate={{
                              opacity: [0.8, 1, 0.8]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            IA
                          </motion.div>
                        </motion.div>
                        
                        {/* Anel pulsante externo */}
                        <motion.div
                          className="absolute inset-0 border-2 border-white/30 rounded-full"
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.3, 0, 0.3]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                        />
                        
                        {/* Anel pulsante interno */}
                        <motion.div
                          className="absolute inset-1 border border-white/20 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 0.5
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Unread messages indicator */}
                    {hasUnreadMessages && (
                      <motion.div 
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <span className="text-xs text-white font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </motion.div>
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
                    className="absolute inset-0 rounded-full border-2 border-white/50 border-t-white animate-spin"
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
                      className="absolute top-1 right-1"
                      animate={{ 
                        y: [0, -8, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        delay: 0
                      }}
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300 drop-shadow-sm" />
                    </motion.div>
                    <motion.div
                      className="absolute bottom-1 left-1"
                      animate={{ 
                        y: [0, 8, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, -180, -360]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        delay: 1.5
                      }}
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300 drop-shadow-sm" />
                    </motion.div>
                    <motion.div
                      className="absolute top-1/2 left-1"
                      animate={{ 
                        x: [0, 8, 0],
                        opacity: [0, 1, 0],
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{ 
                        duration: 2.5,
                        repeat: Infinity,
                        delay: 0.75
                      }}
                    >
                      <Sparkles className="w-2 h-2 text-yellow-200 drop-shadow-sm" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center">
            <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">Severino AI</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {isMinimized 
                ? "Reabrir assistente virtual" 
                : isOpen
                ? "Fechar chat do Severino" 
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
