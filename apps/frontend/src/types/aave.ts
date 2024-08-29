import { Decimal } from '@sovryn/utils';

export type TransactionFactoryOptions = { onComplete?: () => void };

export type EModeCategory = {
  id: number;
  label: string;
  ltv: Decimal;
  liquidationThreshold: Decimal;
  liquidationBonus: Decimal;
  assets: string[];
};

export enum BorrowRateMode {
  STABLE = 1,
  VARIABLE = 2,
}
