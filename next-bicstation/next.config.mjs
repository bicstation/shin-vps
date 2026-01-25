/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 本番(VPS)では '/bicstation'、ローカルでは '' (空) になるよう環境変数で制御
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // 末尾スラッシュを統一（SEOおよびパス解決の安定化）
  trailingSlash: true,

  // Docker環境での動作を最適化
  output: 'standalone', 
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.fmv.com' },
      { protocol: 'https', hostname: '**.linksynergy.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  // クライアント・サーバー両方で参照する変数
  env: {
    API_URL_INTERNAL: process.env.API_URL_INTERNAL || 'http://django-v2:8000',
  },
};

export default nextConfig;