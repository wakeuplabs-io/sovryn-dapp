import React, { FC } from 'react';

import { t } from 'i18next';

import { HelperButton } from '@sovryn/ui';

import { AmountRenderer } from '../../../../../../2_molecules/AmountRenderer/AmountRenderer';
import { translations } from '../../../../../../../locales/i18n';
import { BorrowPoolDetails } from '../../BorrowAssetsList.types';
import { BorrowAssetAction } from '../BorrowAssetAction/BorrowAssetAction';

const pageTranslations = translations.aavePage;

type BorrowAssetDetailsProps = {
  pool: BorrowPoolDetails;
};

export const BorrowAssetDetails: FC<BorrowAssetDetailsProps> = ({ pool }) => {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {/* APR */}
        <div className="grid grid-cols-2">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-30">
              {t(pageTranslations.common.apr)}
            </span>
            <HelperButton
              content={t(pageTranslations.common.aprInfo)}
              className="text-gray-30"
            />
          </div>

          <div className="text-right text-xs text-gray-30 font-medium">
            <AmountRenderer value={pool.apr} suffix={'%'} />
          </div>
        </div>

        {/* Available */}
        <div className="grid grid-cols-2">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-30">
              {t(pageTranslations.borrowAssetsList.available)}
            </span>
          </div>

          <div className="text-right text-xs text-gray-30 font-medium">
            <AmountRenderer value={pool.available} suffix={pool.asset} />
          </div>
        </div>
      </div>

      <BorrowAssetAction pool={pool} />
    </div>
  );
};