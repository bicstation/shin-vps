// /shared/lib/api/django/pc/stats.ts

import { getApiBase } from '@/shared/lib/config/api';

/**
 * =========================================
 * 🔥 共通レスポンスチェック（軽量版）
 * =========================================
 */
async function safeJson(res: Response, url: string) {
  const text = await res.text();

  // HTML検出（APIミス検知）
  if (text.startsWith('<')) {
    console.error('[INVALID JSON]', url, text.slice(0, 120));
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('[JSON PARSE ERROR]', url, e);
    return null;
  }
}

/**
 * =========================================
 * 🔥 ランキング取得
 * =========================================
 */
export async function fetchPCProductRanking(
  sort: string = 'score'
) {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/products/ranking/?sort=${sort}`;

    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[API ERROR]', res.status, url);
      return [];
    }

    const data = await safeJson(res, url);

    if (!data) return [];

    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;

    return [];
  } catch (error) {
    console.error('[fetchPCProductRanking ERROR]', error);
    return [];
  }
}

/**
 * =========================================
 * 🔥 商品詳細（unique_id）
 * =========================================
 */
export async function fetchPCProductDetailByUid(unique_id: string) {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/products/by-uid/${unique_id}/`;

    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[DETAIL ERROR]', res.status, url);
      return null;
    }

    return await safeJson(res, url);
  } catch (error) {
    console.error('[fetchPCProductDetailByUid ERROR]', error);
    return null;
  }
}