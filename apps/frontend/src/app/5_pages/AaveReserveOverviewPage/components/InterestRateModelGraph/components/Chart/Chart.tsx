import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';

import ChartLibrary from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

import { IRatesDataResult } from '../../../../../../../hooks/aave/useAaveRates';
import { CUSTOM_CANVAS_BACKGROUND_COLOR } from './Chart.constants';
import { MockData } from './Chart.types';
import { htmlLegendPlugin } from './Chart.utils';

type ChartProps = {
  mockData: MockData<{ x: number; y: number }>;
  rates: IRatesDataResult;
  yLabel1: string;
};

const calcInterestRateModel = (
  u: number,
  base: number,
  optimal: number,
  slope1: number,
  slope2: number,
) => {
  if (u === 0) return 0;

  if (u <= optimal) return base + (u / optimal) * slope1;

  return base + slope1 + ((u - optimal) / (1 - optimal)) * slope2;
};

const calcVariableInterestRateModel = (u: number, rates: IRatesDataResult) => {
  const base = parseFloat(rates.baseVariableBorrowRate);
  const optimal = parseFloat(rates.optimalUsageRatio);
  const slope1 = parseFloat(rates.variableRateSlope1);
  const slope2 = parseFloat(rates.variableRateSlope2);

  return calcInterestRateModel(u, base, optimal, slope1, slope2);
};
const CHART_PERCENTAGES = [0, 0.05, 0.25, 0.5, 0.75, 1];

export const Chart: FC<ChartProps> = ({ mockData, rates }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartLibrary | null>(null);

  const variableValues = useMemo(
    () =>
      CHART_PERCENTAGES.map(x => calcVariableInterestRateModel(x, rates) * 100),
    [rates],
  );

  console.log('variableValues', variableValues);

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
            type: 'line',
            label: mockData.label1,
            data: variableValues,
            backgroundColor: mockData.lineColor,
            borderColor: mockData.lineColor,
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
          },
          /*           {
            label: 'Current 78.64%',
            type: 'scatter',
            data: mockData.data2,
            borderColor: theme.colors.positive,
            backgroundColor: theme.colors.positive,
            showLine: true,
            borderDash: [1, 2],
            pointRadius: 0,
          },
          {
            label: 'Optimal 92%',
            type: 'scatter',
            data: mockData.data3,
            borderColor: theme.colors.success,
            backgroundColor: theme.colors.success,
            showLine: true,
            borderDash: [1, 2],
            pointRadius: 0,
          }, */
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
      plugins: [CUSTOM_CANVAS_BACKGROUND_COLOR, htmlLegendPlugin],
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [mockData, variableValues]);

  const stopPropagation = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
    },
    [],
  );

  return (
    <div onClick={stopPropagation} className="lg:p-6 lg:bg-gray-80">
      <span id="legend-container-interest-chart" className="text-tiny"></span>
      <canvas ref={canvas}></canvas>
    </div>
  );
};
