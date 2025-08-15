import React, { useEffect, useRef } from 'react';

interface FlowchartNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  x: number;
  y: number;
}

interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}

interface VisualFlowchartProps {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  title?: string;
  height?: number;
  width?: number;
}

const VisualFlowchart: React.FC<VisualFlowchartProps> = ({
  nodes,
  edges,
  title,
  height = 500,
  width = 800
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    canvas.width = width;
    canvas.height = height;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // Configurar estilo
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Desenhar nós
    nodes.forEach(node => {
      const nodeWidth = 120;
      const nodeHeight = 60;

      // Posição do nó
      const x = node.x;
      const y = node.y;

      // Cores baseadas no tipo
      let fillColor = '#3b82f6';
      let strokeColor = '#1d4ed8';

      switch (node.type) {
        case 'start':
        case 'end':
          fillColor = '#10b981';
          strokeColor = '#059669';
          break;
        case 'decision':
          fillColor = '#f59e0b';
          strokeColor = '#d97706';
          break;
        case 'process':
        default:
          fillColor = '#3b82f6';
          strokeColor = '#1d4ed8';
          break;
      }

      // Desenhar forma baseada no tipo
      if (node.type === 'decision') {
        // Losango para decisão
        ctx.beginPath();
        ctx.moveTo(x, y - nodeHeight / 2);
        ctx.lineTo(x + nodeWidth / 2, y);
        ctx.lineTo(x, y + nodeHeight / 2);
        ctx.lineTo(x - nodeWidth / 2, y);
        ctx.closePath();
      } else if (node.type === 'start' || node.type === 'end') {
        // Elipse para início/fim
        ctx.beginPath();
        ctx.ellipse(x, y, nodeWidth / 2, nodeHeight / 2, 0, 0, 2 * Math.PI);
      } else {
        // Retângulo para processo
        ctx.beginPath();
        ctx.roundRect(x - nodeWidth / 2, y - nodeHeight / 2, nodeWidth, nodeHeight, 8);
      }

      // Preencher e contornar
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto
      ctx.fillStyle = '#ffffff';
      ctx.fillText(node.label, x, y);
    });

    // Desenhar arestas
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);

      if (!fromNode || !toNode) return;

      // Calcular pontos de conexão
      const fromX = fromNode.x;
      const fromY = fromNode.y;
      const toX = toNode.x;
      const toY = toNode.y;

      // Desenhar linha
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Desenhar seta
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const arrowLength = 10;
      const arrowAngle = Math.PI / 6;

      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - arrowLength * Math.cos(angle - arrowAngle),
        toY - arrowLength * Math.sin(angle - arrowAngle)
      );
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - arrowLength * Math.cos(angle + arrowAngle),
        toY - arrowLength * Math.sin(angle + arrowAngle)
      );
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label da aresta (se houver)
      if (edge.label) {
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(midX - 30, midY - 10, 60, 20);
        ctx.fillStyle = '#374151';
        ctx.fillText(edge.label, midX, midY);
      }
    });
  }, [nodes, edges, width, height]);

  return (
    <div className="flowchart-container bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      {title && (
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
          {title}
        </h3>
      )}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 dark:border-gray-600 rounded-lg"
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      </div>
    </div>
  );
};

export default VisualFlowchart;
