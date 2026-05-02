const INTERNAL_API =
  process.env.INTERNAL_API_URL || 'http://localhost:8083/api';

const PUBLIC_API =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api';

/**
 * 🔥 API BASE（SSR / CSR 安定版）
 */
export const getApiBase = () => {
  // サーバー（SSR）
  if (typeof window === 'undefined') {
    return INTERNAL_API;
  }

  // クライアント（CSR）
  return PUBLIC_API;
};