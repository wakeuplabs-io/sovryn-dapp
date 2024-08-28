import React, { FC, useMemo, useState } from 'react';

import { t } from 'i18next';

import {
  Button,
  ErrorBadge,
  ErrorLevel,
  Paragraph,
  Select,
  SimpleTable,
  SimpleTableRow,
} from '@sovryn/ui';
import { Decimal } from '@sovryn/utils';

import { config } from '../../../../../../../../../constants/aave';
import { translations } from '../../../../../../../../../locales/i18n';
import { CollateralRatioHealthBar } from '../../../../../CollateralRatioHealthBar/CollateralRatioHealthBar';

type EnableEModeFormProps = {};

const categories = [
  { label: 'Stablecoins', categoryId: 1, availableAssets: ['USDC', 'USDT'] },
];

export const EnableEModeForm: FC<EnableEModeFormProps> = () => {
  const [category, setCategory] = useState(String(categories[0].categoryId));

  const categoriesOptions = useMemo(() => {
    return categories.map(category => ({
      label: category.label,
      value: String(category.categoryId),
    }));
  }, []);

  const selectedCategory = useMemo(() => {
    return categories.find(c => c.categoryId === Number(category));
  }, [category]);

  const confirmEnabled = useMemo(() => {
    return true;
  }, []);

  const positionsInOtherCategories = useMemo(() => {
    return false;
  }, []);

  return (
    <div className="space-y-6">
      <ErrorBadge
        level={ErrorLevel.Warning}
        message={t(translations.aavePage.eMode.limitationsWarning)}
        dataAttribute="limitations-warning"
      />

      <div>
        <Paragraph className="mb-1 text-gray-30 font-medium text-xs">
          {t(translations.aavePage.eMode.selectCategory)}
        </Paragraph>

        <Select
          value={category}
          onChange={setCategory}
          options={categoriesOptions}
          className="w-full"
        />
      </div>

      <CollateralRatioHealthBar
        ratio={Decimal.from(1.5)}
        minimum={config.MinCollateralRatio}
      />

      <SimpleTable>
        <SimpleTableRow
          label={t(translations.aavePage.eMode.availableAssets)}
          value={selectedCategory?.availableAssets.join(', ')}
        />
        <SimpleTableRow
          label={t(translations.aavePage.eMode.maxLoanToValue)}
          value={''}
        />
      </SimpleTable>

      {positionsInOtherCategories && (
        <ErrorBadge
          level={ErrorLevel.Critical}
          message={t(translations.aavePage.eMode.positionsMustBeClosed, {
            category,
          })}
          dataAttribute="positions-must-be-closed-error"
        />
      )}

      <Button
        className="w-full"
        disabled={!confirmEnabled}
        text={t(translations.common.buttons.confirm)}
        onClick={async () => {}}
      />
    </div>
  );
};
