/** @type {import('next').NextConfig} */
const nextConfig = {
  // VPS環境（本番/ステージング）では空、ローカル開発時のみ指定するようにする
  basePath: process.env.NODE_ENV === 'production' ? '' : '/saving',
  // basePath: '/saving',
  // サーバーサイドでの環境変数を定義
  env: {
    // ✅ 修正：環境変数から取得し、なければデフォルト値（本番名）を使用
    // これにより、yml側の environment: DB_HOST 設定が反映されます
    API_URL_INTERNAL: process.env.DB_HOST 
      ? `http://${process.env.DB_HOST}:8000` 
      : 'http://django-v2-prod:8000', 
    
    // 公開用のURL（ブラウザからアクセスするURL）
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  
  // Docker環境でのビルド安定化のため、念のため output を指定（任意）
  output: 'standalone', 
};

export default nextConfig;