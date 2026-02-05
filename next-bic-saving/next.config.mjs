/** @type {import('next').NextConfig} */
import { baseNextConfig } from './shared/next.config.base.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // 1. 共通設定をマージ
  ...baseNextConfig,

  // 2. Dockerビルドに必須の設定
  output: 'standalone',

  // 3. Next.js 15/16 で外部フォルダを認識させる最重要設定
  experimental: {
    ...baseNextConfig?.experimental,
    externalDir: true, // sharedフォルダがプロジェクト外(..)にある場合に必須
  },

  // 4. Webpackエイリアスの設定
  webpack: (config, { isServer }) => {
    // 既存の設定を継承
    if (baseNextConfig?.webpack) {
      config = baseNextConfig.webpack(config, { isServer });
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      // @shared を物理パスに固定
      '@shared': path.resolve(__dirname, 'shared'),
    };

    // symlinkの解消を無効化（Docker環境でのパス解決を安定させます）
    config.resolve.symlinks = false;

    return config;
  },
};

export default nextConfig;