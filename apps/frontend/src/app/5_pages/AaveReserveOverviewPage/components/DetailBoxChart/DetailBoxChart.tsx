import React, { FC } from 'react';

import { t } from 'i18next';

import { FormGroup, Paragraph } from '@sovryn/ui';

import { translations } from '../../../../../locales/i18n';
import { Chart } from '../Chart/Chart';

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
  yLabel2?: string;
  mockData: ChartData;
};

const pageTranslations = translations.aaveReserveOverviewPage;

export const DetailBoxChart: FC<DetailBoxChartProps> = ({
  title,
  meta,
  yLabel1,
  yLabel2,
  mockData,
}) => {
  return (
    <div className="detail-box-chart bg-gray-90 p-6 rounded space-y-6 lg:bg-gray-90 lg:p-6 border border-gray-60">
      <div className="detail-box-chart__header">
        <div className="detail-box-chart__header__title">
          <Paragraph className="text-base">{title}</Paragraph>
        </div>
        <div className="detail-box-chart__header__value">
          {meta.totalAmount && (
            <>
              <FormGroup
                label={t(pageTranslations.reserveStatusTab.supply.title)}
              />
              <Paragraph className="text-base">
                {meta.totalAmount} of {meta.totalAmountOf}{' '}
              </Paragraph>
            </>
          )}
          {meta.APY && (
            <>
              <FormGroup label="APY" />
              <Paragraph className="text-base">{meta.APY}</Paragraph>
            </>
          )}
          {meta.APR && (
            <>
              <FormGroup label="APR" />
              <Paragraph className="text-base">{meta.APR}</Paragraph>
            </>
          )}
          {meta.borrowCap && (
            <>
              <FormGroup label="Borrow Cap" />
              <Paragraph className="text-base">{meta.borrowCap}</Paragraph>
            </>
          )}
          {meta.utilizationRate && (
            <>
              <FormGroup label="Utilization Rate" />
              <Paragraph className="text-base">
                {meta.utilizationRate}
              </Paragraph>
            </>
          )}
        </div>
      </div>
      <div className="detail-box-chart__chart">
        <div className="detail-box-chart__chart__container">
          <Chart
            mockData={mockData}
            tickStep={1}
            yLabel1={yLabel1}
            yLabel2={yLabel2}
          />
        </div>
        {meta.collateralUsage && (
          <>
            <div className="detail-box-chart__chart__collateral-usage">
              <FormGroup label="Collateral Usage" />
              <Paragraph className="text-base">
                <span>Max LTV: {meta.collateralUsage.maxLTV}</span>
                <span>
                  {' '}
                  Liquidation Threshold:{' '}
                  {meta.collateralUsage.liquidationThreshold}
                </span>
                <span>
                  {' '}
                  Liquidation Penalty: {meta.collateralUsage.liquidationPenalty}
                </span>
              </Paragraph>
            </div>
          </>
        )}
        {meta.collectorInfo && (
          <>
            <div className="detail-box-chart__chart__collector-info">
              <FormGroup label="Collector Info" />
              <Paragraph className="text-base">
                <span>Reserve Factor: {meta.collectorInfo.reserveFactor}</span>
              </Paragraph>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
