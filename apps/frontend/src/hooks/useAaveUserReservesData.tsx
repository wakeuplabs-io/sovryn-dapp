import { UiPoolDataProvider } from '@aave/contract-helpers';
import { formatUserSummary } from '@aave/math-utils';

import { useEffect, useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { config } from '../constants/aave';
import { useAaveReservesData } from './useAaveReservesData';
import { useAccount } from './useAccount';
import { AaveUserReservesSummary } from '../utils/aave';

export const useAaveUserReservesData = () => {
  const provider = config.provider;
  const { reserves, reservesData } = useAaveReservesData();
  const { signer } = useAccount();
  const [userReservesSummary, setUserReservesSummary] =
    useState<AaveUserReservesSummary | null>(null);

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

  useEffect(() => {
    const fetchPoolData = async () => {
      if (
        !uiPoolDataProvider ||
        reserves.length === 0 ||
        !signer ||
        !reservesData
      ) {
        return;
      }

      const userReservesData =
        await uiPoolDataProvider.getUserReservesHumanized({
          lendingPoolAddressProvider: config.PoolAddressesProviderAddress,
          user: await signer.getAddress(),
        });

      setUserReservesSummary(
        AaveUserReservesSummary.from(
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
        ),
      );
    };

    fetchPoolData();
  }, [uiPoolDataProvider, reserves, signer, reservesData]);

  return { userReservesSummary };
};
