import React, { FC, useMemo } from 'react';

import { t } from 'i18next';

import { HealthBar } from '@sovryn/ui';
import { Decimal } from '@sovryn/utils';

import { AmountRenderer } from '../../../../2_molecules/AmountRenderer/AmountRenderer';
import { translations } from '../../../../../locales/i18n';
import { getCollateralRatioThresholds } from './CollateralRatioHealthBar.utils';

type CollateralRatioHealthBarProps = {
  ratio: Decimal;
  thresholds?: {
    START: number;
    MIDDLE_START: number;
    MIDDLE_END: number;
    END: number;
  };
};

export const CollateralRatioHealthBar: FC<CollateralRatioHealthBarProps> = ({
  ratio,
  thresholds,
}) => {
  const collateralRatioThresholds = useMemo(
    () => thresholds ?? getCollateralRatioThresholds(),
    [thresholds],
  );

  return (
    <div className="py-3">
      <div className="flex flex-row justify-between items-center mb-3">
        <div className="flex flex-row justify-start items-center gap-2">
          <span>{t(translations.aavePage.common.collateralRatio)}</span>
        </div>
        <div className="">
          <AmountRenderer value={ratio.toString()} suffix="%" />
        </div>
      </div>

      <HealthBar
        start={collateralRatioThresholds.START}
        middleStart={collateralRatioThresholds.MIDDLE_START}
        middleEnd={collateralRatioThresholds.MIDDLE_END}
        end={collateralRatioThresholds.END}
        value={ratio.toNumber()}
      />
    </div>
  );
};