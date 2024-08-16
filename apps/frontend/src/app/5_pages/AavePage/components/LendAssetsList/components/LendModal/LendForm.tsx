import React, { FC, useMemo, useState } from 'react';

import { t } from 'i18next';

import {
  Button,
  ErrorBadge,
  ErrorLevel,
  SimpleTable,
  SimpleTableRow,
} from '@sovryn/ui';
import { Decimal } from '@sovryn/utils';

import { AmountRenderer } from '../../../../../../2_molecules/AmountRenderer/AmountRenderer';
import { AssetAmountInput } from '../../../../../../2_molecules/AssetAmountInput/AssetAmountInput';
import { AssetRenderer } from '../../../../../../2_molecules/AssetRenderer/AssetRenderer';
import { useDecimalAmountInput } from '../../../../../../../hooks/useDecimalAmountInput';
import { translations } from '../../../../../../../locales/i18n';
import { useAaveReservesData } from '../../../../../../../hooks/useAaveReservesData';
import { useAaveDeposit } from '../../../../../../../hooks/useAaveDeposit';

const pageTranslations = translations.aavePage;

type LendFormProps = {
  asset?: string;
  onSuccess: () => unknown;
};

export const LendForm: FC<LendFormProps> = ({ asset, onSuccess }) => {
  const { reserves } = useAaveReservesData();
  const [maximumLendAmount] = useState<Decimal>(Decimal.from(10)); // TODO: this is mocked data. Replace with proper hook
  const [lendAsset, setLendAsset] = useState<string>(asset ?? 'USDC');
  const [lendAmount, setLendAmount, lendSize] = useDecimalAmountInput('');
  const { handleDeposit } = useAaveDeposit(
    () => null,
    () => null,
  );

  const reserve = useMemo(() => {
    return reserves.find(r => r.symbol === lendAsset) ?? reserves[0];
  }, [reserves, lendAsset]);

  const lendAssetsOptions = useMemo(
    () =>
      reserves.map(r => ({
        value: r.symbol,
        label: (
          <AssetRenderer
            showAssetLogo
            asset={r.symbol}
            assetClassName="font-medium"
          />
        ),
      })),
    [reserves],
  );

  const isValidLendAmount = useMemo(
    () => (lendSize.gt(0) ? lendSize.lte(maximumLendAmount) : true),
    [lendSize, maximumLendAmount],
  );

  const submitButtonDisabled = useMemo(
    () => !isValidLendAmount || lendSize.lte(0),
    [isValidLendAmount, lendSize],
  );

  return (
    <form className="flex flex-col gap-6">
      <div>
        <AssetAmountInput
          label={t(translations.aavePage.common.lend)}
          maxAmount={maximumLendAmount}
          amountLabel={t(translations.common.amount)}
          amountValue={lendAmount}
          onAmountChange={setLendAmount}
          invalid={!isValidLendAmount}
          assetValue={lendAsset}
          onAssetChange={setLendAsset}
          assetOptions={lendAssetsOptions}
        />

        {!isValidLendAmount && (
          <ErrorBadge
            level={ErrorLevel.Critical}
            message={t(pageTranslations.lendModal.invalidAmountError)}
            dataAttribute="lend-amount-error"
          />
        )}
      </div>

      <SimpleTable>
        <SimpleTableRow
          label={t(translations.aavePage.lendModal.lendApy)}
          value={
            <AmountRenderer
              value={Decimal.from(reserve?.supplyAPY ?? 0).mul(100)}
              suffix={'%'}
              precision={2}
            />
          }
        />
        <SimpleTableRow
          label={t(translations.aavePage.lendModal.collateralization)}
          value={t(
            translations.aavePage.lendModal[
              reserve?.usageAsCollateralEnabled ? 'enabled' : 'disabled'
            ],
          )}
        />
      </SimpleTable>

      <Button
        disabled={submitButtonDisabled}
        onClick={() => handleDeposit(lendSize, reserve.underlyingAsset)}
        text={t(translations.aavePage.lendModal.deposit)}
      />
    </form>
  );
};
