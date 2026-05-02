// /shared/lib/config/api.ts

/**
 * =========================================
 * 🔥 API BASE（SSR / CSR 安定版）
 * =========================================
 */
export function getApiBase() {
  const isServer = typeof window === 'undefined';

  const base = isServer
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

  if (!base) {
    console.error('[API BASE ERROR] env is undefined', {
      isServer,
      INTERNAL_API_URL: process.env.INTERNAL_API_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    });

    throw new Error('API BASE URL is not defined');
  }

  // 末尾スラッシュ除去（安全処理）
  return base.replace(/\/+$/, '');
}

/**
 * =========================================
 * 🔥 APIエンドポイント（動的生成）
 * =========================================
 */
export const getApiEndpoints = () => {
  const base = getApiBase();

  return {
    ranking: `${base}/products/ranking/`,
    detailByUid: (uid: string) =>
      `${base}/products/by-uid/${uid}/`,
  };
};