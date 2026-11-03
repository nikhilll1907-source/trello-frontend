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
          bg: '#0B1220',      // Deep midnight navy background
          sidebar: '#0A101B', // Dark navy sidebar
          card: '#141E2D',    // Cards and panels
          elevated: '#192536',// Elevated surfaces & inputs
          border: '#29374A',  // Subtle navy-gray border
          hover: '#1E2D42',   // Hover state on elevated surfaces
        },
        primary: {
          DEFAULT: '#2675F5', // Vivid controlled blue
          hover: '#1B63D8',
          light: 'rgba(38, 117, 245, 0.15)',
          subtle: 'rgba(38, 117, 245, 0.08)',
        },
        surface: {
          bg: '#0B1220',
          card: '#141E2D',
          elevated: '#192536',
          border: '#29374A',
          hover: '#1E2D42',
        },
        text: {
          main: '#E8EDF5',     // Soft white
          secondary: '#A3B1C5',// Muted blue-gray
          muted: '#64748B',    // Dim muted
        },
        status: {
          success: '#10B981', // Restrained emerald green
          warning: '#F59E0B', // Muted amber
          error: '#EF4444',   // Controlled red
          info: '#2675F5',
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
