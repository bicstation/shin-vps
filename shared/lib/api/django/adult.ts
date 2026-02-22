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

/** 💡 クエリパラメータの正規化: 日本語破壊を防止 & 特殊パラメータの対応 */
const normalizeParams = (params: any) => {
  const clean: Record<string, string> = {};
  Object.keys(params).forEach(key => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== 'undefined' && val !== '') {
      let targetKey = key;
      
      // エイリアスの変換
      if (key === 'service') targetKey = 'service_code';
      if (key === 'floor') targetKey = 'floor_code';

      // 💡 判定ロジック:
      // 1. 識別子系は小文字化して正規化（一貫性のため）
      // 2. ID系やスラッグ（日本語含む）は破壊を防ぐためそのまま維持
      const lowercaseKeys = ['service_code', 'floor_code', 'api_source', 'related_to_id'];
      
      if (lowercaseKeys.includes(targetKey)) {
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

/** * 商品一覧取得 (Unified) 
 * 🎯 related_to_id が渡された場合、Django 側でスコアリングされた関連作品が返ります。
 */
export async function getUnifiedProducts(params: any = {}) {
  const cleanParams = normalizeParams(params);
  const queryString = new URLSearchParams(cleanParams).toString();
  
  const targetUrl = resolveApiUrl(`/api/adult/unified-products/?${queryString}`);

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(),
      cache: (params.related_to_id || params.actress_id || params.maker_id) ? 'no-store' : 'default',
      next: (params.related_to_id || params.actress_id || params.maker_id) 
        ? { revalidate: 0 } 
        : { revalidate: 3600 }
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
      count: data?.count || 0 
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
 * 💡 4. ナビゲーションメニュー取得 (Real-time product_count 対応)
 * ==============================================================================
 */

/** 共通のナビゲーションリスト取得 (Django: /api/master/nav-list/) */
async function fetchNavList() {
  const targetUrl = resolveApiUrl('/api/master/nav-list/');
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(), 
      next: { revalidate: 3600 } 
    });
    if (!res.ok) throw new Error(`NAV_FETCH_ERROR_${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("[NavList] FETCH_FAILED:", error);
    return { data: {} };
  }
}

/** FANZAフロアナビゲーション */
export async function getFanzaDynamicMenu() {
  const json = await fetchNavList();
  // JSON内の日本語キー「FANZA（アダルト）」からサービス一覧を抽出
  return json?.data?.['FANZA（アダルト）']?.services || {};
}

/** DMMフロアナビゲーション */
export async function getDmmDynamicMenu() {
  const json = await fetchNavList();
  // JSON内の日本語キー「DMM.com（一般）直下、または DMM.com」からサービス一覧を抽出
  return json?.data?.['DMM.com（一般）']?.services || json?.data?.['DMM.com']?.services || {};
}

/**
 * ==============================================================================
 * 💡 5. ランキング・解析データ取得
 * ==============================================================================
 */

/** 🎯 アダルト作品AI解析ランキング取得 */
export async function fetchAdultProductRanking(limit: number = 100) {
  // AIスコア（spec_score）の降順で取得するようクエリを構築
  const params = {
    ordering: '-spec_score', // AI解析スコアの高い順
    limit: String(limit),
  };

  const queryString = new URLSearchParams(params).toString();
  const targetUrl = resolveApiUrl(`/api/adult/unified-products/?${queryString}`);

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(),
      // ランキングは頻繁に更新される可能性があるため、1時間キャッシュ
      next: { revalidate: 3600 } 
    });

    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    
    const data = await res.json();
    
    // page.tsx 側が配列を期待しているため、results を返します
    return safeExtract(data); 
  } catch (error) { 
    console.error("[Ranking] FETCH_FAILED:", error);
    return []; 
  }
}