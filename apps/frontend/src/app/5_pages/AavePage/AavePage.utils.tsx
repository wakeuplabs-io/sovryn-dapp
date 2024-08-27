import { Decimal } from '@sovryn/utils';

import { ReserveData } from '../../../hooks/aave/useAaveReservesData';
import { AaveUserReservesSummary } from '../../../utils/aave/AaveUserReservesSummary';
import { BorrowPosition } from './components/BorrowPositionsList/BorrowPositionsList.types';
import { LendPosition } from './components/LendPositionsList/LendPositionsList.types';

export function normalizeLendPositions(
  userReservesSummary: AaveUserReservesSummary | null,
): LendPosition[] {
  if (!userReservesSummary) {
    return [];
  }

  return userReservesSummary.suppliedAssets.map(s => ({
    asset: s.asset,
    apy: s.apy,
    supplied: s.supplied,
    suppliedUSD: s.suppliedUSD,
    collateral: s.isCollateral,
  }));
}

export function normalizeBorrowPositions(
  userReservesSummary: AaveUserReservesSummary | null,
): BorrowPosition[] {
  if (!userReservesSummary) {
    return [];
  }

  return userReservesSummary.borrowedAssets.map(ba => ({
    asset: ba.asset,
    apy: ba.apy,
    borrowed: ba.borrowed,
    borrowedUSD: ba.borrowedUSD,
    type: ba.type,
  }));
}

export function normalizeBorrowPoolDetails(
  reserves: ReserveData,
  userReservesSummary: AaveUserReservesSummary | null,
) {
  if (!userReservesSummary) {
    return reserves.map(r => ({
      asset: r.symbol,
      apy: Decimal.from(r.variableBorrowAPY).mul(100),
    }));
  } else {
    return reserves.map(r => ({
      asset: r.symbol,
      apy: Decimal.from(r.variableBorrowAPY).mul(100),
      available: userReservesSummary.borrowPower.div(r.priceInUSD),
      availableUSD: userReservesSummary.borrowPower,
    }));
  }
}

export function normalizeLendPoolDetails(
  reserves: ReserveData,
  userReservesSummary: AaveUserReservesSummary | null,
) {
  if (!userReservesSummary) {
    return reserves.map(r => ({
      asset: r.symbol,
      apy: Decimal.from(r.supplyAPY).mul(100),
      canBeCollateral: r.usageAsCollateralEnabled,
      walletBalance: Decimal.from(0),
    }));
  } else {
    return reserves.map(r => ({
      asset: r.symbol,
      apy: Decimal.from(r.supplyAPY).mul(100),
      canBeCollateral: r.usageAsCollateralEnabled,
      walletBalance:
        userReservesSummary.balances.find(b => b.asset.symbol === r.symbol)
          ?.balanceDecimal || Decimal.from(0),
    }));
  }
}
