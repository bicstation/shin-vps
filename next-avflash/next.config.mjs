/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ 1. basePath の設定
  // ビルド引数 (NEXT_PUBLIC_BASE_PATH) があればそれを使用、なければ空（本番用）
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // 🛑 2. 重要：404回避のための設定（追加必須）
  // これにより、サブディレクトリ運用時のリダイレクト不整合を防ぎます
  trailingSlash: true,

  // サーバーサイド（SSR/SSG）実行時の環境変数を定義
  env: {
    // ✅ SSR時のDjangoコンテナ通信用URL
    // 職場の docker-compose.work.yml ではコンテナ名が django-v2 なので、
    // 環境変数があればそれを使用し、なければデフォルトの django-v2 を参照させます
    API_URL_INTERNAL: process.env.API_URL_INTERNAL || 'http://django-v2:8000', 
    
    // ブラウザからDjango APIを叩くための公開URL
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api',
  },

  // 🛑 3. スタンドアロンモード（Docker実行に必須）
  output: 'standalone',

  // Reactの厳密モード（開発時の品質向上のため推奨）
  reactStrictMode: true,
};

export default nextConfig;