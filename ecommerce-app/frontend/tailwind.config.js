/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Escapement design tokens — see docs/architecture design brief.
        // Deliberately cool blue-black + steel, NOT the warm-cream/terracotta
        // or near-black/neon combos that read as generic AI-generated design.
        ink: {
          950: '#15191E', // page background
        },
        steel: {
          800: '#1F262C', // card/surface background
          500: '#4A555E', // hairlines, dividers, disabled states
        },
        mist: {
          100: '#E7EAEC', // primary text
        },
        brass: {
          400: '#B8935A', // primary accent — brushed brass, not shiny gold
        },
        tick: {
          red: '#B23A2F', // used sparingly: the one red seconds-hand touch
        },
      },
      fontFamily: {
        // Display: geometric/technical, deliberately NOT a serif — every
        // luxury watch logotype is a serif, so this is the clearest signal
        // that Escapement is an engineering brand, not a jewelry brand.
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        // Used for EVERY real measurement (42mm, 100m, 42h, 28,800vph) —
        // consistently, everywhere a spec appears. Not a style choice, a rule.
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};