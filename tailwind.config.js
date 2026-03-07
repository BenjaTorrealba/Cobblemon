/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'poke-red': '#CC0000',
        'poke-dark': '#0a0a0f',
        'poke-darker': '#050508',
        'poke-surface': '#12121a',
        'poke-surface2': '#1a1a26',
        'poke-border': '#2a2a3d',
        'poke-accent': '#7c3aed',
        'poke-accent2': '#4f46e5',
        'poke-gold': '#f59e0b',
        'poke-green': '#10b981',
        'poke-blue': '#3b82f6',
      },
      fontFamily: {
        display: ['"Press Start 2P"', 'cursive'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #7c3aed, 0 0 10px #7c3aed' },
          '100%': { boxShadow: '0 0 10px #7c3aed, 0 0 25px #7c3aed, 0 0 40px #7c3aed' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
