/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 既存の画像許可設定 (FANZA / DUGA 等)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pics.dmm.co.jp' },
      { protocol: 'https', hostname: 'dg-pics.duga.jp' },
      { protocol: 'https', hostname: 'www.duga.jp' },
      { protocol: 'http', hostname: '**.linkshare.ne.jp' },
      { protocol: 'https', hostname: '**.linkshare.ne.jp' },
    ],
  },

  // 2. サーバーサイド（SSR/SSG）実行時の環境変数を定義
  env: {
    // ✅ 修正：新しい本番用Djangoコンテナ名に合わせる
    // これにより、SSR時にDjangoからデータを正しく取得できるようになります
    API_URL_INTERNAL: 'http://django-v2-prod:8000', 
    
    // 公開用URL（ブラウザ側で使用）
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api',
  },

  // 3. 🛑 Dockerビルド最適化設定
  // 依存関係をコンパクトにまとめ、Docker環境での起動を安定させます
  output: 'standalone',

  // Reactの厳密モード
  reactStrictMode: true,
};

export default nextConfig;