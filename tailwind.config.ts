import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        panel: 'var(--panel)',
        grid: 'var(--grid)',
        line: 'var(--line)',
        glow: 'var(--glow)',
        dim: 'var(--dim)',
        ember: 'var(--ember)',
      },
      fontFamily: {
        serif: ['var(--serif)'],
        sans: ['var(--sans)'],
      },
      transitionTimingFunction: {
        scene: 'cubic-bezier(0.22, 0.61, 0.24, 1)',
      },
      transitionDuration: {
        scene: '760ms',
      },
    },
  },
  plugins: [],
};

export default config;
