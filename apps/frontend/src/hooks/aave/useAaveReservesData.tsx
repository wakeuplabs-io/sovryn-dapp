import {
  ReserveDataHumanized,
  ReservesDataHumanized,
  UiPoolDataProvider,
} from '@aave/contract-helpers';
import { formatReserves, FormatReserveUSDResponse } from '@aave/math-utils';

import dayjs from 'dayjs';

import { BOB_CHAIN_ID } from '../../config/chains';

import { config } from '../../constants/aave';
import { useCacheCall } from '../useCacheCall';

export type Reserve = ReserveDataHumanized & FormatReserveUSDResponse;

export type ReserveData = {
  reserves: Reserve[];
  reservesData: ReservesDataHumanized | null;
};

export const useAaveReservesData = (): ReserveData => {
  const provider = config.provider; // TODO: replace with useAccount

  const { value } = useCacheCall<ReserveData>(
    'AaveReservesData',
    BOB_CHAIN_ID,
    async () => {
      const uiPoolDataProvider = new UiPoolDataProvider({
        provider,
        uiPoolDataProviderAddress: config.UiPoolDataProviderV3Address,
        chainId: config.chainId,
      });

      const currentTimestamp = dayjs().unix();
      const reservesData = await uiPoolDataProvider.getReservesHumanized({
        lendingPoolAddressProvider: config.PoolAddressesProviderAddress,
      });
      const reserves = reservesData.reservesData.filter(r =>
        config.assetsWhitelist.includes(r.symbol),
      );
      const formattedReserves = formatReserves({
        reserves,
        currentTimestamp,
        marketReferenceCurrencyDecimals:
          reservesData.baseCurrencyData.marketReferenceCurrencyDecimals,
        marketReferencePriceInUsd:
          reservesData.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      });

      return {
        reserves: formattedReserves,
        reservesData: {
          baseCurrencyData: reservesData.baseCurrencyData,
          reservesData: reserves,
        },
      };
    },
    [],
    { reserves: [], reservesData: null },
    { ttl: 1000 * 60 },
  );

  return value;
};
