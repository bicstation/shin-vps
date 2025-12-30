/** @type {import('next').NextConfig} */
const nextConfig = {
  // VPS環境（本番/ステージング）では空、ローカル開発時のみ指定するようにする
  // 1. サブディレクトリ運用のための設定
  basePath: process.env.NODE_ENV === 'production' ? '' : '/tiper',
  // basePath: '/tiper',
  
  // 2. 画像許可設定
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pics.dmm.co.jp' },
      { protocol: 'https', hostname: 'dg-pics.duga.jp' },
      { protocol: 'https', hostname: 'www.duga.jp' },
      { protocol: 'http', hostname: '**.linkshare.ne.jp' },
      { protocol: 'https', hostname: '**.linkshare.ne.jp' },
    ],
  },

  // 3. 環境変数
  env: {
    API_URL_INTERNAL: 'http://django-v2-prod:8000', 
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api',
  },

  // 4. Dockerビルド最適化
  output: 'standalone',

  reactStrictMode: true,
};

export default nextConfig;