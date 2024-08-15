import React, { FC, useEffect, useRef } from 'react';

import ChartLibrary from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

import { CUSTOM_CANVAS_BACKGROUND_COLOR } from './Chart.constants';
import { MockData } from './Chart.types';

type ChartProps = {
  mockData: MockData<any>;
  yLabel1: string;
};

export const Chart: FC<ChartProps> = ({ mockData }) => {
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
        datasets: [
          {
            type: 'line', // The type of chart
            label: mockData.label1,
            data: mockData.data1,
            backgroundColor: 'rgba(245, 140, 49, 1)', // Color del fondo
            borderColor: mockData.lineColor, // Color de la línea
            borderWidth: 2,
            fill: false,
            pointRadius: 0, // Esto evita que se dibujen los puntos en el gráfico
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: 'time', // Use 'time' as the axis type
            time: {
              unit: 'day', // Customize the time unit (e.g., 'day', 'month', 'year')
              tooltipFormat: 'MMMM dd yyyy', // Tooltip formatting
              displayFormats: {
                day: 'MMM dd', // Formato de la fecha en el eje X
              },
            },
            title: {
              display: false,
              text: 'Date', // Label for the X-axis
              color: '#ffffff', // Text color for X-axis label
            },
            ticks: {
              color: '#b6bac1', // Text color for X-axis ticks
              maxTicksLimit: 4, // Limit the number of ticks on the X-axis
              labelOffset: 50,
              maxRotation: 0,
            },
          },
          y: {
            beginAtZero: false,
            suggestedMin: 1, // Valor mínimo sugerido (puedes ajustar este valor)
            ticks: {
              color: '#b6bac1', // Text color for Y-axis ticks
              callback: function (value) {
                return value + '%'; // Añade el símbolo de porcentaje a los valores
              },
              maxTicksLimit: 4, // Limit the number of ticks on the Y-axis
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
        plugins: {
          legend: {
            display: true, // Muestra la leyenda
            labels: {
              color: '#f5f5f5',
              font: {
                size: 9,
              },
              boxWidth: 9,
            },
            align: 'start',
          },
        },
        layout: {
          padding: 20,
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
