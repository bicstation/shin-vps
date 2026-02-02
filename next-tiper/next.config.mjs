/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

// ESM環境で __dirname をシミュレート
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // =====================================================================
  // 🚀 ルーティング設定 (ドメイン分離・ルート運用)
  // =====================================================================
  // 💡 パターンB: ドメインごとに分けるため、サブパス設定は空文字に固定
  basePath: '', 
  assetPrefix: '', 

  // URLの末尾にスラッシュを強制（Traefikとの整合性とSEOのため）
  trailingSlash: true,

  // Docker環境（standaloneモード）での動作を最適化
  output: 'standalone',

  reactStrictMode: true,

  // =====================================================================
  // 🛠️ ビルド・コンパイル設定 (shared連携)
  // =====================================================================
  // 💡 shared ディレクトリをトランスパイル対象に含める
  transpilePackages: ["shared"],

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // 💡 エイリアスの設定（shared ディレクトリとプロジェクトルート）
      '@shared': path.resolve(__dirname, 'shared'),
      '@': path.resolve(__dirname),
    };
    return config;
  },

  // =====================================================================
  // 🌍 環境変数
  // =====================================================================
  env: {
    // 自身のパス判定用（ドメイン運用の場合は常に空）
    NEXT_PUBLIC_BASE_PATH: '',
    // サーバーサイドでのDjango通信用
    API_URL_INTERNAL: process.env.API_URL_INTERNAL || 'http://django-v2:8000',
    // クライアントサイドでのAPI通信用 (統合ポート8083経由)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api',
  },

  // ビルド中断を防ぐ設定
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // =====================================================================
  // 🖼️ 画像最適化設定 (アフィリエイト・外部画像対応)
  // =====================================================================
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    unoptimized: true,
  },
};

export default nextConfig;