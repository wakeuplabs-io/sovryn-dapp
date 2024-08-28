import { Decimal } from '@sovryn/utils';
import { UserSummary } from './AaveUserReservesSummary';

export class AaveCalculations {
  static computeNetApy(
    weightedSupplyApy: Decimal,
    suppliedBalance: Decimal,
    weightedBorrowApy: Decimal,
    borrowedBalance: Decimal,
    netWorthUsd: Decimal,
  ): Decimal {
    return weightedSupplyApy
      .mul(suppliedBalance)
      .div(netWorthUsd)
      .sub(weightedBorrowApy.mul(borrowedBalance).div(netWorthUsd));
  }

  static computeSuppliedBalance(
    reserves: UserSummary['userReservesData'],
  ): Decimal {
    return reserves.reduce(
      (suppliedBalance, r) => suppliedBalance.add(r.underlyingBalanceUSD),
      Decimal.from(0),
    );
  }

  static computeBorrowedBalance(
    reserves: UserSummary['userReservesData'],
  ): Decimal {
    return reserves.reduce(
      (borrowedBalance, r) => borrowedBalance.add(r.totalBorrows),
      Decimal.from(0),
    );
  }

  static computeBorrowPower(
    availableBorrowsUSD: Decimal,
    borrowedBalance: Decimal,
  ) {
    return Decimal.from(availableBorrowsUSD).add(borrowedBalance);
  }

  static computeBorrowPowerUsed(
    borrowedBalance: Decimal,
    borrowPower: Decimal,
  ) {
    return Decimal.from(borrowedBalance).div(borrowPower).mul(100);
  }

  static computeCollateral(reserves: UserSummary['userReservesData']): Decimal {
    return reserves.reduce(
      (collateral, r) =>
        collateral.add(
          r.usageAsCollateralEnabledOnUser ? r.underlyingBalanceUSD : 0,
        ),
      Decimal.from(0),
    );
  }

  static computeHealthFactor(
    collateral: Decimal,
    currentLiquidationThreshold: Decimal,
    borrowedBalance: Decimal,
  ): Decimal {
    return collateral.mul(currentLiquidationThreshold).div(borrowedBalance);
  }

  static computeCollateralRatio(collateral: Decimal, borrowedBalance: Decimal) {
    if (borrowedBalance.eq(0)) {
      return Decimal.from(10000000000); // -> inf
    }
    return collateral.div(borrowedBalance);
  }

  static computeWeightedBorrowApy(
    reserves: UserSummary['userReservesData'],
  ): Decimal {
    let totalBorrowedUSD = Decimal.from(0);
    let weightedBorrowAPYSum = Decimal.from(0);

    reserves.forEach(reserve => {
      const borrowedAmountUSD = Decimal.from(reserve.totalBorrowsUSD);
      const borrowAPY = Decimal.from(reserve.reserve.variableBorrowAPY);

      weightedBorrowAPYSum = weightedBorrowAPYSum.add(
        borrowAPY.mul(borrowedAmountUSD),
      );
      totalBorrowedUSD = totalBorrowedUSD.add(borrowedAmountUSD);
    });

    return weightedBorrowAPYSum.div(totalBorrowedUSD).mul(100);
  }

  static computeWeightedSupplyApy(
    reserves: UserSummary['userReservesData'],
  ): Decimal {
    let totalBorrowedUSD = Decimal.from(0);
    let weightedBorrowAPYSum = Decimal.from(0);

    reserves.forEach(reserve => {
      const borrowedAmountUSD = Decimal.from(reserve.totalBorrowsUSD);
      const borrowAPY = Decimal.from(reserve.reserve.supplyAPY);

      weightedBorrowAPYSum = weightedBorrowAPYSum.add(
        borrowAPY.mul(borrowedAmountUSD),
      );
      totalBorrowedUSD = totalBorrowedUSD.add(borrowedAmountUSD);
    });

    return weightedBorrowAPYSum.div(totalBorrowedUSD).mul(100);
  }

  static computeLiquidationPrice(
    borrowSize: Decimal,
    currentLiquidationThreshold: Decimal,
    collateralBalance: Decimal,
  ) {
    if (collateralBalance.eq(0)) {
      return Decimal.from("1000000000"); // -> inf
    }
    return borrowSize.mul(currentLiquidationThreshold).div(collateralBalance);
  }
}
