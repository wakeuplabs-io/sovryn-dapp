import React, { FC, useEffect, useRef } from 'react';

import ChartLibrary from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

import { CUSTOM_CANVAS_BACKGROUND_COLOR } from './Chart.constants';
import { MockData } from './Chart.types';

type ChartProps = {
  mockData: MockData<{ x: number; y: number }>;
  yLabel1: string;
};

export const Chart: FC<ChartProps> = ({ mockData, yLabel1 }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartLibrary | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    if (!canvas.current) {
      return;
    }

    chartRef.current = new ChartLibrary(canvas.current, {
      type: 'line',
      data: {
        labels: ['0%', '50%', '100%'],
        datasets: [
          {
            type: 'line', // The type of chart
            label: mockData.label1,
            data: mockData.data1,
            backgroundColor: mockData.lineColor, // Color del fondo
            borderColor: mockData.lineColor, // Color de la línea
            borderWidth: 2,
            fill: false,
            pointRadius: 0, // Esto evita que se dibujen los puntos en el gráfico
          },
          {
            label: 'Current 78.64%',
            type: 'scatter', // Annotation points
            data: mockData.data2,
            backgroundColor: 'cyan',
            borderColor: 'cyan',
            showLine: true, // Enable line drawing
            borderDash: [1, 2], // Set the line to be dashed
            pointRadius: 0,
          },
          {
            label: 'Optimal 92%',
            type: 'scatter', // Annotation points
            data: mockData.data3,
            backgroundColor: '#4caf51',
            borderColor: '#4caf51',
            showLine: true, // Enable line drawing
            borderDash: [1, 2], // Set the line to be dashed
            pointRadius: 0,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: 'linear', // Use 'time' as the axis type
            min: 0,
            max: 100,
            ticks: {
              color: '#b6bac1', // Text color for Y-axis ticks
              callback: function (value) {
                return value + '%'; // Añade el símbolo de porcentaje a los valores
              },
              maxTicksLimit: 5, // Limit the number of ticks on the Y-axis
              align: 'center',
            },
          },
          y: {
            min: 0,
            max: 100,
            ticks: {
              color: '#b6bac1', // Text color for Y-axis ticks
              callback: function (value) {
                return value + '%'; // Añade el símbolo de porcentaje a los valores
              },
              maxTicksLimit: 5, // Limit the number of ticks on the Y-axis
              align: 'center',
            },
            grid: {
              color: 'rgb(72 77 89)',
              lineWidth: 1, // Set the thickness of the grid lines
              drawOnChartArea: true, // Ensure the grid lines are drawn on the chart area
              tickBorderDash: [5, 5], // Apply dash pattern to the grid lines
              tickBorderDashOffset: 0, // Offset for the dash pattern (optional)
            },
          },
        },
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            display: true, // Muestra la leyenda
            labels: {
              color: '#f5f5f5',
              font: {
                size: 9,
              },
              boxWidth: 9, // Reduce el tamaño del rectángulo
            },
            align: 'start',
          },
        },
      },
      plugins: [CUSTOM_CANVAS_BACKGROUND_COLOR],
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [mockData]);

  return (
    <div
      onClick={e => {
        e.stopPropagation();
      }}
      className="lg:h-[37rem] h-64 rounded"
    >
      <canvas ref={canvas}></canvas>
    </div>
  );
};
