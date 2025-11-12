import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      colors: {
        level: {
          1: '#8B7355',
          2: '#90EE90',
          3: '#32CD32',
          4: '#228B22',
          5: '#006400',
          6: '#2F4F4F',
          7: '#FFD700',
        },
        badge: {
          basic: '#60A5FA',
          host: '#A78BFA',
          special: '#F59E0B',
          seasonal: '#EC4899',
        },
      },
    },
  },
  plugins: [],
};
export default config;
