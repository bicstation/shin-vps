/** @type {import('next').NextConfig} */

// ✅ 1. basePath の決定
// ローカル開発時に /avflash 等のサブディレクトリで動かす場合は環境変数で指定
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  // 🚀 2. ベースパス設定（ローカル/本番切り替え対応）
  basePath: basePath,

  // 🛑 3. 重要：404回避とリダイレクト整合性
  // サブディレクトリ運用（localhost/avflash/）でも、本番（avflash.xyz/）でも
  // パスの末尾にスラッシュを付与してルーティングを安定させます
  trailingSlash: true,

  // 📦 4. スタンドアロンモード（Docker 本番環境に必須）
  output: 'standalone',

  // 🔧 5. 環境変数の公開（サーバー/クライアント両用）
  env: {
    // SSR時のDjangoコンテナ通信用（内部ネットワーク）
    API_URL_INTERNAL: process.env.API_URL_INTERNAL || 'http://django-v2:8000',
    // クライアントサイドでのAPI通信用（公開URL）
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://avflash.xyz/api',
    // 自身のベースパスをJS側でも参照可能にする
    NEXT_PUBLIC_BASE_PATH: basePath,
  },

  // 🖼️ 6. 画像最適化設定（MGS等の外部アフィリエイト画像表示用）
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mgs.jp', // MGSのアフィリエイト画像
      },
      {
        protocol: 'https',
        hostname: '**.mgstage.com', // MGStageのサムネイル
      },
      {
        protocol: 'https',
        hostname: '**.dmm.co.jp', // (参考) DMMなどの他ASP併用時用
      },
    ],
    // Docker環境でのビルド時間を短縮し、ライブラリ依存エラーを防ぐ設定
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // ⚡ 7. パフォーマンス・品質設定
  reactStrictMode: true,
  swcMinify: true,

  // 🛡️ 8. セキュリティヘッダー（アダルトサイトの信頼性向上）
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;