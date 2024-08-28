import React, { FC, useMemo } from 'react';

import { t } from 'i18next';

import {
  Button,
  ErrorBadge,
  ErrorLevel,
  SimpleTable,
  SimpleTableRow,
} from '@sovryn/ui';
import { Decimal } from '@sovryn/utils';

import { config } from '../../../../../../../../../constants/aave';
import { translations } from '../../../../../../../../../locales/i18n';
import { CollateralRatioHealthBar } from '../../../../../CollateralRatioHealthBar/CollateralRatioHealthBar';

type DisableEModeFormProps = {};

export const DisableEModeForm: FC<DisableEModeFormProps> = () => {
  const currentCategory = {
    name: 'Stable',
    availableAssets: ['USDC', 'USDT', 'DAI'],
  };

  const confirmEnabled = useMemo(() => {
    return true;
  }, []);

  return (
    <div className="space-y-6">
      <ErrorBadge
        level={ErrorLevel.Critical}
        message={t(translations.aavePage.eMode.liquidationRiskWarning)}
        dataAttribute="liquidation-risk-warning"
      />

      <CollateralRatioHealthBar
        ratio={Decimal.from(1.5)}
        minimum={config.MinCollateralRatio}
      />

      <SimpleTable>
        <SimpleTableRow
          label={t(translations.aavePage.eMode.eModeCategory)}
          value={''}
        />
        <SimpleTableRow
          label={t(translations.aavePage.eMode.availableAssets)}
          value={currentCategory?.availableAssets.join(', ')}
        />
        <SimpleTableRow
          label={t(translations.aavePage.eMode.maxLoanToValue)}
          value={''}
        />
      </SimpleTable>

      <Button
        className="w-full"
        disabled={!confirmEnabled}
        text={t(translations.aavePage.eMode.disableEMode)}
        onClick={async () => {}}
      />
    </div>
  );
};
