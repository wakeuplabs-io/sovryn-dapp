/**
 * This hook is used for getting historical reserve data, and it is primarily used with charts.
 * In particular, this hook is used in the  ̶A̶p̶y̶G̶r̶a̶p̶h̶ AaveReserveOverviewPage (chartJS).
 */
import { useCallback, useState } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';

import { Decimal } from '@sovryn/utils';

import { config } from '../../constants/aave';

export enum ESupportedTimeRanges {
  OneMonth = '1m',
  ThreeMonths = '3m',
  SixMonths = '6m',
  OneYear = '1y',
  TwoYears = '2y',
  FiveYears = '5y',
}

export const reserveRateTimeRangeOptions = [
  ESupportedTimeRanges.OneMonth,
  ESupportedTimeRanges.SixMonths,
  ESupportedTimeRanges.OneYear,
];
export type ReserveRateTimeRange = typeof reserveRateTimeRangeOptions[number];

type RatesHistoryParams = {
  from: number;
  resolutionInHours: number;
};

type APIResponse = {
  liquidityRate_avg: Decimal;
  variableBorrowRate_avg: Decimal;
  stableBorrowRate_avg: Decimal;
  utilizationRate_avg: Decimal;
  x: { year: number; month: number; date: number; hours: number };
};

const fetchStats = async (
  address: string,
  timeRange: ReserveRateTimeRange,
  endpointURL: string,
): Promise<APIResponse[]> => {
  const { from, resolutionInHours } = resolutionForTimeRange(timeRange);

  try {
    const url = `${endpointURL}?reserveId=${address}&from=${from}&resolutionInHours=${resolutionInHours}`;
    return (await axios.get<APIResponse[]>(url)).data;
  } catch (e) {
    return [];
  }
};

// TODO: there is possibly a bug here, as Polygon and Avalanche v2 data is coming through empty and erroring in our hook
// The same asset without the 'from' field comes through just fine.
const resolutionForTimeRange = (
  timeRange: ReserveRateTimeRange,
): RatesHistoryParams => {
  switch (timeRange) {
    case ESupportedTimeRanges.OneMonth:
      return {
        from: dayjs().subtract(30, 'day').unix(),
        resolutionInHours: 6,
      };
    case ESupportedTimeRanges.SixMonths:
      return {
        from: dayjs().subtract(6, 'month').unix(),
        resolutionInHours: 24,
      };
    case ESupportedTimeRanges.OneYear:
      return {
        from: dayjs().subtract(1, 'year').unix(),
        resolutionInHours: 24,
      };
    default:
      return {
        // Return today as a fallback
        from: dayjs().unix(),
        resolutionInHours: 6,
      };
  }
};

export type FormattedReserveHistoryItem = {
  date: number;
  liquidityRate: Decimal;
  utilizationRate: Decimal;
  stableBorrowRate: Decimal;
  variableBorrowRate: Decimal;
};

export function useAaveReservesHistory(
  reserveAddress: string,
  timeRange: ReserveRateTimeRange,
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<FormattedReserveHistoryItem[]>([]);

  const refetchData = useCallback(() => {
    // reset
    setLoading(true);
    setError(false);
    setData([]);

    if (reserveAddress && config.ratesHistoryApiUrl) {
      fetchStats(reserveAddress, timeRange, config.ratesHistoryApiUrl)
        .then((data: APIResponse[]) => {
          setData(
            data.map(d => ({
              date: new Date(
                d.x.year,
                d.x.month,
                d.x.date,
                d.x.hours,
              ).getTime(),
              liquidityRate: d.liquidityRate_avg,
              variableBorrowRate: d.variableBorrowRate_avg,
              utilizationRate: d.utilizationRate_avg,
              stableBorrowRate: d.stableBorrowRate_avg,
            })),
          );
          setLoading(false);
        })
        .catch(e => {
          console.error(
            'useReservesHistory(): Failed to fetch historical reserve data.',
            e,
          );
          setError(true);
          setLoading(false);
        });
    }
    setLoading(false);
    return () => null;
  }, [reserveAddress, timeRange]);
  return {
    loading,
    data,
    error,
    refetch: refetchData,
  };
}
