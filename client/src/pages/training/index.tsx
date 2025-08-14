import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Image, 
  FileText, 
  History, 
  Award,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Componentes das seções
import TrainingList from './components/TrainingList';
import NewTraining from './components/NewTraining';
import ThumbnailManager from './components/ThumbnailManager';
import TestConfig from './components/TestConfig';
import TrainingHistory from './components/TrainingHistory';
import Certificates from './components/Certificates';

interface TrainingSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export default function TrainingPage() {
  const location = useLocation();
  
  // Determina qual seção mostrar baseado na rota
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/training/new') return 'new';
    if (path === '/training/thumbnails') return 'thumbnails';
    if (path === '/training/tests') return 'tests';
    if (path === '/training/history') return 'history';
    if (path === '/training/certificates') return 'certificates';
    return 'list'; // padrão
  };

  const activeSection = getActiveSection();

  // Mapeia seções para componentes
  const getComponent = () => {
    switch (activeSection) {
      case 'new':
        return <NewTraining />;
      case 'thumbnails':
        return <ThumbnailManager />;
      case 'tests':
        return <TestConfig />;
      case 'history':
        return <TrainingHistory />;
      case 'certificates':
        return <Certificates />;
      default:
        return <TrainingList />;
    }
  };

  return (
    <div className="min-h-screen theme-gradient-primary">
      {/* Header */}
              <div className="theme-card-primary theme-border-primary px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Treinamentos e Testes</h1>
            <p className="text-slate-600 mt-1">Gerencie treinamentos, testes e certificados</p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getComponent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
