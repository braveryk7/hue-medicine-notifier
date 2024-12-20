'use client';
import React, { useState } from 'react';
import { TabItemsWrapper } from './TabItemsWrapper';

type TabItem = {
  label: string;
  component: React.ReactElement;
};

type TabProps = {
  children: {
    [key: string]: TabItem;
  };
};

export const Tab = ({ children }: TabProps) => {
  const [activeTab, setActiveTab] = useState('task');

  const activeTabStyle = 'border-blue-500 border-b-2 font-bold';
  const colSpan = `col-span-${Object.keys(children).length}`;

  return (
    <div className="rounded-lg border bg-gray-50 p-4 md:col-span-1">
      <div className="flex justify-center px-4">
        {Object.entries(children).map(([key, child]) => {
          return (
            <span
              key={key}
              className={`p-2 ${colSpan} ${activeTab === key && activeTabStyle}`}
              onClick={() => {
                setActiveTab(key);
              }}
            >
              {child.label}
            </span>
          );
        })}
      </div>
      <TabItemsWrapper>{children[activeTab].component}</TabItemsWrapper>
    </div>
  );
};
