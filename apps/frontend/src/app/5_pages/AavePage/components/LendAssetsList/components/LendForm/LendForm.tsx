import React, { FC, useMemo, useState } from 'react';

import { t } from 'i18next';

import { getAssetData } from '@sovryn/contracts';
import {
  Button,
  ErrorBadge,
  ErrorLevel,
  SimpleTable,
  SimpleTableRow,
} from '@sovryn/ui';
import { Decimal } from '@sovryn/utils';

import { BOB_CHAIN_ID } from '../../../../../../../config/chains';

import { AmountRenderer } from '../../../../../../2_molecules/AmountRenderer/AmountRenderer';
import { AssetAmountInput } from '../../../../../../2_molecules/AssetAmountInput/AssetAmountInput';
import { AssetRenderer } from '../../../../../../2_molecules/AssetRenderer/AssetRenderer';
import { useAaveReservesData } from '../../../../../../../hooks/aave/useAaveReservesData';
import { useAaveSupply } from '../../../../../../../hooks/aave/useAaveSupply';
import { useAccount } from '../../../../../../../hooks/useAccount';
import { useAssetBalance } from '../../../../../../../hooks/useAssetBalance';
import { useDecimalAmountInput } from '../../../../../../../hooks/useDecimalAmountInput';
import { translations } from '../../../../../../../locales/i18n';

const pageTranslations = translations.aavePage;

type LendFormProps = {
  asset: string;
  onSuccess: () => void;
};

export const LendForm: FC<LendFormProps> = ({
  asset: initialAsset,
  onSuccess,
}) => {
  const { account } = useAccount();
  const reserves = useAaveReservesData();
  const [lendAsset, setLendAsset] = useState<string>(initialAsset);
  const [lendAmount, setLendAmount, lendSize] = useDecimalAmountInput('');
  const { balance: lendAssetBalance } = useAssetBalance(
    lendAsset,
    BOB_CHAIN_ID,
    account,
  );
  const { handleDeposit } = useAaveSupply();

  const lendAssetsOptions = useMemo(
    () =>
      reserves.map(r => ({
        value: r.symbol,
        label: (
          <AssetRenderer
            showAssetLogo
            asset={r.symbol}
            assetClassName="font-medium"
            chainId={BOB_CHAIN_ID}
          />
        ),
      })),
    [reserves],
  );

  const reserve = useMemo(() => {
    return reserves.find(r => r.symbol === lendAsset) ?? reserves[0];
  }, [reserves, lendAsset]);

  const assetUsdValue: Decimal = useMemo(() => {
    return Decimal.from(reserve?.priceInUSD ?? 0).mul(lendSize);
  }, [reserve, lendSize]);

  const isValidLendAmount = useMemo(
    () => (lendSize.gt(0) ? lendSize.lte(lendAssetBalance) : true),
    [lendSize, lendAssetBalance],
  );

  return (
    <form className="flex flex-col gap-6">
      <div>
        <AssetAmountInput
          label={t(translations.aavePage.common.lend)}
          maxAmount={lendAssetBalance}
          amountLabel={t(translations.common.amount)}
          amountValue={lendAmount}
          onAmountChange={setLendAmount}
          invalid={!isValidLendAmount}
          assetValue={lendAsset}
          assetUsdValue={assetUsdValue}
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
              suffix="%"
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
        disabled={!isValidLendAmount || lendSize.lte(0)}
        onClick={async () =>
          handleDeposit(
            lendSize,
            await getAssetData(reserve.symbol, BOB_CHAIN_ID),
            { onComplete: onSuccess },
          )
        }
        text={t(translations.aavePage.lendModal.deposit)}
      />
    </form>
  );
};