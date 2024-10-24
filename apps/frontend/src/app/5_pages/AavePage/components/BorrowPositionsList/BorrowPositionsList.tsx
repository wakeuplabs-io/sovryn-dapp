import React, { FC, useCallback, useMemo, useState } from 'react';

import { t } from 'i18next';

import {
  Accordion,
  Dialog,
  DialogBody,
  DialogHeader,
  OrderDirection,
  OrderOptions,
  Paragraph,
  Table,
} from '@sovryn/ui';
import { Decimal } from '@sovryn/utils';

import { AaveRowTitle } from '../../../../2_molecules/AavePoolRowTitle/AavePoolRowTitle';
import { useAccount } from '../../../../../hooks/useAccount';
import { translations } from '../../../../../locales/i18n';
import { sortRowsByOrderOptions } from '../../AavePage.utils';
import { PoolPositionStat } from '../PoolPositionStat/PoolPositionStat';
import { COLUMNS_CONFIG } from './BorrowPositionsList.constants';
import { BorrowPosition } from './BorrowPositionsList.types';
import { BorrowPositionDetails } from './components/BorrowPositionDetails/BorrowPositionDetails';
import { EfficiencyModeCard } from './components/EfficiencyModeCard/EfficiencyModeCard';
import { RepayForm } from './components/RepayForm/RepayForm';

const pageTranslations = translations.aavePage;

type BorrowPositionsListProps = {
  borrowPositions: BorrowPosition[];
  borrowBalance: Decimal;
  borrowWeightedApy: Decimal;
  borrowPowerUsed: Decimal;
  eModeCategoryId: Number;
  loading: boolean;
};

export const BorrowPositionsList: FC<BorrowPositionsListProps> = ({
  borrowPositions,
  borrowBalance,
  borrowPowerUsed,
  borrowWeightedApy,
  eModeCategoryId,
  loading,
}) => {
  const { account } = useAccount();
  const [open, setOpen] = useState(true);
  const [orderOptions, setOrderOptions] = useState<OrderOptions>({
    orderBy: 'asset',
    orderDirection: OrderDirection.Desc,
  });
  const [repayAssetDialog, setRepayAssetDialog] = useState<string>();

  const onRepayClose = useCallback(() => setRepayAssetDialog(undefined), []);

  const rowTitleRenderer = useCallback(
    (r: BorrowPosition, isOpen?: boolean) => (
      <AaveRowTitle
        isOpen={isOpen}
        asset={r.asset}
        value={r.borrowed}
        suffix={r.asset}
        precision={2}
      />
    ),
    [],
  );

  const mobileRenderer = useCallback(
    p => (
      <BorrowPositionDetails
        position={p}
        onRepayClick={() => setRepayAssetDialog(p.asset)}
      />
    ),
    [setRepayAssetDialog],
  );

  const rows = useMemo(
    () => sortRowsByOrderOptions(orderOptions, borrowPositions),
    [orderOptions, borrowPositions],
  );

  if (!account) {
    return (
      <div className="bg-gray-70 px-4 py-3 rounded lg:bg-gray-90 lg:pb-6 lg:px-6 lg:pt-3 lg:border lg:border-gray-60">
        <div className="text-base font-medium text-left py-[6px] lg:pt-2 lg:pb-3 lg:flex lg:items-center lg:gap-8">
          <span>{t(pageTranslations.borrowPositionsList.title)}</span>
        </div>

        <div className="flex items-center justify-center lg:h-12">
          <Paragraph className="text-xs text-center text-gray-30 italic font-medium leading-5 lg:text-white">
            {t(pageTranslations.common.connectWallet)}
          </Paragraph>
        </div>
      </div>
    );
  }

  return (
    <Accordion
      label={
        <div className="text-base font-medium text-left lg:flex lg:items-center lg:gap-8">
          <span>{t(pageTranslations.borrowPositionsList.title)}</span>
          <div className="hidden lg:flex gap-3">
            <span className="text-gray-30 font-medium text-sm">
              {t(pageTranslations.borrowPositionsList.eMode)}
            </span>
            <EfficiencyModeCard eModeCategoryId={eModeCategoryId} />
          </div>
        </div>
      }
      className="bg-gray-70 px-4 py-3 rounded space-y-3 lg:bg-gray-90 lg:p-6 lg:border lg:border-gray-60"
      labelClassName="justify-between  lg:h-7 flex items-center"
      open={open}
      onClick={setOpen}
    >
      {rows.length ? (
        <>
          <EfficiencyModeCard
            eModeCategoryId={eModeCategoryId}
            className="lg:hidden mb-3"
          />
          <div className="flex flex-col gap-2 mb-2 lg:flex-row lg:gap-6 lg:mb-6">
            <PoolPositionStat
              label={t(pageTranslations.common.balance)}
              value={borrowBalance}
              prefix="$"
              precision={2}
            />
            <PoolPositionStat
              label={t(pageTranslations.common.apy)}
              labelInfo={t(pageTranslations.borrowPositionsList.apyInfo)}
              value={borrowWeightedApy}
              suffix="%"
              precision={2}
            />
            <PoolPositionStat
              label={t(pageTranslations.borrowPositionsList.borrowPowerUsed)}
              labelInfo={t(
                pageTranslations.borrowPositionsList.borrowPowerUsedInfo,
              )}
              value={borrowPowerUsed}
              suffix="%"
              precision={2}
            />
          </div>
        </>
      ) : null}

      <Table
        isLoading={loading}
        columns={COLUMNS_CONFIG(setRepayAssetDialog)}
        rowClassName="bg-gray-80"
        accordionClassName="bg-gray-60 border border-gray-70"
        rowTitle={rowTitleRenderer}
        mobileRenderer={mobileRenderer}
        rows={rows}
        orderOptions={orderOptions}
        setOrderOptions={setOrderOptions}
        noData={
          <span className="text-gray-30 text-xs italic lg:text-white">
            {t(pageTranslations.borrowPositionsList.noData)}
          </span>
        }
      />

      <Dialog disableFocusTrap isOpen={!!repayAssetDialog}>
        <DialogHeader
          title={t(translations.aavePage.repayModal.title)}
          onClose={onRepayClose}
        />
        <DialogBody className="space-y-3">
          <RepayForm asset={repayAssetDialog!} onComplete={onRepayClose} />
        </DialogBody>
      </Dialog>
    </Accordion>
  );
};
