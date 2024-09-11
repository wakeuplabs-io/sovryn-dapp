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

export const calculateUtilizationRate = (
  decimals: number,
  totalDebt: string,
  availableLiquidity: string,
): Decimal => {
  // Create BigInt instances
  const totalBorrow = BigInt(utils.parseUnits(totalDebt, decimals).toString());
  const totalSupply = BigInt(availableLiquidity) + totalBorrow;
  // Perform division
  const resultInBigInt = (totalBorrow * BigInt(10 ** decimals)) / totalSupply;
  // Restore the decimal point
  const finalResult = formatUnits(resultInBigInt.toString(), decimals);
  return Decimal.from(finalResult);
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
