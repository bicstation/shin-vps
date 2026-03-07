/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 🔞 アダルトコンテンツ統合サービス (shared/lib/api/django/adult.ts)
 * =====================================================================
 * 🛡️ Maya's Zenith v4.1: URL二重化(404) & 文字列分解バグ修正版
 * =====================================================================
 */
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { AdultProduct } from '../types';

/** 🛡️ 内部ユーティリティ: 安全なデータ抽出 */
const safeExtract = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  if (data.data && Array.isArray(data.data)) return data.data;
  return [];
};

/** 🔄 クエリパラメータ正規化 (?0=D&1=U バグ防止) */
const normalizeParams = (params: any) => {
  // params がオブジェクトではなく単なる文字列（"FANZA"など）で来た場合の救済
  if (typeof params === 'string') {
    return { api_source: params.toUpperCase() };
  }
  
  const clean: Record<string, string> = {};
  if (!params || typeof params !== 'object') return clean;

  Object.keys(params).forEach(key => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== 'undefined' && val !== '') {
      let targetKey = key;
      if (key === 'service') targetKey = 'service_code';
      if (key === 'floor') targetKey = 'floor_code';
      
      if (targetKey === 'api_source') {
        clean[targetKey] = String(val).toUpperCase();
      } else {
        const lowercaseKeys = ['service_code', 'floor_code', 'related_to_id'];
        if (lowercaseKeys.includes(targetKey)) {
          clean[targetKey] = String(val).toLowerCase();
        } else {
          clean[targetKey] = String(val); 
        }
      }
    }
  });
  return clean;
};

/**
 * 💡 2. 製品データ取得 (Core)
 */

/** 📦 統合製品リスト取得 */
export async function getUnifiedProducts(params: any = {}) {
  const cleanParams = normalizeParams(params);
  const queryString = new URLSearchParams(cleanParams).toString();
  
  // 💡 修正: client.ts が内部で /api を付けるため、ここでは /adult から開始
  const targetUrl = resolveApiUrl(`/adult/unified-products/?${queryString}`);

  const isFiltered = !!(cleanParams.actress_id || cleanParams.genre_id || cleanParams.maker_id);

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(),
      cache: isFiltered ? 'no-store' : 'default',
      next: isFiltered ? { revalidate: 0 } : { revalidate: 3600 }
    });

    const data = await handleResponseWithDebug(res, targetUrl);
    
    return { 
      results: safeExtract(data), 
      count: data?.count || 0
    };
  } catch (error) { 
    console.error("[UnifiedList Bridge] FETCH_FAILED:", error);
    return { results: [], count: 0 }; 
  }
}

/** 🎯 製品詳細取得 */
export async function getAdultProductDetail(id: string | number): Promise<AdultProduct | null> {
  if (!id || id === 'main') return null;
  
  // 💡 修正: /api/api を防ぐため /adult に修正
  const targetUrl = resolveApiUrl(`/adult/products/${id}/`);
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(), 
      cache: 'no-store' 
    });
    
    const data = await handleResponseWithDebug(res, targetUrl);
    
    if (data?.detail === "Not found." || data?._error) return null;
    return data as AdultProduct;
  } catch (error) {
    console.error(`[ProductDetail Bridge] FETCH_FAILED [${id}]:`, error);
    return null; 
  }
}

/**
 * 💡 3. タクソノミー取得
 */

/** 🏷️ タクソノミー汎用フェッチャー */
export async function fetchAdultTaxonomyIndex(type: string, floorCodeOrParams?: string | any) {
  try {
    const rawParams = typeof floorCodeOrParams === 'object' ? floorCodeOrParams : { floor_code: floorCodeOrParams };
    const cleanParams = normalizeParams({ type, ...rawParams });
    const query = new URLSearchParams(cleanParams).toString();
    
    // 💡 修正: /api/api を防ぐため /adult に修正
    const url = resolveApiUrl(`/adult/taxonomy/?${query}`);
    
    const res = await fetch(url, { headers: getDjangoHeaders(), next: { revalidate: 3600 } });
    const data = await handleResponseWithDebug(res, url);
    
    return { 
      results: safeExtract(data),
      count: data?.count || 0
    };
  } catch (error) {
    return { results: [], count: 0 };
  }
}

export const fetchGenres = (p?: any) => fetchAdultTaxonomyIndex('genres', p);
export const fetchMakers = (p?: any) => fetchAdultTaxonomyIndex('makers', p);
export const fetchActresses = (p?: any) => fetchAdultTaxonomyIndex('actresses', p);

/**
 * 💡 4. ナビゲーションメニュー取得 (TypeError の主原因)
 */
export async function getAdultNavigationFloors(params: any = {}) {
  const cleanParams = normalizeParams(params);
  const query = new URLSearchParams(cleanParams).toString();
  const siteVal = cleanParams.api_source || '';
  
  // 💡 修正: /api/api を防ぐため /adult に修正
  const targetUrl = resolveApiUrl(`/adult/navigation/floors/?${query}`);
  
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(), 
      next: { revalidate: 3600 } 
    });
    const json = await res.json();
    const data = json?.data || json || {};

    if (siteVal) {
      const filteredData: any = {};
      Object.keys(data).forEach(key => {
        const k = key.toUpperCase();
        const isMatch = (siteVal === 'DMM') 
          ? (k.includes('DMM') && !k.includes('FANZA'))
          : k.includes(siteVal);
          
        if (isMatch) filteredData[key] = data[key];
      });
      return Object.keys(filteredData).length > 0 ? filteredData : data;
    }

    return data;
  } catch (error) {
    console.error("[NavFloors Bridge] FETCH_FAILED:", error);
    return {};
  }
}