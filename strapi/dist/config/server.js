"use strict";
// E:\SHIN-VPS\strapi\config\server.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env }) => ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    // 🔽 Strapi の公開 URL を blog.tiper.live のルートに変更
    url: env('PUBLIC_URL', 'http://blog.tiper.live:8080'),
    app: {
        keys: env.array('APP_KEYS'),
    },
    // サブパスプロキシを使用しないため、path設定は削除またはコメントアウト
    // path: '/strapi', 
    // 開発環境の管理画面設定
    admin: {
        // 管理画面 URL も blog.tiper.live:8080/admin に変更
        url: env('ADMIN_URL', 'http://blog.tiper.live:8080/admin'),
        autoOpen: false,
    },
    webhooks: {
        populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
});
