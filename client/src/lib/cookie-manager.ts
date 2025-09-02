// Gerenciador de Cookies para ControlFlow
// Gerencia cookies de sessão, preferências e cache

export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  httpOnly?: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  flowBuilderSettings: {
    gridSnap: boolean;
    showGrid: boolean;
    autoSave: boolean;
    defaultNodeType: string;
  };
  inspectionSettings: {
    autoAdvance: boolean;
    showHelpByDefault: boolean;
    photoQuality: 'low' | 'medium' | 'high';
  };
  uiSettings: {
    sidebarCollapsed: boolean;
    showTooltips: boolean;
    compactMode: boolean;
  };
}

export interface FlowBuilderState {
  lastPlanId?: string;
  canvasZoom: number;
  canvasPosition: { x: number; y: number };
  selectedNodes: string[];
  lastUsedCriteria: string[];
}

export interface InspectionSession {
  currentInspectionId?: string;
  lastStep: number;
  autoSaveData: boolean;
  sessionStartTime: number;
}

class CookieManager {
  private static instance: CookieManager;
  private readonly COOKIE_PREFIX = 'controlflow_';
  private readonly DEFAULT_OPTIONS: CookieOptions = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  };

  private constructor() {
    this.initializeDefaultCookies();
  }

  public static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager();
    }
    return CookieManager.instance;
  }

  // =====================================================
  // MÉTODOS BÁSICOS DE COOKIE
  // =====================================================

  /**
   * Define um cookie
   */
  public setCookie(name: string, value: string, options: CookieOptions = {}): void {
    const cookieOptions = { ...this.DEFAULT_OPTIONS, ...options };
    let cookieString = `${this.COOKIE_PREFIX}${name}=${encodeURIComponent(value)}`;

    if (cookieOptions.expires) {
      cookieString += `; expires=${cookieOptions.expires.toUTCString()}`;
    }
    if (cookieOptions.maxAge) {
      cookieString += `; max-age=${cookieOptions.maxAge}`;
    }
    if (cookieOptions.path) {
      cookieString += `; path=${cookieOptions.path}`;
    }
    if (cookieOptions.domain) {
      cookieString += `; domain=${cookieOptions.domain}`;
    }
    if (cookieOptions.secure) {
      cookieString += '; secure';
    }
    if (cookieOptions.sameSite) {
      cookieString += `; samesite=${cookieOptions.sameSite}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Obtém um cookie
   */
  public getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');
    const cookieName = `${this.COOKIE_PREFIX}${name}`;
    
    for (const cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.trim().split('=');
      if (cookieKey === cookieName) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  /**
   * Remove um cookie
   */
  public removeCookie(name: string): void {
    this.setCookie(name, '', { maxAge: -1 });
  }

  /**
   * Verifica se um cookie existe
   */
  public hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  // =====================================================
  // PREFERÊNCIAS DO USUÁRIO
  // =====================================================

  /**
   * Salva preferências do usuário
   */
  public saveUserPreferences(preferences: Partial<UserPreferences>): void {
    const currentPrefs = this.getUserPreferences();
    const updatedPrefs = { ...currentPrefs, ...preferences };
    
    this.setCookie('user_preferences', JSON.stringify(updatedPrefs), {
      maxAge: 365 * 24 * 60 * 60, // 1 ano
    });
  }

  /**
   * Obtém preferências do usuário
   */
  public getUserPreferences(): UserPreferences {
    const defaultPreferences: UserPreferences = {
      theme: 'light',
      language: 'pt-BR',
      flowBuilderSettings: {
        gridSnap: true,
        showGrid: true,
        autoSave: true,
        defaultNodeType: 'verification',
      },
      inspectionSettings: {
        autoAdvance: false,
        showHelpByDefault: true,
        photoQuality: 'medium',
      },
      uiSettings: {
        sidebarCollapsed: false,
        showTooltips: true,
        compactMode: false,
      },
    };

    const cookieValue = this.getCookie('user_preferences');
    if (!cookieValue) {
      return defaultPreferences;
    }

    try {
      return { ...defaultPreferences, ...JSON.parse(cookieValue) };
    } catch {
      return defaultPreferences;
    }
  }

  /**
   * Atualiza uma preferência específica
   */
  public updatePreference<K extends keyof UserPreferences>(
    category: K,
    key: keyof UserPreferences[K],
    value: any
  ): void {
    const prefs = this.getUserPreferences();
    if (prefs[category] && typeof prefs[category] === 'object') {
      (prefs[category] as any)[key] = value;
      this.saveUserPreferences(prefs);
    }
  }

  // =====================================================
  // ESTADO DO FLOW BUILDER
  // =====================================================

  /**
   * Salva estado do Flow Builder
   */
  public saveFlowBuilderState(state: Partial<FlowBuilderState>): void {
    const currentState = this.getFlowBuilderState();
    const updatedState = { ...currentState, ...state };
    
    this.setCookie('flow_builder_state', JSON.stringify(updatedState), {
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    });
  }

  /**
   * Obtém estado do Flow Builder
   */
  public getFlowBuilderState(): FlowBuilderState {
    const defaultState: FlowBuilderState = {
      canvasZoom: 1,
      canvasPosition: { x: 0, y: 0 },
      selectedNodes: [],
      lastUsedCriteria: [],
    };

    const cookieValue = this.getCookie('flow_builder_state');
    if (!cookieValue) {
      return defaultState;
    }

    try {
      return { ...defaultState, ...JSON.parse(cookieValue) };
    } catch {
      return defaultState;
    }
  }

  /**
   * Salva posição do canvas
   */
  public saveCanvasPosition(x: number, y: number): void {
    const state = this.getFlowBuilderState();
    state.canvasPosition = { x, y };
    this.saveFlowBuilderState(state);
  }

  /**
   * Salva zoom do canvas
   */
  public saveCanvasZoom(zoom: number): void {
    const state = this.getFlowBuilderState();
    state.canvasZoom = zoom;
    this.saveFlowBuilderState(state);
  }

  // =====================================================
  // SESSÃO DE INSPEÇÃO
  // =====================================================

  /**
   * Salva estado da sessão de inspeção
   */
  public saveInspectionSession(session: Partial<InspectionSession>): void {
    const currentSession = this.getInspectionSession();
    const updatedSession = { ...currentSession, ...session };
    
    this.setCookie('inspection_session', JSON.stringify(updatedSession), {
      maxAge: 24 * 60 * 60, // 1 dia
    });
  }

  /**
   * Obtém estado da sessão de inspeção
   */
  public getInspectionSession(): InspectionSession {
    const defaultSession: InspectionSession = {
      lastStep: 0,
      autoSaveData: true,
      sessionStartTime: Date.now(),
    };

    const cookieValue = this.getCookie('inspection_session');
    if (!cookieValue) {
      return defaultSession;
    }

    try {
      return { ...defaultSession, ...JSON.parse(cookieValue) };
    } catch {
      return defaultSession;
    }
  }

  /**
   * Inicia nova sessão de inspeção
   */
  public startInspectionSession(inspectionId: string): void {
    this.saveInspectionSession({
      currentInspectionId: inspectionId,
      lastStep: 0,
      sessionStartTime: Date.now(),
    });
  }

  /**
   * Atualiza passo atual da inspeção
   */
  public updateInspectionStep(step: number): void {
    const session = this.getInspectionSession();
    session.lastStep = step;
    this.saveInspectionSession(session);
  }

  // =====================================================
  // CACHE E PERFORMANCE
  // =====================================================

  /**
   * Salva dados em cache
   */
  public setCache(key: string, value: any, ttl: number = 3600): void {
    const cacheData = {
      value,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Converter para milissegundos
    };

    this.setCookie(`cache_${key}`, JSON.stringify(cacheData), {
      maxAge: ttl,
    });
  }

  /**
   * Obtém dados do cache
   */
  public getCache(key: string): any | null {
    const cookieValue = this.getCookie(`cache_${key}`);
    if (!cookieValue) {
      return null;
    }

    try {
      const cacheData = JSON.parse(cookieValue);
      const now = Date.now();
      
      if (now - cacheData.timestamp > cacheData.ttl) {
        this.removeCookie(`cache_${key}`);
        return null;
      }

      return cacheData.value;
    } catch {
      return null;
    }
  }

  /**
   * Limpa cache expirado
   */
  public cleanupExpiredCache(): void {
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const [cookieKey] = cookie.trim().split('=');
      if (cookieKey.startsWith(this.COOKIE_PREFIX + 'cache_')) {
        const key = cookieKey.replace(this.COOKIE_PREFIX + 'cache_', '');
        this.getCache(key); // Isso automaticamente remove cookies expirados
      }
    }
  }

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  /**
   * Obtém todos os cookies do ControlFlow
   */
  public getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieList = document.cookie.split(';');
    
    for (const cookie of cookieList) {
      const [cookieKey, cookieValue] = cookie.trim().split('=');
      if (cookieKey.startsWith(this.COOKIE_PREFIX)) {
        const name = cookieKey.replace(this.COOKIE_PREFIX, '');
        cookies[name] = decodeURIComponent(cookieValue);
      }
    }
    
    return cookies;
  }

  /**
   * Limpa todos os cookies do ControlFlow
   */
  public clearAllCookies(): void {
    const cookies = this.getAllCookies();
    Object.keys(cookies).forEach(name => {
      this.removeCookie(name);
    });
  }

  /**
   * Obtém estatísticas dos cookies
   */
  public getCookieStats(): {
    totalCookies: number;
    totalSize: number;
    categories: Record<string, number>;
  } {
    const cookies = this.getAllCookies();
    const categories: Record<string, number> = {};
    let totalSize = 0;

    Object.entries(cookies).forEach(([name, value]) => {
      totalSize += name.length + value.length;
      
      if (name.startsWith('user_')) {
        categories.userPreferences = (categories.userPreferences || 0) + 1;
      } else if (name.startsWith('flow_')) {
        categories.flowBuilder = (categories.flowBuilder || 0) + 1;
      } else if (name.startsWith('inspection_')) {
        categories.inspection = (categories.inspection || 0) + 1;
      } else if (name.startsWith('cache_')) {
        categories.cache = (categories.cache || 0) + 1;
      } else {
        categories.other = (categories.other || 0) + 1;
      }
    });

    return {
      totalCookies: Object.keys(cookies).length,
      totalSize,
      categories,
    };
  }

  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================

  /**
   * Inicializa cookies padrão
   */
  private initializeDefaultCookies(): void {
    // Verificar se é a primeira visita
    if (!this.hasCookie('first_visit')) {
      this.setCookie('first_visit', Date.now().toString(), {
        maxAge: 365 * 24 * 60 * 60, // 1 ano
      });
      
      // Definir preferências padrão
      this.saveUserPreferences({});
    }

    // Limpar cache expirado
    this.cleanupExpiredCache();
  }

  /**
   * Configura cookies para desenvolvimento
   */
  public setupDevelopmentCookies(): void {
    if (process.env.NODE_ENV === 'development') {
      // Cookies de debug
      this.setCookie('debug_mode', 'true', { maxAge: 24 * 60 * 60 });
      this.setCookie('dev_tools', 'enabled', { maxAge: 24 * 60 * 60 });
    }
  }
}

// Exportar instância singleton
export const cookieManager = CookieManager.getInstance();

// Exportar tipos para uso externo
export type { CookieOptions, UserPreferences, FlowBuilderState, InspectionSession };
