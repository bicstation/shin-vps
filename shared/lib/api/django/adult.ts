/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
// /home/maya/dev/shin-vps/shared/lib/api/django/adult.ts
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

/** 💡 クエリパラメータの正規化: 日本語破壊を防止 & 特殊パラメータの対応 */
const normalizeParams = (params: any) => {
  const clean: Record<string, string> = {};
  Object.keys(params).forEach(key => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== 'undefined' && val !== '') {
      let targetKey = key;
      
      // エイリアスの変換 (Frontend -> Django Field Name)
      if (key === 'service') targetKey = 'service_code';
      if (key === 'floor') targetKey = 'floor_code';

      // 💡 判定ロジック:
      // 1. 識別子系・コード系は小文字化して正規化
      // 2. ID系（attribute_id含む）やスラッグは破壊を防ぐためそのまま維持
      const lowercaseKeys = ['service_code', 'floor_code', 'api_source', 'related_to_id'];
      
      if (lowercaseKeys.includes(targetKey)) {
        clean[targetKey] = String(val).toLowerCase();
      } else {
        // attribute_id や search, ordering などはそのまま文字列としてセット
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

/** * 商品一覧取得 (Unified) 
 * 🎯 attribute_id が params に含まれる場合、特定のAI属性で絞り込みます。
 */
export async function getUnifiedProducts(params: any = {}) {
  // 💡 パラメータの正規化（ここで attribute_id が確実に保持されます）
  const cleanParams = normalizeParams(params);
  const queryString = new URLSearchParams(cleanParams).toString();
  
  // Django側エンドポイント: /api/adult/unified-products/
  const targetUrl = resolveApiUrl(`/api/adult/unified-products/?${queryString}`);

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(),
      // 絞り込み条件（ID系）がある場合は、動的変化を優先するためキャッシュを調整
      cache: (params.attribute_id || params.related_to_id || params.actress_id) ? 'no-store' : 'default',
      next: (params.attribute_id || params.related_to_id || params.actress_id) 
        ? { revalidate: 0 } 
        : { revalidate: 3600 }
    });

    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    
    const data = await res.json();
    
    // 🔍 デバッグ用: データが空の場合にURLをコンソール出力
    if (!data.results || data.results.length === 0) {
      console.warn(`[UnifiedList] NO_DATA_RETURNED from: ${targetUrl}`);
    }

    return { 
      results: safeExtract(data), 
      count: data?.count || (Array.isArray(data) ? data.length : 0)
    };
  } catch (error) { 
    console.error("[UnifiedList] FETCH_FAILED:", error);
    return { results: [], count: 0 }; 
  }
}

/** 🎯 製品詳細取得 */
export async function getAdultProductDetail(id: string | number): Promise<AdultProduct | null> {
  const endpoint = `/api/adult/products/${id}/`;
  const targetUrl = resolveApiUrl(endpoint);

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(), 
      cache: 'no-store' 
    });
    
    const data = await handleResponseWithDebug(res, targetUrl);
    
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

/** タクソノミー汎用取得 */
export async function fetchAdultTaxonomyIndex(type: string, floorCodeOrParams?: string | any, limit?: number) {
  try {
    const isParamObj = typeof floorCodeOrParams === 'object' && floorCodeOrParams !== null;
    
    const floor_code = isParamObj ? floorCodeOrParams.floor_code : floorCodeOrParams;
    const finalLimit = isParamObj ? floorCodeOrParams.limit : limit;
    const api_source = isParamObj ? floorCodeOrParams.api_source : null;
    const ordering = isParamObj ? (floorCodeOrParams.ordering || '-product_count') : '-product_count';

    const queryParams = new URLSearchParams({ 
      type,
      ordering: ordering
    });

    if (floor_code) queryParams.append('floor_code', String(floor_code).toLowerCase());
    if (finalLimit) queryParams.append('limit', String(finalLimit));
    if (api_source) queryParams.append('api_source', String(api_source).toLowerCase());

    const url = `/api/adult/taxonomy/?${queryParams.toString()}`;
    const res = await fetch(resolveApiUrl(url), { 
      headers: getDjangoHeaders(), 
      next: { revalidate: 3600 } 
    });
    
    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    const data = await res.json();
    
    return { 
      results: safeExtract(data),
      count: data?.count || (Array.isArray(data.results) ? data.results.length : 0)
    };
  } catch (error) {
    console.error(`[Taxonomy] ${type} FETCH_FAILED:`, error);
    return { results: [], count: 0 };
  }
}

// ショートカット関数群
export const fetchGenres = (p?: any) => fetchAdultTaxonomyIndex('genres', p);
export const fetchMakers = (p?: any) => fetchAdultTaxonomyIndex('makers', p);
export const fetchActresses = (p?: any) => fetchAdultTaxonomyIndex('actresses', p);
export const fetchSeries = (p?: any) => fetchAdultTaxonomyIndex('series', p);
export const fetchDirectors = (p?: any) => fetchAdultTaxonomyIndex('directors', p);
export const fetchAuthors = (p?: any) => fetchAdultTaxonomyIndex('authors', p);
export const fetchLabels = (p?: any) => fetchAdultTaxonomyIndex('labels', p);

/**
 * ==============================================================================
 * 💡 4. ナビゲーションメニュー取得
 * ==============================================================================
 */

export async function getAdultNavigationFloors() {
  const targetUrl = resolveApiUrl('/api/adult/navigation/floors/');
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(), 
      next: { revalidate: 3600 } 
    });
    if (!res.ok) throw new Error(`NAV_FETCH_ERROR_${res.status}`);
    const json = await res.json();
    return json?.data || {};
  } catch (error) {
    console.error("[NavFloors] FETCH_FAILED:", error);
    return {};
  }
}

export async function getFanzaDynamicMenu() {
  const data = await getAdultNavigationFloors();
  return data?.['FANZA（アダルト）']?.services || {};
}

export async function getDmmDynamicMenu() {
  const data = await getAdultNavigationFloors();
  return data?.['DMM.com（一般）']?.services || data?.['DMM.com']?.services || {};
}

/**
 * ==============================================================================
 * 💡 5. ランキングデータ取得
 * ==============================================================================
 */

export async function fetchAdultProductRanking(limit: number = 30) {
  const targetUrl = resolveApiUrl(`/api/adult/ranking/`);
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(),
      next: { revalidate: 3600 } 
    });
    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    const data = await res.json();
    return safeExtract(data); 
  } catch (error) { 
    console.error("[Ranking] FETCH_FAILED:", error);
    return []; 
  }
}

/**
 * ==============================================================================
 * 💡 6. 属性（Attribute）統計取得 (サイドバー専用)
 * ==============================================================================
 */

export async function fetchAdultAttributes() {
  const targetUrl = resolveApiUrl('/api/adult/sidebar-stats/');
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(),
      next: { revalidate: 3600 } 
    });
    if (!res.ok) throw new Error(`ATTR_FETCH_ERROR_${res.status}`);
    const data = await res.json();
    return data.attributes || []; 
  } catch (error) { 
    console.error("[AdultAttributes] FETCH_FAILED:", error);
    return []; 
  }
}