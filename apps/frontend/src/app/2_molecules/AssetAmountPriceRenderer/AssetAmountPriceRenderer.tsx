import React, { FC } from 'react';

import classNames from 'classnames';

import { Decimal, Decimalish } from '@sovryn/utils';

import { AmountRenderer } from '../AmountRenderer/AmountRenderer';

type AssetAmountPriceRendererProps = {
  asset: string;
  value: Decimalish;
  valueUSD?: Decimalish;
  className?: string;
  valueClassName?: string;
  priceClassName?: string;
};

export const AssetAmountPriceRenderer: FC<AssetAmountPriceRendererProps> = ({
  asset,
  value,
  valueUSD,
  className,
  valueClassName,
  priceClassName,
}) => {
  // TODO: get price in usd
  const usdPrice = valueUSD ?? Decimal.from(0);

  return (
    <div className={className ?? 'flex flex-col text-right space-y-1'}>
      <AmountRenderer
        value={value}
        suffix={asset}
        className={valueClassName}
        precision={2}
      />
      <AmountRenderer
        value={usdPrice}
        prefix={'$'}
        precision={2}
        className={classNames(
          'text-gray-40 text-xs font-medium',
          priceClassName,
        )}
      />
    </div>
  );
};
