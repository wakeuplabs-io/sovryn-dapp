import { Decimal } from '@sovryn/utils';

import { AAVE_CONTRACT_ADDRESSES } from '../../../../../constants/aave';
import { Reserve } from '../../../../../hooks/aave/useAaveReservesData';
import { GetBorrowHistoryQuery } from '../../../../../utils/graphql/bobAave/generated';
import { getBobExplorerUrl } from '../../../../../utils/helpers';
import { RAY } from '../../../../../utils/math';

export const normalizeBorrowStats = (reserve: Reserve) => ({
  apr: Decimal.from(reserve.variableBorrowAPR).mul(100),
  totalBorrowed: Decimal.from(reserve.totalDebt),
  totalBorrowedUsd: Decimal.from(reserve.totalDebtUSD),
  borrowCap: Decimal.from(reserve.borrowCap),
  borrowCapUsd: Decimal.from(reserve.borrowCapUSD),
  borrowedPercentage: Decimal.from(reserve.totalDebtUSD)
    .div(Decimal.from(reserve.debtCeilingUSD))
    .mul(100),
  reserveFactor: Decimal.from(reserve.reserveFactor).mul(100),
  collectorContractLink: `${getBobExplorerUrl()}/address/${
    AAVE_CONTRACT_ADDRESSES.TREASURY
  }`,
});

export const normalizeBorrowHistory = (
  borrowHistory: GetBorrowHistoryQuery,
) => {
  return borrowHistory.reserves[0].borrowHistory.map(b => ({
    x: b.timestamp,
    y: Number(
      Decimal.from(b.reserve.variableBorrowRate).div(RAY).mul(100).toString(2),
    ),
  }));
};
