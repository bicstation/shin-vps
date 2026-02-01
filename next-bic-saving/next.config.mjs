/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. ベースパスの設定
  // 環境変数から取得し、デフォルトは空（ルート）に設定
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // 2. ビルド・出力設定
  // Docker環境（スタンドアロンモード）で最適に動作するための設定
  output: 'standalone', 
  reactStrictMode: true,

  // 3. 🛠️ 外部ディレクトリ（shared）のコンパイル許可
  // shared フォルダ内の TypeScript/JSX をビルド対象に含めます。
  // これにより、シンボリックリンクや物理コピーされた共通部品が正しく読み込まれます。
  transpilePackages: ['shared'],

  // 4. 環境変数の定義
  env: {
    // サーバー内部（コンテナ間）での通信先
    API_URL_INTERNAL: process.env.API_URL_INTERNAL || 'http://django-v2-prod:8000', 
  },

  // 💡 クライアント側（ブラウザ）で使用する環境変数は、
  // NEXT_PUBLIC_ つきで .env や docker-compose.yml に書くことで自動的に反映されます
};

export default nextConfig;