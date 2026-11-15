/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          bg: 'rgb(var(--color-canvas) / <alpha-value>)',
          sidebar: 'rgb(var(--color-sidebar) / <alpha-value>)',
          card: 'rgb(var(--color-column) / <alpha-value>)',
          elevated: 'rgb(var(--color-surface) / <alpha-value>)',
          border: 'rgb(var(--color-border) / var(--color-border-opacity))',
          hover: 'rgb(var(--color-surface-hover) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          light: 'rgb(var(--color-accent) / 0.15)',
          subtle: 'rgb(var(--color-accent) / 0.08)',
        },
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        surface: {
          bg: 'rgb(var(--color-canvas) / <alpha-value>)',
          card: 'rgb(var(--color-column) / <alpha-value>)',
          elevated: 'rgb(var(--color-surface) / <alpha-value>)',
          border: 'rgb(var(--color-border) / var(--color-border-opacity))',
          hover: 'rgb(var(--color-surface-hover) / <alpha-value>)',
        },
        text: {
          main: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        },
        status: {
          success: '#10B981', // Restrained emerald green
          warning: '#F59E0B', // Muted amber
          error: '#EF4444',   // Controlled red
          info: 'rgb(var(--color-accent) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
      },
    },
  },
  plugins: [],
}
