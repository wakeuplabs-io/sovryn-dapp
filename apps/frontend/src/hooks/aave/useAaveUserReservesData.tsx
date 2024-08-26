import { UiPoolDataProvider } from '@aave/contract-helpers';
import { formatReserves, formatUserSummary } from '@aave/math-utils';

import { useEffect, useMemo, useState } from 'react';

import dayjs from 'dayjs';

// import { BOB_CHAIN_ID } from '../../config/chains';
import { config } from '../../constants/aave';
import { AaveUserReservesSummary } from '../../utils/aave/AaveUserReservesSummary';
import { useAccount } from '../useAccount';

// import { useCachedData } from '../useCachedData';

type UserReservesData = AaveUserReservesSummary | null;

export const useAaveUserReservesData = (): UserReservesData => {
  const provider = config.provider;
  const { account } = useAccount();

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

  // const { value } = useCachedData<UserReservesData>(
  //   `AaveUserReservesData/${account}`,
  //   BOB_CHAIN_ID,
  //   async () => {
  //     if (!account || !uiPoolDataProvider) {
  //       return null;
  //     }

  //     const [reservesData, userReservesData] = await Promise.all([
  //       uiPoolDataProvider.getReservesHumanized({
  //         lendingPoolAddressProvider: config.PoolAddressesProviderAddress,
  //       }),
  //       uiPoolDataProvider.getUserReservesHumanized({
  //         lendingPoolAddressProvider: config.PoolAddressesProviderAddress,
  //         user: account,
  //       }),
  //     ]);
  //     const {
  //       marketReferenceCurrencyDecimals,
  //       marketReferenceCurrencyPriceInUsd: marketReferencePriceInUsd,
  //     } = reservesData.baseCurrencyData;
  //     const currentTimestamp = dayjs().unix();

  //     return AaveUserReservesSummary.from(
  //       formatUserSummary({
  //         currentTimestamp,
  //         marketReferencePriceInUsd,
  //         marketReferenceCurrencyDecimals,
  //         userReserves: userReservesData.userReserves,
  //         userEmodeCategoryId: userReservesData.userEmodeCategoryId,
  //         formattedReserves: formatReserves({
  //           currentTimestamp,
  //           marketReferencePriceInUsd,
  //           marketReferenceCurrencyDecimals,
  //           reserves: reservesData.reservesData,
  //         }),
  //       }),
  //     );
  //   },
  //   [uiPoolDataProvider, account],
  //   null,
  //   { ttl: 1000 * 60, fallbackToPreviousResult: true },
  // );

  const [value, setValue] = useState<UserReservesData | null>(null);
  useEffect(() => {
    const compute = async () => {
      if (!account || !uiPoolDataProvider) {
        return null;
      }

      const [reservesData, userReservesData] = await Promise.all([
        uiPoolDataProvider.getReservesHumanized({
          lendingPoolAddressProvider: config.PoolAddressesProviderAddress,
        }),
        uiPoolDataProvider.getUserReservesHumanized({
          lendingPoolAddressProvider: config.PoolAddressesProviderAddress,
          user: account,
        }),
      ]);
      const {
        marketReferenceCurrencyDecimals,
        marketReferenceCurrencyPriceInUsd: marketReferencePriceInUsd,
      } = reservesData.baseCurrencyData;
      const currentTimestamp = dayjs().unix();

      return AaveUserReservesSummary.from(
        formatUserSummary({
          currentTimestamp,
          marketReferencePriceInUsd,
          marketReferenceCurrencyDecimals,
          userReserves: userReservesData.userReserves,
          userEmodeCategoryId: userReservesData.userEmodeCategoryId,
          formattedReserves: formatReserves({
            currentTimestamp,
            marketReferencePriceInUsd,
            marketReferenceCurrencyDecimals,
            reserves: reservesData.reservesData,
          }),
        }),
      );
    };
    compute().then(setValue);
  }, [uiPoolDataProvider, account]);

  return value;
};
