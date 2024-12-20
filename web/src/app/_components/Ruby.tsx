'use client';

import { useKidsMode } from '../_context/KidsModeContext';

type RubyProps = {
  kanji: string;
  ruby: string;
};

export const Ruby = ({ kanji, ruby }: RubyProps) => {
  const { isKidsMode } = useKidsMode();

  return (
    <>
      {isKidsMode ? (
        <ruby>
          {kanji}
          <rt>{ruby}</rt>
        </ruby>
      ) : (
        kanji
      )}
    </>
  );
};
