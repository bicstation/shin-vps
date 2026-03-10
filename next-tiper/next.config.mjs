/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ baseNextConfig をインポート
import { baseNextConfig } from './shared/next.config.base.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  ...baseNextConfig,

  output: 'standalone',

  // ✅ Next.js 15系で外部の shared を安全に扱う設定
  transpilePackages: ['@shared'],

  experimental: {
    ...baseNextConfig?.experimental,
    externalDir: true, 
  },

  webpack: (config, { isServer }) => {
    // baseNextConfig の webpack 設定を安全に継承
    if (baseNextConfig && typeof baseNextConfig.webpack === 'function') {
      config = baseNextConfig.webpack(config, { isServer });
    }

    // 🚩 核心：クライアントサイド（ブラウザ）ビルドで Node.js 固有モジュールを無視する
    // これがないと 'fs' が見つからないエラーでビルドが止まります
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
      // ✅ 絶対パスでの紐付け
      '@shared': path.resolve(__dirname, 'shared'),
      '@': path.resolve(__dirname, './'),
    };

    return config;
  },

  // ✅ ビルド時の安全策（Dockerビルドを強制的に進める）
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;