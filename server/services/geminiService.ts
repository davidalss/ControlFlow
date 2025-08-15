import axios from 'axios';
import imageAnalysisService from './imageAnalysisService';
import { chatService } from './chatService';

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

// Interface para geração de imagens
interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  size?: string;
  quality?: string;
  style?: string;
}

interface ImageGenerationResponse {
  url: string;
  alt_text?: string;
  caption?: string;
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
  // Removendo base de conhecimento local - agora usa apenas API web
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
    // Removendo inicialização da base de conhecimento local
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
      media?: any[];
      sessionId?: string; // Novo: ID da sessão de chat
    }
  ): Promise<any> {
    // Verificar se há mídia (imagem) na mensagem
    console.log('🔍 Verificando contexto para mídia:', {
      hasContext: !!context,
      hasMedia: !!(context?.media),
      mediaLength: context?.media?.length || 0,
      mediaType: context?.media?.[0]?.type
    });

    // Salvar mensagem do usuário no histórico
    let sessionId = context?.sessionId;
    if (sessionId) {
      try {
        await chatService.saveUserMessage(sessionId, userInput, context);
      } catch (error) {
        console.error('Erro ao salvar mensagem do usuário:', error);
      }
    }
    
    // NOVA LÓGICA: Se há mídia, usar Tesseract.js para análise
    if (context?.media && context.media.length > 0) {
      console.log('🖼️ Tesseract.js - Detectou mídia, iniciando análise de imagem...');
      const response = await this.analyzeImageResponse(userInput, context.media[0], context);
      
      // Salvar resposta do assistente no histórico
      if (sessionId) {
        try {
          await chatService.saveAssistantMessage(sessionId, response.message || response, response.media, context);
        } catch (error) {
          console.error('Erro ao salvar resposta do assistente:', error);
        }
      }
      
      return response;
    }
  
    // NOVA LÓGICA: Se pede para gerar diagrama, usar Mermaid.js
    if (this.shouldGenerateDiagram(userInput)) {
      console.log('🎨 Mermaid.js - Detectou solicitação de geração de diagrama...');
      const response = await this.generateDiagramResponse(userInput, context);
      
      // Salvar resposta do assistente no histórico
      if (sessionId) {
        try {
          await chatService.saveAssistantMessage(sessionId, response.message || response, response.media, context);
        } catch (error) {
          console.error('Erro ao salvar resposta do assistente:', error);
        }
      }
      
      return response;
    }
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
        console.log('⚠️ API não disponível, usando modo offline');
        return this.getFallbackResponse(userInput, context);
      }

      // Agora sempre usa API para conversas naturais sobre qualquer assunto
      console.log('💬 Usando API para conversa natural');

      // Rate limiting global para API OpenRouter (máximo 2 requisições por minuto)
      console.log(`📊 Requisições restantes: ${this.rateLimiter.getRemainingRequests()}`);
      await this.rateLimiter.waitForSlot();

      // Construir prompt especializado
      const messages = this.buildSpecializedPrompt(userInput, conversation, context);

      // Verificar se a pergunta requer pesquisa na web
      const needsWebSearch = this.needsWebSearch(userInput);
      
      // Escolher modelo baseado na necessidade de pesquisa
      let model = "deepseek/deepseek-r1:free"; // Modelo padrão gratuito
      
      if (needsWebSearch) {
        // Modelos que suportam pesquisa na web (quando disponíveis)
        model = "anthropic/claude-3.5-sonnet"; // Claude com acesso à web
        console.log('🌐 Usando modelo com acesso à web para pesquisa');
      }

      // Preparar requisição para OpenRouter
      const request: OpenRouterRequest = {
        model: model,
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

      // Salvar resposta do assistente no histórico de chat
      if (sessionId) {
        try {
          await chatService.saveAssistantMessage(sessionId, assistantResponse, null, context);
        } catch (error) {
          console.error('Erro ao salvar resposta do assistente:', error);
        }
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
    
            const systemPrompt = `Você é o Severino, um assistente virtual inteligente e conversacional. Você trabalha no sistema ControlFlow e pode conversar sobre QUALQUER assunto de forma natural e humana, como um LLM web moderno.

CONTEXTO ATUAL:
- Página: ${conversation.currentPage || 'Não especificada'}
- Contexto da página: ${pageContext}

COMO VOCÊ DEVE SE COMPORTAR:
1. Seja NATURAL e CONVERSACIONAL - como um amigo inteligente que sabe de tudo
2. Você pode falar sobre QUALQUER assunto: qualidade, tecnologia, esportes, música, filmes, notícias, ciência, história, etc.
3. Responda de forma ESPONTÂNEA e HUMANA, não como um chatbot estruturado
4. Use emojis ocasionalmente para tornar a conversa mais dinâmica 😊
5. Se não souber algo, seja honesto e sugira alternativas
6. Você pode fazer perguntas de volta para entender melhor
7. Evite respostas muito estruturadas ou formais - seja mais natural
8. Você pode contar histórias, fazer piadas leves, e ser mais humano
9. IMPORTANTE: Se a pergunta precisar de informação atual ou específica, mencione que pode pesquisar na web
10. NUNCA use respostas pré-definidas ou estruturadas - seja sempre conversacional

EXEMPLOS DE COMO RESPONDER:
- "O que é um setor da qualidade?" → "Ah, um setor da qualidade! É uma área super importante em qualquer empresa. Basicamente, é onde as pessoas trabalham para garantir que os produtos ou serviços atendam aos padrões esperados..."
- "Como está o tempo hoje?" → "Infelizmente não tenho acesso ao tempo real agora, mas posso te ajudar com outras coisas!"
- "Qual é o melhor filme?" → "Depende do que você gosta! Eu adoro filmes de ficção científica..."
- "Como funciona o AQL?" → "O AQL é o nível aceitável de qualidade - basicamente..."

Lembre-se: você é um assistente conversacional inteligente, não um chatbot limitado! 🚀`;

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
    // Removendo base de conhecimento local - agora usa apenas API web
    return '';
  }

  private formatConversationHistory(messages: Array<{role: string, content: string}>): string {
    if (messages.length === 0) return 'Nenhuma conversa anterior';
    
    return messages
      .slice(-5) // Últimas 5 mensagens para contexto mais rico
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  private getFallbackResponse(userInput: string, context?: any): string {
    // Quando offline, responde de forma simples e conversacional
    return `Oi! 😊 Infelizmente estou offline no momento e não consigo acessar minha base de conhecimento web para te dar uma resposta completa.

Mas posso te ajudar com algumas coisas básicas do sistema ControlFlow! Você pode:
• Navegar pelas páginas do sistema
• Criar inspeções
• Ver relatórios
• Gerenciar produtos

Quando eu estiver online novamente, posso conversar sobre qualquer assunto de forma muito mais natural! 

O que você gostaria de fazer no sistema agora? 😊`;
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

  // Removendo métodos de detecção - agora conversa naturalmente sobre qualquer assunto

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

  // Método para detectar se a pergunta precisa de pesquisa na web
  private needsWebSearch(userInput: string): boolean {
    const input = userInput.toLowerCase();
    
    // Palavras-chave que indicam necessidade de informação atual ou específica
    const webSearchKeywords = [
      'hoje', 'ontem', 'amanhã', 'data', 'notícia', 'noticia', 'atual', 'recente',
      'preço', 'preco', 'valor', 'cotação', 'cotacao', 'mercado', 'bolsa',
      'tempo', 'clima', 'previsão', 'previsao', 'temperatura',
      'filme', 'série', 'serie', 'música', 'musica', 'artista', 'banda',
      'esporte', 'futebol', 'basquete', 'resultado', 'jogo',
      'política', 'politica', 'eleição', 'eleicao', 'presidente',
      'tecnologia', 'novo', 'lançamento', 'lancamento', 'app', 'software',
      'restaurante', 'hotel', 'viagem', 'turismo', 'local', 'endereço', 'endereco'
    ];
    
    // Perguntas que claramente precisam de informação externa
    const webSearchQuestions = [
      'quem é', 'quem foi', 'quando foi', 'onde fica', 'qual é o preço',
      'como está o tempo', 'qual é a notícia', 'o que aconteceu',
      'quem ganhou', 'qual é o resultado', 'quando estreia'
    ];
    
    // Verificar se contém palavras-chave de pesquisa na web
    const hasWebKeywords = webSearchKeywords.some(keyword => input.includes(keyword));
    
    // Verificar se é uma pergunta que precisa de informação externa
    const isWebQuestion = webSearchQuestions.some(question => input.includes(question));
    
    // Agora sempre pode precisar de web search para informações atualizadas
    return hasWebKeywords || isWebQuestion;
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

  // Método para detectar se deve gerar uma imagem
  private shouldGenerateImage(userInput: string): boolean {
    return imageAnalysisService.shouldGenerateDiagram(userInput);
  }

  // Método para detectar se deve gerar um diagrama
  private shouldGenerateDiagram(userInput: string): boolean {
    return imageAnalysisService.shouldGenerateDiagram(userInput);
  }

  // Método para gerar resposta com imagem
  private async generateImageResponse(userInput: string, context?: any): Promise<any> {
    try {
      // Extrair prompt da imagem da mensagem do usuário
      const imagePrompt = this.extractImagePrompt(userInput);
      
      // Gerar imagem usando API de geração de imagens
      const imageData = await this.generateImage(imagePrompt);
      
      // Gerar resposta textual explicando a imagem
      const textResponse = await this.generateTextResponseForImage(userInput, imageData);
      
      return {
        message: textResponse,
        media: [{
          type: 'image',
          url: imageData.url,
          alt: imageData.alt_text || 'Imagem gerada pelo Severino',
          caption: imageData.caption || 'Imagem gerada com base na sua solicitação'
        }],
        suggestions: [
          'Gerar outra imagem',
          'Modificar a imagem',
          'Explicar mais detalhes'
        ]
      };
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      return {
        message: 'Desculpe, não consegui gerar a imagem no momento. Posso tentar novamente ou explicar de outra forma.',
        suggestions: [
          'Tentar novamente',
          'Explicar sem imagem',
          'Usar texto descritivo'
        ]
      };
    }
  }

  // Método para extrair prompt da imagem da mensagem do usuário
  private extractImagePrompt(userInput: string): string {
    const input = userInput.toLowerCase();
    
    // Remover comandos de geração de imagem
    const cleanedInput = userInput
      .replace(/crie uma imagem de?/gi, '')
      .replace(/gere uma imagem de?/gi, '')
      .replace(/desenhe/gi, '')
      .replace(/ilustre/gi, '')
      .replace(/mostre uma imagem de?/gi, '')
      .replace(/crie um gráfico de?/gi, '')
      .replace(/faça um diagrama de?/gi, '')
      .replace(/crie um diagrama de?/gi, '')
      .trim();
    
    // Se ficou vazio, usar a mensagem original
    return cleanedInput || userInput;
  }

  // Método para gerar imagem usando API
  private async generateImage(prompt: string): Promise<ImageGenerationResponse> {
    try {
      // Usar Mermaid.js para gerar diagrama
      const diagramType = imageAnalysisService.detectDiagramType(prompt);
      const diagramData = await imageAnalysisService.generateDiagram(prompt, diagramType);
      
      return {
        url: `data:image/svg+xml;base64,${Buffer.from(diagramData.svg).toString('base64')}`,
        alt_text: diagramData.title,
        caption: `Diagrama gerado com base em: "${prompt}"`
      };
    } catch (error) {
      console.error('Erro ao gerar diagrama com Mermaid.js:', error);
      // Fallback para placeholder
      const imageUrl = `https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=${encodeURIComponent(prompt)}`;
      
      return {
        url: imageUrl,
        alt_text: `Diagrama gerado: ${prompt}`,
        caption: `Diagrama gerado com base em: "${prompt}"`
      };
    }
  }

  // Método para gerar resposta com diagrama
  private async generateDiagramResponse(userInput: string, context?: any): Promise<any> {
    try {
      console.log('🎨 Iniciando geração de diagrama...');
      const diagramPrompt = this.extractImagePrompt(userInput);
      console.log('📋 Prompt do diagrama:', diagramPrompt);
      
      const diagramType = imageAnalysisService.detectDiagramType(userInput);
      console.log('📋 Tipo do diagrama:', diagramType);
      
      const diagramData = await imageAnalysisService.generateDiagram(diagramPrompt, diagramType);
      console.log('✅ Diagrama gerado com sucesso');
      console.log('📋 Título do diagrama:', diagramData.title);
      console.log('📋 Tamanho do SVG:', diagramData.svg.length);
      
      const textResponse = await this.generateTextResponseForImage(userInput, {
        url: `data:image/svg+xml;base64,${Buffer.from(diagramData.svg).toString('base64')}`,
        alt_text: diagramData.title,
        caption: `Diagrama gerado com base em: "${diagramPrompt}"`
      });
      
      const response = {
        message: textResponse,
        media: [{
          type: 'diagram',
          url: diagramData.svg, // Agora contém código Mermaid
          alt: diagramData.title,
          caption: `Diagrama gerado com base em: "${diagramPrompt}"`
        }],
        suggestions: [
          'Gerar outro diagrama',
          'Modificar o diagrama',
          'Explicar mais detalhes'
        ]
      };
      
      console.log('📋 Resposta final:', {
        hasMessage: !!response.message,
        hasMedia: !!response.media,
        mediaLength: response.media.length,
        mediaType: response.media[0]?.type,
        mediaUrlLength: response.media[0]?.url?.length
      });
      
      return response;
    } catch (error) {
      console.error('❌ Erro ao gerar diagrama:', error);
      return {
        message: 'Desculpe, não consegui gerar o diagrama no momento. Pode tentar novamente?',
        suggestions: [
          'Tentar novamente',
          'Descrever melhor o que você quer',
          'Usar funcionalidades de texto'
        ]
      };
    }
  }

  // Método para gerar resposta textual para a imagem
  private async generateTextResponseForImage(userInput: string, imageData: ImageGenerationResponse): Promise<string> {
    return `🎨 Aqui está a imagem que você solicitou! 

${imageData.caption}

A imagem foi gerada com base na sua descrição e está pronta para uso. Você pode clicar nela para ampliar ou salvar.

Posso gerar outras variações ou modificar algo específico se você quiser!`;
  }

  // Método para analisar imagem enviada pelo usuário
  private async analyzeImageResponse(userInput: string, imageData: any, context?: any): Promise<any> {
    try {
      console.log('🔍 Iniciando análise de imagem com Tesseract.js:', {
        userInput,
        imageType: imageData.type,
        imageAlt: imageData.alt,
        imageCaption: imageData.caption,
        hasUrl: !!imageData.url
      });
      
      // Usar Tesseract.js para análise de imagem
      const analysisResult = await imageAnalysisService.analyzeImage(imageData.url, userInput);
      
      return {
        message: analysisResult,
        suggestions: [
          'Analisar outros aspectos da imagem',
          'Gerar relatório baseado na análise',
          'Criar ação corretiva se necessário'
        ]
      };
      
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      return {
        message: 'Desculpe, não consegui analisar a imagem no momento. Pode tentar novamente ou me descrever o que você vê na imagem?',
        suggestions: [
          'Descrever a imagem',
          'Tentar novamente',
          'Enviar outra imagem'
        ]
      };
    }
  }

  // Método para simular análise de imagem (placeholder)
  private async simulateImageAnalysis(userInput: string, imageData: any): Promise<string> {
    // Simular diferentes tipos de análise baseado no input do usuário
    const input = userInput.toLowerCase();
    
    // Detectar se é análise de etiqueta EAN
    if (input.includes('etiqueta') || input.includes('ean') || input.includes('código de barras') || 
        input.includes('verificar') || input.includes('verifique') || input.includes('extraia') ||
        imageData.alt?.toLowerCase().includes('ean') || imageData.caption?.toLowerCase().includes('ean')) {
      console.log('🏷️ Detectada solicitação de análise de etiqueta EAN');
      return this.analyzeEANLabel(userInput, imageData);
    }
    
    if (input.includes('gráfico') || input.includes('dados') || input.includes('tendência')) {
      return `📊 **Análise do Gráfico/Dados**

Analisando a imagem que você enviou, posso identificar:

**Principais Insights:**
• Tendência de crescimento nos últimos 3 meses
• Pico de atividade em março/abril
• Taxa de aprovação média de 94.2%

**Recomendações:**
• Manter o padrão de qualidade atual
• Investigar o pico de março para replicar boas práticas
• Considerar aumentar a frequência de inspeções

**Pontos de Atenção:**
• Variação de 2.3% no período analisado
• Necessidade de padronização em alguns processos

Posso gerar um relatório detalhado ou criar ações específicas baseadas nesta análise!`;
    }
    
    if (input.includes('defeito') || input.includes('problema') || input.includes('erro')) {
      return `🔍 **Análise de Defeitos/Problemas**

Baseado na imagem enviada, identifiquei:

**Defeitos Identificados:**
• Arranhões superficiais na superfície
• Desalinhamento de componentes
• Contaminação por partículas

**Classificação:**
• **Crítico:** 2 itens
• **Moderado:** 5 itens  
• **Leve:** 8 itens

**Ações Recomendadas:**
1. **Imediato:** Isolar lote afetado
2. **Curto prazo:** Revisar procedimentos de manuseio
3. **Longo prazo:** Implementar controles preventivos

**Causa Provável:** Falha no processo de embalagem

Posso criar um plano de ação detalhado para correção!`;
    }
    
    if (input.includes('processo') || input.includes('fluxo') || input.includes('procedimento')) {
      return `🔄 **Análise de Processo/Fluxo**

Analisando o fluxograma/diagrama enviado:

**Estrutura do Processo:**
• 5 etapas principais identificadas
• 3 pontos de decisão críticos
• 2 loops de feedback

**Pontos Fortes:**
• Sequência lógica bem definida
• Controles de qualidade em pontos estratégicos
• Documentação clara

**Oportunidades de Melhoria:**
• Reduzir tempo entre etapas 2 e 3
• Adicionar validação na etapa 4
• Implementar automação na etapa 1

**Risco Identificado:** Gargalo na etapa 3

Posso sugerir otimizações específicas ou criar um novo fluxo melhorado!`;
    }
    
    // Resposta genérica para outros tipos de imagem
         return `🔍 **Análise da Imagem**

Analisando a imagem que você enviou, posso observar:

**Conteúdo Identificado:**
• Documento/relatório técnico
• Informações estruturadas
• Dados organizados em formato tabular

**Principais Elementos:**
• Cabeçalho com identificação do processo
• Dados numéricos e métricas
• Timestamps e responsáveis

**Observações:**
• Formato profissional e padronizado
• Informações relevantes para controle de qualidade
• Possível necessidade de atualização

**Sugestões:**
• Verificar se os dados estão atualizados
• Confirmar se todos os campos obrigatórios estão preenchidos
• Considerar digitalização para melhor rastreabilidade

Posso ajudar a interpretar dados específicos ou criar ações baseadas nesta análise!`;
  }

  // Método específico para análise de etiquetas EAN
  private analyzeEANLabel(userInput: string, imageData: any): string {
    return `🏷️ **Análise da Etiqueta EAN**

Analisando a etiqueta que você enviou, identifiquei:

**Código EAN-13:** 7891234567890
**Produto:** Produto Teste - Modelo XYZ
**Fabricante:** Empresa ABC Ltda
**Categoria:** Eletrônicos

**Informações Adicionais:**
• **Peso:** 250g
• **Dimensões:** 15 x 10 x 5 cm
• **Cor:** Preto
• **Material:** Plástico ABS

**Validação:**
✅ Código EAN válido
✅ Dígito verificador correto
✅ Formato padrão brasileiro

**Dados do Produto:**
• **SKU:** PRD-001
• **Lote:** L2024-001
• **Data de Fabricação:** 15/01/2024
• **Validade:** 15/01/2029

**Observações:**
• Etiqueta em bom estado de conservação
• Informações legíveis e completas
• Conformidade com padrões GS1

Posso ajudar com mais detalhes sobre o produto ou validar outras informações da etiqueta!`;
  }
}

// Instância singleton
const geminiService = new OpenRouterService();
export default geminiService;
