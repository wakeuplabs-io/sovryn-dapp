import { BigNumber, constants, ethers } from 'ethers';
import { t } from 'i18next';

import { AssetDetailsData, getAssetDataByAddress } from '@sovryn/contracts';

import { BOB_CHAIN_ID } from '../../config/chains';

import {
  Transaction,
  TransactionType,
} from '../../app/3_organisms/TransactionStepDialog/TransactionStepDialog.types';
import { translations } from '../../locales/i18n';
import { prepareApproveTransaction } from '../transactions';

export class AaveSupplyTransactionsFactory {
  private readonly Pool: ethers.Contract;
  private readonly WETHGateway: ethers.Contract;

  constructor(
    private readonly PoolAddress: string,
    private readonly WETHGatewayAddress: string,
    private readonly signer: ethers.Signer,
  ) {
    this.Pool = new ethers.Contract(
      this.PoolAddress,
      [
        'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
      ],
      this.signer,
    );

    this.WETHGateway = new ethers.Contract(
      this.WETHGatewayAddress,
      [
        'function depositETH(address pool, address onBehalfOf, uint16 referralCode) payable',
      ],
      this.signer,
    );
  }

  async supply(
    token: AssetDetailsData,
    amount: BigNumber,
  ): Promise<Transaction[]> {
    if (token.isNative) return this.supplyNative(amount);
    else return this.supplyToken(token, amount);
  }

  private async supplyToken(
    asset: AssetDetailsData,
    amount: BigNumber,
  ): Promise<Transaction[]> {
    const approval = await prepareApproveTransaction({
      spender: this.PoolAddress,
      token: asset.symbol,
      contract: asset.contract(),
      amount: amount,
      chain: BOB_CHAIN_ID,
    });
    const transactions: Transaction[] = approval ? [approval] : [];

    const fnName = 'supply';
    const args = [
      asset.address,
      amount.toString(),
      await this.signer.getAddress(),
      0,
    ];
    const gasEstimate = await this.Pool.estimateGas[fnName](...args);
    transactions.push({
      title: t(translations.aavePage.tx.supplyTitle, {
        symbol: asset.symbol,
      }),
      subtitle: t(translations.aavePage.tx.supplySubtitle, {
        symbol: asset.symbol,
      }),
      request: {
        type: TransactionType.signTransaction,
        args: args,
        contract: this.Pool,
        fnName,
        gasPrice: (await this.signer.getGasPrice()).toString(),
        gasLimit: gasEstimate.toString(),
        value: 0,
      },
    });

    return transactions;
  }

  private async supplyNative(amount: BigNumber): Promise<Transaction[]> {
    const fnName = 'depositETH';
    const args = [this.PoolAddress, await this.signer.getAddress(), 0];
    const gasEstimate = await this.Pool.estimateGas[fnName](...args, {
      value: amount.toString(),
    });

    const nativeAsset = await getAssetDataByAddress(
      constants.AddressZero,
      BOB_CHAIN_ID,
    );

    return [
      {
        title: t(translations.aavePage.tx.supplyTitle, {
          symbol: nativeAsset.symbol,
        }),
        subtitle: t(translations.aavePage.tx.supplySubtitle, {
          symbol: nativeAsset.symbol,
        }),
        request: {
          type: TransactionType.signTransaction,
          args: args,
          contract: this.WETHGateway,
          fnName,
          gasPrice: (await this.signer.getGasPrice()).toString(),
          gasLimit: gasEstimate.toString(),
          value: amount.toString(),
        },
      },
    ];
  }
}
