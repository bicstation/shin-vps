/** @type {import('next').NextConfig} */
// 1. 共通設定を import する
import { baseNextConfig } from './shared/next.config.base.mjs';

const nextConfig = {
  // 2. 共通設定をすべて展開して適用
  ...baseNextConfig,

  /* もし avflash サイトだけで使いたい「特別な設定」があれば
     ここに追記します（例: 環境変数など）。
     特になければこのままでOKです。
  */
};

export default nextConfig;