import { useCallback, useEffect, useState } from 'react';

import { useAccount } from '../../../../hooks/useAccount';
import { useLoadContract } from '../../../../hooks/useLoadContract';
import { fromWei } from '../../../../utils/math';

export const useGetSovGain = () => {
  const { account } = useAccount();
  const [sovGain, setSOVGain] = useState('0');

  const stabilityPool = useLoadContract('stabilityPool', 'zero');

  const updateSOVGain = useCallback(async () => {
    const gain = await stabilityPool?.getDepositorSOVGain(account);
    setSOVGain(fromWei(gain.toString()));
  }, [account, stabilityPool]);

  useEffect(() => {
    updateSOVGain();
  }, [updateSOVGain]);

  return {
    sovGain,
    updateSOVGain,
  };
};