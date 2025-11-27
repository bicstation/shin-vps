// ./strapi/config/plugin.ts
// 🚨 エラーの元となっていた 'import { Env } from "@strapi/types";' を削除

// Env の型定義を削除し、シンプルに記述します。
export default ({ env }) => ({
  // 1. 組み込みの 'users-permissions' プラグインを設定
  'users-permissions': {
    config: {
      // APP_KEYS 環境変数（.envファイルに定義済み）の値を jwtSecret として使用
      jwtSecret: env('APP_KEYS'),
    },
  },

  // 2. 他のプラグインがあればここに定義します

});