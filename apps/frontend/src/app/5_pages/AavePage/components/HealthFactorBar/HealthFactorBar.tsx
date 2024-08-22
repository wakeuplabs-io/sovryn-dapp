import React, { FC } from 'react';

import { t } from 'i18next';

import { HealthBar } from '@sovryn/ui';
import { Decimal } from '@sovryn/utils';

import { AmountRenderer } from '../../../../2_molecules/AmountRenderer/AmountRenderer';
import { translations } from '../../../../../locales/i18n';

type HealthFactorBarProps = {
  ratio: Decimal;
};

export const HealthFactorBar: FC<HealthFactorBarProps> = ({ ratio }) => {
  return (
    <div className="py-3">
      <div className="flex flex-row justify-between items-center mb-3">
        <div className="flex flex-row justify-start items-center gap-2">
          <span>{t(translations.aavePage.common.healthFactor)}</span>
        </div>

        <AmountRenderer
          value={ratio.toString()}
          suffix="%"
          precision={2}
          infiniteFrom={10000}
        />
      </div>

      <HealthBar
        start={0}
        end={4 * 25} // maximum health rate for graph 4. So multiply all by 25 to reach 100
        middleStart={1 * 25} // health factor < 1 => liquidation
        middleEnd={1.2 * 25}
        value={(ratio.toNumber() ?? 0) * 25}
      />
    </div>
  );
};
