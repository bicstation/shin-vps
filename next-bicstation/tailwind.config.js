/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // もし /shared/components など他のディレクトリも使っているならここに追加してください
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 必要に応じてここにフォントサイズやカラーのカスタマイズを追加できます
    },
  },
  plugins: [
    // 💡 Markdownの見た目を劇的に綺麗にするプラグインを追加
    require('@tailwindcss/typography'),
  ],
}