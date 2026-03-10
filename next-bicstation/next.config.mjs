/** @type {import('next').NextConfig} */
import { baseNextConfig } from './shared/next.config.base.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM環境で __dirname を再現するための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // 1. 共通設定をマージ
  ...baseNextConfig,

  // 2. Dockerビルド（standalone）の設定
  output: 'standalone',

  // 3. 外部の shared フォルダを許可
  experimental: {
    ...baseNextConfig.experimental,
    externalDir: true,
  },

  // 4. Webpack設定（エイリアス設定 + Node.jsモジュールの回避）
  webpack: (config, { isServer }) => {
    // 既存の webpack 設定を継承
    if (baseNextConfig.webpack) {
      config = baseNextConfig.webpack(config, { isServer });
    }

    // 🚩 クライアントサイドでの Node.js モジュールエラー（fs等）を回避
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
        os: false,
        net: false,
        tls: false,
      };
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