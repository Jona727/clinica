/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Institucional (Verde / Teal) - Estilo Imagen 2
        brand: {
          50: '#f0f9f8',
          100: '#dcefee',
          200: '#bee0dd',
          300: '#91cac6',
          400: '#5fabab',
          500: '#408f90', // Color principal botones
          600: '#327375',
          700: '#2a5d60',
          800: '#244d50',
          900: '#204144',
        },
        // Paleta Psicología (Cálidos / Tierra) - Estilo Imagen 1
        warm: {
          50: '#faf8f5', // Fondo principal psicología
          100: '#f2ece4',
          200: '#e5d8cb',
          300: '#d5bea9',
          400: '#c59f83',
          500: '#b78564', // Terracota principal
          600: '#ac7254',
          700: '#8e5b45',
          800: '#754d3d',
          900: '#5f4034',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'], // Para dar el toque premium a títulos en psicología
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}
