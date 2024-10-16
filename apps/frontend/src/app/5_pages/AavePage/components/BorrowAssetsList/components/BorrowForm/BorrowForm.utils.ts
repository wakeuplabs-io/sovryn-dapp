import { MINIMUM_COLLATERAL_RATIO_LENDING_POOLS } from '../../../../../../../constants/lending';

export const getCollateralRatioThresholds = () => {
  const minimumCollateralRatio =
    MINIMUM_COLLATERAL_RATIO_LENDING_POOLS.mul(100);

  return {
    START: minimumCollateralRatio.mul(0.9).toNumber(),
    MIDDLE_START: minimumCollateralRatio.toNumber() - 0.1,
    MIDDLE_END: minimumCollateralRatio.mul(1.2).toNumber(),
    END: minimumCollateralRatio.mul(1.6).toNumber(),
  };
};
