import type React from 'next';
import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { Refresh } from './_components/Refresh';
import { KidsModeProvider } from './_context/KidsModeContext';
import { ToggleKidsMode } from './_components/ToggleKidsMode';
import { Title } from './_components/Title';

const defaultFont = Noto_Sans_JP({
  subsets: ['latin'],
  weight: '400',
});

const title = 'お薬飲んでないとブチギレるゾ';

export const metadata: Metadata = {
  title,
  description: 'Generated by create next app',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/x-icon',
      },
      {
        url: '/icon512_maskable.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="font-bold text-slate-700">
      <body className={`${defaultFont.className} flex min-h-screen flex-col antialiased`}>
        <KidsModeProvider>
          <Refresh />
          <Title />
          <ToggleKidsMode />
          {children}
        </KidsModeProvider>
      </body>
    </html>
  );
}
