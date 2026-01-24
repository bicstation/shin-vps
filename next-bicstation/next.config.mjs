/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ ビルド引数で渡されたパス、または空（VPS本番用）を使用
  // NEXT_PUBLIC_BASE_PATH が "/bicstation" なら、URLは /bicstation/ranking/ になります
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // 🛑 重要：404回避のための設定
  trailingSlash: true,

  // サーバーサイド（SSR/SSG）実行時の環境変数を定義
  env: {
    API_URL_INTERNAL: process.env.API_URL_INTERNAL || 'http://django-v2:8000', 
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083',
  },

  // 🖼️ 画像ドメインの許可設定
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.fmv.com' },
      { protocol: 'https', hostname: '**.linksynergy.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  // Docker用設定
  output: 'standalone', 
  
  reactStrictMode: true,
};

export default nextConfig;