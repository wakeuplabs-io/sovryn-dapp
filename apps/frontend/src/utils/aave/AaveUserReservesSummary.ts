import { ReserveDataHumanized } from '@aave/contract-helpers';
import {
  FormatReserveUSDResponse,
  FormatUserSummaryResponse,
} from '@aave/math-utils';

import { BigNumber, ethers } from 'ethers';

import { AssetDetailsData, getAssetData } from '@sovryn/contracts';
import { Decimal } from '@sovryn/utils';
import { Reserve } from '../../hooks/aave/useAaveReservesData';
import { BOB_CHAIN_ID } from '../../config/chains';
import { decimalic, fromWei } from '../math';
import { AaveCalculations } from './AaveCalculations';

export type UserSummary = FormatUserSummaryResponse<
  ReserveDataHumanized & FormatReserveUSDResponse
>;

export type AssetBalance = {
  asset: AssetDetailsData;
  balance: BigNumber;
  balanceDecimal: Decimal;
};

export enum LoanType {
  STABLE = 1,
  VARIABLE = 2,
}

export type ReserveSummary = {
  reserve: Reserve;
  asset: string;

  walletBalance: Decimal;
  walletBalanceUsd: Decimal;
  collateral: boolean;
  supplied: Decimal;
  suppliedUSD: Decimal;
  borrowed: Decimal;
  borrowedUSD: Decimal;
  borrowMode: LoanType;
  availableToBorrow: Decimal;
};

export type AaveUserReservesSummary = {
  netApy: Decimal;
  netWorth: Decimal;
  healthFactor: Decimal;
  collateralRatio: Decimal;

  supplyBalance: Decimal;
  supplyWeightedApy: Decimal;
  collateralBalance: Decimal;
  currentLiquidationThreshold: Decimal;

  borrowBalance: Decimal;
  borrowWeightedApy: Decimal;
  borrowPower: Decimal;
  borrowPowerUsed: Decimal;
  eModeEnabled: boolean;
  eModeCategoryId: number;

  reserves: ReserveSummary[];
};

export class AaveUserReservesSummaryFactory {
  static buildZeroSummary(reserves: Reserve[]): AaveUserReservesSummary {
    return {
      netApy: Decimal.ZERO,
      netWorth: Decimal.ZERO,
      healthFactor: Decimal.ZERO,
      collateralRatio: Decimal.ZERO,

      supplyBalance: Decimal.ZERO,
      supplyWeightedApy: Decimal.ZERO,
      collateralBalance: Decimal.ZERO,
      currentLiquidationThreshold: Decimal.ZERO,

      borrowBalance: Decimal.ZERO,
      borrowWeightedApy: Decimal.ZERO,
      borrowPower: Decimal.ZERO,
      borrowPowerUsed: Decimal.ZERO,
      eModeEnabled: false,
      eModeCategoryId: 0,

      reserves: reserves.map(r => ({
        reserve: r,
        asset: r.symbol,

        walletBalance: Decimal.ZERO,
        walletBalanceUsd: Decimal.ZERO,
        collateral: false,
        supplied: Decimal.ZERO,
        suppliedUSD: Decimal.ZERO,
        availableToSupply: Decimal.ZERO,
        borrowed: Decimal.ZERO,
        borrowedUSD: Decimal.ZERO,
        borrowMode: LoanType.VARIABLE,
        availableToBorrow: Decimal.ZERO,
      })),
    };
  }

  static async buildSummary(
    provider: ethers.providers.Provider,
    account: string,
    userSummary: UserSummary,
  ): Promise<AaveUserReservesSummary> {
    const netWorth = Decimal.from(userSummary.netWorthUSD);
    const borrowBalance = Decimal.from(userSummary.totalBorrowsUSD);
    const supplyBalance = AaveCalculations.computeSuppliedBalance(
      userSummary.userReservesData,
    );
    const collateralBalance = AaveCalculations.computeCollateral(
      userSummary.userReservesData,
    );
    const supplyWeightedApy = AaveCalculations.computeWeightedSupplyApy(
      userSummary.userReservesData,
    );
    const borrowWeightedApy = AaveCalculations.computeWeightedBorrowApy(
      userSummary.userReservesData,
    );
    const netApy = AaveCalculations.computeNetApy(
      supplyWeightedApy,
      supplyBalance,
      borrowWeightedApy,
      borrowBalance,
      netWorth,
    );

    // health and borrow status
    const currentLiquidationThreshold = Decimal.from(
      userSummary.currentLiquidationThreshold,
    );
    const borrowPower = AaveCalculations.computeBorrowPower(
      Decimal.from(userSummary.availableBorrowsUSD),
      borrowBalance,
    );
    const borrowPowerUsed = AaveCalculations.computeBorrowPowerUsed(
      borrowBalance,
      borrowPower,
    );
    const healthFactor = AaveCalculations.computeHealthFactor(
      collateralBalance,
      currentLiquidationThreshold,
      borrowBalance,
    );
    const collateralRatio = AaveCalculations.computeCollateralRatio(
      collateralBalance,
      borrowBalance,
    );

    return {
      netApy,
      netWorth,
      healthFactor,
      collateralRatio,

      supplyBalance,
      supplyWeightedApy,
      collateralBalance,
      currentLiquidationThreshold,

      borrowBalance,
      borrowWeightedApy,
      borrowPower,
      borrowPowerUsed,
      eModeEnabled: userSummary.userEmodeCategoryId !== 0,
      eModeCategoryId: userSummary.userEmodeCategoryId,

      reserves: await Promise.all(
        userSummary.userReservesData.map(async r => {
          const asset = await getAssetData(r.reserve.symbol, BOB_CHAIN_ID);
          const balance = await getBalance(asset, account, provider);
          const decimalBalance = decimalic(fromWei(balance, asset.decimals));

          const supplied = Decimal.from(r.underlyingBalance)
          const suppliedUSD = Decimal.from(r.underlyingBalanceUSD)

          const borrowed = Decimal.from(r.totalBorrows)
          const borrowedUSD = Decimal.from(r.totalBorrowsUSD)

          const availableToBorrow = borrowPower.div(r.reserve.priceInUSD);

          return {
            asset: r.reserve.symbol,
            reserve: r.reserve,

            walletBalance: decimalBalance,
            walletBalanceUsd: decimalBalance.mul(r.reserve.priceInUSD),
            collateral: r.usageAsCollateralEnabledOnUser,
            supplied,
            suppliedUSD,
            borrowed,
            borrowedUSD,
            borrowMode: Decimal.from(r.variableBorrows).gt(0)
              ? LoanType.VARIABLE
              : LoanType.STABLE,
            availableToBorrow,
          };
        }),
      ),
    };
  }
}

function getBalance(
  asset: AssetDetailsData,
  account: string,
  provider: ethers.providers.Provider,
): Promise<BigNumber> {
  return asset.isNative
    ? provider.getBalance(account)
    : asset.contract(provider).balanceOf(account);
}
