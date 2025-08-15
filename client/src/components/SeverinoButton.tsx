import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Brain, MessageSquare, Zap, Sparkles, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SeverinoButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  hasNotifications?: boolean;
  notificationCount?: number;
  isProcessing?: boolean;
  className?: string;
}

export const SeverinoButton: React.FC<SeverinoButtonProps> = ({
  isOpen,
  onToggle,
  hasNotifications = false,
  notificationCount = 0,
  isProcessing = false,
  className
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn("fixed bottom-6 right-6 z-40", className)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onToggle}
              size="lg"
              className={cn(
                "relative w-14 h-14 rounded-full shadow-lg border border-gray-200 dark:border-gray-600",
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                "text-white transition-all duration-200 font-medium",
                isOpen && "ring-2 ring-blue-500 ring-opacity-30"
              )}
            >
              {/* Main Icon */}
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MessageSquare className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <Brain className="w-6 h-6" />
                    
                    {/* AI Status Indicator */}
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notification Badge */}
              <AnimatePresence>
                {hasNotifications && notificationCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Badge 
                      variant="destructive" 
                      className="h-6 w-6 rounded-full p-0 text-xs font-bold flex items-center justify-center"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
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
                {!isOpen && (
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
              {isOpen 
                ? "Fechar assistente virtual" 
                : "Abrir assistente virtual de qualidade"
              }
            </div>
            {hasNotifications && notificationCount > 0 && (
              <div className="text-xs text-orange-600 mt-2 font-medium">
                {notificationCount} nova{notificationCount > 1 ? 's' : ''} notificação{notificationCount > 1 ? 'ões' : ''}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1 font-medium">
              IA ativa e conectada
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SeverinoButton;
