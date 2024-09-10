import React, { FC, useState } from 'react';

interface TimeRangeButtonsProps {
  onChange: (range: '1m' | '6m' | '1y') => void;
}

export const TimeRangeButtons: FC<TimeRangeButtonsProps> = ({ onChange }) => {
  const [activeRange, setActiveRange] = useState<'1m' | '6m' | '1y'>('1m');

  const handleClick = (range: '1m' | '6m' | '1y') => {
    setActiveRange(range);
    onChange(range);
  };

  return (
    <div className="flex space-x-2 justify-end mb-4">
      {' '}
      <button
        className={`py-1.5 px-4 rounded-md text-sm font-medium ${
          activeRange === '1m'
            ? 'bg-[#484D59] text-white'
            : 'bg-[#2C303B] text-gray-400'
        }`}
        onClick={() => handleClick('1m')}
      >
        1m
      </button>
      <button
        className={`py-1.5 px-4 rounded-md text-sm font-medium ${
          activeRange === '6m'
            ? 'bg-[#484D59] text-white'
            : 'bg-[#2C303B] text-gray-400'
        }`}
        onClick={() => handleClick('6m')}
      >
        6m
      </button>
      <button
        className={`py-1.5 px-4 rounded-md text-sm font-medium ${
          activeRange === '1y'
            ? 'bg-[#484D59] text-white'
            : 'bg-[#2C303B] text-gray-400'
        }`}
        onClick={() => handleClick('1y')}
      >
        1y
      </button>
    </div>
  );
};
