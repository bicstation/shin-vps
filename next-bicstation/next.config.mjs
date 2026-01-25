/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 独自ドメイン(bicstation.com)の直下で運用するため、basePathは空に設定します。
  // これによりローカル(localhost:3000/)と本番の両方で整合性が取れます。
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // 末尾スラッシュを有効化（URLの正規化）
  trailingSlash: true,

  // Docker環境（standaloneモード）での動作を最適化
  output: 'standalone', 
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.fmv.com' },
      { protocol: 'https', hostname: '**.linksynergy.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  // サーバーサイド環境変数
  env: {
    API_URL_INTERNAL: process.env.API_URL_INTERNAL || 'http://django-v2:8000',
  },
};

export default nextConfig;