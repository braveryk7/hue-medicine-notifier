'use client';

import Link from 'next/link';
import { useKidsMode } from '../_context/KidsModeContext';

export const Footer = () => {
  const { isKidsMode } = useKidsMode();

  if (isKidsMode) {
    return null; // キッズモードが有効の場合は非表示
  }

  return (
    <footer className="fixed inset-x-0 bottom-0 flex items-center justify-center bg-gray-200 md:min-h-10">
      <p>
        <Link href="/admin">管理モード</Link>
      </p>
    </footer>
  );
};
