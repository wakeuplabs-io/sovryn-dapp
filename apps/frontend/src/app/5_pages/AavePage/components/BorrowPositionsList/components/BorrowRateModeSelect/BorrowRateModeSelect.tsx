import React, { FC, useCallback, useMemo } from 'react';

import { t } from 'i18next';

import { getAssetData } from '@sovryn/contracts';
import { Select } from '@sovryn/ui';

import { BOB_CHAIN_ID } from '../../../../../../../config/chains';

import { useAaveBorrow } from '../../../../../../../hooks/aave/useAaveBorrow';
import { translations } from '../../../../../../../locales/i18n';
import { BorrowRateMode } from '../../../../../../../types/aave';
import { BorrowPosition } from '../../BorrowPositionsList.types';

type BorrowRateModeSelectProps = {
  position: BorrowPosition;
};

export const BorrowRateModeSelect: FC<BorrowRateModeSelectProps> = ({
  position,
}) => {
  const { handleSwapBorrowRateMode } = useAaveBorrow();
  const [rateMode, setRateMode] = React.useState<BorrowRateMode>(
    position.borrowRateMode,
  );

  const options = useMemo(
    () => [
      {
        label: t(translations.aavePage.borrowPositionsList.selectStableApy, {
          apy: position.stableApy.toString(2),
        }),
        value: String(BorrowRateMode.STABLE),
      },
      {
        label: t(translations.aavePage.borrowPositionsList.selectVariableApy, {
          apy: position.variableApy.toString(2),
        }),
        value: String(BorrowRateMode.VARIABLE),
      },
    ],
    [position],
  );

  const onRateModeChange = useCallback(
    async (rateMode: string) => {
      handleSwapBorrowRateMode(
        await getAssetData(position.asset, BOB_CHAIN_ID),
        Number(rateMode),
        { onComplete: () => setRateMode(Number(rateMode)) }, // TODO: recheck
      );
    },
    [handleSwapBorrowRateMode, position],
  );

  return (
    <div>
      <Select
        onChange={onRateModeChange}
        options={options}
        value={rateMode.toString()}
      />
    </div>
  );
};
