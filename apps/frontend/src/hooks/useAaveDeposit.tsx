import { useCallback } from 'react';

import { config } from '../constants/aave';
import { useAccount } from './useAccount';
import { useTransactionContext } from '../contexts/TransactionContext';
import { Decimal } from '@sovryn/utils';
import { prepareApproveTransaction } from '../utils/transactions';
import { AssetDetailsData, getAssetData } from '@sovryn/contracts';
import { Transaction } from '../app/3_organisms/TransactionStepDialog/TransactionStepDialog.types';
import { ChainIds } from '@sovryn/ethers-provider';

export const useAaveDeposit = (onBegin: () => void, onComplete: () => void) => {
  const { account, signer, provider } = useAccount();

  const { setTransactions, setIsOpen, setTitle } = useTransactionContext();

  const handleDeposit = useCallback(
    async (amount: Decimal, token: string) => {
      if (!account || !signer || !provider) {
        return;
      }

      console.log(
        'handleDeposit',
        amount.toString(),
        token,
        await getAssetData('USDC', ChainIds.BOB_MAINNET),
      );

      const tokenDetails: AssetDetailsData = await getAssetData(
        'USDC',
        ChainIds.BOB_MAINNET,
      );

      const transactions: Transaction[] = [];
      if (!tokenDetails.isNative) {
        const approve = await prepareApproveTransaction({
          token: tokenDetails.symbol,
          amount: amount.toBigNumber().toString(),
          signer,
          spender: config.PoolAddress,
          chain: ChainIds.BOB_MAINNET,
        });

        if (approve) {
          transactions.push(approve);
        }
      }

      console.log('deposit');

      // const pool = new PoolBundle(provider).contractFactory.connect(
      //   config.PoolAddress,
      //   signer,
      // );

      // transactions.push({
      //   title: 'deposit',
      //   request: {
      //     type: TransactionType.signTransaction,
      //     contract: pool,
      //     fnName: 'supply(address,uint256,address,uint16)',
      //     args: [token, amount.toBigNumber().toString(), account, '0'],
      //   },
      //   onComplete,
      // });

      setTransactions(transactions);
      setTitle('Deposit');
      setIsOpen(true);
    },
    [provider, account, setIsOpen, setTitle, signer, setTransactions],
  );

  return { handleDeposit };
};
