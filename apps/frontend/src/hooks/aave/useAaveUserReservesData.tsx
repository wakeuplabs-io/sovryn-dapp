import { UiPoolDataProvider } from '@aave/contract-helpers';
import { formatUserSummary } from '@aave/math-utils';

import { useMemo } from 'react';

import dayjs from 'dayjs';

import { BOB_CHAIN_ID } from '../../config/chains';

import { config } from '../../constants/aave';
import { AaveUserReservesSummary } from '../../utils/aave';
import { useCacheCall } from '../useCacheCall';
import { useAaveReservesData } from './useAaveReservesData';

type UserReservesData = AaveUserReservesSummary | null;

export const useAaveUserReservesData = (): UserReservesData => {
  const provider = config.provider;
  const account = '0xF754D0f4de0e815b391D997Eeec5cD07E59858F0';
  // const { account, provider } = useAccount(); TODO: activate this instead of 2 above once calculations in bob are possible

  const { reserves, reservesData } = useAaveReservesData();

  const uiPoolDataProvider = useMemo(
    () =>
      provider
        ? new UiPoolDataProvider({
            provider,
            uiPoolDataProviderAddress: config.UiPoolDataProviderV3Address,
            chainId: config.chainId,
          })
        : null,
    [provider],
  );

  const { value } = useCacheCall<UserReservesData>(
    'AaveUserReservesData',
    BOB_CHAIN_ID,
    async () => {
      if (!account || !uiPoolDataProvider || !reservesData || !reserves) {
        return null;
      }

      const userReservesData =
        await uiPoolDataProvider.getUserReservesHumanized({
          lendingPoolAddressProvider: config.PoolAddressesProviderAddress,
          user: account,
        });

      return AaveUserReservesSummary.from(
        formatUserSummary({
          currentTimestamp: dayjs().unix(),
          userReserves: userReservesData.userReserves,
          userEmodeCategoryId: userReservesData.userEmodeCategoryId,
          formattedReserves: reserves,
          marketReferenceCurrencyDecimals:
            reservesData.baseCurrencyData.marketReferenceCurrencyDecimals,
          marketReferencePriceInUsd:
            reservesData.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        }),
      );
    },
    [uiPoolDataProvider, reservesData, account, reserves],
    null,
    { ttl: 1000 * 60 },
  );

  return value;
};
