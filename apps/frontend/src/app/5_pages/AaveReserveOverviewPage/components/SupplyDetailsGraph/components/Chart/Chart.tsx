import React, { FC, useCallback, useEffect, useRef } from 'react';

import ChartLibrary from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

import { ReserveRateTimeRange } from '../../../../../../../hooks/aave/useAaveReservesHistory';
import { TimeRangeButtons } from '../../../TimeRangeButtons/TimeRangeButtons';
import {
  CUSTOM_CANVAS_BACKGROUND_COLOR,
  GRID_COLOR,
  TICK_COLOR,
} from './Chart.constants';
import { InputData } from './Chart.types';
import { htmlLegendPlugin } from './Chart.utils';

type ChartProps = {
  input: InputData<{ x: number; y: number }>;
  onTimeRangeChange: (range: ReserveRateTimeRange) => void;
};

export const Chart: FC<ChartProps> = ({ input, onTimeRangeChange }) => {
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
            type: 'line',
            label: input.label,
            data: input.data,
            backgroundColor: 'rgba(245, 140, 49, 1)',
            borderColor: input.lineColor,
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              tooltipFormat: 'MMMM dd yyyy',
              displayFormats: {
                day: 'MMM dd',
              },
            },
            title: {
              display: false,
              text: 'Date',
              color: '#ffffff',
            },
            ticks: {
              color: TICK_COLOR,
              maxTicksLimit: 4,
              labelOffset: 50,
              maxRotation: 0,
            },
          },
          y: {
            beginAtZero: false,
            suggestedMin: 1,
            ticks: {
              color: TICK_COLOR,
              callback: function (value) {
                return value + '%';
              },
              maxTicksLimit: 4,
              align: 'center',
            },
            grid: {
              color: GRID_COLOR,
              tickBorderDash: [5, 5],
              drawTicks: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        layout: {
          padding: 20,
        },
      },
      plugins: [CUSTOM_CANVAS_BACKGROUND_COLOR, htmlLegendPlugin],
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [input]);

  const stopPropagation = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
    },
    [],
  );

  return (
    <div onClick={stopPropagation} className="lg:p-6 lg:bg-gray-80">
      <div className="flex items-center justify-between">
        <span id="legend-container-supply-chart" className="text-tiny"></span>
        <TimeRangeButtons onChange={onTimeRangeChange} />
      </div>
      <canvas ref={canvas}></canvas>
    </div>
  );
};
