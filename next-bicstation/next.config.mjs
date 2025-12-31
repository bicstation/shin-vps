/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ ビルド引数で渡されたパス、または空（VPS本番用）を使用
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // 🛑 重要：404回避のための設定
  trailingSlash: true,

  // サーバーサイド（SSR/SSG）実行時の環境変数を定義
  env: {
    // 職場のコンテナ名に合わせる
    API_URL_INTERNAL: process.env.API_URL_INTERNAL || 'http://django-v2:8000', 
    
    // 公開用API URL
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Docker用設定
  output: 'standalone', 
  
  reactStrictMode: true,
};

// .mjs ファイルなので export default を使用します
export default nextConfig;