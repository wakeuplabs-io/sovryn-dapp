import { utils } from 'ethers';

import { Decimal } from '@sovryn/utils';

export const isBetweenZeroAndOne = (value: Decimal): boolean => {
  const lowerBound = Decimal.from(0);
  const upperBound = Decimal.from(1);

  // Check if value is greater than or equal to 0 and less than or equal to 1
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

  // Calculate total supply
  const totalSupplyBigInt = totalBorrowBigInt + availableLiquidityBigInt;

  // Ensure no division by zero
  if (totalSupplyBigInt === BigInt(0)) {
    return Decimal.from(0); // Return 0 if there's no total supply
  }

  // Perform the utilization rate calculation
  const utilizationRateBigInt =
    (totalBorrowBigInt * BigInt(10 ** decimals)) / totalSupplyBigInt;

  // Convert the result back to a decimal string and then to a Decimal instance
  const utilizationRate = utils.formatUnits(
    utilizationRateBigInt.toString(),
    decimals,
  );

  return Decimal.from(utilizationRate);
};
