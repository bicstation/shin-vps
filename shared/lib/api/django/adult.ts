/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { getSiteMetadata } from '../../siteConfig';
import { AdultProduct } from '../types';

/**
 * ==============================================================================
 * 🚀 内部ロジック: 競合回避 & 階層吸収
 * ==============================================================================
 */

/** 💡 汎用データ抽出: Djangoのページネーション有無にかかわらず配列を返す */
const safeExtract = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  // 統合API(results) / 解析API(data.data) / 直列配列をすべてカバー
  return data.results || data.data || (Array.isArray(data) ? data : []);
};

/** 💡 [INTERNAL] ナビゲーション取得コア */
async function fetchBaseNavigation(targetKey: 'FANZA（アダルト）' | 'DMM.com（一般）') {
  try {
    const res = await fetch(resolveApiUrl('/api/navigation/floors/'), { 
      headers: getDjangoHeaders(),
      next: { revalidate: 3600 } 
    });
    const json = await res.json();
    // Django側のレスポンス構造に合わせて data を優先参照
    const allData = json.data || json || {};
    const siteMenu = allData[targetKey];
    return siteMenu?.services || {};
  } catch (error) { 
    console.error(`[Navigation] ${targetKey}_FETCH_FAILED:`, error);
    return {}; 
  }
}

/** 💡 [INTERNAL] マスターデータ取得用汎用関数 (DRF標準リスト形式に対応) */
const fetchMasterData = async (endpoint: string, params?: any) => {
  try {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    const res = await fetch(resolveApiUrl(`${endpoint}${query}`), { 
      headers: getDjangoHeaders(),
      next: { revalidate: 3600 } // デフォルトでキャッシュ有効化
    });
    const data = await res.json();
    return { 
      results: safeExtract(data), 
      count: data?.count || (Array.isArray(data) ? data.length : 0) 
    };
  } catch (error) {
    console.error(`[MasterData] FETCH_FAILED [${endpoint}]:`, error);
    return { results: [], count: 0 };
  }
};

/**
 * ==============================================================================
 * 💡 1. 製品詳細 & アーカイブ取得 (Core)
 * ==============================================================================
 */

/** * 💡 製品詳細取得: すべて /api/adult-products/ に集約
 * バックエンド統合により、FANZA/DUGA問わず単一エンドポイントで取得可能。
 */
export async function getAdultProductDetail(id: string | number, source?: string): Promise<AdultProduct | null> {
  const idStr = String(id);
  
  // 💡 [最適化] バックエンド統合に伴い、旧エンドポイント '/api/fanza-products/' は廃止
  // すべて '/api/adult-products/' で lookup_field='product_id_unique' を使用
  const endpoint = `/api/adult-products/${idStr}/`;
  
  try {
    const res = await fetch(resolveApiUrl(endpoint), { 
      headers: getDjangoHeaders(), 
      cache: 'no-store' 
    });
    const data = await handleResponseWithDebug(res, resolveApiUrl(endpoint));
    return (data && !data._error) ? data : null;
  } catch (error) {
    console.error(`[Detail] FETCH_FAILED [${idStr}]:`, error);
    return null; 
  }
}

/** 💡 統合製品一覧 (Unified): バックエンドの UnifiedAdultProductListView に直結 */
export async function getUnifiedProducts(params: any = {}) {
  const cleanParams: Record<string, string> = {};
  
  Object.keys(params).forEach(key => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== 'undefined' && val !== '') {
      let targetKey = key;
      // フロントのキー名をバックエンドのフィルタ名にマッピング
      if (key === 'service') targetKey = 'service_code';
      if (key === 'floor') targetKey = 'floor_code';
      
      cleanParams[targetKey] = String(val).toLowerCase(); 
    }
  });

  const queryString = new URLSearchParams(cleanParams).toString();
  const targetUrl = resolveApiUrl(`/api/unified-adult-products/?${queryString}`);

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(),
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    const data = await res.json();
    return { 
      results: safeExtract(data), 
      count: data?.count || 0,
      next: data?.next || null,
      previous: data?.previous || null
    };
  } catch (error) { 
    console.error("[UnifiedList] FETCH_FAILED:", error);
    return { results: [], count: 0, next: null, previous: null }; 
  }
}

/** 💡 個別製品一覧 (Standard) - 後方互換性維持 */
export async function getAdultProducts(params: any = {}) {
  return getUnifiedProducts(params);
}

/**
 * ==============================================================================
 * 💡 2. マーケット分析 & サイドバー集計 (Analysis)
 * ==============================================================================
 */

export async function getPlatformAnalysis(source: string, params: any = {}) {
  const queryParams = {
    source: source?.toLowerCase(),
    ...params
  };
  
  if (params.floor) {
    queryParams.floor_code = params.floor;
    delete queryParams.floor;
  }

  const query = new URLSearchParams(queryParams);
  try {
    const res = await fetch(resolveApiUrl(`/api/adult-products/analysis/?${query}`), { 
      headers: getDjangoHeaders(),
      next: { revalidate: 3600 } 
    });
    const data = await res.json();
    // 分析API特有の data 階層、または results 階層を吸収
    return data.data || data.results || data;
  } catch (err) { 
    console.error("[Analysis] FETCH_ERROR:", err);
    return null; 
  }
}

/**
 * ==============================================================================
 * 💡 3. プラットフォーム別メニュー構造
 * ==============================================================================
 */
export async function getFanzaDynamicMenu() { return fetchBaseNavigation('FANZA（アダルト）'); }
export async function getDmmDynamicMenu() { return fetchBaseNavigation('DMM.com（一般）'); }

/**
 * ==============================================================================
 * 💡 4. 各種マスタデータ一覧 (Masters)
 * ==============================================================================
 */

/** 💡 万能仕分けインデックス取得 (A-Z/50音 検索用) */
export async function fetchAdultTaxonomyIndex(type: string, floorCode?: string) {
  try {
    let url = `/api/adult/taxonomy/?type=${type}`;
    if (floorCode) url += `&floor_code=${floorCode.toLowerCase()}`;
    const res = await fetch(resolveApiUrl(url), { 
      headers: getDjangoHeaders(), 
      next: { revalidate: 3600 } 
    });
    const data = await res.json();
    return { 
      type: data.type, 
      results: safeExtract(data), 
      total_count: data.total_count || 0 
    };
  } catch (error) {
    console.error("[Taxonomy] FETCH_FAILED:", error);
    return { type, results: [], total_count: 0 };
  }
}

/** 💡 マスタ系関数群 */
export const fetchMakers = (p?: any) => fetchMasterData('/api/makers/', p);
export const fetchGenres = (p?: any) => fetchMasterData('/api/genres/', p);
export const fetchSeries = (p?: any) => fetchMasterData('/api/series/', p);
export const fetchDirectors = (p?: any) => fetchMasterData('/api/directors/', p);
export const fetchAuthors = (p?: any) => fetchMasterData('/api/authors/', p);
export const fetchActresses = (p?: any) => fetchMasterData('/api/actresses/', p);

/** 💡 スコアランキング取得 (spec_scoreベース) */
export async function fetchAdultProductRanking() {
  try {
    const res = await fetch(resolveApiUrl(`/api/adult-products/ranking/`), { 
      headers: getDjangoHeaders(),
      next: { revalidate: 3600 }
    });
    const data = await res.json();
    return { 
      results: safeExtract(data), 
      count: data?.count || (Array.isArray(data) ? data.length : 0) 
    };
  } catch (error) {
    console.error("[Ranking] FETCH_FAILED:", error);
    return { results: [], count: 0 };
  }
}

/**
 * ==============================================================================
 * 💡 5. 互換性のためのエイリアス
 * ==============================================================================
 */
export const getUnifiedProductDetail = getAdultProductDetail;