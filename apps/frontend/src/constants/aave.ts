import { ethers } from 'ethers';

import { decimalic } from '../utils/math';

export const config = {
  chainId: 111,
  MinCollateralRatio: decimalic(1.5),
  PoolAddress: '0x026df3c3541Fe9f0BD115e5d53f7E14BB77eE8E3',
  WETHGatewayAddress: '0x71E59321878A080166BaD09DC811d7F825cFCc62',
  VariableDebtWETHAddress: '0xF51f7a40d5b2B890B13Cc288379ad067023cc61c',
  UiPoolDataProviderV3Address: '0xDdea07591341A68602af48F2f0422f1d72BF57e3',
  PoolAddressesProviderAddress: '0x5620417792cC0dbc33BF707D20b63146F676Bb9D',
  assetsWhitelist: ['DAI', 'USDC', 'USDT', 'BTC', 'WETH', 'EURS'], // TODO: review this

  provider: new ethers.providers.JsonRpcProvider(
    'https://testnet.rpc.gobob.xyz',
  ),
};
