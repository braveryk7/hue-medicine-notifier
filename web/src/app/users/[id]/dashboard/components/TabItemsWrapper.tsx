import React from 'react';

export const TabItemsWrapper = ({ children }: { children: React.ReactElement }) => {
  return <div className="rounded-lg px-2 pt-4 md:col-span-1 md:!mt-0">{children}</div>;
};
