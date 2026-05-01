// /shared/lib/config.ts
// @ts-nocheck

import { getSiteMetadata } from '../utils/siteConfig';

/** 実行環境判定 */
export const IS_SERVER = typeof window === 'undefined';

/**
 * =========================================================
 * 🌍 API 接続設定（シンプル安定版）
 * =========================================================
 * ・SSR / Client で同一URLを使う
 * ・内部URL（docker）は使わない
 * ・URL加工はしない
 * =========================================================
 */
export const getWpConfig = (manualHost?: string) => {
  // ① ホスト判定
  const identifier =
    manualHost ||
    (IS_SERVER
      ? process.env.NEXT_PUBLIC_SITE_DOMAIN
      : window.location.hostname);

  // ② メタ取得
  const meta = getSiteMetadata(identifier || '');

  // ③ baseUrl決定（最優先：siteConfig → env → fallback）
  let baseUrl =
    meta.api_base_url ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8000/api';

  // ④ 末尾スラッシュだけ除去（これ以上いじらない）
  baseUrl = baseUrl.replace(/\/+$/, '');

  return {
    /** APIベースURL（そのまま使う） */
    baseUrl,

    /** Django識別用 */
    host: meta.django_host || 'bicstation.com',

    /** サイト識別 */
    siteKey: meta.site_tag || 'bicstation',

    /** prefix（既存維持） */
    sitePrefix: meta.site_prefix,
  };
};

/** Django base URL */
export const getDjangoBaseUrl = () => getWpConfig().baseUrl;

/** API共通設定 */
export const API_CONFIG = {
  get djangoBase() {
    return getDjangoBaseUrl();
  },
  get wp() {
    return getWpConfig();
  },
  timeout: 10000,
};