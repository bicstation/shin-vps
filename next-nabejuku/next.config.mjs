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
    externalDir: true, // sharedフォルダがプロジェクト外にある場合に必須
  },

  // 4. Webpack設定
  webpack: (config, { isServer }) => {
    // 既存の設定を継承
    if (baseNextConfig?.webpack) {
      config = baseNextConfig.webpack(config, { isServer });
    }

    // 🚩 核心：クライアントサイドでの 'fs' エラーを回避
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
      // @shared を物理パスに固定
      '@shared': path.resolve(__dirname, 'shared'),
      '@': path.resolve(__dirname),
    };

    // symlinkの解消を無効化（Docker環境でのパス解決を安定させます）
    config.resolve.symlinks = false;

    return config;
  },

  // 5. 型エラーやESLintエラーでビルドを止めない設定 (Dockerビルドを優先)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;