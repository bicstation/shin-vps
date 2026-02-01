/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,
  // 💡 sharedディレクトリをコンパイル対象に含める
  transpilePackages: ["shared"],
  output: 'standalone',
  reactStrictMode: true,

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // 💡 実体の構造に合わせて /components まで含める
      '@shared': path.resolve(process.cwd(), 'shared/components'),
      '@': path.resolve(process.cwd()),
    };
    return config;
  },
};

export default nextConfig;