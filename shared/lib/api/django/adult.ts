/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 🔞 アダルトコンテンツ統合サービス (shared/lib/api/django/adult.ts)
 * =====================================================================
 * 【責務】
 * 1. 複数APIソース（FANZA/DMM/DUGA）のクエリ正規化と統合
 * 2. タクソノミー（女優/ジャンル/メーカー等）の横断取得
 * 3. サイト別ナビゲーション（フロア/サービス）の動的生成
 * =====================================================================
 */
// shared/lib/api/django/adult.ts

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from './client';
import { AdultProduct } from '../types';

/**
 * 🛠️ 1. 内部ユーティリティ
 */

/** 🛡️ レスポンス抽出の安全性確保 */
const safeExtract = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results || data.data || [];
};

/** * 🔄 クエリパラメータ正規化エンジン
 * フロントエンドの命名規則を Django モデルのフィールド名へ翻訳します。
 * 特に 'api_source' の大文字化は、Django 側でのフィルタリング精度に直結します。
 */
const normalizeParams = (params: any) => {
  const clean: Record<string, string> = {};
  if (!params) return clean;

  Object.keys(params).forEach(key => {
    const val = params[key];
    
    // 無効な値 (undefined, null, 空文字) を徹底排除
    if (val !== undefined && val !== null && val !== 'undefined' && val !== '') {
      let targetKey = key;
      
      // 🚀 マッピング: Frontend Key -> Django Model Field
      if (key === 'service') targetKey = 'service_code';
      if (key === 'floor') targetKey = 'floor_code';
      
      // 💡 api_source はモデル側で大文字（CHOICE）管理されているため強制変換
      if (targetKey === 'api_source') {
        clean[targetKey] = String(val).toUpperCase(); // e.g., 'fanza' -> 'FANZA'
      } else {
        // 小文字化が必要なコード系キーの処理
        const lowercaseKeys = ['service_code', 'floor_code', 'related_to_id'];
        if (lowercaseKeys.includes(targetKey)) {
          clean[targetKey] = String(val).toLowerCase();
        } else {
          // スラッグやIDは文字列として維持
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

/** * 📦 統合製品リスト取得
 * キャッシュ戦略: フィルタリング時は鮮度優先 (no-store)、一覧時は速度優先 (3600s)
 */
export async function getUnifiedProducts(params: any = {}) {
  const cleanParams = normalizeParams(params);
  const queryString = new URLSearchParams(cleanParams).toString();
  const targetUrl = resolveApiUrl(`/api/adult/unified-products/?${queryString}`);

  // 特定の属性（女優、メーカー等）による絞り込みがあるか判定
  const isFiltered = !!(
    cleanParams.attribute || 
    cleanParams.attribute_id || 
    cleanParams.actress_id || 
    cleanParams.related_to_id
  );

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(),
      // フィルタ時は常に最新、それ以外は1時間キャッシュ
      cache: isFiltered ? 'no-store' : 'default',
      next: isFiltered ? { revalidate: 0 } : { revalidate: 3600 }
    });

    if (!res.ok) throw new Error(`HTTP_ERROR_${res.status}`);
    const data = await res.json();
    
    return { 
      results: safeExtract(data), 
      count: data?.count || (Array.isArray(data) ? data.length : 0)
    };
  } catch (error) { 
    console.error("[UnifiedList Bridge] FETCH_FAILED:", error);
    return { results: [], count: 0 }; 
  }
}

/** 🎯 製品詳細取得 */
export async function getAdultProductDetail(id: string | number): Promise<AdultProduct | null> {
  const targetUrl = resolveApiUrl(`/api/adult/products/${id}/`);
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(), 
      cache: 'no-store' 
    });
    const data = await handleResponseWithDebug(res, targetUrl);
    if (data?.detail === "Not found." || data?._error) return null;
    return data;
  } catch (error) {
    console.error(`[ProductDetail Bridge] FETCH_FAILED [${id}]:`, error);
    return null; 
  }
}

/**
 * 💡 3. タクソノミー（マスターデータ）取得
 */

/** 🏷️ タクソノミー汎用フェッチャー */
export async function fetchAdultTaxonomyIndex(type: string, floorCodeOrParams?: string | any, limit?: number) {
  try {
    const isParamObj = typeof floorCodeOrParams === 'object' && floorCodeOrParams !== null;
    const rawParams = isParamObj ? floorCodeOrParams : { floor_code: floorCodeOrParams, limit };
    
    const cleanParams = normalizeParams({
      type,
      ordering: rawParams.ordering || '-product_count', // 投稿数が多い順がデフォルト
      ...rawParams
    });

    const queryParams = new URLSearchParams(cleanParams);
    const url = resolveApiUrl(`/api/adult/taxonomy/?${queryParams.toString()}`);
    
    const res = await fetch(url, { 
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
    console.error(`[Taxonomy Bridge] ${type} FETCH_FAILED:`, error);
    return { results: [], count: 0 };
  }
}

// 🏷️ ショートカット関数群
export const fetchGenres = (p?: any) => fetchAdultTaxonomyIndex('genres', p);
export const fetchMakers = (p?: any) => fetchAdultTaxonomyIndex('makers', p);
export const fetchActresses = (p?: any) => fetchAdultTaxonomyIndex('actresses', p);
export const fetchSeries = (p?: any) => fetchAdultTaxonomyIndex('series', p);

/**
 * 💡 4. ナビゲーションメニュー取得 (防衛的フィルタリング)
 */

export async function getAdultNavigationFloors(params: { site?: string } = {}) {
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

    // 🚀 特定サイト向けの厳密な抽出ロジック
    if (siteVal) {
      const filteredData: any = {};
      Object.keys(data).forEach(key => {
        const k = key.toUpperCase();
        // DMM と FANZA の混同を防止するガードロジック
        const isMatch = (siteVal === 'DMM') 
          ? (k.includes('DMM') && !k.includes('FANZA'))
          : k.includes(siteVal);
          
        if (isMatch) filteredData[key] = data[key];
      });
      if (Object.keys(filteredData).length > 0) return filteredData;
    }

    return data;
  } catch (error) {
    console.error("[NavFloors Bridge] FETCH_FAILED:", error);
    return {};
  }
}