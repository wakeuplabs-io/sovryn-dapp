import { useEffect, useState } from 'react';

import { Contract } from 'ethers/lib/ethers';
import { Subscription } from 'zen-observable-ts';

import { getTokenDetails } from '@sovryn/contracts';
import { SupportedTokens } from '@sovryn/contracts';
import { getProvider } from '@sovryn/ethers-provider';

import { useBlockNumber } from '../../../../hooks/useBlockNumber';
import {
  idHash,
  CacheCallResponse,
  observeCall,
  startCall,
} from '../../../../store/rxjs/provider-cache';
import { getRskChainId } from '../../../../utils/chain';
import { EcosystemDataType } from '../types';

export const useGetAssetBalanceByAddress = (
  asset: SupportedTokens,
  contractAddress: string,
  chainId = getRskChainId(),
): CacheCallResponse<string> => {
  const { value: block } = useBlockNumber(chainId);
  const [state, setState] = useState<CacheCallResponse<string>>({
    value: '0',
    loading: false,
    error: null,
  });

  useEffect(() => {
    let sub: Subscription;
    const getBalance = async () => {
      const tokenDetails = await getTokenDetails(asset, chainId);
      const hashedArgs = idHash([
        tokenDetails.address,
        EcosystemDataType.balanceOf,
        contractAddress,
      ]);

      sub = observeCall(hashedArgs).subscribe(e => setState(e.result));

      const callback = () => {
        return new Contract(
          tokenDetails.address,
          tokenDetails.abi,
          getProvider(chainId),
        ).balanceOf(contractAddress);
      };
      startCall(hashedArgs, callback, {
        ttl: 1000 * 30,
        fallbackToPreviousResult: true,
      });
    };
    getBalance().catch(e => setState({ value: '0', loading: false, error: e }));

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [asset, chainId, contractAddress, block]);

  return { ...state, value: state.value === null ? '0' : state.value };
};