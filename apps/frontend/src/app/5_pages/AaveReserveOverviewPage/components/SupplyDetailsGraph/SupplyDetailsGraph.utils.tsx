import { Decimal } from '@sovryn/utils';

import { Reserve } from '../../../../../hooks/aave/useAaveReservesData';

export const normalizeSupplyStats = (reserve: Reserve) => ({
  totalSupplied: Decimal.from(reserve.formattedAvailableLiquidity).add(
    reserve.totalDebt,
  ),
  totalSuppliedUSD: Decimal.from(reserve.availableLiquidityUSD).add(
    reserve.totalDebtUSD,
  ),
  supplyApy: Decimal.from(reserve.supplyAPY),
  supplyCap: Decimal.from(reserve.supplyCap),
  supplyCapUSD: Decimal.from(reserve.supplyCapUSD),
  suppliedPercentage: Decimal.from(reserve.supplyCapUSD)
    .div(Decimal.from(reserve.supplyCapUSD))
    .mul(100)
    .toString(0),
  maxLTV: Decimal.from(reserve.baseLTVasCollateral).div(100),
  liquidationThreshold: Decimal.from(
    reserve.formattedReserveLiquidationThreshold,
  ).mul(100),
  liquidationPenalty: Decimal.from(
    reserve.formattedReserveLiquidationBonus,
  ).mul(100),
});
