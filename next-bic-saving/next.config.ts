// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 環境変数は env オブジェクト内で定義
  // process.env.NEXT_PUBLIC_API_URL を直接参照する
  env: {
    // コンテナ内部のネットワーク名とポートでDjango APIを指定
    API_URL_INTERNAL: 'http://django:8000', 
    // 公開用のURL（環境変数 NEXT_PUBLIC_API_URL が設定されていなければ http://localhost:8000 をデフォルトとして使用）
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  // ... その他の設定
};

export default nextConfig;