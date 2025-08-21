import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bot, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useScrollPosition } from '@/hooks/use-scroll-position';

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
  const { scrollY, scrollDirection, isScrolling } = useScrollPosition();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "severino-button-container", 
              className,
              isScrolling && "scrolling",
              hasUnreadMessages && "has-unread"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: isScrolling && scrollDirection === 'down' ? 10 : 0,
              rotate: isScrolling ? (scrollDirection === 'down' ? 5 : -5) : 0
            }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              duration: 0.2,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggle();
              }}
              size="lg"
              className={cn(
                "relative w-14 h-14 rounded-full shadow-lg border",
                "bg-white dark:bg-gray-800",
                "hover:bg-gray-50 dark:hover:bg-gray-700",
                "border-gray-200 dark:border-gray-600",
                "hover:border-gray-300 dark:hover:border-gray-500",
                "text-gray-700 dark:text-gray-200",
                "transition-all duration-200",
                "backdrop-blur-sm",
                isOpen && "ring-2 ring-blue-500/50"
              )}
            >
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
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/severino-avatar.svg" />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Bot className="w-4 h-4" />
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
                    {isOpen ? (
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Bot className="w-6 h-6 text-blue-600" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Unread messages indicator */}
              {hasUnreadMessages && (
                <motion.div 
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <span className="text-xs text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </motion.div>
              )}

              {/* Processing Indicator */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-full border-2 border-blue-500/50 border-t-blue-500 animate-spin"
                  />
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">Severino AI</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
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
