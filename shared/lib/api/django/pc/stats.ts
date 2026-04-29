// /shared/lib/api/django/pc/stats.ts
// @ts-nocheck

import { getWpConfig } from '../../config';

/**
 * =========================================================
 * 💻 PCランキング取得（Product共通API使用）
 * =========================================================
 * ✔ Productモデルを使用（全サイト共通）
 * ✔ prefix・pc・generalは使わない
 * ✔ SSR/Client 両対応
 */
export async function fetchPCProductRanking(
  sort: string = 'score',
  host?: string
) {
  try {
    const { baseUrl } = getWpConfig(host);

    // 🔥 ここが本丸（絶対に変えない）
    const url = `${baseUrl}/products/ranking/?sort=${sort}`;

    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[API ERROR]', res.status, url);
      return [];
    }

    const data = await res.json();

    // 🔒 安全ガード（構造揺れ対策）
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;

    return [];
  } catch (error) {
    console.error('[fetchPCProductRanking ERROR]', error);
    return [];
  }
}

/**
 * =========================================================
 * 💻 PC詳細取得（既存PCProduct維持）
 * =========================================================
 * ✔ 詳細ページ用
 * ✔ 既存構造を壊さない
 */
export async function fetchPCProductDetail(id: number, host?: string) {
  try {
    const { baseUrl, sitePrefix } = getWpConfig(host);

    // 👇 ここは既存ルートを維持（重要）
    const url = `${baseUrl}/${sitePrefix}/products/${id}/`;

    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[PC DETAIL ERROR]', res.status, url);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('[fetchPCProductDetail ERROR]', error);
    return null;
  }
}

/**
 * =========================================================
 * 🔥 人気ランキング（必要なら）
 * =========================================================
 */
export async function fetchPCPopularityRanking(host?: string) {
  try {
    const { baseUrl } = getWpConfig(host);

    const url = `${baseUrl}/products/ranking/?sort=popularity`;

    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) return [];

    return await res.json();
  } catch {
    return [];
  }
}