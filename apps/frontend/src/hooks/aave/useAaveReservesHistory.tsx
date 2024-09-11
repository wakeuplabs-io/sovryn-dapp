import { useCallback, useEffect, useState } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';

import { Decimal } from '@sovryn/utils';

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

const requestCache = new Map<string, Promise<APIResponse[]>>();
const fetchStats = async (
  address: string,
  timeRange: ReserveRateTimeRange,
  endpointURL: string,
): Promise<APIResponse[]> => {
  const { from, resolutionInHours } = resolutionForTimeRange(timeRange);
  const qs = `reserveId=${address}&from=${from}&resolutionInHours=${resolutionInHours}`;
  const url = `${endpointURL}?${qs}`;

  if (requestCache.has(url)) {
    return requestCache.get(url)!;
  }

  const requestPromise = axios
    .get<APIResponse[]>(url)
    .then(response => response.data)
    .finally(() => {
      requestCache.delete(url);
    });

  requestCache.set(url, requestPromise);

  return requestPromise;
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

const RatesHistoryApiUrl = process.env.REACT_APP_RATES_HISTORY_API_URL;

export function useAaveReservesHistory(
  reserveAddress: string,
  timeRange: ReserveRateTimeRange,
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<FormattedReserveHistoryItem[]>([]);

  const refetchData = useCallback(() => {
    if (reserveAddress && RatesHistoryApiUrl) {
      // reset
      setLoading(true);
      setError(false);
      setData([]);
      fetchStats(reserveAddress, timeRange, RatesHistoryApiUrl)
        .then((data: APIResponse[]) => {
          setData(
            data.map(d => ({
              date: dayjs()
                .set('year', d.x.year)
                .set('month', d.x.month)
                .set('date', d.x.date)
                .set('hour', d.x.hours)
                .valueOf(),
              liquidityRate: d.liquidityRate_avg,
              variableBorrowRate: d.variableBorrowRate_avg,
              utilizationRate: d.utilizationRate_avg,
              stableBorrowRate: d.stableBorrowRate_avg,
            })),
          );
        })
        .catch(e => {
          console.error(
            'useReservesHistory(): Failed to fetch historical reserve data.',
            e,
          );
          setError(true);
        })
        .finally(() => setLoading(false));
    }

    return () => null;
  }, [reserveAddress, timeRange]);

  useEffect(() => {
    refetchData();
  }, [refetchData]);
  return {
    loading,
    data,
    error,
    refetch: refetchData,
  };
}
