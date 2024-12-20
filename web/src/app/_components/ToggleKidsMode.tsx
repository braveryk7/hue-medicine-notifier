'use client';

import { useKidsMode } from '../_context/KidsModeContext';
import { Toggle } from './Toggle';

export const ToggleKidsMode = () => {
  const { isKidsMode, toggleKidsMode } = useKidsMode();

  return (
    <div
      className="
        fixed bottom-0 flex w-full items-center justify-center gap-2 rounded bg-rose-100 p-2 py-4
        shadow-md md:right-12 md:top-12 md:h-4 md:w-40 md:bg-gray-100 
      "
    >
      <span className="text-sm font-semibold">キッズモード</span>
      <Toggle id={0} isChecked={isKidsMode} handleToggle={() => toggleKidsMode()} />
    </div>
  );
};
