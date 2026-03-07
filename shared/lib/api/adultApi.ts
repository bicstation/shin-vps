/**
 * shared/lib/api/adultApi.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api-tiper-host:8083';

/**
 * 💡 プラットフォームごとの仕訳（統計）データを取得
 */
export async function fetchPlatformAnalysis(source: string, makerId?: string) {
  const url = new URL(`${BASE_URL}/api/adult-products/analysis/`);
  url.searchParams.append('source', source);
  if (makerId) url.searchParams.append('maker_id', makerId);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch analysis data');
  return res.json();
}

/**
 * 💡 プラットフォーム別の統合商品リストを取得
 */
export async function fetchUnifiedProducts(source: string, page = 1) {
  const url = `${BASE_URL}/api/unified-adult-products/?api_source=${source}&page=${page}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}