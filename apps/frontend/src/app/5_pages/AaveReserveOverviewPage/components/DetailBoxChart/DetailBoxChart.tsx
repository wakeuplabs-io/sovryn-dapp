import React, { FC } from 'react';

import { FormGroup, Paragraph } from '@sovryn/ui';

import { Chart } from '../../../../2_molecules/Chart/Chart';
import {
  GRADIENT1_COLOR1,
  GRADIENT1_COLOR2,
  GRADIENT2_COLOR1,
  GRADIENT2_COLOR2,
} from '../../../MarketMakingPage/components/PoolDetails/components/PoolChart/PoolChart.constants';

export interface ChartData {
  data1: number[];
  label1: string;
  borderColor1: string;
  data2: number[];
  label2: string;
  borderColor2: string;
  xLabels: string[];
}

export interface DetailBoxMetaData {
  totalAmount?: string;
  totalAmountOf?: string;
  APY?: string;
  APR?: string;
  borrowCap?: string;
  collateralUsage?: {
    maxLTV: string;
    liquidationThreshold: string;
    liquidationPenalty: string;
  };
  collectorInfo?: {
    reserveFactor: string;
  };
  utilizationRate?: string;
}

type DetailBoxChartProps = {
  title: string;
  meta: DetailBoxMetaData;
  yLabel1: string;
  mockData: ChartData;
};

export const DetailBoxChart: FC<DetailBoxChartProps> = ({
  title,
  meta,
  yLabel1,
  mockData,
}) => {
  return (
    <div className="detail-box-chart bg-gray-90 p-6 rounded space-y-6 lg:bg-gray-90 lg:p-6 border border-gray-60">
      <div className="detail-box-chart__header">
        <div className="detail-box-chart__header__title">
          <Paragraph className="text-base">{title}</Paragraph>
        </div>
        <div className="detail-box-chart__header__value">
          <FormGroup label="Total supplied" />
        </div>
      </div>
      <div className="detail-box-chart__chart">
        <div className="detail-box-chart__chart__container">
          <Chart
            mockData={mockData}
            tickStep={0}
            yLabel1={yLabel1}
            yLabel2=""
            gradient1Colors={[GRADIENT1_COLOR1, GRADIENT1_COLOR2]}
            gradient2Colors={[GRADIENT2_COLOR1, GRADIENT2_COLOR2]}
          />
        </div>
      </div>
    </div>
  );
};
