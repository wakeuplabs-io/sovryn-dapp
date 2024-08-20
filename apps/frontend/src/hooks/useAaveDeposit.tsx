import { useCallback, useMemo } from 'react';

import { config } from '../constants/aave';
import { useAccount } from './useAccount';
import { useTransactionContext } from '../contexts/TransactionContext';
import { Decimal } from '@sovryn/utils';
import { AaveSupplyTransactionsFactory } from '../utils/aave/AaveSupplyTransactionsFactory';
import { getAssetData } from '@sovryn/contracts';
import { ChainIds } from '@sovryn/ethers-provider';
import { BigNumber } from 'ethers';

export const useAaveDeposit = (onBegin: () => void, onComplete: () => void) => {
  const { signer } = useAccount();
  const { setTransactions, setIsOpen, setTitle } = useTransactionContext();

  const aaveSupplyTransactionsFactory = useMemo(() => {
    if (!signer) return null;
    return new AaveSupplyTransactionsFactory(
      config.PoolAddress,
      config.WETHGatewayAddress,
      signer,
    );
  }, [signer]);

  const handleDeposit = useCallback(
    async (amount: Decimal, assetSymbol: string) => {
      if (!aaveSupplyTransactionsFactory) {
        return;
      }

      const asset = await getAssetData(assetSymbol, ChainIds.BOB_TESTNET);
      const bnAmount = BigNumber.from(
        amount.mul(Decimal.from(10).pow(asset.decimals)).toString(),
      );

      setTransactions(
        await aaveSupplyTransactionsFactory.supply(asset, bnAmount),
      );
      setTitle('Deposit'); // TODO: translations
      setIsOpen(true);
    },
    [setIsOpen, setTitle, setTransactions, aaveSupplyTransactionsFactory],
  );

  return { handleDeposit };
};
