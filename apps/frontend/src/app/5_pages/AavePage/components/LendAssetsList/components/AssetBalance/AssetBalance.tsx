import React, { FC, useEffect } from 'react';
import { AmountRenderer } from '../../../../../../2_molecules/AmountRenderer/AmountRenderer';
import { useAssetBalance } from '../../../../../../../hooks/useAssetBalance';
import { useAccount } from '../../../../../../../hooks/useAccount';
import { BOB_CHAIN_ID } from '../../../../../../../config/chains';

export type AssetBalanceRendererProps = {
  asset: string;
};

export const AssetBalanceRenderer: FC<AssetBalanceRendererProps> = ({
  asset,
}) => {
  const { account } = useAccount();
  const balance = useAssetBalance(asset, BOB_CHAIN_ID);

  useEffect(() => {
    console.log("account", account, balance)
  }, [account, balance]);

  return account ? (
    <AmountRenderer
      value={balance.balance}
      precision={balance.decimalPrecision}
    />
  ) : (
    <span>-</span>
  );
};
