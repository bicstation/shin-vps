/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/bicstation',
  // サーバーサイド（SSR/SSG）実行時の環境変数を定義
  env: {
    // ✅ 修正：Djangoコンテナのホスト名
    // Docker内部ネットワークでDjangoと通信するためのURLです。
    // ステージングと共存するため、本番用コンテナ名を指定します。
    API_URL_INTERNAL: 'http://django-v2-prod:8000', 
    
    // 公開用API URL（ブラウザからアクセスする用）
    // docker-compose.ymlの環境変数を優先し、なければデフォルト値を使用
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // 🛑 重要：Dockerでのビルド・デプロイを安定させる設定
  // 依存関係を最小限にまとめて起動を速くします
  output: 'standalone', 
  
  // Reactの厳密モード（必要に応じて）
  reactStrictMode: true,
};

export default nextConfig;