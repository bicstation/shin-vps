/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { AdultProduct } from '../types';

/**
 * ==============================================================================
 * 🚀 1. 内部ユーティリティ (共通ロジックの集約)
 * ==============================================================================
 */

/** 💡 汎用データ抽出: Django REST Framework の results または単一配列を正規化 */
const safeExtract = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results || data.data || [];
};

/** 💡 クエリパラメータの正規化: サービス/フロア等のエイリアスを吸収 */
const normalizeParams = (params: any) => {
  const clean: Record<string, string> = {};
  Object.keys(params).forEach(key => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== 'undefined' && val !== '') {
      let targetKey = key;
      if (key === 'service') targetKey = 'service_code';
      if (key === 'floor') targetKey = 'floor_code';
      clean[targetKey] = String(val).toLowerCase(); 
    }
  });
  return clean;
};

/**
 * ==============================================================================
 * 💡 2. 製品データ取得 (Core)
 * ==============================================================================
 */

/** 💡 統合製品一覧取得: /api/adult/unified-products/ を使用 */
export async function getUnifiedProducts(params: any = {}) {
  const cleanParams = normalizeParams(params);
  const queryString = new URLSearchParams(cleanParams).toString();
  const targetUrl = resolveApiUrl(`/api/adult/unified-products/?${queryString}`);

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(),
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    const data = await res.json();
    return { 
      results: safeExtract(data), 
      count: data?.count || 0
    };
  } catch (error) { 
    console.error("[UnifiedList] FETCH_FAILED:", error);
    return { results: [], count: 0 }; 
  }
}

/** 💡 製品詳細取得 */
export async function getAdultProductDetail(id: string | number): Promise<AdultProduct | null> {
  const endpoint = `/api/adult-products/${id}/`;
  try {
    const res = await fetch(resolveApiUrl(endpoint), { 
      headers: getDjangoHeaders(), 
      cache: 'no-store' 
    });
    const data = await handleResponseWithDebug(res, resolveApiUrl(endpoint));
    return (data && !data._error) ? data : null;
  } catch (error) {
    console.error(`[Detail] FETCH_FAILED [${id}]:`, error);
    return null; 
  }
}

/**
 * ==============================================================================
 * 💡 3. タクソノミー集計取得 (Masters)
 * ==============================================================================
 */

/** 💡 共通マスタ取得ロジック: /api/adult/taxonomy/ を使用しカウント順で取得 */
export async function fetchAdultTaxonomyIndex(type: string, floorCode?: string, limit?: number) {
  try {
    const params = new URLSearchParams({ 
      type,
      ordering: '-product_count' // ✅ 作品数カウント順
    });
    if (floorCode) params.append('floor_code', floorCode.toLowerCase());
    if (limit) params.append('limit', limit.toString());

    const url = `/api/adult/taxonomy/?${params.toString()}`;
    const res = await fetch(resolveApiUrl(url), { 
      headers: getDjangoHeaders(), 
      next: { revalidate: 3600 } 
    });
    
    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    const data = await res.json();
    
    return { 
      results: safeExtract(data),
      count: data?.count || 0 
    };
  } catch (error) {
    console.error(`[Taxonomy] ${type} FETCH_FAILED:`, error);
    return { results: [], count: 0 };
  }
}

/** 💡 マスタ系エイリアス関数群 (著者・監督を含む全項目) */
export const fetchGenres = (p?: any) => fetchAdultTaxonomyIndex('genres', p?.floor_code, p?.limit);
export const fetchMakers = (p?: any) => fetchAdultTaxonomyIndex('makers', p?.floor_code, p?.limit);
export const fetchActresses = (p?: any) => fetchAdultTaxonomyIndex('actresses', p?.floor_code, p?.limit);
export const fetchSeries = (p?: any) => fetchAdultTaxonomyIndex('series', p?.floor_code, p?.limit);
export const fetchDirectors = (p?: any) => fetchAdultTaxonomyIndex('directors', p?.floor_code, p?.limit);
export const fetchAuthors = (p?: any) => fetchAdultTaxonomyIndex('authors', p?.floor_code, p?.limit); // ✅ 著者
export const fetchLabels = (p?: any) => fetchAdultTaxonomyIndex('labels', p?.floor_code, p?.limit);

/** 💡 ナビゲーション取得 */
export async function getFanzaDynamicMenu() {
  const targetUrl = resolveApiUrl('/api/navigation/floors/');
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(), 
      next: { revalidate: 3600 } 
    });
    const json = await res.json();
    return json.data?.['FANZA（アダルト）']?.services || {};
  } catch (error) {
    console.error("[Navigation] FETCH_FAILED:", error);
    return {};
  }
}