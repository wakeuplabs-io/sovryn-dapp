import { useMemo } from 'react';

import { useCurrentChain } from '../../../../../../hooks/useChainStore';
import { useFetch } from '../../../../../../hooks/useFetch';
import { useTokenDetailsByAsset } from '../../../../../../hooks/useTokenDetailsByAsset';
import { getIndexerUri } from '../../../../../../utils/indexer';
import { AmbientPoolCandle } from '../AmbientMarketMaking.types';
import { AmbientLiquidityPool } from '../utils/AmbientLiquidityPool';

export const useGetAmbientPool24Volume = (pool: AmbientLiquidityPool) => {
  const chainId = useCurrentChain();
  const baseToken = useTokenDetailsByAsset(pool.base, pool.chainId);
  const quoteToken = useTokenDetailsByAsset(pool.quote, pool.chainId);

  const { value: candles, loading } = useFetch(
    `${getIndexerUri(chainId)}/pool_candles?base=${baseToken?.address}&quote=${
      quoteToken?.address
    }&poolIdx=${pool.poolIndex}&chainId=${pool.chainId}&n=2&period=86400`,
    undefined,
    baseToken !== undefined &&
      baseToken.address !== undefined &&
      quoteToken !== undefined &&
      quoteToken.address !== undefined,
  );

  const data = useMemo(() => {
    return (candles?.data || [])[0] as AmbientPoolCandle | undefined;
  }, [candles]);

  return {
    data,
    loading,
  };
};