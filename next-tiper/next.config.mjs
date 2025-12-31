/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ 1. サブディレクトリ運用のための設定
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  // 🛑 重要：サブディレクトリ運用時の404エラーを回避
  trailingSlash: true,

  // 2. 画像許可設定（そのまま維持）
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
    // ✅ 修正：職場のコンテナ名 (django-v2) と本番の両方に対応
    API_URL_INTERNAL: process.env.API_URL_INTERNAL || 'http://django-v2:8000', 
    
    // 公開用のAPI URL（職場PCのTraefik経由をデフォルトに）
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api/',
  },

  // 4. Dockerビルド最適化（必須）
  output: 'standalone',

  reactStrictMode: true,
};

export default nextConfig;