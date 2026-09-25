/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050505',
        'ink-2': '#0B0B0C',
        'ink-3': '#131315',
        bone: '#F2EEE7',
        muted: '#8B8782',
        'muted-2': '#5C5955',
        saffron: '#E8833A',
        vermilion: '#9E2B18',
        teal: '#2F6F63',
      },
      fontFamily: {
        display: ['"Inter Tight"', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.055em',
        widest2: '0.32em',
      },
      transitionTimingFunction: {
        cine: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
