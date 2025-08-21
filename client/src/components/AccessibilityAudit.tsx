import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  MousePointer, 
  Keyboard,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Accessibility,
  Contrast,
  Type,
  Zap
} from 'lucide-react';

interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'contrast' | 'keyboard' | 'screen-reader' | 'semantics' | 'focus';
  message: string;
  element?: HTMLElement;
  severity: 'high' | 'medium' | 'low';
  fix?: string;
}

interface AccessibilityAuditProps {
  className?: string;
}

export default function AccessibilityAudit({ className = "" }: AccessibilityAuditProps) {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Executar auditoria de acessibilidade
  const runAudit = () => {
    setIsAuditing(true);
    const foundIssues: AccessibilityIssue[] = [];

    // 1. Verificar contraste de cores
    checkColorContrast(foundIssues);

    // 2. Verificar navegação por teclado
    checkKeyboardNavigation(foundIssues);

    // 3. Verificar semântica HTML
    checkSemanticHTML(foundIssues);

    // 4. Verificar foco
    checkFocusManagement(foundIssues);

    // 5. Verificar leitores de tela
    checkScreenReaderSupport(foundIssues);

    // 6. Verificar responsividade
    checkResponsiveDesign(foundIssues);

    setIssues(foundIssues);
    setIsAuditing(false);
  };

  // Verificar contraste de cores
  const checkColorContrast = (foundIssues: AccessibilityIssue[]) => {
    const elements = document.querySelectorAll('*');
    
    elements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      
      if (backgroundColor && color && backgroundColor !== 'transparent') {
        const contrast = calculateContrastRatio(backgroundColor, color);
        
        if (contrast < 4.5) {
          foundIssues.push({
            id: `contrast-${Date.now()}-${Math.random()}`,
            type: 'error',
            category: 'contrast',
            message: `Contraste insuficiente (${contrast.toFixed(2)}:1) no elemento ${element.tagName}`,
            element: element as HTMLElement,
            severity: 'high',
            fix: 'Aumentar o contraste entre texto e fundo para pelo menos 4.5:1'
          });
        } else if (contrast < 7) {
          foundIssues.push({
            id: `contrast-${Date.now()}-${Math.random()}`,
            type: 'warning',
            category: 'contrast',
            message: `Contraste baixo (${contrast.toFixed(2)}:1) no elemento ${element.tagName}`,
            element: element as HTMLElement,
            severity: 'medium',
            fix: 'Considerar aumentar o contraste para melhor legibilidade'
          });
        }
      }
    });
  };

  // Verificar navegação por teclado
  const checkKeyboardNavigation = (foundIssues: AccessibilityIssue[]) => {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    
    interactiveElements.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex');
      
      if (tabIndex === '-1' && element.tagName !== 'BUTTON' && element.tagName !== 'A') {
        foundIssues.push({
          id: `keyboard-${Date.now()}-${Math.random()}`,
          type: 'warning',
          category: 'keyboard',
          message: `Elemento ${element.tagName} removido da navegação por teclado`,
          element: element as HTMLElement,
          severity: 'medium',
          fix: 'Verificar se o elemento deve ser acessível por teclado'
        });
      }
      
      if (element.tagName === 'BUTTON' && !element.getAttribute('aria-label') && !element.textContent?.trim()) {
        foundIssues.push({
          id: `keyboard-${Date.now()}-${Math.random()}`,
          type: 'error',
          category: 'keyboard',
          message: `Botão sem texto ou aria-label`,
          element: element as HTMLElement,
          severity: 'high',
          fix: 'Adicionar texto ou aria-label ao botão'
        });
      }
    });
  };

  // Verificar semântica HTML
  const checkSemanticHTML = (foundIssues: AccessibilityIssue[]) => {
    // Verificar uso de divs em vez de elementos semânticos
    const divs = document.querySelectorAll('div');
    
    divs.forEach((div) => {
      const role = div.getAttribute('role');
      const onClick = div.getAttribute('onclick');
      
      if (onClick && !role) {
        foundIssues.push({
          id: `semantic-${Date.now()}-${Math.random()}`,
          type: 'warning',
          category: 'semantics',
          message: `Div clicável sem role semântico`,
          element: div as HTMLElement,
          severity: 'medium',
          fix: 'Adicionar role="button" ou usar elemento button'
        });
      }
    });

    // Verificar headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName[1]));
    
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] - headingLevels[i-1] > 1) {
        foundIssues.push({
          id: `semantic-${Date.now()}-${Math.random()}`,
          type: 'warning',
          category: 'semantics',
          message: 'Estrutura de headings não hierárquica',
          element: headings[i] as HTMLElement,
          severity: 'medium',
          fix: 'Manter hierarquia sequencial de headings (h1 → h2 → h3)'
        });
      }
    }
  };

  // Verificar gerenciamento de foco
  const checkFocusManagement = (foundIssues: AccessibilityIssue[]) => {
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const outline = styles.outline;
      
      if (outline === 'none' || outline === '0px') {
        foundIssues.push({
          id: `focus-${Date.now()}-${Math.random()}`,
          type: 'error',
          category: 'focus',
          message: `Elemento sem indicador visual de foco`,
          element: element as HTMLElement,
          severity: 'high',
          fix: 'Adicionar outline ou box-shadow para indicar foco'
        });
      }
    });
  };

  // Verificar suporte a leitores de tela
  const checkScreenReaderSupport = (foundIssues: AccessibilityIssue[]) => {
    const images = document.querySelectorAll('img');
    
    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      
      if (!alt) {
        foundIssues.push({
          id: `screen-reader-${Date.now()}-${Math.random()}`,
          type: 'error',
          category: 'screen-reader',
          message: `Imagem sem atributo alt`,
          element: img as HTMLElement,
          severity: 'high',
          fix: 'Adicionar atributo alt descritivo'
        });
      } else if (alt === '') {
        foundIssues.push({
          id: `screen-reader-${Date.now()}-${Math.random()}`,
          type: 'info',
          category: 'screen-reader',
          message: `Imagem decorativa com alt vazio`,
          element: img as HTMLElement,
          severity: 'low',
          fix: 'Considerar usar role="presentation" para imagens decorativas'
        });
      }
    });

    // Verificar labels em formulários
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      
      if (!id && !ariaLabel && !ariaLabelledby) {
        foundIssues.push({
          id: `screen-reader-${Date.now()}-${Math.random()}`,
          type: 'error',
          category: 'screen-reader',
          message: `Campo de formulário sem label`,
          element: input as HTMLElement,
          severity: 'high',
          fix: 'Adicionar label, aria-label ou aria-labelledby'
        });
      }
    });
  };

  // Verificar design responsivo
  const checkResponsiveDesign = (foundIssues: AccessibilityIssue[]) => {
    const viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
      foundIssues.push({
        id: `responsive-${Date.now()}-${Math.random()}`,
        type: 'error',
        category: 'semantics',
        message: 'Meta viewport não encontrada',
        element: document.head,
        severity: 'high',
        fix: 'Adicionar meta viewport para responsividade'
      });
    }

    // Verificar tamanho mínimo de toque
    const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
    
    touchTargets.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const minSize = 44; // 44px é o tamanho mínimo recomendado para toque
      
      if (rect.width < minSize || rect.height < minSize) {
        foundIssues.push({
          id: `responsive-${Date.now()}-${Math.random()}`,
          type: 'warning',
          category: 'semantics',
          message: `Elemento muito pequeno para toque (${rect.width}x${rect.height}px)`,
          element: element as HTMLElement,
          severity: 'medium',
          fix: 'Aumentar tamanho mínimo para 44x44px'
        });
      }
    });
  };

  // Calcular razão de contraste
  const calculateContrastRatio = (bg: string, fg: string): number => {
    // Implementação simplificada - em produção usar biblioteca especializada
    return 4.5; // Placeholder
  };

  // Toggle alto contraste
  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.body.classList.toggle('high-contrast');
  };

  // Toggle movimento reduzido
  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
    document.body.classList.toggle('reduced-motion');
  };

  // Aumentar tamanho da fonte
  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
    document.documentElement.style.fontSize = `${fontSize}px`;
  };

  // Diminuir tamanho da fonte
  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
    document.documentElement.style.fontSize = `${fontSize}px`;
  };

  // Contadores de problemas
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const infoCount = issues.filter(i => i.type === 'info').length;

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Auditoria de Acessibilidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controles de acessibilidade */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={toggleHighContrast}
              variant={highContrast ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              {highContrast ? <Contrast className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Alto Contraste
            </Button>
            
            <Button
              onClick={toggleReducedMotion}
              variant={reducedMotion ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              {reducedMotion ? <Zap className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              Movimento Reduzido
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={decreaseFontSize}
                variant="outline"
                size="sm"
                disabled={fontSize <= 12}
              >
                A-
              </Button>
              <span className="text-sm font-medium">{fontSize}px</span>
              <Button
                onClick={increaseFontSize}
                variant="outline"
                size="sm"
                disabled={fontSize >= 24}
              >
                A+
              </Button>
            </div>
          </div>

          {/* Botão de auditoria */}
          <Button
            onClick={runAudit}
            disabled={isAuditing}
            className="w-full"
          >
            {isAuditing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Executando Auditoria...
              </>
            ) : (
              <>
                <Accessibility className="w-4 h-4 mr-2" />
                Executar Auditoria Completa
              </>
            )}
          </Button>

          {/* Resumo dos problemas */}
          {issues.length > 0 && (
            <div className="flex gap-4">
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {errorCount} Erros
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {warningCount} Avisos
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                {infoCount} Informações
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de problemas */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Problemas Encontrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {issues.map((issue) => (
                <Alert key={issue.id} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                  <div className="flex items-start gap-3">
                    {issue.type === 'error' && <XCircle className="w-4 h-4 mt-0.5" />}
                    {issue.type === 'warning' && <AlertTriangle className="w-4 h-4 mt-0.5" />}
                    {issue.type === 'info' && <Info className="w-4 h-4 mt-0.5" />}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                        <Badge variant={issue.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                          {issue.severity}
                        </Badge>
                      </div>
                      
                      <AlertDescription className="font-medium">
                        {issue.message}
                      </AlertDescription>
                      
                      {issue.fix && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <strong>Sugestão:</strong> {issue.fix}
                        </p>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas de acessibilidade */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas de Acessibilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                Navegação por Teclado
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Todos os elementos interativos devem ser acessíveis por Tab</li>
                <li>• Use Enter e Espaço para ativar botões</li>
                <li>• Implemente atalhos de teclado para ações frequentes</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Contraste e Cores
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Contraste mínimo de 4.5:1 para texto normal</li>
                <li>• Contraste mínimo de 3:1 para texto grande</li>
                <li>• Não dependa apenas da cor para transmitir informação</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Leitores de Tela
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Use HTML semântico (h1, h2, button, etc.)</li>
                <li>• Adicione alt text descritivo em imagens</li>
                <li>• Use aria-labels para elementos sem texto</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                Tamanhos de Toque
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Elementos clicáveis devem ter pelo menos 44x44px</li>
                <li>• Espaçamento adequado entre elementos</li>
                <li>• Evite elementos muito próximos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
