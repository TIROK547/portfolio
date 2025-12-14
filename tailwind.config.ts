import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: {
            dark: '#1e2326',      // Everforest dark
            light: '#fdf6e3',     // Warm light
          },
          text: {
            dark: '#d3c6aa',      // Everforest foreground (warm beige)
            light: '#1e2326',
          },
          accent: {
            blue: '#7fbbb3',      // Everforest blue (teal-ish) - PRIMARY for commands
            magenta: '#d699b6',   // Everforest magenta (pink/purple) - For prompts
            cyan: '#83c092',      // Everforest cyan (greenish)
            green: '#a7c080',     // Everforest green
            yellow: '#dbbc7f',    // Everforest yellow
            red: '#e67e80',       // Everforest red
            orange: '#e69875',    // Everforest orange
            purple: '#d699b6',    // Same as magenta for purple
            pink: '#d699b6',      // Same as magenta
          }
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'typing': 'typing 2s steps(40, end)',
        'blink': 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' }
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      }
    },
  },
  plugins: [],
};
export default config;
