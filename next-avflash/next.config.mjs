// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // VPS環境（本番/ステージング）では空、ローカル開発時のみ指定するようにする
  basePath: process.env.NODE_ENV === 'production' ? '' : '/avflash',
  // basePath: '/avflash',
  // サーバーサイドでの環境変数を定義
  env: {
    // ✅ 修正：本番環境のコンテナ名に合わせる
    // SSR（サーバーサイドレンダリング）時にコンテナ間通信でDjangoを叩くためのURL
    API_URL_INTERNAL: 'http://django-v2-prod:8000', 
    
    // ブラウザからDjango APIを叩くための公開URL
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api',
  },

  // 🛑 スタンドアロンモード（Dockerでの実行に最適化）
  // もしDockerfileのrunnerステージで起動に失敗する場合は、ここを有効にしてみてください
  output: 'standalone',
};

export default nextConfig;