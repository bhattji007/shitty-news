import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // The channel's approved palette. Nobody approved it. There is nobody left.
        ink: '#0A0A0C',
        'ink-raised': '#111116',
        'ink-line': '#1E1E24',
        broadcast: '#E5484D',
        newsprint: '#E8E6E1',
        'newsprint-dim': '#8C8A86',
        crt: '#3DD68C',
      },
      fontFamily: {
        serif: ['var(--font-headline)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'tired-blink': {
          '0%, 41%, 44%, 71%, 100%': { opacity: '1' },
          '42%, 43%': { opacity: '0.15' },
          '72%, 78%': { opacity: '0.2' },
        },
        'scanline-drift': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'ticker-slide': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'static-flicker': {
          '0%, 100%': { opacity: '0' },
          '10%, 30%, 50%, 70%': { opacity: '0.85' },
          '20%, 40%, 60%': { opacity: '0.2' },
        },
        'signal-drop': {
          '0%, 100%': { opacity: '1', transform: 'translateX(0)' },
          '50%': { opacity: '0.6', transform: 'translateX(-1px)' },
        },
      },
      animation: {
        'tired-blink': 'tired-blink 4.7s infinite steps(1, end)',
        'scanline-drift': 'scanline-drift 7s linear infinite',
        'static-flicker': 'static-flicker 0.5s steps(2, end) infinite',
        'signal-drop': 'signal-drop 3.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
