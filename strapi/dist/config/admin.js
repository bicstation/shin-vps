"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// config/admin.js
exports.default = ({ env }) => ({
    auth: {
        secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
        salt: env('API_TOKEN_SALT'),
    },
    transfer: {
        token: {
            salt: env('TRANSFER_TOKEN_SALT'),
        },
    },
    secrets: {
        encryptionKey: env('ENCRYPTION_KEY'),
    },
    flags: {
        nps: env.bool('FLAG_NPS', true),
        promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    // 🔽 管理画面のベースURLをサブパスに合わせて追加 (Strapi v4 以降で重要)
    url: '/strapi/admin',
});
