import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

interface VisualChartProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
  data: ChartData;
  title?: string;
  height?: number;
  width?: number;
}

const VisualChart: React.FC<VisualChartProps> = ({
  type,
  data,
  title,
  height = 400,
  width = 600
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#78716c',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        color: '#57534e',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#a8a29e',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: type !== 'pie' && type !== 'doughnut' && type !== 'radar' ? {
      x: {
        grid: {
          color: '#e7e5e4',
          drawBorder: false
        },
        ticks: {
          color: '#78716c',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#e7e5e4',
          drawBorder: false
        },
        ticks: {
          color: '#78716c',
          font: {
            size: 11
          }
        }
      }
    } : undefined
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={options} />;
      case 'line':
        return <Line data={data} options={options} />;
      case 'pie':
        return <Pie data={data} options={options} />;
      case 'doughnut':
        return <Doughnut data={data} options={options} />;
      case 'radar':
        return <Radar data={data} options={options} />;
      default:
        return <Bar data={data} options={options} />;
    }
  };

  return (
    <div 
      className="chart-container bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
      style={{ height: `${height}px`, width: `${width}px` }}
    >
      {renderChart()}
    </div>
  );
};

export default VisualChart;
