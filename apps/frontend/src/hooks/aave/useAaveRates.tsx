import { useEffect, useMemo, useState } from 'react';

import { Contract, utils } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useSearchParams } from 'react-router-dom';

import { getProvider } from '@sovryn/ethers-provider';

import { BOB_CHAIN_ID } from '../../config/chains';

import { RAY, WEI } from '../../utils/math';
import { INTEREST_RATE_STRATEGY_ABI } from './useAaveRates.constants';
import { useAaveReservesData } from './useAaveReservesData';

export interface RatesDataResult {
  currentUsageRatio: string;
  optimalUsageRatio: string;
  baseVariableBorrowRate: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: string;
}

const calculateUtilizationRate = (
  decimals: number,
  totalDebt: string,
  availableLiquidity: string,
): bigint => {
  // Create BigNumber instances
  const totalBorrow = BigInt(utils.parseUnits(totalDebt, decimals).toString());
  const totalSupply = BigInt(availableLiquidity) + totalBorrow;
  // Perform division
  return (totalBorrow * BigInt(10 ** 18)) / totalSupply;
};

export const useAaveInterestRatesData = (): {
  data: RatesDataResult | null;
  error: string | null;
} => {
  const [data, setData] = useState<RatesDataResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const provider = getProvider(BOB_CHAIN_ID);

  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('asset') || 'ETH';
  const { reserves, loading } = useAaveReservesData();
  const reserve = useMemo(
    () =>
      reserves.find(
        r => r.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase(),
      ),
    [reserves, symbol],
  );
  const interestRateStrategyAddress = reserve?.interestRateStrategyAddress;

  const rateContract = useMemo(
    () =>
      provider && interestRateStrategyAddress && !loading
        ? new Contract(
            interestRateStrategyAddress,
            INTEREST_RATE_STRATEGY_ABI,
            provider,
          )
        : null,
    [loading, interestRateStrategyAddress, provider],
  );

  useEffect(() => {
    if (loading || !rateContract || !reserve) return;
    let ratesData: RatesDataResult;
    try {
      const utilizationRate = calculateUtilizationRate(
        reserve.decimals,
        reserve.totalDebt,
        reserve.availableLiquidity,
      );
      ratesData = {
        currentUsageRatio: formatUnits(utilizationRate, WEI),
        optimalUsageRatio: formatUnits(
          reserve.optimalUsageRatio,
          RAY,
        ).toString(),
        baseVariableBorrowRate: formatUnits(
          reserve.baseVariableBorrowRate,
          RAY,
        ).toString(),
        variableRateSlope1: formatUnits(
          reserve.variableRateSlope1,
          RAY,
        ).toString(),
        variableRateSlope2: formatUnits(
          reserve.variableRateSlope2,
          RAY,
        ).toString(),
        underlyingAsset: reserve.underlyingAsset,
        name: reserve.name,
        symbol: reserve.symbol,
        decimals: reserve.decimals.toString(),
      };
      setData(ratesData);
    } catch (error) {
      setError(error.message);
    }
  }, [symbol, loading, reserve, rateContract]);

  return { data, error };
};
