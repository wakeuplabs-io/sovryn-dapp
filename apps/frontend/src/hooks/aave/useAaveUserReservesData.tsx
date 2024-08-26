import { UiPoolDataProvider } from '@aave/contract-helpers';
import { formatReserves, formatUserSummary } from '@aave/math-utils';

import { useCallback, useEffect, useMemo, useState } from 'react';

import dayjs from 'dayjs';

import { config } from '../../constants/aave';
import { AaveUserReservesSummary } from '../../utils/aave/AaveUserReservesSummary';
import { useAccount } from '../useAccount';
import { useBlockNumber } from '../useBlockNumber';

export const useAaveUserReservesData = (): AaveUserReservesSummary | null => {
  const provider = config.provider;
  const { account } = useAccount();
  const [value, setValue] = useState<AaveUserReservesSummary | null>(null);
  const { value: blockNumber } = useBlockNumber();
  const [processedBlock, setProcessedBlock] = useState<number | undefined>();

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

  const loadUserReservesData = useCallback(async () => {
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

    setValue(
      AaveUserReservesSummary.from(
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
      ),
    );
    setProcessedBlock(blockNumber);
  }, [account, uiPoolDataProvider, blockNumber]);

  useEffect(() => {
    if (blockNumber !== processedBlock) {
      loadUserReservesData();
    }
  }, [loadUserReservesData, processedBlock, blockNumber]);

  return value;
};
