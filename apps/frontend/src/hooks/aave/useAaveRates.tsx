import { useEffect, useMemo, useState } from 'react';

import { utils } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import { Decimal } from '@sovryn/utils';

import { RAY } from '../../utils/math';
import { useAaveReservesData } from './useAaveReservesData';

export interface RatesDataResult {
  currentUsageRatio: Decimal;
  optimalUsageRatio: Decimal;
  baseVariableBorrowRate: Decimal;
  variableRateSlope1: Decimal;
  variableRateSlope2: Decimal;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
}

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

export const useAaveInterestRatesData = (
  symbol: string,
): {
  data: RatesDataResult | null;
  error: string | null;
} => {
  const [data, setData] = useState<RatesDataResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { reserves } = useAaveReservesData();
  const reserve = useMemo(
    () =>
      reserves.find(
        r => r.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase(),
      ),
    [reserves, symbol],
  );

  useEffect(() => {
    if (!reserve) return;
    try {
      const utilizationRate = calculateUtilizationRate(
        reserve.decimals,
        reserve.totalDebt,
        reserve.availableLiquidity,
      );
      if (!isBetweenZeroAndOne(utilizationRate)) {
        console.log('The utilization rate is out of bounds.');
      }
      setData({
        currentUsageRatio: utilizationRate,
        optimalUsageRatio: Decimal.from(
          formatUnits(reserve.optimalUsageRatio, RAY),
        ),
        baseVariableBorrowRate: Decimal.from(
          formatUnits(reserve.baseVariableBorrowRate, RAY),
        ),
        variableRateSlope1: Decimal.from(
          formatUnits(reserve.variableRateSlope1, RAY),
        ),
        variableRateSlope2: Decimal.from(
          formatUnits(reserve.variableRateSlope2, RAY),
        ),
        underlyingAsset: reserve.underlyingAsset,
        name: reserve.name,
        symbol: reserve.symbol,
        decimals: reserve.decimals,
      });
    } catch (error) {
      setError(error.message);
    }
  }, [reserve]);

  return { data, error };
};
