/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ baseNextConfig をインポート。もしこれが原因で落ちる場合は
// このファイル内に直接設定を書き込むのが最も安全です。
import { baseNextConfig } from './shared/next.config.base.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  ...baseNextConfig,

  output: 'standalone',

  // ✅ 追加: Next.js 15系では transpilePackages を指定するのが最も確実です
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

    config.resolve.alias = {
      ...config.resolve.alias,
      // ✅ 絶対パスでの紐付けは Webpack ビルドにおいて最強の解決策です
      '@shared': path.resolve(__dirname, 'shared'),
      '@': path.resolve(__dirname, './'),
    };

    return config;
  },
};

export default nextConfig;