import { utils } from 'ethers';

import { Decimal } from '@sovryn/utils';

export const isBetweenZeroAndOne = (value: Decimal): boolean => {
  const lowerBound = Decimal.from(0);
  const upperBound = Decimal.from(1);

  return value.gte(lowerBound) && value.lte(upperBound);
};

export const calculateUtilizationRate = (
  decimals: number,
  totalDebt: string,
  availableLiquidity: string,
): Decimal => {
  const totalBorrowBigInt = BigInt(
    utils.parseUnits(totalDebt, decimals).toString(),
  );
  const availableLiquidityBigInt = BigInt(availableLiquidity);

  const totalSupplyBigInt = totalBorrowBigInt + availableLiquidityBigInt;

  if (totalSupplyBigInt === BigInt(0)) {
    return Decimal.from(0);
  }

  const utilizationRateBigInt =
    (totalBorrowBigInt * BigInt(10 ** decimals)) / totalSupplyBigInt;

  const utilizationRate = utils.formatUnits(
    utilizationRateBigInt.toString(),
    decimals,
  );

  const utilizationRateDecimal = Decimal.from(utilizationRate);

  if (!isBetweenZeroAndOne(utilizationRateDecimal)) {
    return Decimal.from(0);
  }

  return utilizationRateDecimal;
};
