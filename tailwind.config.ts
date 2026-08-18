import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vintage Narrative System
        'surface': 'var(--surface)',
        'surface-dim': 'var(--surface-dim)',
        'surface-bright': 'var(--surface-bright)',
        'surface-container-lowest': 'var(--surface-container-lowest)',
        'surface-container-low': 'var(--surface-container-low)',
        'surface-container': 'var(--surface-container)',
        'surface-container-high': 'var(--surface-container-high)',
        'surface-container-highest': 'var(--surface-container-highest)',
        'on-surface': 'var(--on-surface)',
        'on-surface-variant': 'var(--on-surface-variant)',
        'inverse-surface': 'var(--inverse-surface)',
        'inverse-on-surface': 'var(--inverse-on-surface)',
        'outline': 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',
        'primary': 'var(--primary)',
        'on-primary': 'var(--on-primary)',
        'primary-container': 'var(--primary-container)',
        'on-primary-container': 'var(--on-primary-container)',
        'inverse-primary': 'var(--inverse-primary)',
        'secondary': 'var(--secondary)',
        'on-secondary': 'var(--on-secondary)',
        'secondary-container': 'var(--secondary-container)',
        'on-secondary-container': 'var(--on-secondary-container)',
        'tertiary': 'var(--tertiary)',
        'on-tertiary': 'var(--on-tertiary)',
        'tertiary-container': 'var(--tertiary-container)',
        'on-tertiary-container': 'var(--on-tertiary-container)',
        'error': 'var(--error)',
        'on-error': 'var(--on-error)',
        'error-container': 'var(--error-container)',
        'on-error-container': 'var(--on-error-container)',
        'background': 'var(--background)',
        'on-background': 'var(--on-background)',
        'surface-tint': 'var(--surface-tint)',
        'surface-variant': 'var(--surface-variant)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
        handwritten: ["'Be Vietnam Pro'", 'sans-serif'],
      },
      borderRadius: {
        'sm': '2px',
        DEFAULT: '2px',
        'md': '4px',
        'lg': '6px',
        'xl': '8px',
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
      animation: {
        'pin-pulse': 'pin-pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'heart-burst': 'heart-burst 0.65s ease-out forwards',
      },
      keyframes: {
        'pin-pulse': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(3.5)', opacity: '0' },
        },
        'heart-burst': {
          '0%': { transform: 'scale(0) rotate(-15deg)', opacity: '1' },
          '50%': { transform: 'scale(1.4) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1.2) rotate(0deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
