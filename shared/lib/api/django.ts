/**
 * =====================================================================
 * 🏢 Django API 統合エクスポート (shared/lib/api/django.ts)
 * 🛡️ Maya's Logic: 物理パス同期版 (サブフォルダ依存を排除)
 * =====================================================================
 */

// 1. 基盤・統合ブリッジ (django-bridge.ts)
// 🚨 旧 WordPress 互換の fetchPostList などはここに含まれます
export * from './django-bridge';

// 2. アダルトコンテンツ API (adultApi.ts)
// 🚨 getAdultProducts (getUnifiedProducts) など
export * from './adultApi';

// 3. 共通型定義 (types.ts)
export * from './types';

/**
 * 💡 補足: 
 * 現在、shared/lib/api/ 直下にファイルがフラットに並んでいるため、
 * サブディレクトリ (./django/...) への参照はすべてエラーになります。
 */