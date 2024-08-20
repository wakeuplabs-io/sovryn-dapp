import { BigNumber, ethers } from 'ethers';
import {
  Transaction,
  TransactionType,
} from '../../app/3_organisms/TransactionStepDialog/TransactionStepDialog.types';
import { AssetDetailsData } from '@sovryn/contracts';
import { t } from 'i18next';
import { translations } from '../../locales/i18n';
import { prepareApproveTransaction } from '../transactions';

export class AaveSupplyTransactionsFactory {
  private readonly Pool: ethers.Contract;
  private readonly WETHGateway: ethers.Contract;

  constructor(
    private readonly chain: string,
    private readonly PoolAddress: string,
    private readonly WETHGatewayAddress: string,
    private readonly signer: ethers.Signer,
  ) {
    this.Pool = new ethers.Contract(
      this.PoolAddress,
      [
        'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
        'function withdraw(address asset, uint256 amount, address to)',
        'function repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf)',
        'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)',
        'function setUserUseReserveAsCollateral(address asset, bool useAsCollateral)',
      ],
      this.signer,
    );

    this.WETHGateway = new ethers.Contract(
      this.WETHGatewayAddress,
      [
        'function depositETH(address pool, address onBehalfOf, uint16 referralCode) payable',
        'function getWETHAddress() external view returns (address)',
        'function withdrawETH(address pool, uint256 amount, address to)',
        'function repayETH(address pool, uint256 amount, uint256 rateMode, address onBehalfOf) payable',
        'function borrowETH(address pool, uint256 amount, uint256 interestRateMode, uint16 referralCode)',
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
      chain: this.chain,
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
      title: 'Supply', // TODO: translations
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

    return [
      {
        title: t(translations.common.tx.signApproveTitle, {
          symbol: 'ETH', // TODO: find native symbol
        }),
        subtitle: t(translations.common.tx.signApproveTitle, {
          symbol: 'ETH', // TODO: find native symbol
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
