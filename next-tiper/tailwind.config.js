/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // 💡 自分のフォルダだけでなく、隣にあるsharedフォルダもスキャンする
    "../shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // layout.tsxのstyle属性で対応できない細かいTailwindカラー設定があればここへ
      },
    },
  },
  plugins: [],
}