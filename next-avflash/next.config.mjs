/** @type {import('next').NextConfig} */
import { baseNextConfig } from './shared/next.config.base.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // 1. ベース設定を継承
  ...baseNextConfig,

  // 2. Next.js 15 仕様: スタンドアロン出力設定
  output: 'standalone',
  // Docker環境でのトレーシングを正確にするためのルート設定
  outputFileTracingRoot: path.resolve(__dirname),

  // 3. 外部ディレクトリの参照を許可
  experimental: {
    ...baseNextConfig.experimental,
    externalDir: true,
  },

  // 4. Webpack 設定 (エイリアス解決 + fsエラー対策)
  webpack: (config, { isServer }) => {
    // 🚩 クライアントサイドビルドで Node.js 固有モジュールを無視する設定を追加
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
      '@': path.resolve(__dirname),
    };

    // ベース設定に webpack 設定がある場合はそれを適用
    if (baseNextConfig.webpack) {
      config = baseNextConfig.webpack(config, { isServer });
    }

    return config;
  },

  // 5. ビルド時の安全策 (型エラー等でビルドを止めない)
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