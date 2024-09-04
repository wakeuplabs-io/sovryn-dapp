import React, { FC } from 'react';

import classNames from 'classnames';
import { t } from 'i18next';

import { Heading, Icon, IconNames, Paragraph, ParagraphSize } from '@sovryn/ui';
import { Decimal } from '@sovryn/utils';

import { BOB_CHAIN_ID } from '../../../../../config/chains';

import { WalletIcon } from '../../../../1_atoms/Icons/Icons';
import { AmountRenderer } from '../../../../2_molecules/AmountRenderer/AmountRenderer';
import { AssetRenderer } from '../../../../2_molecules/AssetRenderer/AssetRenderer';
import { StatisticsCard } from '../../../../2_molecules/StatisticsCard/StatisticsCard';
import { translations } from '../../../../../locales/i18n';
import { formatUsdAmount } from './TopPanel.utils';

const pageTranslations = translations.aaveReserveOverviewPage.topPanel;

export type ReserveOverview = {
  symbol: string;
  name: string;
  reserveSize: Decimal;
  availableLiquidity: Decimal;
  utilizationRate: Decimal;
  oraclePrice: Decimal;
};

type TopPanelProps = {
  reserve: ReserveOverview;
  className?: string;
};

export const TopPanel: FC<TopPanelProps> = ({ reserve, className }) => {
  return (
    <div className={classNames('w-full flex flex-col gap-6', className)}>
      <div className="text-center py-6 px-10 space-y-3 lg:hidden">
        <Heading className="text-base leading-5">
          {t(pageTranslations.title)}
        </Heading>
        <Paragraph size={ParagraphSize.base}>
          {t(pageTranslations.subtitle)}
        </Paragraph>
      </div>

      <div className="gap-6 lg:gap-9 flex-shrink-0 grid grid-cols-2 lg:flex">
        <div className="col-span-2 flex items-center lg:items-start gap-3">
          <div className="flex items-center gap-1">
            <AssetRenderer
              asset={reserve.symbol}
              chainId={BOB_CHAIN_ID}
              showAssetLogo
              assetClassName="text-base"
              logoClassName="[&>svg]:h-8 [&>svg]:w-8 [&>svg]:mr-[10px]"
            />
            <span className="text-gray-40 text-base font-medium">
              {reserve.name}
            </span>
          </div>

          <div className="flex items-center gap-2 h-8">
            <a href="#block-explorer">
              <Icon
                icon={IconNames.NEW_TAB}
                className="text-gray-30"
                size={16}
              />
            </a>
            <a href="#block-explorer">
              <Icon icon={WalletIcon} className="text-gray-30" size={16} />
            </a>
          </div>
        </div>

        <StatisticsCard
          label={t(pageTranslations.reserveSize)}
          value={
            <AmountRenderer
              prefix="$"
              className="text-2xl"
              {...formatUsdAmount(reserve.reserveSize)}
            />
          }
        />
        <StatisticsCard
          label={t(pageTranslations.availableLiquidity)}
          value={
            <AmountRenderer
              prefix="$"
              className="text-2xl"
              {...formatUsdAmount(reserve.availableLiquidity)}
            />
          }
        />
        <StatisticsCard
          label={t(pageTranslations.utilizationRate)}
          value={
            <AmountRenderer
              suffix="%"
              value={reserve.utilizationRate}
              precision={2}
              className="text-2xl"
            />
          }
        />
        <StatisticsCard
          label={t(pageTranslations.oraclePrice)}
          link="#oracle-price"
          value={
            <AmountRenderer
              prefix="$"
              value={reserve.oraclePrice}
              precision={2}
              className="text-2xl"
            />
          }
        />
      </div>
    </div>
  );
};
