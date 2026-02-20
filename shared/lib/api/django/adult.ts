/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { AdultProduct } from '../types';

/**
 * ==============================================================================
 * 🚀 1. 内部ユーティリティ
 * ==============================================================================
 */

const safeExtract = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results || data.data || [];
};

/** 💡 クエリパラメータの正規化: 日本語破壊を防止 */
const normalizeParams = (params: any) => {
  const clean: Record<string, string> = {};
  Object.keys(params).forEach(key => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== 'undefined' && val !== '') {
      let targetKey = key;
      
      // エイリアスの変換
      if (key === 'service') targetKey = 'service_code';
      if (key === 'floor') targetKey = 'floor_code';

      // 💡 修正ポイント: 
      // 1. service_code や floor_code は小文字でOK
      // 2. それ以外（特に _slug がつく日本語名）は そのまま維持
      if (targetKey.includes('_code') || targetKey === 'api_source') {
        clean[targetKey] = String(val).toLowerCase();
      } else {
        clean[targetKey] = String(val); 
      }
    }
  });
  return clean;
};

/**
 * ==============================================================================
 * 💡 2. 製品データ取得 (Core)
 * ==============================================================================
 */

/** 商品一覧取得 (Unified) */
export async function getUnifiedProducts(params: any = {}) {
  const cleanParams = normalizeParams(params);
  const queryString = new URLSearchParams(cleanParams).toString();
  // Django: /api/adult/unified-products/
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

/** * 🎯 製品詳細取得 (修正ポイント)
 * Django: /api/adult/products/<str:product_id_unique>/ 
 */
export async function getAdultProductDetail(id: string | number): Promise<AdultProduct | null> {
  // 💡 エンドポイントを Django の定義に修正
  const endpoint = `/api/adult/products/${id}/`;
  const targetUrl = resolveApiUrl(endpoint);

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(), 
      cache: 'no-store' 
    });
    
    // handleResponseWithDebug 内で 404 等を適切に処理
    const data = await handleResponseWithDebug(res, targetUrl);
    
    // Django は見つからない場合に { detail: "Not found." } を返す
    if (data?.detail === "Not found." || data?._error) {
      return null;
    }
    
    return data;
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

/** タクソノミー汎用取得 (集計が必要な場合) */
export async function fetchAdultTaxonomyIndex(type: string, floorCode?: string, limit?: number) {
  try {
    const params = new URLSearchParams({ 
      type,
      ordering: '-product_count'
    });
    if (floorCode) params.append('floor_code', floorCode.toLowerCase());
    if (limit) params.append('limit', limit.toString());

    // Django: /api/adult/taxonomy/
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

// 💡 ショートカット関数群
export const fetchGenres = (p?: any) => fetchAdultTaxonomyIndex('genres', p?.floor_code, p?.limit);
export const fetchMakers = (p?: any) => fetchAdultTaxonomyIndex('makers', p?.floor_code, p?.limit);
export const fetchActresses = (p?: any) => fetchAdultTaxonomyIndex('actresses', p?.floor_code, p?.limit);
export const fetchSeries = (p?: any) => fetchAdultTaxonomyIndex('series', p?.floor_code, p?.limit);
export const fetchDirectors = (p?: any) => fetchAdultTaxonomyIndex('directors', p?.floor_code, p?.limit);
export const fetchAuthors = (p?: any) => fetchAdultTaxonomyIndex('authors', p?.floor_code, p?.limit);
export const fetchLabels = (p?: any) => fetchAdultTaxonomyIndex('labels', p?.floor_code, p?.limit);

/** FANZAフロアナビゲーション */
export async function getFanzaDynamicMenu() {
  // Django: /api/adult/navigation/floors/
  const targetUrl = resolveApiUrl('/api/adult/navigation/floors/');
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(), 
      next: { revalidate: 3600 } 
    });
    const json = await res.json();
    // 構造に合わせて抽出
    return json.data?.['FANZA（アダルト）']?.services || json.services || {};
  } catch (error) {
    console.error("[Navigation] FETCH_FAILED:", error);
    return {};
  }
}