/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#060913', // Deep navy / near-black
        surface: '#131B2F', // Slightly lighter dark navy
        surfaceHover: '#1E2A47',
        primary: '#00F0FF', // Electric blue / cyan
        success: '#10B981', // Teal / green for positive / savings
        warning: '#F59E0B', // Amber / orange for action / price-drop
        textPrimary: '#F8FAFC', // Soft white
        textSecondary: '#94A3B8', // Cool gray
        border: '#1E293B', // Subtle dark blue-gray
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
