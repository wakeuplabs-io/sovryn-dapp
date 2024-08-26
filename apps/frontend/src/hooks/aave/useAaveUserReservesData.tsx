import { UiPoolDataProvider } from '@aave/contract-helpers';
import { formatReserves, formatUserSummary } from '@aave/math-utils';

import { useCallback, useEffect, useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { BigNumber } from 'ethers';

import { getAssetData } from '@sovryn/contracts';
import { Decimal } from '@sovryn/utils';

import { BOB_CHAIN_ID } from '../../config/chains';

import { config } from '../../constants/aave';
import {
  AaveUserReservesSummary,
  AssetBalance,
} from '../../utils/aave/AaveUserReservesSummary';
import { decimalic, fromWei } from '../../utils/math';
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
    if (!account || !uiPoolDataProvider || !provider || !blockNumber) {
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

    const balances: AssetBalance[] = await Promise.all(
      reservesData.reservesData.map(async r => {
        const asset = await getAssetData(r.symbol, BOB_CHAIN_ID);

        try {
          const balance = asset.isNative
            ? await provider.getBalance(account)
            : await asset.contract(provider).balanceOf(account);

          return {
            asset,
            balance: BigNumber.from(balance),
            balanceDecimal: decimalic(
              fromWei(balance.toString(), asset.decimals),
            ),
          };
        } catch (e) {
          return {
            asset,
            balance: BigNumber.from(0),
            balanceDecimal: Decimal.ZERO,
          };
        }
      }),
    );

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
        balances,
      ),
    );
    setProcessedBlock(blockNumber);
  }, [account, uiPoolDataProvider, blockNumber, provider]);

  useEffect(() => {
    if (blockNumber !== processedBlock) {
      loadUserReservesData();
    }
  }, [loadUserReservesData, processedBlock, blockNumber]);

  return value;
};
