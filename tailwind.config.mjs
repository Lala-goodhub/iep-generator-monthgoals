/** @type {import('tailwindcss').Config} */
const config = { // 👈 'const config =' 100% 맞습니까?
  content: [
    // ⭐️ (이 부분이 '제일' 중요합니다!) ⭐️
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // 👈 '큰따옴표', '점', '/', '*', '{ }' 100% 똑같습니까?

    // (보험 🛡️용 ㅋ)
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ], // 👈 ']' (대괄호 닫기) + ',' (쉼표!) 100% 있습니까?
  theme: {
    extend: {
      colors: {
        'pastel-bg': '#e0f2fe', 
        'pastel-blue': '#38bdf8',
        'pastel-green': '#22c55e',
      }
    },
  },
  plugins: [],
}; // 👈 '};' (중괄호 닫기 + 세미콜론!) 100% 있습니까?

export default config; // 👈 'export default config;' 100% 맞습니까?