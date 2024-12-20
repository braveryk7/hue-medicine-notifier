'use client';

import Link from 'next/link';
import { useKidsMode } from '../_context/KidsModeContext';
import { Ruby } from './Ruby';

export const Title = () => {
  const { isKidsMode } = useKidsMode();

  return (
    <h1 className="py-4 text-center text-lg md:py-12 md:text-2xl">
      <Link href="/">
        {isKidsMode ? (
          <>
            お<Ruby kanji="薬" ruby="くすり" />
            のもうね！
          </>
        ) : (
          'お薬飲んでないとブチギレるゾ'
        )}
      </Link>
    </h1>
  );
};
