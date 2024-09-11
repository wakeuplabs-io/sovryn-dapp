import { utils } from 'ethers';

import { Decimal } from '@sovryn/utils';

import { calculateUtilizationRate, isBetweenZeroAndOne } from './utils';

describe('hooks/aave/utils', () => {
  describe('calculateUtilizationRate', () => {
    it('should calculate utilization rate correctly', () => {
      const decimals = 18;
      const totalDebt = '500'; // 500 units of debt
      const availableLiquidity = utils.parseUnits('500', decimals).toString(); // 500 units of liquidity

      const result = calculateUtilizationRate(
        decimals,
        totalDebt,
        availableLiquidity,
      );

      // Utilization rate should be 0.5 (since debt and liquidity are equal)
      expect(result.toString()).toBe('0.5');
    });

    it('should return 0 if total supply is zero', () => {
      const decimals = 18;
      const totalDebt = '0';
      const availableLiquidity = '0';

      const result = calculateUtilizationRate(
        decimals,
        totalDebt,
        availableLiquidity,
      );

      expect(result.toString()).toBe('0'); // Utilization rate should be 0 when there's no supply
    });

    it('should calculate utilization rate close to 1', () => {
      const decimals = 18;
      const totalDebt = '1000'; // 1000 units of debt
      const availableLiquidity = utils.parseUnits('1', decimals).toString(); // 1 unit of liquidity

      const result = calculateUtilizationRate(
        decimals,
        totalDebt,
        availableLiquidity,
      );

      // Utilization rate should be close to 1
      expect(result.gte(Decimal.from('0.999'))).toBe(true);
    });
  });

  describe('isBetweenZeroAndOne', () => {
    it('should return true for value between 0 and 1', () => {
      const value = Decimal.from('0.5');
      expect(isBetweenZeroAndOne(value)).toBe(true);
    });

    it('should return false for value greater than 1', () => {
      const value = Decimal.from('1.1');
      expect(isBetweenZeroAndOne(value)).toBe(false);
    });

    it('should return true for value exactly 0', () => {
      const value = Decimal.from('0');
      expect(isBetweenZeroAndOne(value)).toBe(true);
    });

    it('should return true for value exactly 1', () => {
      const value = Decimal.from('1');
      expect(isBetweenZeroAndOne(value)).toBe(true);
    });
  });
});
