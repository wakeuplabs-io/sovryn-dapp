import { ReactNode } from 'react';

import { Align, RowObject } from '../TableBase';

export type ColumnOptions<RowType extends RowObject> = {
  id: keyof RowType | string;
  title?: ReactNode;
  align?: Align;
  className?: string;
  cellRenderer?: (
    row: RowType,
    columnId: ColumnOptions<RowType>['id'],
  ) => ReactNode;
  filter?: ReactNode;
  sortable?: boolean;
  sampleData?: ReactNode;
};

export type TableProps<RowType extends RowObject> = {
  className?: string;
  columns: ColumnOptions<RowType>[];
  rows?: RowType[];
  rowKey?: (row: RowType) => number | string;
  rowTitle?: (row: RowType) => ReactNode;
  noData?: ReactNode;
  onRowClick?: (row: RowType) => void;
  dataAttribute?: string;
  isClickable?: boolean;
  orderOptions?: OrderOptions;
  setOrderOptions?: (sort: OrderOptions) => void;
  isLoading?: boolean;
};

export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type OrderOptions = {
  orderBy?: string;
  orderDirection?: OrderDirection;
};