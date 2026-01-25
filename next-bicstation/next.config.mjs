/** @type {import('next').NextConfig} */
const nextConfig = {
  // 💡 NEXT_PUBLIC_BASE_PATH がセットされていない場合のデフォルトを '/bicstation' にするか
  // もしくは環境変数に確実に含めてください
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/bicstation',

  trailingSlash: true,

  // 🛑 注意：env セクションで NEXT_PUBLIC_... を再定義すると、
  // .env や Docker の引数が無視される原因になるため、ここからは削除を推奨します。
  env: {
    API_URL_INTERNAL: process.env.API_URL_INTERNAL || 'http://django-v2:8000',
    // NEXT_PUBLIC_API_URL は自動的に読み込まれるので、ここには書かないのが安全です
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.fmv.com' },
      { protocol: 'https', hostname: '**.linksynergy.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  output: 'standalone', 
  reactStrictMode: true,
};

export default nextConfig;