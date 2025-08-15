import axios from 'axios';

// Tipos para o OpenRouter API
interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Configuração da API - APENAS variáveis de ambiente
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

if (!OPENROUTER_API_KEY) {
  console.warn('⚠️ OPENROUTER_API_KEY não configurada. Severino funcionará apenas em modo offline.');
}

// Rate Limiter Global para API OpenRouter (limites generosos)
class OpenRouterRateLimiter {
  private requestTimes: number[] = [];
  private readonly MAX_REQUESTS_PER_MINUTE = 100; // Limite muito generoso
  private readonly WINDOW_SIZE = 60 * 1000; // 1 minuto em ms

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    
    // Remover requisições antigas (mais de 1 minuto)
    this.requestTimes = this.requestTimes.filter(time => now - time < this.WINDOW_SIZE);
    
    // Se já atingiu o limite, aguardar
    if (this.requestTimes.length >= this.MAX_REQUESTS_PER_MINUTE) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = this.WINDOW_SIZE - (now - oldestRequest) + 1000; // +1s de margem
      
      console.log(`🔄 Rate limit global atingido. Aguardando ${Math.ceil(waitTime/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Recursivamente verificar novamente após aguardar
      return this.waitForSlot();
    }
    
    // Adicionar timestamp da requisição atual
    this.requestTimes.push(now);
    console.log(`📊 Requisições na janela: ${this.requestTimes.length}/${this.MAX_REQUESTS_PER_MINUTE}`);
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter(time => now - time < this.WINDOW_SIZE);
    return Math.max(0, this.MAX_REQUESTS_PER_MINUTE - this.requestTimes.length);
  }
}

// Contexto de conversa
interface ConversationContext {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  currentPage?: string;
  userPreferences?: {
    language: string;
    detailLevel: 'basic' | 'detailed' | 'expert';
    proactiveHelp: boolean;
  };
  lastApiCall?: number;
  rateLimitCount?: number;
}

// Cache LRU implementação
class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V & { timestamp: number }>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (item) {
      // Atualizar timestamp para "recentemente usado"
      this.cache.delete(key);
      this.cache.set(key, { ...item, timestamp: Date.now() });
      return item;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remover item menos recentemente usado
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, { ...value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

class OpenRouterService {
  private conversationContext: Map<string, ConversationContext> = new Map();
  private qualityKnowledgeBase: Map<string, string> = new Map();
  private responseCache: LRUCache<string, { response: string; timestamp: number }>;
  private rateLimiter: OpenRouterRateLimiter;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutos
  private readonly RATE_LIMIT_DELAY = 1000; // 1 segundo entre chamadas por usuário
  private readonly MAX_RETRIES = 3;
  private readonly API_TIMEOUT = 15000; // 15 segundos de timeout
  private readonly MAX_MESSAGES_HISTORY = 20; // Aumentado para 20 mensagens
  private readonly CACHE_SIZE = 200; // Cache maior

  constructor() {
    this.responseCache = new LRUCache(this.CACHE_SIZE);
    this.rateLimiter = new OpenRouterRateLimiter();
    this.initializeQualityKnowledge();
  }

  private initializeQualityKnowledge() {
    // Base de conhecimento especializada em qualidade
    this.qualityKnowledgeBase.set('aql', `
      AQL (Acceptable Quality Level) é um padrão de inspeção por amostragem:
      - AQL 0.065: Para produtos críticos (defeitos críticos)
      - AQL 1.0: Para produtos importantes (defeitos maiores)
      - AQL 2.5: Para produtos gerais (defeitos menores)
      
      Cálculo do tamanho da amostra baseado no tamanho do lote e nível de inspeção.
    `);

    this.qualityKnowledgeBase.set('inspection', `
      Tipos de inspeção:
      - Inspeção 100%: Todos os itens são verificados
      - Inspeção por amostragem: Baseada em planos estatísticos
      - Inspeção de recebimento: Para materiais recebidos
      - Inspeção de processo: Durante a produção
      - Inspeção final: Antes do envio
    `);

    this.qualityKnowledgeBase.set('defects', `
      Classificação de defeitos:
      - Crítico: Pode causar lesão ou falha total
      - Maior: Afeta funcionalidade ou aparência significativamente
      - Menor: Pequenos problemas estéticos ou funcionais
    `);

    this.qualityKnowledgeBase.set('training', `
      Treinamentos de qualidade:
      - Procedimentos de inspeção
      - Uso de instrumentos de medição
      - Interpretação de especificações
      - Gestão de não conformidades
      - Metodologias de melhoria contínua
    `);

    this.qualityKnowledgeBase.set('quality_engineering', `
      Engenharia de Qualidade:
      - Análise estatística de processos
      - Controle estatístico de qualidade
      - Metodologias Six Sigma
      - Ferramentas de melhoria contínua
      - Gestão de riscos de qualidade
    `);
  }

  // Validação de entrada do usuário
  private validateUserInput(input: string): { isValid: boolean; error?: string } {
    if (!input || typeof input !== 'string') {
      return { isValid: false, error: 'Entrada inválida' };
    }

    if (input.length > 2000) {
      return { isValid: false, error: 'Mensagem muito longa (máximo 2000 caracteres)' };
    }

    // Verificar caracteres perigosos ou prompts que podem quebrar a API
    const dangerousPatterns = [
      /```/g, // Code blocks não fechados
      /<script>/gi,
      /javascript:/gi,
      /data:text\/html/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(input)) {
        return { isValid: false, error: 'Conteúdo não permitido' };
      }
    }

    return { isValid: true };
  }

  async generateResponse(
    userInput: string,
    userId: string,
    context?: {
      currentPage?: string;
      pageData?: any;
      userRole?: string;
    }
  ): Promise<string> {
    try {
      // Validar entrada do usuário
      const validation = this.validateUserInput(userInput);
      if (!validation.isValid) {
        return `❌ ${validation.error}. Por favor, reformule sua pergunta.`;
      }

      // Obter ou criar contexto de conversa
      let conversation = this.conversationContext.get(userId);
      if (!conversation) {
        conversation = {
          messages: [],
          currentPage: context?.currentPage,
          userPreferences: {
            language: 'pt-BR',
            detailLevel: 'detailed',
            proactiveHelp: true
          },
          lastApiCall: 0,
          rateLimitCount: 0
        };
        this.conversationContext.set(userId, conversation);
      }

      // Atualizar contexto atual
      if (context?.currentPage) {
        conversation.currentPage = context.currentPage;
      }

      // Verificar cache primeiro
      const cacheKey = `${userInput.toLowerCase().trim()}_${conversation.currentPage || 'general'}`;
      const cachedResponse = this.responseCache.get(cacheKey);
      
      if (cachedResponse && (Date.now() - cachedResponse.timestamp) < this.CACHE_DURATION) {
        console.log('✅ Resposta retornada do cache');
        return cachedResponse.response;
      }

      // Rate limiting por usuário
      const timeSinceLastCall = Date.now() - (conversation.lastApiCall || 0);
      if (timeSinceLastCall < this.RATE_LIMIT_DELAY) {
        const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastCall;
        console.log(`⏳ Rate limit por usuário. Aguardando ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Verificar se API key está disponível
      if (!OPENROUTER_API_KEY) {
        return this.getFallbackResponse(userInput, context);
      }

      // Rate limiting global para API OpenRouter (máximo 2 requisições por minuto)
      console.log(`📊 Requisições restantes: ${this.rateLimiter.getRemainingRequests()}`);
      await this.rateLimiter.waitForSlot();

      // Construir prompt especializado
      const messages = this.buildSpecializedPrompt(userInput, conversation, context);

      // Preparar requisição para OpenRouter
      const request: OpenRouterRequest = {
        model: "deepseek/deepseek-r1:free", // Modelo gratuito OpenRouter
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000, // Limite padrão
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.2
      };

      // Fazer chamada para API com retry e rate limiting melhorado
      let response;
      let retryCount = 0;

      while (retryCount < this.MAX_RETRIES) {
        try {
          response = await axios.post(
            OPENROUTER_API_URL,
            request,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'User-Agent': 'ControlFlow/1.0'
              },
              timeout: this.API_TIMEOUT // Timeout aumentado para 15s
            }
          );
          break; // Sucesso, sair do loop
        } catch (error: any) {
          retryCount++;
          console.error(`❌ Tentativa ${retryCount} falhou:`, error.response?.status, error.message);
          
          // Tratamento específico por tipo de erro
          if (error.response?.status === 429) {
            // Verificar se há retryDelay na resposta da API
            const retryDelay = error.response?.data?.error?.details?.find(
              (detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
            )?.retryDelay;
            
            if (retryDelay) {
              const waitTime = parseInt(retryDelay.replace('s', '')) * 1000;
              console.log(`🔄 Rate limit atingido. Aguardando ${waitTime}ms conforme solicitado pela API...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
              // Fallback para exponential backoff se não houver retryDelay
              const waitTime = Math.min(Math.pow(2, retryCount) * 1000, 5000);
              console.log(`🔄 Rate limit atingido. Aguardando ${waitTime}ms antes da próxima tentativa...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            
            // Se for a última tentativa, usar modo offline
            if (retryCount >= this.MAX_RETRIES) {
              console.log('🔄 Máximo de tentativas atingido. Usando modo offline...');
              return this.getFallbackResponse(userInput, context);
            }
          } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.log('🌐 Erro de rede. Usando modo offline...');
            return this.getFallbackResponse(userInput, context);
          } else if (error.code === 'ETIMEDOUT') {
            console.log('⏰ Timeout da API. Usando modo offline...');
            return this.getFallbackResponse(userInput, context);
          } else if (retryCount >= this.MAX_RETRIES) {
            throw error; // Re-throw se esgotou as tentativas
          } else {
            // Para outros erros, aguardar um pouco antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (!response) {
        throw new Error('Falha em todas as tentativas de conexão com OpenRouter API');
      }

      // Validar estrutura da resposta antes de acessar
      const openRouterResponse: OpenRouterResponse = response.data;
      if (!openRouterResponse?.choices?.[0]?.message?.content) {
        console.warn('⚠️ Resposta da API com estrutura inválida');
        return this.getFallbackResponse(userInput, context);
      }

      const assistantResponse = openRouterResponse.choices[0].message.content;

      // Atualizar timestamp da última chamada por usuário
      conversation.lastApiCall = Date.now();

      // Armazenar no cache
      this.responseCache.set(cacheKey, {
        response: assistantResponse,
        timestamp: Date.now()
      });

      // Atualizar histórico de conversa
      conversation.messages.push(
        { role: 'user', content: userInput, timestamp: new Date() },
        { role: 'assistant', content: assistantResponse, timestamp: new Date() }
      );

      // Manter apenas as últimas mensagens para evitar contexto muito longo
      if (conversation.messages.length > this.MAX_MESSAGES_HISTORY) {
        conversation.messages = conversation.messages.slice(-this.MAX_MESSAGES_HISTORY);
      }

      return assistantResponse;

    } catch (error: any) {
      console.error('❌ Erro na integração com OpenRouter:', error.response?.status, error.message);
      
      // Se for erro 429, 403, 401 ou qualquer erro de API, usar modo offline
      if (error.response?.status === 429 || error.response?.status === 403 || error.response?.status === 401) {
        return '🔄 Estou recebendo muitas solicitações no momento. Funcionando em modo offline para te ajudar! 😊';
      }
      
      return this.getFallbackResponse(userInput, context);
    }
  }

  private buildSpecializedPrompt(
    userInput: string,
    conversation: ConversationContext,
    context?: any
  ): OpenRouterMessage[] {
    const pageContext = this.getPageContext(conversation.currentPage);
    const qualityKnowledge = this.getRelevantQualityKnowledge(userInput);
    
    const systemPrompt = `Você é o Severino, um assistente virtual especializado em qualidade industrial e gestão de processos. Você trabalha no sistema ControlFlow e ajuda inspetores e gestores de qualidade.

CONTEXTO ATUAL:
- Página: ${conversation.currentPage || 'Não especificada'}
- Contexto da página: ${pageContext}

CONHECIMENTO ESPECIALIZADO EM QUALIDADE:
${qualityKnowledge}

INSTRUÇÕES:
1. Responda sempre em português brasileiro
2. Seja específico e prático
3. Ofereça sugestões baseadas no contexto atual
4. Use linguagem técnica apropriada para qualidade
5. Se não souber algo, sugira onde encontrar a informação
6. Seja proativo em oferecer ajuda adicional
7. Mantenha respostas concisas mas informativas`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Adicionar histórico da conversa (últimas 5 mensagens)
    const recentMessages = conversation.messages.slice(-5);
    for (const msg of recentMessages) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }

    // Adicionar a pergunta atual do usuário
    messages.push({
      role: 'user',
      content: userInput
    });

    return messages;
  }

  private getPageContext(page?: string): string {
    const pageContexts: Record<string, string> = {
      '/inspections': 'Página de inspeções - aqui você pode criar, visualizar e gerenciar inspeções de qualidade',
      '/products': 'Página de produtos - cadastro e gestão de produtos para inspeção',
      '/dashboard': 'Dashboard principal - visualização de métricas e indicadores de qualidade',
      '/training': 'Página de treinamentos - gestão de treinamentos e certificações',
      '/quality': 'Módulo de engenharia de qualidade - ferramentas avançadas de análise',
      '/reports': 'Relatórios e análises - geração de relatórios de qualidade'
    };

    return pageContexts[page || ''] || 'Página geral do sistema';
  }

  private getRelevantQualityKnowledge(userInput: string): string {
    const input = userInput.toLowerCase();
    let knowledge = '';

    if (input.includes('aql') || input.includes('amostra')) {
      knowledge += this.qualityKnowledgeBase.get('aql') + '\n';
    }
    if (input.includes('inspeção') || input.includes('inspecao')) {
      knowledge += this.qualityKnowledgeBase.get('inspection') + '\n';
    }
    if (input.includes('defeito') || input.includes('não conformidade')) {
      knowledge += this.qualityKnowledgeBase.get('defects') + '\n';
    }
    if (input.includes('treinamento') || input.includes('certificação')) {
      knowledge += this.qualityKnowledgeBase.get('training') + '\n';
    }
    if (input.includes('engenharia') || input.includes('qualidade')) {
      knowledge += this.qualityKnowledgeBase.get('quality_engineering') + '\n';
    }

    return knowledge || 'Conhecimento geral em qualidade industrial e gestão de processos.';
  }

  private formatConversationHistory(messages: Array<{role: string, content: string}>): string {
    if (messages.length === 0) return 'Nenhuma conversa anterior';
    
    return messages
      .slice(-5) // Últimas 5 mensagens para contexto mais rico
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  private getFallbackResponse(userInput: string, context?: any): string {
    const input = userInput.toLowerCase();
    
    // Respostas mais concisas e inteligentes
    if (input.includes('ajuda') || input.includes('help') || input.includes('oi') || input.includes('olá')) {
      return `Olá! Sou o Severino, seu assistente de qualidade! 😊

**Posso ajudar com:**
• Inspeções e AQL • Cálculos de amostragem • Procedimentos de qualidade
• Gestão de não conformidades • Treinamentos • Relatórios

**Exemplos:** "Como funciona o AQL?", "Quero criar uma inspeção", "Explique defeitos críticos"

Como posso ajudá-lo hoje?`;
    }
    
    if (input.includes('aql') || input.includes('amostra') || input.includes('tamanho')) {
      return `📊 **AQL e Amostragem**

**AQL (Acceptable Quality Level):**
• 0.065%: Defeitos críticos (segurança)
• 1.0%: Defeitos maiores (funcionalidade)  
• 2.5%: Defeitos menores (aparência)

**Para calcular amostra preciso:**
• Tamanho do lote • Tipo de defeito • Nível de inspeção (I/II/III)

**Exemplo:** 1000 peças, defeitos menores (AQL 2.5%), nível II = 80 peças

Me diga os dados do seu lote! 😊`;
    }
    
    if (input.includes('inspeção') || input.includes('inspecao') || input.includes('criar')) {
      return `🔍 **Criar Inspeção**

**Etapas:**
1. **Produto:** Escolha na página "Produtos" ou me diga qual
2. **Tipo:** Recebimento / Processo / Final
3. **Critérios:** AQL, parâmetros, pontos de inspeção

**Qual produto quer inspecionar?** Me diga o nome/código! 😊`;
    }
    
    if (input.includes('defeito') || input.includes('não conformidade') || input.includes('problema')) {
      return `⚠️ **Gestão de Não Conformidades**

**Classificação:**
• Crítico: Afeta segurança/performance
• Maior: Afeta funcionalidade  
• Menor: Afeta aparência

**Ações:** Documentar → Classificar → Isolar → Corrigir

**Precisa ajuda com algum defeito específico?**`;
    }
    
    if (input.includes('treinamento') || input.includes('certificação') || input.includes('curso')) {
      return `🎓 **Treinamentos Disponíveis**

• Inspeção de Qualidade Básica
• Metodologia AQL
• Gestão de Não Conformidades
• Uso do Sistema ControlFlow
• Normas de Qualidade

**Funcionalidades:** Matrícula online, progresso, certificados digitais

**Gostaria de se matricular?**`;
    }
    
    if (input.includes('relatório') || input.includes('relatorio') || input.includes('dados')) {
      return `📈 **Relatórios Disponíveis**

• Inspeções por Período
• Tendências de Qualidade
• Não Conformidades
• Estatísticas de Produtos
• Treinamentos

**Funcionalidades:** Filtros, gráficos, exportação PDF/Excel

**Dica:** Acesse "Relatórios" no menu lateral!`;
    }
    
    // Navegação do sistema - mais concisa
    if (input.includes('levar') || input.includes('ir para') || input.includes('página') || input.includes('pagina')) {
      if (input.includes('inspeção') || input.includes('inspecao')) {
        return `🔍 **Navegando para Inspeções**

**Ação:** Navegando para /inspections

Clique em "Inspeções" no menu lateral! 😊

**Dica:** Diga "criar inspeção" para ajuda no processo!`;
      }
      
      if (input.includes('produto') || input.includes('produtos')) {
        return `📦 **Navegando para Produtos**

**Ação:** Navegando para /products

Clique em "Produtos" no menu lateral! 😊`;
      }
      
      if (input.includes('dashboard') || input.includes('início') || input.includes('inicio')) {
        return `🏠 **Navegando para Dashboard**

**Ação:** Navegando para /dashboard

Clique em "Dashboard" no menu lateral! 😊`;
      }
      
      if (input.includes('treinamento') || input.includes('treinamentos')) {
        return `🎓 **Navegando para Treinamentos**

**Ação:** Navegando para /training

Clique em "Treinamentos" no menu lateral! 😊`;
      }
      
      if (input.includes('relatório') || input.includes('relatorio')) {
        return `📊 **Navegando para Relatórios**

**Ação:** Navegando para /reports

Clique em "Relatórios" no menu lateral! 😊`;
      }
    }
    
    // Resposta geral mais concisa
    return `Olá! Funcionando em modo offline. 😊

**Posso ajudar com:** Inspeções, AQL, defeitos, treinamentos, relatórios

**Exemplos:** "Como funciona AQL?", "Criar inspeção", "Defeitos críticos"

**Navegação:** "Me leve para inspeções", "Ver produtos"

Me faça uma pergunta! 🚀`;
  }

  // Métodos para gerenciamento de contexto
  updateUserPreferences(userId: string, preferences: Partial<ConversationContext['userPreferences']>) {
    const conversation = this.conversationContext.get(userId);
    if (conversation && conversation.userPreferences && preferences) {
      conversation.userPreferences = { 
        language: preferences.language || conversation.userPreferences.language,
        detailLevel: preferences.detailLevel || conversation.userPreferences.detailLevel,
        proactiveHelp: preferences.proactiveHelp !== undefined ? preferences.proactiveHelp : conversation.userPreferences.proactiveHelp
      };
    }
  }

  getConversationContext(userId: string): ConversationContext | undefined {
    return this.conversationContext.get(userId);
  }

  clearConversationContext(userId: string) {
    this.conversationContext.delete(userId);
  }

  // Método para análise de sentimento e proatividade melhorado
  async analyzeUserIntent(userInput: string): Promise<{
    intent: 'question' | 'command' | 'complaint' | 'praise' | 'help' | 'navigation';
    confidence: number;
    suggestedActions: string[];
  }> {
    const input = userInput.toLowerCase();
    
    // Navegação
    if (input.includes('levar') || input.includes('ir para') || input.includes('página') || input.includes('pagina')) {
      return {
        intent: 'navigation',
        confidence: 0.95,
        suggestedActions: ['navigate_to_page', 'show_menu_options']
      };
    }
    
    // Perguntas
    if (input.includes('como') || input.includes('o que') || input.includes('quando') || input.includes('onde') || input.includes('qual')) {
      return {
        intent: 'question',
        confidence: 0.9,
        suggestedActions: ['provide_information', 'show_examples']
      };
    }
    
    // Comandos
    if (input.includes('crie') || input.includes('faça') || input.includes('execute') || input.includes('criar')) {
      return {
        intent: 'command',
        confidence: 0.8,
        suggestedActions: ['create_inspection', 'generate_report', 'schedule_task']
      };
    }
    
    // Reclamações
    if (input.includes('problema') || input.includes('erro') || input.includes('não funciona') || input.includes('bug')) {
      return {
        intent: 'complaint',
        confidence: 0.7,
        suggestedActions: ['troubleshoot', 'escalate', 'provide_alternative']
      };
    }
    
    // Elogios
    if (input.includes('obrigado') || input.includes('bom') || input.includes('excelente') || input.includes('ótimo')) {
      return {
        intent: 'praise',
        confidence: 0.8,
        suggestedActions: ['acknowledge', 'suggest_improvements']
      };
    }
    
    return {
      intent: 'help',
      confidence: 0.6,
      suggestedActions: ['provide_help', 'ask_clarification']
    };
  }

  // Método para obter sugestões proativas baseadas no contexto
  getProactiveSuggestions(userId: string, currentPage?: string): string[] {
    const conversation = this.conversationContext.get(userId);
    const suggestions: string[] = [];

    // Sugestões baseadas na página atual
    switch (currentPage) {
      case '/inspections':
        suggestions.push('Criar nova inspeção', 'Ver inspeções pendentes', 'Analisar resultados');
        break;
      case '/products':
        suggestions.push('Cadastrar produto', 'Editar especificações', 'Ver histórico');
        break;
      case '/dashboard':
        suggestions.push('Ver métricas', 'Gerar relatório', 'Analisar tendências');
        break;
      case '/training':
        suggestions.push('Ver cursos disponíveis', 'Matricular-se', 'Baixar certificado');
        break;
      default:
        suggestions.push('Como funciona o AQL?', 'Criar inspeção', 'Ver relatórios');
    }

    // Sugestões baseadas no histórico
    if (conversation && conversation.messages.length > 0) {
      const lastMessage = conversation.messages[conversation.messages.length - 1].content.toLowerCase();
      
      if (lastMessage.includes('aql')) {
        suggestions.push('Calcular tamanho da amostra', 'Explicar níveis de inspeção');
      } else if (lastMessage.includes('defeito')) {
        suggestions.push('Classificar defeito', 'Criar ação corretiva');
      } else if (lastMessage.includes('inspeção')) {
        suggestions.push('Configurar critérios', 'Definir pontos de inspeção');
      }
    }

    return suggestions.slice(0, 3); // Máximo 3 sugestões
  }
}

// Instância singleton
const geminiService = new OpenRouterService();
export default geminiService;
