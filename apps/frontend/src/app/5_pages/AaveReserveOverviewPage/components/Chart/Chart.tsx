import React, { FC, useEffect, useMemo, useRef } from 'react';

import ChartLibrary from 'chart.js/auto';

import { MockData } from './Chart.types';
import { getChartData, getChartOptions } from './Chart.utils';

type ChartProps = {
  mockData: MockData;
  tickStep: number;
  yLabel1: string;
  yLabel2?: string;
  gradient1Colors?: string[];
};

export const Chart: FC<ChartProps> = ({
  mockData,
  tickStep,
  yLabel1,
  yLabel2,
  gradient1Colors = [],
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartLibrary | null>(null);

  const chartOptions = useMemo(
    () => getChartOptions(tickStep, mockData, yLabel1, yLabel2),
    [mockData, tickStep, yLabel1, yLabel2],
  );

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    if (!canvas.current) {
      return;
    }

    const gradient1 = chartRef.current?.ctx?.createLinearGradient(0, 0, 0, 400);
    gradient1?.addColorStop(0, gradient1Colors[0]);
    gradient1?.addColorStop(1, gradient1Colors[1]);

    chartRef.current = new ChartLibrary(canvas.current, {
      type: 'line',
      data: getChartData(mockData, gradient1),
      options: chartOptions,
      plugins: [],
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartOptions, gradient1Colors, mockData]);

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
