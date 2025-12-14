// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  // サーバーサイドでの環境変数を定義
  env: {
    // コンテナ内部のネットワーク名とポートでDjango APIを指定
    API_URL_INTERNAL: 'http://django:8000', 
    // 公開用のURL（デプロイ後に変更が必要）
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  // ... その他の設定
};

export default nextConfig;