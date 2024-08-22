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

import { BOB_CHAIN_ID } from '../../../../../../../config/chains';

import { AmountTransition } from '../../../../../../2_molecules/AmountTransition/AmountTransition';
import { AssetAmountInput } from '../../../../../../2_molecules/AssetAmountInput/AssetAmountInput';
import { AssetRenderer } from '../../../../../../2_molecules/AssetRenderer/AssetRenderer';
import { useAaveReservesData } from '../../../../../../../hooks/aave/useAaveReservesData';
import { useAaveUserReservesData } from '../../../../../../../hooks/aave/useAaveUserReservesData';
import { useDecimalAmountInput } from '../../../../../../../hooks/useDecimalAmountInput';
import { translations } from '../../../../../../../locales/i18n';
import { HealthFactorBar } from '../../../HealthFactorBar/HealthFactorBar';

const pageTranslations = translations.aavePage;

type RepayWithWalletBalanceFormProps = {
  asset: string;
  onSuccess: () => unknown;
};

export const RepayWithWalletBalanceForm: FC<
  RepayWithWalletBalanceFormProps
> = ({ asset }) => {
  const reserves = useAaveReservesData();
  const userReservesSummary = useAaveUserReservesData();
  const [repayAsset, setRepayAsset] = useState<string>(asset);
  const [repayAmount, setRepayAmount, repaySize] = useDecimalAmountInput('');

  const repayAssetsOptions = useMemo(
    () =>
      userReservesSummary
        ? userReservesSummary.borrowedAssets.map(ba => ({
            value: ba.asset,
            label: (
              <AssetRenderer
                showAssetLogo
                asset={ba.asset}
                assetClassName="font-medium"
                chainId={BOB_CHAIN_ID}
              />
            ),
          }))
        : [],
    [userReservesSummary],
  );

  const debt = useMemo(() => {
    return userReservesSummary?.borrowedAssets.find(
      a => a.asset === repayAsset,
    );
  }, [userReservesSummary, repayAsset]);

  // TODO: this is a mix between balance and maximum to repay
  const maximumRepayAmount = useMemo(() => {
    return debt ? debt.borrowedUSD : Decimal.from(0);
  }, [debt]);

  const isValidRepayAmount = useMemo(
    () => (repaySize.gt(0) ? repaySize.lte(maximumRepayAmount) : true),
    [repaySize, maximumRepayAmount],
  );

  const reserve = useMemo(() => {
    return reserves.find(r => r.symbol === repayAsset);
  }, [reserves, repayAsset]);

  const repayUsdAmount = useMemo(() => {
    return repaySize.mul(reserve?.priceInUSD ?? 0);
  }, [repaySize, reserve]);

  const newDebtAmount = useMemo(() => {
    const nd = debt?.borrowed ? debt.borrowed.sub(repaySize) : Decimal.from(0);
    return nd.gt(0) ? nd : Decimal.from(0);
  }, [debt, repaySize]);

  const newDebtAmountUSD = useMemo(() => {
    return newDebtAmount.mul(reserve?.priceInUSD ?? 0);
  }, [newDebtAmount, reserve]);

  const newHealthFactor = useMemo(() => {
    if (!userReservesSummary) return Decimal.from(0);
    if (newDebtAmountUSD.eq(0)) return Decimal.from('100000000');

    return userReservesSummary.healthFactor
      .mul(userReservesSummary.borrowBalance)
      .div(newDebtAmountUSD);
  }, [userReservesSummary, newDebtAmountUSD]);

  // TODO: Add validations
  const submitButtonDisabled = useMemo(
    () => !isValidRepayAmount || repaySize.lte(0),
    [isValidRepayAmount, repaySize],
  );

  return (
    <form className="flex flex-col gap-6 relative">
      <div className="space-y-3">
        <AssetAmountInput
          maxAmount={maximumRepayAmount}
          amountLabel={t(translations.common.amount)}
          amountValue={repayAmount}
          onAmountChange={setRepayAmount}
          invalid={!isValidRepayAmount}
          assetValue={repayAsset}
          assetUsdValue={repayUsdAmount}
          onAssetChange={setRepayAsset}
          assetOptions={repayAssetsOptions}
        />

        {!isValidRepayAmount && (
          <ErrorBadge
            level={ErrorLevel.Critical}
            message={t(pageTranslations.repayModal.invalidAmountError)}
            dataAttribute="repay-amount-error"
          />
        )}
      </div>

      <HealthFactorBar ratio={newHealthFactor} />

      <SimpleTable>
        <SimpleTableRow
          label={t(translations.aavePage.repayModal.remainingDebt)}
          value={
            <div className="space-y-1">
              <AmountTransition
                className="justify-end"
                from={{
                  precision: 2,
                  value: debt?.borrowed ?? Decimal.from(0),
                  suffix: repayAsset,
                }}
                to={{ value: newDebtAmount, suffix: repayAsset, precision: 2 }}
              />
              <AmountTransition
                className="justify-end text-gray-40"
                from={{
                  precision: 2,
                  value: debt?.borrowedUSD ?? Decimal.from(0),
                  prefix: '$',
                }}
                to={{
                  precision: 2,
                  value: newDebtAmountUSD,
                  prefix: '$',
                }}
              />
            </div>
          }
        />
        <SimpleTableRow
          label={t(translations.aavePage.common.healthFactor)}
          value={
            <AmountTransition
              className="justify-end"
              from={{
                value: userReservesSummary?.healthFactor ?? 0,
                suffix: '%',
                precision: 2,
              }}
              to={{
                precision: 2,
                value: newHealthFactor,
                suffix: '%',
                className: 'text-primary-10',
                infiniteFrom: Decimal.from('10000'),
              }}
            />
          }
        />
      </SimpleTable>

      <Button
        disabled={submitButtonDisabled}
        text={t(translations.common.buttons.confirm)}
      />
    </form>
  );
};
