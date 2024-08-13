import React, { FC, useState } from 'react';

import classNames from 'classnames';
import { t } from 'i18next';
import { Helmet } from 'react-helmet-async';

import { Paragraph, Tabs, TabSize, TabType } from '@sovryn/ui';

import { translations } from '../../../locales/i18n';
import {
  ChartData,
  DetailBoxChart,
  DetailBoxMetaData,
} from './components/DetailBoxChart/DetailBoxChart';
import { EModeDetails } from './components/EModeDetails/EModeDetails';
import { WalletOverview } from './components/WalletOverview/WalletOverview';

const pageTranslations = translations.aaveReserveOverviewPage;

enum OverviewTab {
  RESERVE = 0,
  WALLET,
}

const AaveReserveOverviewPage: FC = () => {
  const [activeOverviewTab, setActiveOverviewTab] = useState<OverviewTab>(
    OverviewTab.RESERVE,
  );

  const [supplyDetailBox] = useState<{
    data: ChartData;
    meta: DetailBoxMetaData;
  }>({
    meta: {
      totalAmount: '1.63B',
      totalAmountOf: '1.63B',
      APY: '5.94%',
      collateralUsage: {
        maxLTV: '80.50%',
        liquidationThreshold: '83.00%',
        liquidationPenalty: '5.00%',
      },
    },
    data: {
      data1: [3, 2, 6, 5.5, 4, 1.5],
      label1: t(pageTranslations.reserveStatusTab.supply.label1),
      borderColor1: 'rgba(255, 255, 255, 1)',
      data2: [],
      label2: '',
      borderColor2: 'rgba(255, 255, 255, 1)',
      xLabels: ['Jun 16', 'Jun 23', 'Jun 30', 'Jul 7'],
    },
  });

  const [borrowDetailBox] = useState<{
    data: ChartData;
    meta: DetailBoxMetaData;
  }>({
    meta: {
      totalAmount: '1.63B',
      totalAmountOf: '1.63B',
      APR: '5.94%',
      borrowCap: '1.40M',
      collectorInfo: {
        reserveFactor: '15.00%',
      },
    },
    data: {
      data1: [2.2, 2.3, 4.5, 3.8],
      label1: t(pageTranslations.reserveStatusTab.borrow.label1),
      borderColor1: 'rgba(255, 255, 255, 1)',
      data2: [],
      label2: '',
      borderColor2: 'rgba(255, 255, 255, 1)',
      xLabels: ['1', '2', '3', '4', '5', '6', '7'],
    },
  });
  const [interestDetailBox] = useState<{
    data: ChartData;
    meta: DetailBoxMetaData;
  }>({
    meta: {
      utilizationRate: '78.64%',
      collectorInfo: {
        reserveFactor: '15.00%',
      },
    },
    data: {
      data1: [1, 10, 12, 15, 20, 50, 99, 100],
      label1: t(pageTranslations.reserveStatusTab.interest.label1),
      borderColor1: 'rgba(255, 255, 255, 1)',
      data2: [78.64, 92],
      label2: t(pageTranslations.reserveStatusTab.interest.label2),
      borderColor2: 'rgba(255, 255, 255, 1)',
      xLabels: ['1', '2', '3', '4', '5', '6', '7'],
    },
  });
  return (
    <div className="w-full pb-6 2xl:px-12">
      <Helmet>
        <title>{t(pageTranslations.meta.title)}</title>
      </Helmet>

      {/* TODO: <TopPanel /> */}

      <div className="pt-6 mt-6 space-y-6 lg:pt-0 lg:mt-0 lg:space-y-0 w-full">
        <Tabs
          className="w-full bg-gray-80 rounded p-1 border border-gray-60 lg:hidden"
          index={activeOverviewTab}
          items={[
            {
              activeClassName: 'text-primary-20',
              dataAttribute: 'reserve-status',
              label: t(pageTranslations.reserveStatusTab.title),
            },
            {
              activeClassName: 'text-primary-20',
              dataAttribute: 'your-wallet',
              label: t(pageTranslations.yourWalletTab.title),
            },
          ]}
          onChange={e => setActiveOverviewTab(e)}
          size={TabSize.normal}
          type={TabType.secondary}
        />

        <div className="grid w-full">
          <Paragraph className="text-base">
            {t(pageTranslations.reserveStatusTab.title)}
          </Paragraph>
        </div>
        {/* reserve graphics columns */}
        <div className="grid grid-cols-1 lg:gap-5 lg:grid-cols-[auto_465px]">
          <div
            className={classNames(
              { hidden: activeOverviewTab !== OverviewTab.RESERVE },
              'lg:block space-y-4 w-full',
            )}
          >
            <DetailBoxChart
              title={t(pageTranslations.reserveStatusTab.supply.title)}
              mockData={supplyDetailBox.data}
              meta={supplyDetailBox.meta}
              yLabel1="label1"
            />
            <DetailBoxChart
              title={t(pageTranslations.reserveStatusTab.borrow.title)}
              mockData={borrowDetailBox.data}
              meta={borrowDetailBox.meta}
              yLabel1="label1"
            />
            <EModeDetails />
            <DetailBoxChart
              title={t(pageTranslations.reserveStatusTab.interest.title)}
              mockData={interestDetailBox.data}
              meta={interestDetailBox.meta}
              yLabel1="label1"
            />
          </div>

          {/* wallet column */}
          <div
            className={classNames(
              { hidden: activeOverviewTab !== OverviewTab.WALLET },
              'lg:block space-y-4',
            )}
          >
            <WalletOverview asset="ETH" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AaveReserveOverviewPage;
