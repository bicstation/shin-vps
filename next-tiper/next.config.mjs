// next-tiper/next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 外部サーバーの画像を next/image で表示するための許可設定
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pics.dmm.co.jp', // FANZA (DMM) の商品画像
      },
      {
        protocol: 'https',
        hostname: 'dg-pics.duga.jp', // DUGA の商品画像
      },
      {
        protocol: 'https',
        hostname: 'www.duga.jp', // DUGA のサブドメイン
      },
      {
        protocol: 'http', // 一部古いASP用
        hostname: '**.linkshare.ne.jp', 
      },
      {
        protocol: 'https',
        hostname: '**.linkshare.ne.jp',
      },
    ],
    // もし全ての外部ドメインを一時的に許可してテストしたい場合は以下のコメントを外しますが、
    // 本番環境ではセキュリティのため上記の remotePatterns 形式が推奨されます。
    // unoptimized: true, 
  },
};

export default nextConfig;