import { Decimal } from '@sovryn/utils';

import { Reserve } from '../../../../../hooks/aave/useAaveReservesData';
import { GetSupplyHistoryQuery } from '../../../../../utils/graphql/bobAave/generated';
import { RAY } from '../../../../../utils/math';

export const normalizeSupplyStats = (reserve: Reserve) => ({
  totalSupplied: Decimal.from(reserve.formattedAvailableLiquidity).add(
    reserve.totalDebt,
  ),
  totalSuppliedUsd: Decimal.from(reserve.availableLiquidityUSD).add(
    reserve.totalDebtUSD,
  ),
  supplyApy: Decimal.from(reserve.supplyAPY).mul(100),
  supplyCap: Decimal.from(reserve.supplyCap),
  supplyCapUsd: Decimal.from(reserve.supplyCapUSD),
  suppliedPercentage: Decimal.from(reserve.supplyCapUSD)
    .div(Decimal.from(reserve.supplyCapUSD))
    .mul(100),
  maxLTV: Decimal.from(reserve.baseLTVasCollateral).div(100),
  liquidationThreshold: Decimal.from(
    reserve.formattedReserveLiquidationThreshold,
  ).mul(100),
  liquidationPenalty: Decimal.from(
    reserve.formattedReserveLiquidationBonus,
  ).mul(100),
});

export const normalizeSupplyHistory = (
  borrowHistory: GetSupplyHistoryQuery,
) => {
  return borrowHistory.reserves[0].supplyHistory.map(b => ({
    x: b.timestamp,
    y: Number(
      Decimal.from(b.reserve.liquidityRate).div(RAY).mul(100).toString(2),
    ),
  }));
};
