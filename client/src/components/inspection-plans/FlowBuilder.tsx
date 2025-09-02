import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  GripVertical,
  Camera,
  FileText,
  CheckSquare,
  BarChart3,
  Upload,
  Download,
  Settings,
  Users,
  Shield,
  Calendar,
  Tag,
  Info,
  AlertCircle,
  Layers,
  Eye,
  Search,
  Zap,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  XCircle,
  Star,
  Target,
  Award,
  TrendingUp,
  Database,
  Grid,
  List,
  MoreHorizontal,
  FileImage,
  Square,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Lock,
  Unlock,
  Image,
  Copy,
  Share2,
  History,
  Bell,
  Filter,
  SortAsc,
  SortDesc,
  Brain,
  Sparkles,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useFlowBuilderCookies, useUserPreferences } from '@/hooks/use-cookies';

// Tipos para o Flow Builder
export interface FlowNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'nc_handling' | 'end';
  title: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: {
    questionType?: string;
    options?: string[];
    defectType?: string;
    mediaHelp?: string;
    dynamicVariables?: string[];
    conditionalLogic?: {
      condition: string;
      nextNodeId: string;
      label: string;
    }[];
  };
  connections: {
    id: string;
    targetId: string;
    label: string;
    condition?: string;
  }[];
}

export interface FlowConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  condition?: string;
}

export interface FlowPlan {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
  metadata: {
    version: string;
    createdBy: string;
    createdAt: string;
    lastModified: string;
    tags: string[];
  };
}

interface FlowBuilderProps {
  plan?: FlowPlan;
  onSave: (plan: FlowPlan) => void;
  onSimulate: (plan: FlowPlan) => void;
  onClose: () => void;
}

export default function FlowBuilder({ plan, onSave, onSimulate, onClose }: FlowBuilderProps) {
  const { toast } = useToast();
  const { preferences } = useUserPreferences();
  const { 
    flowBuilderState, 
    updateFlowBuilderState, 
    saveCanvasPosition, 
    saveCanvasZoom 
  } = useFlowBuilderCookies();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<FlowNode[]>(plan?.nodes || []);
  const [connections, setConnections] = useState<FlowConnection[]>(plan?.connections || []);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showNodeLibrary, setShowNodeLibrary] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationAnswers, setSimulationAnswers] = useState<Record<string, any>>({});
  
  // Estado do canvas baseado em cookies
  const [canvasZoom, setCanvasZoom] = useState(flowBuilderState.canvasZoom);
  const [canvasPosition, setCanvasPosition] = useState(flowBuilderState.canvasPosition);

  // Nós padrão da biblioteca
  const defaultNodes = [
    {
      id: 'start',
      type: 'start' as const,
      title: 'Início da Inspeção',
      description: 'Ponto de partida da inspeção',
      x: 100,
      y: 100,
      width: 120,
      height: 60,
      data: {},
      connections: []
    },
    {
      id: 'process',
      type: 'process' as const,
      title: 'Verificação',
      description: 'Etapa de verificação padrão',
      x: 300,
      y: 100,
      width: 120,
      height: 60,
      data: {
        questionType: 'yes_no',
        defectType: 'MAIOR'
      },
      connections: []
    },
    {
      id: 'decision',
      type: 'decision' as const,
      title: 'Decisão',
      description: 'Nó de decisão condicional',
      x: 500,
      y: 100,
      width: 120,
      height: 60,
      data: {
        questionType: 'yes_no',
        options: ['SIM', 'NÃO'],
        defectType: 'MAIOR'
      },
      connections: []
    },
    {
      id: 'nc_handling',
      type: 'nc_handling' as const,
      title: 'Tratamento NC',
      description: 'Tratamento de não conformidade',
      x: 700,
      y: 100,
      width: 120,
      height: 60,
      data: {
        defectType: 'CRÍTICO'
      },
      connections: []
    }
  ];

  // Adicionar nó à biblioteca
  const addNodeToLibrary = useCallback((node: Omit<FlowNode, 'id'>) => {
    const newNode: FlowNode = {
      ...node,
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      connections: []
    };
    setNodes(prev => [...prev, newNode]);
    toast({
      title: "Nó adicionado",
      description: "Novo nó adicionado ao fluxo"
    });
  }, [toast]);

  // Adicionar nó padrão
  const addDefaultNode = useCallback((nodeType: FlowNode['type']) => {
    const defaultNode = defaultNodes.find(n => n.type === nodeType);
    if (defaultNode) {
      const newNode: FlowNode = {
        ...defaultNode,
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        connections: []
      };
      setNodes(prev => [...prev, newNode]);
    }
  }, []);

  // Conectar nós
  const connectNodes = useCallback((sourceId: string, targetId: string, label: string, condition?: string) => {
    const newConnection: FlowConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceId,
      targetId,
      label,
      condition
    };
    setConnections(prev => [...prev, newConnection]);
    
    // Atualizar conexões do nó fonte
    setNodes(prev => prev.map(node => 
      node.id === sourceId 
        ? { ...node, connections: [...node.connections, { id: newConnection.id, targetId, label, condition }] }
        : node
    ));
  }, []);

  // Iniciar simulação
  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    setSimulationStep(0);
    setSimulationAnswers({});
    
    // Encontrar nó inicial
    const startNode = nodes.find(n => n.type === 'start');
    if (startNode) {
      setSelectedNode(startNode);
    }
  }, [nodes]);

  // Executar passo da simulação
  const executeSimulationStep = useCallback((answer: any) => {
    if (!selectedNode) return;

    // Salvar resposta
    setSimulationAnswers(prev => ({ ...prev, [selectedNode.id]: answer }));

    // Encontrar próximo nó baseado na lógica condicional
    const nextNode = findNextNode(selectedNode, answer);
    if (nextNode) {
      setSelectedNode(nextNode);
      setSimulationStep(prev => prev + 1);
    } else {
      // Fim da simulação
      setIsSimulating(false);
      toast({
        title: "Simulação concluída",
        description: "Fluxo validado com sucesso"
      });
    }
  }, [selectedNode, nodes, toast]);

  // Encontrar próximo nó baseado na lógica condicional
  const findNextNode = useCallback((currentNode: FlowNode, answer: any): FlowNode | null => {
    const connection = currentNode.connections.find(conn => {
      if (conn.condition) {
        // Lógica condicional baseada na resposta
        return evaluateCondition(conn.condition, answer);
      }
      return true;
    });

    if (connection) {
      return nodes.find(n => n.id === connection.targetId) || null;
    }
    return null;
  }, [nodes]);

  // Avaliar condição
  const evaluateCondition = useCallback((condition: string, answer: any): boolean => {
    // Implementar lógica de avaliação de condições
    // Por exemplo: "answer === 'SIM'" ou "answer === 'SIM'" ou "answer > 5"
    try {
      return eval(condition.replace('answer', JSON.stringify(answer)));
    } catch {
      return false;
    }
  }, []);

  // =====================================================
  // FUNÇÕES DE COOKIES E PERSISTÊNCIA
  // =====================================================

  // Salvar estado do canvas nos cookies
  const saveCanvasState = useCallback(() => {
    updateFlowBuilderState({
      canvasZoom,
      canvasPosition,
      selectedNodes: selectedNode ? [selectedNode.id] : [],
      lastUsedCriteria: nodes.map(n => n.title)
    });
  }, [canvasZoom, canvasPosition, selectedNode, nodes, updateFlowBuilderState]);

  // Aplicar zoom
  const handleZoom = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(0.5, Math.min(2, newZoom));
    setCanvasZoom(clampedZoom);
    saveCanvasZoom(clampedZoom);
  }, [saveCanvasZoom]);

  // Aplicar posição do canvas
  const handleCanvasMove = useCallback((x: number, y: number) => {
    setCanvasPosition({ x, y });
    saveCanvasPosition(x, y);
  }, [saveCanvasPosition]);

  // Auto-save baseado em preferências
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (preferences?.flowBuilderSettings?.autoSave) {
        saveCanvasState();
      }
    }, 30000); // Auto-save a cada 30 segundos

    return () => clearInterval(autoSaveInterval);
  }, [saveCanvasState, preferences?.flowBuilderSettings?.autoSave]);

  // Restaurar estado dos cookies ao carregar
  useEffect(() => {
    if (flowBuilderState.canvasZoom !== 1) {
      setCanvasZoom(flowBuilderState.canvasZoom);
    }
    if (flowBuilderState.canvasPosition.x !== 0 || flowBuilderState.canvasPosition.y !== 0) {
      setCanvasPosition(flowBuilderState.canvasPosition);
    }
  }, [flowBuilderState]);

  // Salvar plano
  const handleSave = useCallback(() => {
    const flowPlan: FlowPlan = {
      id: plan?.id || `plan_${Date.now()}`,
      name: plan?.name || 'Novo Plano de Inspeção',
      description: plan?.description || 'Plano criado com Flow Builder',
      nodes,
      connections,
      metadata: {
        version: plan?.metadata.version || '1.0',
        createdBy: plan?.metadata.createdBy || 'Usuário',
        createdAt: plan?.metadata.createdAt || new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: plan?.metadata.tags || ['flow-builder']
      }
    };

    onSave(flowPlan);
    toast({
      title: "Plano salvo",
      description: "Plano de inspeção salvo com sucesso"
    });
  }, [plan, nodes, connections, onSave, toast]);

  // Renderizar nó
  const renderNode = useCallback((node: FlowNode) => {
    const isSelected = selectedNode?.id === node.id;
    const isSimulating = isSimulating && isSelected;

    const nodeStyles = {
      start: 'bg-green-500 border-green-600',
      process: 'bg-blue-500 border-blue-600',
      decision: 'bg-yellow-500 border-yellow-600',
      nc_handling: 'bg-red-500 border-red-600',
      end: 'bg-gray-500 border-gray-600'
    };

    const nodeShape = {
      start: 'rounded-full',
      process: 'rounded-lg',
      decision: 'rotate-45',
      nc_handling: 'rounded-lg',
      end: 'rounded-full'
    };

    return (
      <motion.div
        key={node.id}
        className={`absolute cursor-move ${nodeShape[node.type]} ${nodeStyles[node.type]} border-2 text-white p-3 flex flex-col items-center justify-center min-w-[120px] min-h-[60px] ${
          isSelected ? 'ring-4 ring-blue-300 ring-offset-2' : ''
        }`}
        style={{
          left: node.x,
          top: node.y,
          width: node.width,
          height: node.height
        }}
        onMouseDown={(e) => {
          if (isSimulating) return;
          setSelectedNode(node);
          setIsDragging(true);
          setDragOffset({
            x: e.clientX - node.x,
            y: e.clientY - node.y
          });
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="text-xs font-medium text-center">
          {node.title}
        </div>
        {isSimulating && (
          <div className="mt-2">
            <Button
              size="sm"
              onClick={() => executeSimulationStep('SIM')}
              className="mr-1 bg-green-600 hover:bg-green-700"
            >
              SIM
            </Button>
            <Button
              size="sm"
              onClick={() => executeSimulationStep('NÃO')}
              className="bg-red-600 hover:bg-red-700"
            >
              NÃO
            </Button>
          </div>
        )}
      </motion.div>
    );
  }, [selectedNode, isSimulating, executeSimulationStep]);

  // Renderizar conexões
  const renderConnections = useCallback(() => {
    return connections.map(connection => {
      const sourceNode = nodes.find(n => n.id === connection.sourceId);
      const targetNode = nodes.find(n => n.id === connection.targetId);
      
      if (!sourceNode || !targetNode) return null;

      const startX = sourceNode.x + sourceNode.width / 2;
      const startY = sourceNode.y + sourceNode.height / 2;
      const endX = targetNode.x + targetNode.width / 2;
      const endY = targetNode.y + targetNode.height / 2;

      return (
        <svg
          key={connection.id}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id={`arrow-${connection.id}`}
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0,0 0,6 9,3" fill="#6b7280" />
            </marker>
          </defs>
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="#6b7280"
            strokeWidth="2"
            markerEnd={`url(#arrow-${connection.id})`}
          />
          {connection.label && (
            <text
              x={(startX + endX) / 2}
              y={(startY + endY) / 2}
              textAnchor="middle"
              dy="-5"
              className="text-xs fill-gray-600 bg-white px-1"
            >
              {connection.label}
            </text>
          )}
        </svg>
      );
    });
  }, [connections, nodes]);

  // Efeitos de mouse para drag and drop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && selectedNode) {
        setNodes(prev => prev.map(node =>
          node.id === selectedNode.id
            ? { ...node, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
            : node
        ));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedNode, dragOffset]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Flow Builder - Plano de Inspeção</h2>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowNodeLibrary(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Biblioteca
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAIAssistant(true)}
            >
              <Brain className="w-4 h-4 mr-2" />
              IA Assistant
            </Button>
            <Button
              variant="outline"
              onClick={startSimulation}
              disabled={isSimulating}
            >
              <Play className="w-4 h-4 mr-2" />
              Simular
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r p-4 space-y-4">
            <div>
              <h3 className="font-medium mb-2">Nós Disponíveis</h3>
              <div className="space-y-2">
                {defaultNodes.map(nodeType => (
                  <Button
                    key={nodeType.type}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => addDefaultNode(nodeType.type)}
                  >
                    <div className={`w-3 h-3 rounded mr-2 ${nodeType.type === 'start' ? 'bg-green-500' : nodeType.type === 'decision' ? 'bg-yellow-500' : nodeType.type === 'nc_handling' ? 'bg-red-500' : 'bg-blue-500'}`} />
                    {nodeType.title}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Ações</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    // Implementar lógica de conexão
                    toast({
                      title: "Modo Conexão",
                      description: "Clique em dois nós para conectá-los"
                    });
                  }}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Conectar Nós
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    // Implementar lógica de exclusão
                    if (selectedNode) {
                      setNodes(prev => prev.filter(n => n.id !== selectedNode.id));
                      setSelectedNode(null);
                    }
                  }}
                  disabled={!selectedNode}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Nó
                </Button>
              </div>
            </div>

            {selectedNode && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Propriedades do Nó</h3>
                  <div className="space-y-2">
                    <Input
                      placeholder="Título"
                      value={selectedNode.title}
                      onChange={(e) => setNodes(prev => prev.map(n =>
                        n.id === selectedNode.id ? { ...n, title: e.target.value } : n
                      ))}
                    />
                    <Textarea
                      placeholder="Descrição"
                      value={selectedNode.description}
                      onChange={(e) => setNodes(prev => prev.map(n =>
                        n.id === selectedNode.id ? { ...n, description: e.target.value } : n
                      ))}
                    />
                    <Select
                      value={selectedNode.data.questionType || ''}
                      onValueChange={(value) => setNodes(prev => prev.map(n =>
                        n.id === selectedNode.id ? { ...n, data: { ...n.data, questionType: value } } : n
                      ))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de Pergunta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes_no">Sim/Não</SelectItem>
                        <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="photo">Foto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <div
              ref={canvasRef}
              className="w-full h-full relative bg-gray-50 dark:bg-gray-800"
              style={{ minHeight: '600px' }}
            >
              {renderConnections()}
              {nodes.map(renderNode)}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="border-t p-2 flex items-center justify-between text-sm text-gray-600">
          <div>
            {isSimulating ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Simulando... Passo {simulationStep + 1}
              </span>
            ) : (
              <span>{nodes.length} nós, {connections.length} conexões</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>Zoom: 100%</span>
            <span>Posição: {selectedNode ? `${Math.round(selectedNode.x)}, ${Math.round(selectedNode.y)}` : '0, 0'}</span>
          </div>
        </div>
      </div>

      {/* Modais */}
      <AnimatePresence>
        {showNodeLibrary && (
          <NodeLibraryModal
            onClose={() => setShowNodeLibrary(false)}
            onAddNode={addNodeToLibrary}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAIAssistant && (
          <AIAssistantModal
            onClose={() => setShowAIAssistant(false)}
            nodes={nodes}
            onAddSuggestion={(suggestion) => {
              // Implementar adição de sugestão da IA
              toast({
                title: "Sugestão da IA",
                description: "Funcionalidade em desenvolvimento"
              });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente Modal da Biblioteca de Nós
interface NodeLibraryModalProps {
  onClose: () => void;
  onAddNode: (node: Omit<FlowNode, 'id'>) => void;
}

function NodeLibraryModal({ onClose, onAddNode }: NodeLibraryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const nodeCategories = [
    { id: 'all', name: 'Todos', icon: Grid },
    { id: 'verification', name: 'Verificação', icon: CheckSquare },
    { id: 'decision', name: 'Decisão', icon: Target },
    { id: 'nc', name: 'Não Conformidade', icon: AlertCircle },
    { id: 'custom', name: 'Personalizado', icon: Settings }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Biblioteca de Nós</h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Buscar nós..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {nodeCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Nós pré-configurados */}
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <CheckSquare className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                <h4 className="font-medium">Verificação Padrão</h4>
                <p className="text-sm text-gray-600">Verificação básica com foto</p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    onAddNode({
                      type: 'process',
                      title: 'Verificação Padrão',
                      description: 'Verificação básica com foto obrigatória',
                      x: 100,
                      y: 100,
                      width: 120,
                      height: 60,
                      data: {
                        questionType: 'photo',
                        defectType: 'MAIOR'
                      },
                      connections: []
                    });
                    onClose();
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
                <h4 className="font-medium">Decisão Condicional</h4>
                <p className="text-sm text-gray-600">Nó de decisão com ramificações</p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    onAddNode({
                      type: 'decision',
                      title: 'Decisão Condicional',
                      description: 'Nó de decisão com ramificações SIM/NÃO',
                      x: 100,
                      y: 100,
                      width: 120,
                      height: 60,
                      data: {
                        questionType: 'yes_no',
                        options: ['SIM', 'NÃO'],
                        defectType: 'MAIOR'
                      },
                      connections: []
                    });
                    onClose();
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
                <h4 className="font-medium">Tratamento NC</h4>
                <p className="text-sm text-gray-600">Fluxo de não conformidade</p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    onAddNode({
                      type: 'nc_handling',
                      title: 'Tratamento NC',
                      description: 'Fluxo de tratamento de não conformidade',
                      x: 100,
                      y: 100,
                      width: 120,
                      height: 60,
                      data: {
                        defectType: 'CRÍTICO'
                      },
                      connections: []
                    });
                    onClose();
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente Modal do Assistente de IA
interface AIAssistantModalProps {
  onClose: () => void;
  nodes: FlowNode[];
  onAddSuggestion: (suggestion: any) => void;
}

function AIAssistantModal({ onClose, nodes, onAddSuggestion }: AIAssistantModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const analyzeFlow = async () => {
    setIsAnalyzing(true);
    
    // Simular análise da IA
    setTimeout(() => {
      const mockSuggestions = [
        {
          id: 1,
          type: 'missing_step',
          title: 'Verificação de Segurança',
          description: 'Recomendamos adicionar uma verificação de segurança antes da aprovação final',
          priority: 'high'
        },
        {
          id: 2,
          type: 'optimization',
          title: 'Sequência Otimizada',
          description: 'A sequência atual pode ser otimizada para reduzir tempo de inspeção',
          priority: 'medium'
        }
      ];
      
      setSuggestions(mockSuggestions);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Assistente de IA</h3>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <p className="text-gray-600 mb-4">
              Analise seu fluxo de inspeção com inteligência artificial para identificar pontos de melhoria e possíveis não conformidades.
            </p>
            
            <Button
              onClick={analyzeFlow}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  ✨ Sugerir Pontos de Falha
                </>
              )}
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Sugestões da IA</h4>
              {suggestions.map(suggestion => (
                <Card key={suggestion.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium">{suggestion.title}</h5>
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                      <Badge variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'} className="mt-1">
                        {suggestion.priority === 'high' ? 'Alta' : 'Média'}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onAddSuggestion(suggestion)}
                    >
                      Aplicar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
