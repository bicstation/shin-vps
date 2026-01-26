/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 独自ドメイン(bicstation.com)の直下で運用するため、basePathは空に設定します。
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // 末尾スラッシュを有効化（URLの正規化）
  trailingSlash: true,

  // Docker環境（standaloneモード）での動作を最適化
  output: 'standalone', 
  reactStrictMode: true,

  images: {
    // 🚩 画像が表示されない問題を解決するために patterns を拡張
    remotePatterns: [
      { protocol: 'https', hostname: 'www.fmv.com' },
      { protocol: 'https', hostname: '**.linksynergy.com' },
      { protocol: 'https', hostname: '**.itmedia.co.jp' },
      { protocol: 'https', hostname: '**.rakuten.co.jp' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      // 💡 あらゆる外部画像ドメインを許可するワイルドカード設定
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },

  // サーバーサイド環境変数
  env: {
    API_URL_INTERNAL: process.env.API_URL_INTERNAL || 'http://django-v2:8000',
  },
};

export default nextConfig;