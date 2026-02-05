/** @type {import('next').NextConfig} */
import path from 'path';

// Docker内では /app になります
const projectRoot = process.cwd();

/**
 * Next.js 15/16 対応の共通設定
 */
export const baseNextConfig = {
  // ✅ 1. スタンドアロン出力
  output: 'standalone',

  // ✅ 2.OutputFileTracingRoot は experimental の「外」が現在の正解
  outputFileTracingRoot: projectRoot,

  // ✅ 3. 外部ディレクトリのトランスパイル（重要！）
  transpilePackages: ['@shared'],

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.wp.com' },
      { protocol: 'https', hostname: 's.w.org' },
    ],
  },

  experimental: {
    // ✅ 4. 外部ディレクトリを許可するフラグ
    externalDir: true,
  },

  // ✅ 5. Webpack の解決設定
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // 物理パスを確実に absolute で指定
      '@shared': path.resolve(projectRoot, 'shared'),
    };
    return config;
  },
};

export default baseNextConfig;