/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

// ESM環境で __dirname をシミュレート
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // 💡 ホスト名運用(tiper-host)では basePath は空にする必要があります
  // 環境変数 NEXT_PUBLIC_BASE_PATH が設定されている場合はこれを無効化します
  basePath: '', 

  trailingSlash: true,

  // 💡 sharedディレクトリをコンパイル対象に含める
  transpilePackages: ["shared"],

  // Docker/VPS運用に必須の設定
  output: 'standalone',

  reactStrictMode: true,

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // 💡 エイリアスを shared のルートに設定（importしやすくなります）
      '@shared': path.resolve(__dirname, 'shared'),
      '@': path.resolve(__dirname),
    };
    return config;
  },

  // 💡 ホスト名チェックの緩和（Invalid Host Header 対策）
  // 開発環境で tiper-host 等を使用する場合に必要になることがあります
  devIndicators: {
    buildActivity: true,
  },
};

export default nextConfig;