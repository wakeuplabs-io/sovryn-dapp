import React from 'react';

import { t } from 'i18next';

import { AmountRenderer } from '../../../../2_molecules/AmountRenderer/AmountRenderer';
import { AssetRenderer } from '../../../../2_molecules/AssetRenderer/AssetRenderer';
import { TxIdWithNotification } from '../../../../2_molecules/TxIdWithNotification/TransactionIdWithNotification';
import { translations } from '../../../../../locales/i18n';
import { dateFormat, getBobExplorerUrl } from '../../../../../utils/helpers';
import { RepayHistoryItem } from './AaveCloseWithDepositLoanFrame.types';

export const COLUMNS = [
  {
    id: 'timestamp',
    title: t(translations.common.tables.columnTitles.timestamp),
    cellRenderer: (tx: RepayHistoryItem) => dateFormat(tx.timestamp),
    sortable: true,
  },
  {
    id: 'transactionType',
    title: t(translations.common.tables.columnTitles.transactionType),
    cellRenderer: () => t(translations.borrowHistory.transactionTypes.repay),
  },
  {
    id: 'debtAmount',
    title: t(translations.loanHistory.table.debtRepaid),
    cellRenderer: (tx: RepayHistoryItem) => (
      <div className="inline-flex gap-1 items-center">
        <AmountRenderer
          value={tx.amount}
          precision={2}
          dataAttribute="borrow-new-debt"
        />
        <AssetRenderer asset={tx.reserve.symbol} />
      </div>
    ),
  },
  {
    id: 'transactionID',
    title: t(translations.common.tables.columnTitles.transactionID),
    cellRenderer: (tx: RepayHistoryItem) => (
      <TxIdWithNotification
        href={`${getBobExplorerUrl()}/tx/${tx.hash}`}
        value={tx.hash}
        dataAttribute="transaction-id"
      />
    ),
  },
];
