import { useCallback, useEffect, useMemo, useState } from 'react';

import { BigNumber, Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useSearchParams } from 'react-router-dom';

import { useAccount } from '../useAccount';
import rateStrategy from './ReserveStrategy-rateStrategyStableOne.json';
import { BIG_NUMBER_PRECISION_TWENTY_SEVEN } from './constants';
import { useAaveReservesData } from './useAaveReservesData';

export interface IRatesDataResult {
  currentUsageRatio: string;
  baseStableBorrowRate: string;
  optimalUsageRatio: string;
  baseVariableBorrowRate: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  //baseStableRateOffset: string;
  stableRateExcessOffset: string;
  optimalStableToTotalDebtRatio: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: string;
}

function calculateUtilizationRate(
  totalDebt: string,
  availableLiquidity: string,
): string {
  // Convert inputs to BigNumber
  const _totalDebt: BigNumber = BigNumber.from(totalDebt);
  const _liquidity: BigNumber = BigNumber.from(availableLiquidity);

  return _totalDebt.div(_totalDebt.add(_liquidity)).toString();
}

export const useAaveInterestRatesData = (): {
  data: IRatesDataResult | null;
  error: string | null;
  loading: boolean;
} => {
  const [data, setData] = useState<IRatesDataResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { provider } = useAccount();

  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('asset') || '';
  const { reserves } = useAaveReservesData();
  const reserveAsset = reserves.find(
    r => r.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase(),
  );
  const interestRateStrategyAddress = reserveAsset?.interestRateStrategyAddress;

  const rateContract = useMemo(
    () =>
      provider && interestRateStrategyAddress
        ? new Contract(
            interestRateStrategyAddress as string,
            rateStrategy.abi,
            provider,
          )
        : null,
    [provider, interestRateStrategyAddress],
  );

  const fetchRatesData = useCallback(async () => {
    let ratesData: IRatesDataResult;
    try {
      if (!rateContract || !reserveAsset) {
        const error = 'Interest Rate Strategy Could not be found for reserve';
        console.log(error, reserveAsset);
        setError(error);
        throw new Error(error);
      }
      const utilizationRate = calculateUtilizationRate(
        reserveAsset.totalDebt,
        reserveAsset.availableLiquidity,
      );

      const [stableRateExcessOffset, optimalStableToTotalDebtRatio] =
        await Promise.all([
          rateContract.getStableRateExcessOffset(),
          rateContract.OPTIMAL_STABLE_TO_TOTAL_DEBT_RATIO(),
        ]);

      ratesData = {
        currentUsageRatio: utilizationRate,
        optimalUsageRatio: formatUnits(
          reserveAsset.optimalUsageRatio,
          BIG_NUMBER_PRECISION_TWENTY_SEVEN,
        ).toString(),
        baseVariableBorrowRate: formatUnits(
          reserveAsset.baseVariableBorrowRate,
          BIG_NUMBER_PRECISION_TWENTY_SEVEN,
        ).toString(),
        variableRateSlope1: formatUnits(
          reserveAsset.variableRateSlope1,
          BIG_NUMBER_PRECISION_TWENTY_SEVEN,
        ).toString(),
        variableRateSlope2: formatUnits(
          reserveAsset.variableRateSlope2,
          BIG_NUMBER_PRECISION_TWENTY_SEVEN,
        ).toString(),
        stableRateSlope1: formatUnits(
          reserveAsset.stableRateSlope1,
          BIG_NUMBER_PRECISION_TWENTY_SEVEN,
        ).toString(),
        stableRateSlope2: formatUnits(
          reserveAsset.stableRateSlope2,
          BIG_NUMBER_PRECISION_TWENTY_SEVEN,
        ).toString(),
        baseStableBorrowRate: formatUnits(
          reserveAsset.baseStableBorrowRate,
          BIG_NUMBER_PRECISION_TWENTY_SEVEN,
        ).toString(),
        stableRateExcessOffset: formatUnits(
          stableRateExcessOffset,
          BIG_NUMBER_PRECISION_TWENTY_SEVEN,
        ).toString(),
        optimalStableToTotalDebtRatio: formatUnits(
          optimalStableToTotalDebtRatio,
          BIG_NUMBER_PRECISION_TWENTY_SEVEN,
        ).toString(),
        underlyingAsset: reserveAsset.underlyingAsset.toString(),
        name: reserveAsset.name.toString(),
        symbol: reserveAsset.symbol.toString(),
        decimals: reserveAsset.decimals.toString(),
      };
      setData(ratesData);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [setData, reserveAsset, rateContract]);

  useEffect(() => {
    if (provider && reserveAsset) {
      setLoading(true);
      fetchRatesData()
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [provider, reserveAsset, fetchRatesData]);

  return { data, loading, error };
};
