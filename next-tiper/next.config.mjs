/** @type {import('next').NextConfig} */
// ✅ 相対パスの先頭に ./ を明示
import { baseNextConfig } from './shared/next.config.base.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  ...baseNextConfig,

  output: 'standalone',

  experimental: {
    ...baseNextConfig.experimental,
    externalDir: true, // 👈 これが命！
  },

  webpack: (config, { isServer }) => {
    // baseNextConfig の webpack 設定を安全に継承
    if (baseNextConfig && typeof baseNextConfig.webpack === 'function') {
      config = baseNextConfig.webpack(config, { isServer });
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      // ✅ @shared を絶対パスで確実に紐付け
      '@shared': path.resolve(__dirname, 'shared'),
    };

    return config;
  },
};

export default nextConfig;