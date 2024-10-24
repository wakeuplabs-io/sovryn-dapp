import { formatUnits } from 'ethers/lib/utils';
import { t } from 'i18next';

import { Decimal } from '@sovryn/utils';

import { translations } from '../../../../../locales/i18n';
import { BorrowRateMode } from '../../../../../types/aave';
import { UserBorrowTransactionsQuery } from '../../../../../utils/graphql/bobAave/generated';
import { RAY } from '../../../../../utils/math';
import { NewBorrowHistoryItem } from './AaveNewLoanHistoryFrame.types';

export const normalizeUserBorrowTransactions = (
  data: UserBorrowTransactionsQuery,
): NewBorrowHistoryItem[] => {
  if (!data) {
    return [];
  }

  return data.userTransactions.reduce((acc, tx) => {
    if (tx.__typename !== 'Borrow') {
      return acc;
    }

    return [
      ...acc,
      {
        id: tx.id,
        amount: Decimal.from(
          formatUnits(tx.amount, tx.reserve.decimals),
        ).toString(2),
        borrowRate: Decimal.from(tx.borrowRate).div(RAY).toString(2),
        borrowRateMode: t(
          translations.loanHistory.table[
            tx.borrowRateMode === BorrowRateMode.STABLE ? 'stable' : 'variable'
          ],
        ),
        timestamp: tx.timestamp,
        hash: tx.txHash,
        reserve: {
          symbol: tx.reserve.symbol,
          decimals: tx.reserve.decimals,
          name: tx.reserve.name,
          underlyingAsset: tx.reserve.underlyingAsset,
          assetPriceUSD: tx.assetPriceUSD,
        },
      } as NewBorrowHistoryItem,
    ];
  }, [] as NewBorrowHistoryItem[]);
};
