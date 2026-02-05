/** @type {import('next').NextConfig} */
import path from 'path';

// 現在の作業ディレクトリ（Docker内では /app）
const projectRoot = process.cwd();

/**
 * Next.js 16 対応の共通設定
 * Turbopack と Webpack の両方で @shared を正しく解決します
 */
export const baseNextConfig = {
  // ✅ 1. Docker/VPS用のスタンドアロン出力
  output: 'standalone',

  // ✅ 2. 外部ディレクトリ(@shared)をビルド対象に含める
  transpilePackages: ['@shared'],

  // ✅ 3. ビルド高速化 (これらはルート直下でOK)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // ✅ 4. 画像配信の共通許可設定
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.wp.com' },
      { protocol: 'https', hostname: 's.w.org' },
    ],
  },

  // ✅ 5. Next.js 15/16 用の実験的機能設定
  experimental: {
    // モノレポ/Docker用のトレースルート設定 (警告に従いここへ配置)
    outputFileTracingRoot: projectRoot,

    // Turbopack 用の解決設定
    // webpack設定がある場合、ここを明示しないとビルドエラーになります
    turbo: {
      resolveAlias: {
        // インポート文 '@shared/...' を物理パス './shared/...' にマップ
        '@shared': './shared',
      },
    },
  },

  // ✅ 6. 従来の Webpack 用のパス解決 (互換性のために維持)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': path.join(projectRoot, 'shared'),
    };
    return config;
  },
};

export default baseNextConfig;