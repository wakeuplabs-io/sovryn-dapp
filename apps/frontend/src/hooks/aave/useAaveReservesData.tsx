import {
  ReserveDataHumanized,
  UiPoolDataProvider,
} from '@aave/contract-helpers';
import { formatReserves, FormatReserveUSDResponse } from '@aave/math-utils';

import { useEffect, useMemo, useState } from 'react';

import dayjs from 'dayjs';

import { config } from '../../constants/aave';

// import { BOB_CHAIN_ID } from '../../config/chains';
// import { useAccount } from '../useAccount';
// import { useCachedData } from '../useCachedData';

export type Reserve = ReserveDataHumanized & FormatReserveUSDResponse;

export type ReserveData = Reserve[];

export const useAaveReservesData = (): ReserveData => {
  const provider = config.provider; // TODO: replace with useAccount. Circular dependency error...

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

  // const { value } = useCachedData<ReserveData>(
  //   'AaveReservesData',
  //   BOB_CHAIN_ID,
  //   async () => {
  //     if (!uiPoolDataProvider) {
  //       return [];
  //     }

  //     const currentTimestamp = dayjs().unix();
  //     const reservesData = await uiPoolDataProvider.getReservesHumanized({
  //       lendingPoolAddressProvider: config.PoolAddressesProviderAddress,
  //     });
  //     const reserves = reservesData.reservesData.filter(r =>
  //       config.assetsWhitelist.includes(r.symbol),
  //     );
  //     const formattedReserves = formatReserves({
  //       reserves,
  //       currentTimestamp,
  //       marketReferenceCurrencyDecimals:
  //         reservesData.baseCurrencyData.marketReferenceCurrencyDecimals,
  //       marketReferencePriceInUsd:
  //         reservesData.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  //     });

  //     return formattedReserves;
  //   },
  //   [uiPoolDataProvider],
  //   [],
  //   { ttl: 1000 * 60, fallbackToPreviousResult: true },
  // );

  const [value, setValue] = useState<ReserveData>([]);
  useEffect(() => {
    const compute = async () => {
      if (!uiPoolDataProvider) {
        return [];
      }

      const currentTimestamp = dayjs().unix();
      const reservesData = await uiPoolDataProvider.getReservesHumanized({
        lendingPoolAddressProvider: config.PoolAddressesProviderAddress,
      });
      const formattedReserves = formatReserves({
        reserves: reservesData.reservesData,
        currentTimestamp,
        marketReferenceCurrencyDecimals:
          reservesData.baseCurrencyData.marketReferenceCurrencyDecimals,
        marketReferencePriceInUsd:
          reservesData.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      });

      return formattedReserves;
    };
    compute().then(setValue);
  }, [uiPoolDataProvider]);

  return value;
};
