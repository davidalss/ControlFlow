// Tipos para o sistema Severino

export interface SeverinoMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    page?: string;
    action?: string;
    confidence?: number;
  };
}

export interface SeverinoContext {
  userId: string;
  currentPage: string;
  pageData?: any;
  userRole?: string;
  userPreferences: {
    language: string;
    detailLevel: 'basic' | 'detailed' | 'expert';
    proactiveHelp: boolean;
    notifications: boolean;
  };
  conversationHistory: SeverinoMessage[];
  lastActivity: Date;
}

export interface SeverinoAction {
  type: 'create_inspection' | 'analyze_dashboard' | 'check_training' | 'generate_report' | 'navigate_page' | 'extract_data';
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiresConfirmation: boolean;
}

export interface SeverinoResponse {
  message: string;
  actions?: SeverinoAction[];
  suggestions?: string[];
  data?: any;
  confidence: number;
  requiresUserAction: boolean;
}

export interface QualityInspectionData {
  productCode: string;
  productEAN: string;
  inspectionType: 'receiving' | 'process' | 'final' | 'sampling';
  sampleSize?: number;
  aqlLevel?: number;
  inspectorId: string;
  scheduledDate: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface DashboardMetrics {
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  passRate: number;
  averageInspectionTime: number;
  pendingInspections: number;
  criticalIssues: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface TrainingStatus {
  userId: string;
  userName: string;
  trainingId: string;
  trainingName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  dueDate: Date;
  completionDate?: Date;
  score?: number;
  requiredScore: number;
}

export interface SeverinoNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    type: string;
    data: any;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SeverinoAnalytics {
  totalConversations: number;
  averageResponseTime: number;
  userSatisfaction: number;
  mostCommonQueries: Array<{
    query: string;
    count: number;
  }>;
  successfulActions: number;
  failedActions: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface WebAutomationTask {
  id: string;
  type: 'inspection_creation' | 'data_extraction' | 'report_generation' | 'training_check';
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters: any;
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  retryCount: number;
  maxRetries: number;
}

export interface SeverinoConfig {
  geminiApiKey: string;
  geminiModel: string;
  maxConversationHistory: number;
  responseTimeout: number;
  enableVoiceRecognition: boolean;
  enableProactiveHelp: boolean;
  notificationChannels: {
    websocket: boolean;
    email: boolean;
    slack: boolean;
    teams: boolean;
  };
  automationSettings: {
    maxConcurrentTasks: number;
    retryAttempts: number;
    taskTimeout: number;
  };
}

export interface SeverinoUserPreferences {
  userId: string;
  language: string;
  detailLevel: 'basic' | 'detailed' | 'expert';
  proactiveHelp: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    slack: boolean;
  };
  automationLevel: 'manual' | 'semi_auto' | 'full_auto';
  preferredResponseFormat: 'text' | 'voice' | 'mixed';
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
  };
}

// Tipos para integração com WebSocket
export interface WebSocketMessage {
  type: 'message' | 'action' | 'notification' | 'status_update';
  data: any;
  timestamp: Date;
  userId?: string;
}

export interface WebSocketConnection {
  id: string;
  userId: string;
  connectedAt: Date;
  lastActivity: Date;
  userAgent: string;
  ipAddress: string;
}

// Tipos para análise de dados
export interface DataAnalysisRequest {
  dataSource: 'inspections' | 'products' | 'training' | 'reports';
  filters: Record<string, any>;
  metrics: string[];
  timeRange: {
    start: Date;
    end: Date;
  };
  groupBy?: string[];
  sortBy?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface DataAnalysisResult {
  summary: {
    totalRecords: number;
    filteredRecords: number;
    timeRange: {
      start: Date;
      end: Date;
    };
  };
  metrics: Record<string, number>;
  trends: Array<{
    date: Date;
    values: Record<string, number>;
  }>;
  insights: string[];
  recommendations: string[];
}

// Tipos para comandos de voz
export interface VoiceCommand {
  text: string;
  confidence: number;
  intent: string;
  entities: Record<string, any>;
  timestamp: Date;
}

export interface VoiceResponse {
  text: string;
  shouldSpeak: boolean;
  actions: SeverinoAction[];
}

// Tipos para aprendizado e melhoria
export interface LearningData {
  userId: string;
  query: string;
  response: string;
  helpful: boolean;
  feedback?: string;
  timestamp: Date;
  context: {
    page: string;
    userRole: string;
    timeOfDay: string;
  };
}

export interface SeverinoImprovement {
  type: 'response_quality' | 'action_success' | 'user_satisfaction' | 'performance';
  metric: string;
  oldValue: number;
  newValue: number;
  improvement: number;
  timestamp: Date;
  description: string;
}
