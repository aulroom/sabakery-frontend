/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crumb: {
          maroon: '#a7191e', // Merah gelap Crumb Theory
          cream: '#fdf7f0',  // Krem latar belakang
          text: '#5c3a21',   // Cokelat gelap untuk teks
          border: '#d4b8a3'  // Warna garis pinggir
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'], 
        sans: ['"Lato"', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}