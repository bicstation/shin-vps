/** @type {import('next').NextConfig} */
import { baseNextConfig } from './shared/next.config.base.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM環境で __dirname を再現するための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // 1. 共通設定（shared/next.config.base.mjs）をマージ
  ...baseNextConfig,

  // 2. Dockerビルド（standalone）の設定
  output: 'standalone',

  // 3. Next.js 15 で外部の shared フォルダを許可する設定
  experimental: {
    ...baseNextConfig.experimental,
    externalDir: true,
  },

  // 4. Webpackによるエイリアスの強制紐付け（Module not found 対策の核心）
  webpack: (config, { isServer }) => {
    // 既存の webpack 設定があれば継承
    if (baseNextConfig.webpack) {
      config = baseNextConfig.webpack(config, { isServer });
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      // @shared を物理的な ./shared フォルダに固定
      '@shared': path.resolve(__dirname, 'shared'),
    };

    return config;
  },
};

export default nextConfig;