// /shared/lib/config/api.ts

/**
 * =========================================
 * 🔥 API BASE（SSR / CSR 完全安定版）
 * =========================================
 */
export function getApiBase() {
  const isServer = typeof window === 'undefined';

  let base = isServer
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

  // 🔥 フォールバック（超重要）
  if (!base) {
    base = isServer
      ? 'http://django-v3:8000/api'
      : 'http://localhost:8083/api';

    console.warn('[API BASE FALLBACK]', {
      isServer,
      base,
    });
  }

  // 🔥 最終ログ（デバッグ用）
  if (process.env.NODE_ENV !== 'production') {
    console.log('[API BASE]', {
      isServer,
      base,
    });
  }

  return base.replace(/\/+$/, '');
}

/**
 * =========================================
 * 🔥 APIエンドポイント（完全版）
 * =========================================
 */
export const getApiEndpoints = () => {
  const base = getApiBase();

  const endpoints = {
    ranking: `${base}/general/pc-products/ranking/`,

    detailByUid: (uid: string) =>
      `${base}/products/by-uid/${uid}/`,
  };

  // 🔥 デバッグログ（重要）
  if (process.env.NODE_ENV !== 'production') {
    console.log('[API ENDPOINTS]', endpoints);
  }

  return endpoints;
};