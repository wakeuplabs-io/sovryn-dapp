import React, { FC, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Heading, Select, SelectOption, Tabs } from '@sovryn/ui';

import { TransactionHistoryFrame } from '../../3_organisms';
import { translations } from '../../../locales/i18n';
import styles from './HistoryPage.module.css';

const ACTIVE_CLASSNAME = 'border-t-primary-30';
const locHistory = (
  <div className="px-0 py-4 lg:p-4">
    <TransactionHistoryFrame />
  </div>
);

const HistoryPage: FC = () => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const comingSoon = useMemo(
    () => (
      <div className="px-4 py-12 rounded my-4 lg:rounded-none lg:my-0 flex flex-row justify-center bg-gray-80">
        <Heading className="inline">
          {t(translations.historyPage.table.comingSoon)}
        </Heading>
      </div>
    ),
    [t],
  );

  const items = useMemo(
    () => [
      {
        label: t(translations.historyPage.table.tabs.lineOfCredit),
        content: locHistory,
        activeClassName: ACTIVE_CLASSNAME,
        dataAttribute: 'loc',
      },
      {
        label: t(translations.historyPage.table.tabs.stability),
        content: comingSoon,
        activeClassName: ACTIVE_CLASSNAME,
        dataAttribute: 'stability',
      },
      {
        label: t(translations.historyPage.table.tabs.convert),
        content: comingSoon,
        activeClassName: ACTIVE_CLASSNAME,
        dataAttribute: 'conversion',
      },
      {
        label: t(translations.historyPage.table.tabs.funding),
        content: comingSoon,
        activeClassName: ACTIVE_CLASSNAME,
        dataAttribute: 'funding',
      },
    ],
    [t, comingSoon],
  );

  const options: SelectOption[] = useMemo(
    () =>
      items.map((item, index) => ({ value: String(index), label: item.label })),
    [items],
  );

  return (
    <div className="w-full text-gray-10 mt-9 lg:mt-10">
      <Heading className="text-center lg:mb-10 lg:text-2xl">
        {t(translations.historyPage.title)}
      </Heading>
      <div className="w-full">
        <div className={styles.mobileSelect}>
          <Select
            options={options}
            value={String(index)}
            onChange={value => setIndex(Number(value))}
          />
        </div>
        <div className={styles.desktop}>
          <Tabs
            items={items}
            onChange={setIndex}
            index={index}
            className="w-full"
          />
        </div>
        <div className={styles.mobile}>{items[index].content}</div>
      </div>
    </div>
  );
};

export default HistoryPage;