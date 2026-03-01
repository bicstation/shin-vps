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

/** 💡 クエリパラメータの正規化: 日本語破壊防止 & モデル（大文字 api_source）適合 */
const normalizeParams = (params: any) => {
  const clean: Record<string, string> = {};
  
  if (!params) return clean;

  Object.keys(params).forEach(key => {
    const val = params[key];
    
    // 有効な値のみを抽出
    if (val !== undefined && val !== null && val !== 'undefined' && val !== '') {
      let targetKey = key;
      
      // 🚀 Frontendのクエリ名をDjangoのフィールド名にマッピング
      if (key === 'service') targetKey = 'service_code';
      if (key === 'floor') targetKey = 'floor_code';
      
      // 💡 モデルの仕様（api_sourceは大文字）に合わせるための特殊処理
      if (targetKey === 'api_source') {
        clean[targetKey] = String(val).toUpperCase(); // FANZA, DMM, DUGA
      } else {
        // 小文字化が必要な特定のキー
        const lowercaseKeys = ['service_code', 'floor_code', 'related_to_id'];
        
        if (lowercaseKeys.includes(targetKey)) {
          clean[targetKey] = String(val).toLowerCase();
        } else {
          // attribute (スラッグ) や attribute_id はそのままの文字列で維持
          clean[targetKey] = String(val); 
        }
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

/** * 商品一覧取得 (Unified) */
export async function getUnifiedProducts(params: any = {}) {
  // 🚀 1. パラメータの正規化
  const cleanParams = normalizeParams(params);
  const queryString = new URLSearchParams(cleanParams).toString();
  
  // 🚀 2. ターゲットURLの生成
  const targetUrl = resolveApiUrl(`/api/adult/unified-products/?${queryString}`);

  const isFiltered = !!(
    cleanParams.attribute || 
    cleanParams.attribute_id || 
    cleanParams.actress_id || 
    cleanParams.related_to_id
  );

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(),
      cache: isFiltered ? 'no-store' : 'default',
      next: isFiltered ? { revalidate: 0 } : { revalidate: 3600 }
    });

    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    const data = await res.json();
    
    if (isFiltered) {
      console.log(`[UnifiedList] FILTER_ACTIVE: URL=${targetUrl} | FOUND=${data?.count}`);
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
    if (data?.detail === "Not found." || data?._error) return null;
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
    
    const rawParams = isParamObj ? floorCodeOrParams : { 
      floor_code: floorCodeOrParams, 
      limit: limit 
    };
    
    const cleanParams = normalizeParams({
      type,
      ordering: rawParams.ordering || '-product_count',
      ...rawParams
    });

    const queryParams = new URLSearchParams(cleanParams);
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
 * 💡 4. ナビゲーションメニュー取得 (仕分け完全防衛版)
 * ==============================================================================
 */

export async function getAdultNavigationFloors(params: { site?: string } = {}) {
  // 🚀 api_source クエリを構築（モデルに合わせて大文字）
  const siteVal = params.site ? params.site.toUpperCase() : '';
  const query = siteVal ? `?api_source=${siteVal}` : '';
  const targetUrl = resolveApiUrl(`/api/adult/navigation/floors/${query}`);
  
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(), 
      next: { revalidate: 3600 } 
    });
    if (!res.ok) throw new Error(`NAV_FETCH_ERROR_${res.status}`);
    const json = await res.json();
    const data = json?.data || {};

    // 🚀 ブランドごとの厳密な仕分け
    if (siteVal) {
      const filteredData: any = {};
      Object.keys(data).forEach(key => {
        const k = key.toUpperCase();
        // DMM の場合は FANZA（アダルト）を巻き込まないように除外ガード
        const isMatch = (siteVal === 'DMM') 
          ? (k.includes('DMM') && !k.includes('FANZA'))
          : k.includes(siteVal);
          
        if (isMatch) filteredData[key] = data[key];
      });
      
      // 💡 DUGAなど階層がフラットな場合、servicesではなくその階層自体を返すロジックを担保
      if (Object.keys(filteredData).length > 0) {
        return filteredData;
      }
    }

    return data;
  } catch (error) {
    console.error("[NavFloors] FETCH_FAILED:", error);
    return {};
  }
}

/** 💡 既存の特定ブランド取得ショートカットの互換性維持 */
export async function getFanzaDynamicMenu() {
  const data = await getAdultNavigationFloors({ site: 'FANZA' });
  const matchedKey = Object.keys(data).find(k => k.includes('FANZA'));
  return matchedKey ? data[matchedKey].services : {};
}

/**
 * ==============================================================================
 * 💡 5. ランキング & 属性統計
 * ==============================================================================
 */

export async function fetchAdultProductRanking(limit: number = 30) {
  const targetUrl = resolveApiUrl(`/api/adult/ranking/`);
  try {
    const res = await fetch(targetUrl, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    const data = await res.json();
    return safeExtract(data); 
  } catch (error) { 
    console.error("[Ranking] FETCH_FAILED:", error);
    return []; 
  }
}

export async function fetchAdultAttributes() {
  const targetUrl = resolveApiUrl('/api/adult/sidebar-stats/');
  try {
    const res = await fetch(targetUrl, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`ATTR_FETCH_ERROR_${res.status}`);
    const data = await res.json();
    return data.attributes || []; 
  } catch (error) { 
    console.error("[AdultAttributes] FETCH_FAILED:", error);
    return []; 
  }
}