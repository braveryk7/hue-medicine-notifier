import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: ['text-yellow-500'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      animation: {
        trainMove: 'trainMove 4s ease-in-out forwards',
      },
      keyframes: {
        trainMove: {
          '0%': { left: '-60%' },
          '100%': { left: '130%' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
