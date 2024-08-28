import { Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import { config } from '../../constants/aave';
import rateStrategy from './ReserveStrategy-rateStrategyStableOne.json';
import { BIG_NUMBER_PRECISION_TWENTY_SEVEN } from './constants';
import { Reserve } from './useAaveReservesData';

export interface IRatesDataResult {
  baseStableBorrowRate: string; //TODO MISSING ??
  optimalUsageRatio: string;
  baseVariableBorrowRate: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  baseStableRateOffset: string;
  stableRateExcessOffset: string;
  optimalStableToTotalDebtRatio: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: string;
}

export const getAaveInterestRatesData = async (
  reserves: Reserve | undefined,
): Promise<any> => {
  const provider = config.provider; // TODO: replace with useAccount
  // const { provider } = useAccount();
  const result = reserves as Reserve;

  const interestRateStrategyAddress = reserves?.interestRateStrategyAddress;

  if (!interestRateStrategyAddress) {
    return null;
  }

  const ratesStrategy = new Contract(
    interestRateStrategyAddress,
    rateStrategy.abi,
    provider,
  );

  const stableRateExcessOffset =
    await ratesStrategy.getStableRateExcessOffset();

  const optimalStableToTotalDebtRatio =
    await ratesStrategy.OPTIMAL_STABLE_TO_TOTAL_DEBT_RATIO();

  return {
    optimalUsageRatio: formatUnits(
      result.optimalUsageRatio,
      BIG_NUMBER_PRECISION_TWENTY_SEVEN,
    ).toString(),
    baseVariableBorrowRate: formatUnits(
      result.baseVariableBorrowRate,
      BIG_NUMBER_PRECISION_TWENTY_SEVEN,
    ).toString(),
    variableRateSlope1: formatUnits(
      result.variableRateSlope1,
      BIG_NUMBER_PRECISION_TWENTY_SEVEN,
    ).toString(),
    variableRateSlope2: formatUnits(
      result.variableRateSlope2,
      BIG_NUMBER_PRECISION_TWENTY_SEVEN,
    ).toString(),
    stableRateSlope1: formatUnits(
      result.stableRateSlope1,
      BIG_NUMBER_PRECISION_TWENTY_SEVEN,
    ).toString(),
    stableRateSlope2: formatUnits(
      result.stableRateSlope2,
      BIG_NUMBER_PRECISION_TWENTY_SEVEN,
    ).toString(),
    baseStableBorrowRate: formatUnits(
      result.baseStableBorrowRate,
      BIG_NUMBER_PRECISION_TWENTY_SEVEN,
    ).toString(),
    baseStableRateOffset: 1, //@todo fix overflow error here
    stableRateExcessOffset: formatUnits(
      stableRateExcessOffset,
      BIG_NUMBER_PRECISION_TWENTY_SEVEN,
    ).toString(),
    optimalStableToTotalDebtRatio: formatUnits(
      optimalStableToTotalDebtRatio,
      BIG_NUMBER_PRECISION_TWENTY_SEVEN,
    ).toString(),
    underlyingAsset: result.underlyingAsset.toString(),
    name: result.name.toString(),
    symbol: result.symbol.toString(),
    decimals: result.decimals.toString(),
  };
};
