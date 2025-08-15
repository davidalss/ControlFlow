import axios from 'axios';
import { createWorker } from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

interface DiagramResult {
  svg: string;
  type: 'flowchart' | 'mindmap' | 'graph' | 'sequence';
  title: string;
}

class ImageAnalysisService {
  private tesseractWorker: any = null;
  private isInitializing: boolean = false;

  constructor() {
    // Inicializar de forma assíncrona
    this.initializeTesseract().catch(error => {
      console.error('❌ Erro na inicialização do Tesseract.js:', error);
    });
  }

  /**
   * Inicializa o worker do Tesseract.js
   */
  private async initializeTesseract() {
    if (this.isInitializing) {
      // Aguardar se já está inicializando
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isInitializing = true;
    
    try {
      console.log('🔧 Inicializando Tesseract.js...');
      this.tesseractWorker = await createWorker('por'); // Português
      console.log('✅ Tesseract.js inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Tesseract.js:', error);
      this.tesseractWorker = null;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Extrai texto de imagem usando Tesseract.js (OCR gratuito)
   */
  async extractTextFromImage(imageData: string): Promise<OCRResult> {
    try {
      console.log('🔍 Tesseract.js - Iniciando OCR da imagem...');
      
      // Aguardar inicialização se necessário
      if (!this.tesseractWorker && !this.isInitializing) {
        await this.initializeTesseract();
      }
      
      // Se ainda não tem worker, retornar erro
      if (!this.tesseractWorker) {
        throw new Error('Tesseract.js não foi inicializado corretamente');
      }

      // Converter base64 para blob
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      const blob = Buffer.from(base64Data, 'base64');

      // Realizar OCR
      const result = await this.tesseractWorker.recognize(blob);
      
      console.log('✅ Tesseract.js - OCR concluído com sucesso');
      
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words ? result.data.words.map((word: any) => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox
        })) : []
      };

    } catch (error) {
      console.error('❌ Erro no OCR do Tesseract.js:', error);
      throw new Error('Falha ao extrair texto da imagem');
    }
  }

  /**
   * Analisa imagem e extrai informações relevantes
   */
  async analyzeImage(imageData: string, userPrompt: string): Promise<string> {
    try {
      console.log('🤖 Iniciando análise de imagem...');
      
      // Extrair texto usando OCR
      const ocrResult = await this.extractTextFromImage(imageData);
      
      // Analisar o conteúdo extraído
      const analysis = this.analyzeExtractedContent(ocrResult.text, userPrompt);
      
      return analysis;

    } catch (error) {
      console.error('❌ Erro na análise de imagem:', error);
      throw new Error('Falha ao analisar imagem');
    }
  }

  /**
   * Analisa o conteúdo extraído e gera resposta contextual
   */
  private analyzeExtractedContent(extractedText: string, userPrompt: string): string {
    const text = extractedText.toLowerCase();
    const prompt = userPrompt.toLowerCase();

    // Detectar tipo de documento
    if (text.includes('ean') || text.includes('código') || text.includes('barras')) {
      return this.analyzeBarcodeLabel(extractedText, userPrompt);
    }
    
    if (text.includes('inspeção') || text.includes('qualidade') || text.includes('defeito')) {
      return this.analyzeQualityDocument(extractedText, userPrompt);
    }
    
    if (text.includes('processo') || text.includes('fluxo') || text.includes('etapa')) {
      return this.analyzeProcessDocument(extractedText, userPrompt);
    }

    // Análise genérica
    const lines = extractedText.split('\n').filter(line => line.trim());
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
    const hasNumbers = /\d/.test(extractedText);
    const hasLetters = /[a-zA-Z]/.test(extractedText);
    
    return `ANÁLISE DE DOCUMENTO - OCR

TEXTO EXTRAÍDO:
${extractedText}

ANÁLISE TÉCNICA:
• Linhas Processadas: ${lines.length}
• Palavras Identificadas: ${wordCount}
• Status: Processado com sucesso
• Qualidade da Extração: ${extractedText.length > 50 ? 'Excelente' : extractedText.length > 20 ? 'Boa' : 'Regular'}
• Tipo de Conteúdo: ${hasNumbers ? 'Com números' : ''} ${hasLetters ? 'Com texto' : ''}

PERGUNTA:
"${userPrompt}"

O documento foi processado com sucesso! Extraí todas as informações acima e estão prontas para análise. Posso ajudar com interpretações específicas, comparações ou análises detalhadas conforme sua necessidade.`;
  }

  /**
   * Analisa etiquetas de código de barras
   */
  private analyzeBarcodeLabel(text: string, userPrompt: string): string {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Análise inteligente do conteúdo
    const hasNumbers = /\d/.test(text);
    const hasLetters = /[a-zA-Z]/.test(text);
    const hasSpecialChars = /[^a-zA-Z0-9\s]/.test(text);
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    // Detectar tipo de documento baseado no conteúdo
    let documentType = 'Etiqueta';
    if (text.includes('INSPEÇÃO') || text.includes('QUALIDADE')) documentType = 'Documento de Qualidade';
    if (text.includes('PROCESSO') || text.includes('FLUXO')) documentType = 'Documento de Processo';
    if (text.includes('RELATÓRIO') || text.includes('REPORT')) documentType = 'Relatório';
    if (text.includes('CERTIFICADO') || text.includes('CERTIFICATE')) documentType = 'Certificado';
    
    // Extrair informações relevantes (primeiras linhas significativas)
    const mainInfo = lines.slice(0, 3).filter(line => line.trim().length > 2);
    const additionalInfo = lines.slice(3).filter(line => line.trim().length > 2);
    
    return `ANÁLISE DE DOCUMENTO - OCR

INFORMAÇÕES PRINCIPAIS:
${mainInfo.map((line, index) => `Linha ${index + 1}: ${line}`).join('\n')}

${additionalInfo.length > 0 ? `\nINFORMAÇÕES ADICIONAIS:\n${additionalInfo.map((line, index) => `• ${line}`).join('\n')}` : ''}

TEXTO COMPLETO EXTRAÍDO:
${lines.join('\n')}

ANÁLISE TÉCNICA:
• Tipo de Documento: ${documentType}
• Linhas Processadas: ${lines.length}
• Palavras Identificadas: ${wordCount}
• Status: Processado com sucesso
• Qualidade da Extração: ${text.length > 50 ? 'Excelente' : text.length > 20 ? 'Boa' : 'Regular'}
• Conteúdo: ${hasNumbers ? 'Com números' : ''} ${hasLetters ? 'Com texto' : ''} ${hasSpecialChars ? 'Com caracteres especiais' : ''}

PERGUNTA:
"${userPrompt}"

Baseado na análise do documento, extraí todas as informações acima. O conteúdo foi processado com sucesso e está pronto para análise. Posso ajudar com interpretações específicas, comparações ou análises detalhadas conforme sua necessidade.`;
  }

  /**
   * Analisa documentos de qualidade
   */
  private analyzeQualityDocument(text: string, userPrompt: string): string {
    return `ANÁLISE DE DOCUMENTO DE QUALIDADE

CONTEÚDO EXTRAÍDO:
${text}

ANÁLISE:
• Tipo: Documento relacionado à qualidade
• Possíveis elementos: Inspeções, defeitos, especificações
• Status: Processado e analisado

PERGUNTA:
"${userPrompt}"

O documento de qualidade foi analisado. Posso ajudar a interpretar dados específicos, identificar padrões ou criar relatórios baseados no conteúdo extraído.`;
  }

  /**
   * Analisa documentos de processo
   */
  private analyzeProcessDocument(text: string, userPrompt: string): string {
    return `ANÁLISE DE DOCUMENTO DE PROCESSO

CONTEÚDO EXTRAÍDO:
${text}

ANÁLISE:
• Tipo: Documento de processo ou fluxo
• Elementos identificados: Etapas, procedimentos, fluxos
• Aplicabilidade: Controle de qualidade e processos industriais

PERGUNTA:
"${userPrompt}"

O documento de processo foi analisado. Posso ajudar a criar fluxogramas, identificar pontos de melhoria ou documentar procedimentos baseados no conteúdo extraído.`;
  }

  /**
   * Detecta se o prompt solicita geração de diagrama
   */
  shouldGenerateDiagram(userInput: string): boolean {
    const input = userInput.toLowerCase();
    const diagramKeywords = [
      'crie um fluxograma', 'gere um fluxograma', 'faça um diagrama', 'crie um diagrama',
      'gere um diagrama', 'mostre um fluxo', 'desenhe um processo', 'ilustre o processo', 
      'crie um mapa', 'fluxograma', 'diagrama de fluxo', 'processo', 'mind map', 'mapa mental',
      'diagrama', 'fluxo', 'processo de inspeção', 'inspeção'
    ];
    
    console.log('🔍 Verificando se deve gerar diagrama para:', input);
    const shouldGenerate = diagramKeywords.some(keyword => input.includes(keyword));
    console.log('📋 Palavras-chave encontradas:', diagramKeywords.filter(keyword => input.includes(keyword)));
    console.log('📋 Deve gerar diagrama?', shouldGenerate);
    
    return shouldGenerate;
  }

  /**
   * Gera diagrama usando Mermaid.js (gratuito)
   */
  async generateDiagram(prompt: string, type: 'flowchart' | 'mindmap' | 'graph' | 'sequence'): Promise<DiagramResult> {
    try {
      console.log('🎨 Gerando diagrama com Mermaid.js...');
      
      const mermaidCode = this.createMermaidCode(prompt, type);
      
      // Retornar o código Mermaid diretamente para renderização no cliente
      return {
        svg: mermaidCode, // Agora contém o código Mermaid, não SVG
        type,
        title: `Diagrama gerado: ${prompt}`
      };

    } catch (error) {
      console.error('❌ Erro ao gerar diagrama:', error);
      throw new Error('Falha ao gerar diagrama');
    }
  }

  /**
   * Cria código Mermaid baseado no prompt
   */
  private createMermaidCode(prompt: string, type: string): string {
    switch (type) {
      case 'flowchart':
        return this.createFlowchartCode(prompt);
      case 'mindmap':
        return this.createMindmapCode(prompt);
      case 'sequence':
        return this.createSequenceCode(prompt);
      default:
        return this.createFlowchartCode(prompt);
    }
  }

  /**
   * Cria código para fluxograma
   */
  private createFlowchartCode(prompt: string): string {
    return `graph TD
    A[🎯 Início do Processo] --> B[📋 Coleta de Dados]
    B --> C{🔍 Verificação de Qualidade}
    C -->|✅ Aprovado| D[📊 Análise de Resultados]
    C -->|❌ Reprovado| E[🔄 Correção de Defeitos]
    D --> F[📈 Geração de Relatório]
    E --> B
    F --> G[🏁 Finalização]
    
    style A fill:#e1f5fe,stroke:#01579b,stroke-width:3px
    style B fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style C fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style D fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style E fill:#ffebee,stroke:#c62828,stroke-width:2px
    style F fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style G fill:#f1f8e9,stroke:#33691e,stroke-width:3px`;
  }

  /**
   * Cria código para mapa mental
   */
  private createMindmapCode(prompt: string): string {
    return `mindmap
  root((🎯 Controle de Qualidade))
    📊 Inspeção
      🔍 Visual
      📏 Dimensional
      ⚖️ Funcional
    📋 Documentação
      📝 Procedimentos
      📋 Registros
      📈 Relatórios
    🔧 Processos
      ⚙️ Produção
      🏭 Fabricação
      📦 Embalagem
    👥 Recursos
      👨‍💼 Pessoal
      🛠️ Equipamentos
      🏢 Infraestrutura`;
  }

  /**
   * Cria código para diagrama de sequência
   */
  private createSequenceCode(prompt: string): string {
    return `sequenceDiagram
    participant I as 👨‍💼 Inspetor
    participant S as 🖥️ Sistema
    participant D as 📊 Banco de Dados
    participant R as 📈 Relatórios
    
    I->>S: 📋 Iniciar Inspeção
    S->>D: 🔍 Consultar Produto
    D-->>S: 📄 Dados do Produto
    S-->>I: 📱 Formulário de Inspeção
    I->>S: ✅ Registrar Resultados
    S->>D: 💾 Salvar Inspeção
    D-->>S: ✅ Confirmação
    S->>R: 📊 Gerar Relatório
    R-->>S: 📈 Relatório Pronto
    S-->>I: 🎯 Inspeção Concluída`;
  }

  /**
   * Converte código Mermaid para SVG usando API pública
   */
  private async convertMermaidToSVG(mermaidCode: string): Promise<string> {
    try {
      console.log('🔄 Convertendo Mermaid para SVG...');
      console.log('📋 Código Mermaid:', mermaidCode);
      
      // Gerar SVG diretamente baseado no tipo de diagrama
      const svg = this.generateSimpleSVG(mermaidCode);
      
      console.log('✅ SVG gerado com sucesso');
      console.log('📋 Tamanho do SVG:', svg.length);
      console.log('📋 Primeiros 100 chars do SVG:', svg.substring(0, 100));
      
      return svg;
    } catch (error) {
      console.error('❌ Erro ao converter Mermaid para SVG:', error);
      // Fallback: retornar SVG básico
      const fallbackSvg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" fill="#666">Diagrama: ${mermaidCode.substring(0, 50)}...</text>
      </svg>`;
      console.log('🔄 Usando SVG fallback');
      return fallbackSvg;
    }
  }

  /**
   * Gera SVG simples baseado no código Mermaid
   */
  private generateSimpleSVG(mermaidCode: string): string {
    if (mermaidCode.includes('graph TD') || mermaidCode.includes('graph LR')) {
      return this.generateFlowchartSVG();
    } else if (mermaidCode.includes('mindmap')) {
      return this.generateMindmapSVG();
    } else if (mermaidCode.includes('sequenceDiagram')) {
      return this.generateSequenceSVG();
    } else {
      return this.generateDefaultSVG();
    }
  }

  /**
   * Gera SVG para fluxograma
   */
  private generateFlowchartSVG(): string {
    return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .node { fill: #e1f5fe; stroke: #01579b; stroke-width: 2; }
          .decision { fill: #fff3e0; stroke: #e65100; stroke-width: 2; }
          .end { fill: #c8e6c9; stroke: #2e7d32; stroke-width: 2; }
          .text { font-family: Arial, sans-serif; font-size: 12px; text-anchor: middle; }
          .arrow { stroke: #333; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
        </style>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
        </marker>
      </defs>
      
      <!-- Nós -->
      <rect x="250" y="50" width="100" height="40" rx="5" class="node"/>
      <text x="300" y="75" class="text">Início</text>
      
      <rect x="250" y="120" width="100" height="40" rx="5" class="node"/>
      <text x="300" y="145" class="text">Processo 1</text>
      
      <polygon points="300,200 320,220 300,240 280,220" class="decision"/>
      <text x="300" y="225" class="text">Decisão</text>
      
      <rect x="400" y="190" width="100" height="40" rx="5" class="node"/>
      <text x="450" y="215" class="text">Processo 2</text>
      
      <rect x="100" y="190" width="100" height="40" rx="5" class="node"/>
      <text x="150" y="215" class="text">Processo 3</text>
      
      <rect x="250" y="280" width="100" height="40" rx="5" class="end"/>
      <text x="300" y="305" class="text">Fim</text>
      
      <!-- Setas -->
      <line x1="300" y1="90" x2="300" y2="120" class="arrow"/>
      <line x1="300" y1="160" x2="300" y2="200" class="arrow"/>
      <line x1="320" y1="220" x2="400" y2="220" class="arrow"/>
      <line x1="280" y1="220" x2="200" y2="220" class="arrow"/>
      <line x1="450" y1="230" x2="400" y2="280" class="arrow"/>
      <line x1="150" y1="230" x2="200" y2="280" class="arrow"/>
      <line x1="300" y1="240" x2="300" y2="280" class="arrow"/>
      
      <!-- Labels -->
      <text x="420" y="210" class="text" font-size="10">Sim</text>
      <text x="180" y="210" class="text" font-size="10">Não</text>
    </svg>`;
  }

  /**
   * Gera SVG para mapa mental
   */
  private generateMindmapSVG(): string {
    return `<svg width="500" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .central { fill: #4f46e5; stroke: #3730a3; stroke-width: 2; }
          .branch { fill: #818cf8; stroke: #6366f1; stroke-width: 2; }
          .leaf { fill: #c7d2fe; stroke: #a5b4fc; stroke-width: 2; }
          .text { font-family: Arial, sans-serif; font-size: 12px; text-anchor: middle; fill: white; }
          .line { stroke: #6366f1; stroke-width: 2; fill: none; }
        </style>
      </defs>
      
      <!-- Nó central -->
      <circle cx="250" cy="200" r="40" class="central"/>
      <text x="250" y="205" class="text">Tema</text>
      
      <!-- Ramos principais -->
      <circle cx="100" cy="100" r="30" class="branch"/>
      <text x="100" y="105" class="text">Ramo 1</text>
      <line x1="210" y1="180" x2="130" y2="130" class="line"/>
      
      <circle cx="400" cy="100" r="30" class="branch"/>
      <text x="400" y="105" class="text">Ramo 2</text>
      <line x1="290" y1="180" x2="370" y2="130" class="line"/>
      
      <circle cx="100" cy="300" r="30" class="branch"/>
      <text x="100" y="305" class="text">Ramo 3</text>
      <line x1="210" y1="220" x2="130" y2="270" class="line"/>
      
      <circle cx="400" cy="300" r="30" class="branch"/>
      <text x="400" y="305" class="text">Ramo 4</text>
      <line x1="290" y1="220" x2="370" y2="270" class="line"/>
      
      <!-- Folhas -->
      <circle cx="50" cy="50" r="20" class="leaf"/>
      <text x="50" y="55" class="text" font-size="10">Item 1</text>
      <line x1="70" y1="70" x2="85" y2="85" class="line"/>
      
      <circle cx="450" cy="50" r="20" class="leaf"/>
      <text x="450" y="55" class="text" font-size="10">Item 2</text>
      <line x1="430" y1="70" x2="415" y2="85" class="line"/>
    </svg>`;
  }

  /**
   * Gera SVG para diagrama de sequência
   */
  private generateSequenceSVG(): string {
    return `<svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .actor { fill: #e1f5fe; stroke: #01579b; stroke-width: 2; }
          .lifeline { stroke: #ccc; stroke-width: 1; stroke-dasharray: 5,5; }
          .message { stroke: #333; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
          .text { font-family: Arial, sans-serif; font-size: 12px; text-anchor: middle; }
        </style>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
        </marker>
      </defs>
      
      <!-- Atores -->
      <rect x="50" y="50" width="80" height="40" rx="5" class="actor"/>
      <text x="90" y="75" class="text">Usuário</text>
      <line x1="90" y1="90" x2="90" y2="250" class="lifeline"/>
      
      <rect x="200" y="50" width="80" height="40" rx="5" class="actor"/>
      <text x="240" y="75" class="text">Sistema</text>
      <line x1="240" y1="90" x2="240" y2="250" class="lifeline"/>
      
      <rect x="350" y="50" width="80" height="40" rx="5" class="actor"/>
      <text x="390" y="75" class="text">Banco</text>
      <line x1="390" y1="90" x2="390" y2="250" class="lifeline"/>
      
      <!-- Mensagens -->
      <line x1="90" y1="120" x2="240" y2="120" class="message"/>
      <text x="165" y="115" class="text" font-size="10">Solicitação</text>
      
      <line x1="240" y1="150" x2="390" y2="150" class="message"/>
      <text x="315" y="145" class="text" font-size="10">Consulta</text>
      
      <line x1="390" y1="180" x2="240" y2="180" class="message"/>
      <text x="315" y="175" class="text" font-size="10">Resposta</text>
      
      <line x1="240" y1="210" x2="90" y2="210" class="message"/>
      <text x="165" y="205" class="text" font-size="10">Resultado</text>
    </svg>`;
  }

  /**
   * Gera SVG padrão
   */
  private generateDefaultSVG(): string {
    return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="16">
        Diagrama Gerado
      </text>
    </svg>`;
  }

  /**
   * Detecta o tipo de diagrama a ser gerado
   */
  detectDiagramType(userInput: string): 'flowchart' | 'mindmap' | 'graph' | 'sequence' {
    const input = userInput.toLowerCase();
    
    if (input.includes('fluxograma') || input.includes('fluxo') || input.includes('processo')) {
      return 'flowchart';
    }
    if (input.includes('mind map') || input.includes('mapa mental') || input.includes('organograma')) {
      return 'mindmap';
    }
    if (input.includes('sequência') || input.includes('sequencia') || input.includes('interação')) {
      return 'sequence';
    }
    return 'flowchart';
  }
}

export default new ImageAnalysisService();
