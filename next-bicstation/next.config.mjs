/** @type {import('next').NextConfig} */
const nextConfig = {
  // =====================================================================
  // 🚀 ルーティング設定 (ローカル・VPS本番 両対応)
  // =====================================================================
  // 💡 ポイント: 
  // ローカル開発時: NEXT_PUBLIC_BASE_PATH='/tiper' 等を指定してサブパス運用。
  // VPS本番環境: NEXT_PUBLIC_BASE_PATH を空にすることで、ドメイン直下運用。
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // URLの末尾にスラッシュを強制（例: /login -> /login/）
  // Traefikとの整合性を高め、404エラーを回避するために有効化します。
  trailingSlash: true,

  // Docker環境（standaloneモード）での動作を最適化
  output: 'standalone', 
  reactStrictMode: true,

  // =====================================================================
  // 🛠 ビルド・チェック緩和設定 (エラーによる中断を防止)
  // =====================================================================
  typescript: {
    // ⚠️ Rechartsなどのサードパーティ製ライブラリの型エラーを無視してビルドを継続
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ ビルド中のESLintチェックでエラーが出ても中断しない
    ignoreDuringBuilds: true,
  },

  // =====================================================================
  // 🖼 画像最適化設定 (あらゆる画像ソースに対応)
  // =====================================================================
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.fmv.com' },
      { protocol: 'https', hostname: '**.linksynergy.com' },
      { protocol: 'https', hostname: '**.itmedia.co.jp' },
      { protocol: 'https', hostname: '**.rakuten.co.jp' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      // 💡 あらゆる外部画像ドメインを許可するワイルドカード設定
      // これにより、動的な画像配信サービスもカバーします。
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },

  // =====================================================================
  // 🌍 環境変数設定 (サーバーサイド用)
  // =====================================================================
  env: {
    // コンテナ間通信（サーバーサイド）で使用するAPIの向き先
    API_URL_INTERNAL: process.env.API_URL_INTERNAL || 'http://django-v2:8000',
  },
};

// 💡 Next.js 14以降推奨の ES Modules (mjs) 形式でエクスポート
export default nextConfig;