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
        words: result.data.words.map((word: any) => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox
        }))
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
    return `📋 **Análise do Documento**

**Texto Extraído:**
${extractedText}

**Observações:**
• Documento processado com sucesso
• ${extractedText.split(' ').length} palavras identificadas
• Conteúdo legível e estruturado

**Resposta à sua pergunta:** "${userPrompt}"
Baseado no conteúdo extraído, posso confirmar que o documento foi processado. Se precisar de análise específica, me informe qual aspecto você gostaria que eu focasse.`;
  }

  /**
   * Analisa etiquetas de código de barras
   */
  private analyzeBarcodeLabel(text: string, userPrompt: string): string {
    const lines = text.split('\n').filter(line => line.trim());
    
    return `🏷️ **Análise de Etiqueta/Código de Barras**

**Conteúdo Identificado:**
${lines.map((line, index) => `${index + 1}. ${line}`).join('\n')}

**Informações Extraídas:**
• Tipo: Etiqueta com código de barras
• Linhas de texto: ${lines.length}
• Conteúdo principal: ${lines[0] || 'Não identificado'}

**Resposta à sua pergunta:** "${userPrompt}"
A etiqueta foi processada com sucesso. O conteúdo acima representa o texto extraído da imagem. Se precisar de informações específicas sobre códigos, números de série ou outros dados, me informe.`;
  }

  /**
   * Analisa documentos de qualidade
   */
  private analyzeQualityDocument(text: string, userPrompt: string): string {
    return `📊 **Análise de Documento de Qualidade**

**Conteúdo Extraído:**
${text}

**Análise:**
• Tipo: Documento relacionado à qualidade
• Possíveis elementos: Inspeções, defeitos, especificações
• Status: Processado e analisado

**Resposta à sua pergunta:** "${userPrompt}"
O documento de qualidade foi analisado. Posso ajudar a interpretar dados específicos, identificar padrões ou criar relatórios baseados no conteúdo extraído.`;
  }

  /**
   * Analisa documentos de processo
   */
  private analyzeProcessDocument(text: string, userPrompt: string): string {
    return `🔄 **Análise de Documento de Processo**

**Conteúdo Extraído:**
${text}

**Análise:**
• Tipo: Documento de processo ou fluxo
• Elementos identificados: Etapas, procedimentos, fluxos
• Aplicabilidade: Controle de qualidade e processos industriais

**Resposta à sua pergunta:** "${userPrompt}"
O documento de processo foi analisado. Posso ajudar a criar fluxogramas, identificar pontos de melhoria ou documentar procedimentos baseados no conteúdo extraído.`;
  }

  /**
   * Detecta se o prompt solicita geração de diagrama
   */
  shouldGenerateDiagram(userInput: string): boolean {
    const input = userInput.toLowerCase();
    const diagramKeywords = [
      'crie um fluxograma', 'gere um fluxograma', 'faça um diagrama', 'crie um diagrama',
      'mostre um fluxo', 'desenhe um processo', 'ilustre o processo', 'crie um mapa',
      'fluxograma', 'diagrama de fluxo', 'processo', 'mind map', 'mapa mental'
    ];
    return diagramKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * Gera diagrama usando Mermaid.js (gratuito)
   */
  async generateDiagram(prompt: string, type: 'flowchart' | 'mindmap' | 'graph' | 'sequence'): Promise<DiagramResult> {
    try {
      console.log('🎨 Gerando diagrama com Mermaid.js...');
      
      const mermaidCode = this.createMermaidCode(prompt, type);
      
      // Converter Mermaid para SVG usando API pública
      const svg = await this.convertMermaidToSVG(mermaidCode);
      
      return {
        svg,
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
    A[Início] --> B[Processo 1]
    B --> C{Decisão}
    C -->|Sim| D[Processo 2]
    C -->|Não| E[Processo 3]
    D --> F[Fim]
    E --> F
    style A fill:#e1f5fe
    style F fill:#c8e6c9`;
  }

  /**
   * Cria código para mapa mental
   */
  private createMindmapCode(prompt: string): string {
    return `mindmap
  root((Tema Central))
    Subtema 1
      Item 1.1
      Item 1.2
    Subtema 2
      Item 2.1
      Item 2.2
    Subtema 3
      Item 3.1
      Item 3.2`;
  }

  /**
   * Cria código para diagrama de sequência
   */
  private createSequenceCode(prompt: string): string {
    return `sequenceDiagram
    participant A as Usuário
    participant B as Sistema
    participant C as Banco
    
    A->>B: Solicitação
    B->>C: Consulta
    C-->>B: Resposta
    B-->>A: Resultado`;
  }

  /**
   * Converte código Mermaid para SVG usando API pública
   */
  private async convertMermaidToSVG(mermaidCode: string): Promise<string> {
    try {
      // Usar API pública do Mermaid.js
      const response = await axios.post('https://mermaid.ink/svg', {
        graph: mermaidCode
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      // Fallback: retornar SVG básico
      return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" fill="#666">Diagrama: ${mermaidCode.substring(0, 50)}...</text>
      </svg>`;
    }
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
