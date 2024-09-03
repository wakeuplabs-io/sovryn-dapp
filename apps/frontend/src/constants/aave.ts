import { ethers } from 'ethers';

import { decimalic } from '../utils/math';

export const config = {
  chainId: 111,
  MinCollateralRatio: decimalic(1.5),
  PoolAddress: '0x7be5F1b198f0c1fd21D426C225Ce02a9DD787930',
  WETHGatewayAddress: '0x34A49CCb345FF2351641F0b807f2352FeB07fff2',
  UiPoolDataProviderV3Address: '0x6D377E4b191AA0A658900DB6FC594Ae765299877',
  PoolAddressesProviderAddress: '0x54C5E489B929a875F66162B3a6A7AEDD9b1F3798',
  VariableDebtWETHAddress: '0xe18D591F3d8aB2Fe573AB20503faB6A02670B709',
  WETHAddress: '0x5546cB953770BA6Aa78FdbaEFB3450F87d97dDBC',

  provider: new ethers.providers.JsonRpcProvider(
    'https://testnet.rpc.gobob.xyz',
  ),
};
