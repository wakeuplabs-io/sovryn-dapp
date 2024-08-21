import React, { FC, useMemo, useState } from 'react';

import { t } from 'i18next';

import { getAssetData } from '@sovryn/contracts';
import {
  Button,
  Checkbox,
  ErrorBadge,
  ErrorLevel,
  HealthBar,
  Link,
  SimpleTable,
  SimpleTableRow,
} from '@sovryn/ui';
import { Decimal } from '@sovryn/utils';

import { BOB_CHAIN_ID } from '../../../../../../../config/chains';

import { AmountRenderer } from '../../../../../../2_molecules/AmountRenderer/AmountRenderer';
import { AssetAmountInput } from '../../../../../../2_molecules/AssetAmountInput/AssetAmountInput';
import { AssetRenderer } from '../../../../../../2_molecules/AssetRenderer/AssetRenderer';
import { useAaveBorrow } from '../../../../../../../hooks/aave/useAaveBorrow';
import { useAaveReservesData } from '../../../../../../../hooks/aave/useAaveReservesData';
import { useAaveUserReservesData } from '../../../../../../../hooks/aave/useAaveUserReservesData';
import { useDecimalAmountInput } from '../../../../../../../hooks/useDecimalAmountInput';
import { translations } from '../../../../../../../locales/i18n';
import { BorrowRateMode } from '../../../../../../../utils/aave/AaveBorrowTransactionsFactory';
import { getCollateralRatioThresholds } from './BorrowForm.utils';

const pageTranslations = translations.aavePage;

type BorrowFormProps = {
  asset: string;
  onSuccess: () => unknown;
};

export const BorrowForm: FC<BorrowFormProps> = ({ asset }) => {
  const reserves = useAaveReservesData();
  const userReservesSummary = useAaveUserReservesData();
  const [borrowAsset, setBorrowAsset] = useState<string>(asset);
  const [borrowAmount, setBorrowAmount, borrowSize] = useDecimalAmountInput('');
  const [acknowledge, setAcknowledge] = useState<boolean>(false);
  const { handleBorrow } = useAaveBorrow({});

  const reserve = useMemo(() => {
    return reserves.find(r => r.symbol === borrowAsset);
  }, [reserves, borrowAsset]);

  const variableBorrowAPY = useMemo(() => {
    if (!reserve) return Decimal.from(0);
    return Decimal.from(reserve.variableBorrowAPY).mul(100);
  }, [reserve]);

  const maximumBorrowAmount = useMemo(() => {
    if (!reserve || !userReservesSummary) return Decimal.from(0);
    return userReservesSummary.borrowPower.div(reserve.priceInUSD);
  }, [userReservesSummary, reserve]);

  const borrowableAssetsOptions = useMemo(
    () =>
      reserves.map(r => ({
        value: r.symbol,
        label: (
          <AssetRenderer
            showAssetLogo
            asset={r.symbol}
            chainId={BOB_CHAIN_ID}
            assetClassName="font-medium"
          />
        ),
      })),
    [reserves],
  );

  const isValidBorrowAmount = useMemo(
    () => (borrowSize.gt(0) ? borrowSize.lte(maximumBorrowAmount) : true),
    [borrowSize, maximumBorrowAmount],
  );

  const newBorrowedBalance = useMemo(() => {
    if (!userReservesSummary || !reserve) return Decimal.from(0);
    return userReservesSummary.borrowBalance.add(
      borrowSize.mul(reserve.priceInUSD),
    );
  }, [userReservesSummary, borrowSize, reserve]);

  const collateralRatioThresholds = useMemo(
    () =>
      getCollateralRatioThresholds(
        reserve,
        userReservesSummary?.eModeEnabled ?? false,
      ),
    [reserve, userReservesSummary],
  );

  const collateralRatio = useMemo(() => {
    if (!userReservesSummary || newBorrowedBalance.eq(0))
      return Decimal.from(0);

    return Decimal.from(userReservesSummary.collateralBalance).div(
      newBorrowedBalance,
    );
  }, [userReservesSummary, newBorrowedBalance]);

  const liquidationPrice = useMemo(() => {
    if (!borrowSize || !reserve || !userReservesSummary) {
      return Decimal.from(0);
    }
    if (userReservesSummary.collateralBalance.eq(0)) {
      return Decimal.from(0);
    }

    const liquidationThreehold = userReservesSummary.eModeEnabled
      ? Decimal.from(reserve.formattedEModeLiquidationThreshold)
      : Decimal.from(reserve.formattedReserveLiquidationThreshold);

    console.log(
      'liquidationPrice',
      borrowSize.toString(),
      liquidationThreehold.toString(),
      userReservesSummary.collateralBalance.toString(),
    );

    return borrowSize
      .mul(liquidationThreehold.div(100))
      .div(userReservesSummary.collateralBalance);
  }, [borrowSize, reserve, userReservesSummary]);

  // TODO: expand validations
  const submitButtonDisabled = useMemo(
    () => !isValidBorrowAmount || borrowSize.lte(0) || !acknowledge || !reserve,
    [isValidBorrowAmount, borrowSize, acknowledge, reserve],
  );

  return (
    <form className="flex flex-col gap-6">
      <div className="space-y-3">
        <AssetAmountInput
          label={t(translations.aavePage.common.borrow)}
          amountLabel={t(translations.common.amount)}
          amountValue={borrowAmount}
          assetUsdValue={borrowSize.mul(reserve?.priceInUSD ?? 0)}
          onAmountChange={setBorrowAmount}
          maxAmount={maximumBorrowAmount}
          invalid={!isValidBorrowAmount}
          assetValue={borrowAsset}
          onAssetChange={setBorrowAsset}
          assetOptions={borrowableAssetsOptions}
        />

        {!isValidBorrowAmount && (
          <ErrorBadge
            level={ErrorLevel.Critical}
            message={t(pageTranslations.borrowForm.invalidAmountError)}
            dataAttribute="borrow-amount-error"
          />
        )}
      </div>

      <SimpleTable>
        <SimpleTableRow
          label={t(translations.aavePage.borrowForm.borrowApy)}
          value={
            <AmountRenderer
              value={variableBorrowAPY}
              suffix={'%'}
              precision={2}
            />
          }
        />
      </SimpleTable>

      <div>
        <div className="flex flex-row justify-between items-center mt-6 mb-3">
          <div className="flex flex-row justify-start items-center gap-2">
            <span>{t(translations.aavePage.borrowForm.collateralRatio)}</span>
          </div>
          <AmountRenderer value={collateralRatio.toString()} suffix="%" />
        </div>

        <HealthBar
          // className="w-full"
          start={collateralRatioThresholds.START}
          middleStart={collateralRatioThresholds.MIDDLE_START}
          middleEnd={collateralRatioThresholds.MIDDLE_END}
          end={collateralRatioThresholds.END}
          value={100}
          // start={0}
          // middleStart={10}
          // middleEnd={80}
          // end={110}
          // value={20}
        />
      </div>

      <SimpleTable>
        <SimpleTableRow
          label={t(translations.aavePage.borrowForm.liquidationPrice)}
          value={
            <AmountRenderer
              value={liquidationPrice}
              precision={2}
              prefix={'$'}
            />
          }
        />
        <SimpleTableRow
          label={t(translations.aavePage.borrowForm.tokenPrice, {
            token: borrowAsset,
          })}
          value={
            <AmountRenderer
              value={reserve?.priceInUSD ?? 0}
              precision={2}
              prefix={'$'}
            />
          }
        />
      </SimpleTable>

      <Checkbox
        checked={acknowledge}
        onChangeValue={setAcknowledge}
        label={
          <span>
            {t(translations.aavePage.borrowForm.acknowledge)}{' '}
            <Link text="Learn more" href="#learn-more" />
            {/* TODO: Add proper learn more href */}
          </span>
        }
      />

      <Button
        onClick={async () => {
          handleBorrow(
            borrowSize,
            await getAssetData(reserve!.symbol, BOB_CHAIN_ID),
            BorrowRateMode.VARIABLE,
          );
        }}
        disabled={submitButtonDisabled}
        text={t(translations.common.buttons.confirm)}
      />
    </form>
  );
};
