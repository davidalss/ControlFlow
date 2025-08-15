import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
  onError?: (error: string) => void;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgContent: string;
  title: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  chart,
  className = '',
  onError
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastChartRef = useRef<string>('');

  // Inicializar Mermaid apenas uma vez
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        bottomMarginAdj: 1,
        rightAngles: false,
        showSequenceNumbers: false
      },
      gantt: {
        useMaxWidth: true,
        leftPadding: 75,
        rightPadding: 20,
        topPadding: 50,
        bottomPadding: 100,
        titleTopMargin: 25,
        barGap: 4,
        barHeight: 20,
        barLowHeight: 15,
        barMediumHeight: 20,
        barHighHeight: 25,
        topMargin: 50,
        leftMargin: 75,
        gridLineStartPadding: 35,
        fontSize: 11,
        fontFamily: '"Open-Sans", "sans-serif"',
        numberSectionStyles: 4,
        axisFormat: '%Y-%m-%d'
      },
      journey: {
        useMaxWidth: true,
        leftPadding: 75,
        rightPadding: 20,
        topPadding: 50,
        bottomPadding: 100,
        titleTopMargin: 25,
        barGap: 4,
        barHeight: 20,
        barLowHeight: 15,
        barMediumHeight: 20,
        barHighHeight: 25,
        topMargin: 50,
        leftMargin: 75,
        gridLineStartPadding: 35,
        fontSize: 11,
        fontFamily: '"Open-Sans", "sans-serif"',
        numberSectionStyles: 4,
        axisFormat: '%Y-%m-%d'
      },
      pie: {
        useMaxWidth: true
      },
      er: {
        useMaxWidth: true,
        diagramPadding: 20,
        layoutDirection: 'TB',
        minEntityWidth: 100,
        minEntityHeight: 75,
        entityPadding: 15,
        stroke: 'gray',
        fill: 'honeydew',
        fontSize: 12
      },
      mindmap: {
        useMaxWidth: true
      },
      gitGraph: {
        useMaxWidth: true,
        rotateCommitLabel: true
      }
    });
  }, []);

  const renderDiagram = useCallback(async () => {
    if (!chart) return;

    // Verificar se o chart mudou
    if (lastChartRef.current === chart) {
      return; // Não re-renderizar se o chart é o mesmo
    }

    try {
      setError(null);
      setIsLoading(true);
      setIsRendered(false);
      lastChartRef.current = chart;

      // Gerar ID único para o diagrama
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Renderizar o diagrama
      const { svg } = await mermaid.render(id, chart);
      
      setSvgContent(svg);
      setIsRendered(true);
      setIsLoading(false);

    } catch (err) {
      console.error('Erro ao renderizar diagrama Mermaid:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  }, [chart, onError]);

  // Função para download do SVG
  const handleDownload = useCallback(() => {
    if (!svgContent) return;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagrama-mermaid.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svgContent]);

  // Função para impressão
  const handlePrint = useCallback(() => {
    if (!svgContent) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Diagrama Mermaid</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .diagram-container { text-align: center; }
              .diagram-title { font-size: 18px; margin-bottom: 20px; font-weight: bold; }
              svg { max-width: 100%; height: auto; }
              @media print {
                body { padding: 0; }
                .diagram-container { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="diagram-container">
              <div class="diagram-title">Diagrama Mermaid</div>
              ${svgContent}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }, [svgContent]);

  // Função para abrir modal
  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Função para fechar modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Efeito para gerenciar scroll do body e tecla ESC quando modal estiver aberto
  useEffect(() => {
    if (isModalOpen) {
      // Prevenir scroll do body quando modal estiver aberto
      document.body.style.overflow = 'hidden';

      // Função para fechar modal com ESC
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleCloseModal();
        }
      };

      // Adicionar listener para tecla ESC
      document.addEventListener('keydown', handleEscape);

      // Cleanup: remover listener e restaurar scroll
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    } else {
      // Restaurar scroll do body quando modal fechar
      document.body.style.overflow = 'unset';
    }

    // Cleanup: restaurar scroll quando componente for desmontado
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, handleCloseModal]);

  // Componente Modal
  const Modal: React.FC<ModalProps> = ({ isOpen, onClose, svgContent, title }) => {
    if (!isOpen) return null;

    const modalContent = (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f9fafb'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#374151' }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                overflow: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#fafafa'
              }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>

          {/* Footer with Actions */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: '#f9fafb'
            }}
          >
            <button
              onClick={handleDownload}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              📥 Download SVG
            </button>
            
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
              }}
            >
              🖨️ Imprimir
            </button>
            
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6b7280';
              }}
            >
              ❌ Fechar
            </button>
          </div>
                 </div>
       </div>
     );

    // Renderizar o modal usando portal para fora da hierarquia do chat
    return createPortal(modalContent, document.body);
  };

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  if (isLoading) {
    return (
      <div 
        className={`mermaid-diagram ${className}`}
        style={{
          width: '100%',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          color: '#6b7280'
        }}
      >
        <div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 10px'
          }} />
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `
          }} />
          <div>Renderizando diagrama...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`mermaid-diagram ${className}`}
        style={{
          width: '100%',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{
          padding: '20px',
          border: '2px dashed #e5e7eb',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#6b7280',
          background: '#f9fafb'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
          <div style={{ fontWeight: '600', marginBottom: '5px' }}>Erro ao renderizar diagrama</div>
          <div style={{ fontSize: '14px' }}>{error}</div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#9ca3af' }}>
            Código Mermaid: {chart.substring(0, 100)}...
          </div>
        </div>
      </div>
    );
  }

  if (!isRendered || !svgContent) {
    return (
      <div 
        className={`mermaid-diagram ${className}`}
        style={{
          width: '100%',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          color: '#6b7280'
        }}
      >
        <div>Carregando diagrama...</div>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`mermaid-diagram ${className}`}
        style={{
          width: '100%',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={handleOpenModal}
      >
        {/* Conteúdo SVG */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
        
        {/* Overlay indicador de clique */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(59, 130, 246, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          🔍 Clique para ampliar
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        svgContent={svgContent}
        title="Diagrama Mermaid - Visualização Ampliada"
      />
    </>
  );
};

export default MermaidDiagram;
