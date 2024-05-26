import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  plugins: [typography],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            div: false,
            'code::before': false,
            'code::after': false,
            'blockquote p:first-of-type::before': false,
            'blockquote p:last-of-type::after': false,
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter, Inter var',
          'ui-sans-serif',
          '-apple-system',
          'system-ui',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '10xl': '10rem',
        '11xl': '12rem',
      },
      colors: {
        bg: '#040709',
        primary: '#0EA5E9',
        shadow: '#A7C6D3',
        secondary: '#6366F1',
        error: '#F87171',
        warning: '#FBBF24',
        accent: '#10B91D',
        text: '#E8F0F4',
        description: '#757575',
      },
      animation: {
        spotlight: 'spotlight 2s ease .75s 1 forwards',
      },
      keyframes: {
        spotlight: {
          '0%': {
            opacity: '0',
            transform: 'translate(-72%, -62%) scale(0.5)',
          },
          '100%': {
            opacity: '1',
            transform: 'translate(-50%,-40%) scale(1)',
          },
        },
      },
    },
  },
} satisfies Config
