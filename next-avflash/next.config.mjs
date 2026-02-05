/** @type {import('next').NextConfig} */
import { baseNextConfig } from './shared/next.config.base.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // 1. ベース設定を継承
  ...baseNextConfig,

  // 2. Next.js 15/16 仕様: experimental の外に出すべき設定を上書き
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname),

  // 3. 外部ディレクトリの参照を強制許可
  experimental: {
    ...baseNextConfig.experimental,
    externalDir: true,
    // 警告の原因となる古いキーを確実に排除（念のため）
    outputFileTracingRoot: undefined, 
  },

  // 4. Webpack エイリアスの強制解決
  // Docker内の絶対パス /app/shared を @shared に紐付けます
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': path.resolve(__dirname, 'shared'),
      '@': path.resolve(__dirname),
    };
    return config;
  },

  // 5. ビルド時の安全策
  typescript: {
    ...baseNextConfig.typescript,
    ignoreBuildErrors: true,
  },
  eslint: {
    ...baseNextConfig.eslint,
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;