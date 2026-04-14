// @ts-nocheck
/**
 * =====================================================================
 * 🔞 アダルト製品取得サービス (Zenith v12.0 - Adult Domain Sync)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【識別子同期】siteTag を client.ts へ伝え、適切な Django 接続先を確保。
 * 2. 【画像URL置換】内部ドメイン (django-api-host 等) を公開 URL へ自動置換。
 * 3. 【堅牢なパース】safeExtract と handleResponseWithDebug を組み合わせ、
 * SSR 時のパースエラーを完全に封殺。
 * =====================================================================
 */

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { replaceInternalUrls } from '../posts'; // 💡 内部ドメイン置換ロジックを再利用
import { normalizeParams, safeExtract } from './utils';
import { AdultProduct } from '../../types';

/**
 * 📦 統合製品リスト取得 (Unified API 経由)
 * FANZA, DMM, MGS 等の製品を横断的に取得します。
 */
export async function getUnifiedProducts(params: any = {}, host: string = '') {
  // 1. パラメータの正規化と siteTag の抽出
  const cleanParams = normalizeParams(params);
  const siteTag = cleanParams.site || 'avflash'; // avflash / tiper 等

  const queryString = new URLSearchParams(cleanParams).toString();
  
  /**
   * ✅ URL解決: client.ts (v11.0) のロジックを使用
   * 末尾スラッシュを固定し、siteTag を伝達。
   */
  const targetUrl = resolveApiUrl(`adult/unified-products/?${queryString}`, siteTag);

  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(siteTag), // 💡 siteTag ごとのヘッダーを付与
      cache: 'no-store', // 🔄 復旧優先：最新の在庫・価格情報を直視
    });

    // 2. 共通ハンドリング
    const data = await handleResponseWithDebug(res, targetUrl);
    
    // 3. 画像URLの洗浄 (内部ドメインが含まれる場合を考慮)
    const cleanedData = replaceInternalUrls(data);
    
    return { 
      results: safeExtract(cleanedData) as AdultProduct[], 
      count: cleanedData?.count || 0
    };
  } catch (error) { 
    console.error(`🚨 [Adult-Products] FETCH_FAILED: ${targetUrl}`, error);
    return { results: [], count: 0 }; 
  }
}

/**
 * 🎯 製品詳細取得
 * 単一製品の詳細データを取得します。
 */
export async function getAdultProductDetail(id: string | number, siteTag: string = 'avflash'): Promise<AdultProduct | null> {
  if (!id || id === 'main') return null;
  
  // 💡 site パラメータを付与して詳細取得を確実にする
  const targetUrl = resolveApiUrl(`adult/products/${id}/?site=${siteTag}`, siteTag);
  
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(siteTag), 
      cache: 'no-store' 
    });
    
    // handleResponseWithDebug は results 配列またはオブジェクト単体を正規化して返す
    const data = await handleResponseWithDebug(res, targetUrl);
    const cleanedData = replaceInternalUrls(data);

    /**
     * Django の詳細エンドポイントは results[0] ではなく単体オブジェクトを返すことが多いが
     * handleResponseWithDebug の仕様（resultsプロパティの有無）に合わせ、柔軟に抽出。
     */
    const product = (cleanedData.results && Array.isArray(cleanedData.results)) 
      ? cleanedData.results[0] 
      : (cleanedData.id ? cleanedData : null);
    
    // 404 または Not Found のガード
    if (!product || product.detail === "Not found." || cleanedData?._error) {
      console.warn(`⚠️ [Adult-Detail] Product not found: ${id}`);
      return null;
    }

    return product as AdultProduct;
  } catch (error) {
    console.error(`🚨 [Adult-Detail] FETCH_FAILED [${id}]:`, error);
    return null; 
  }
}

/** 🚀 エイリアス設定 */
export const fetchAdultProducts = getUnifiedProducts;
export const fetchAdultProductDetail = getAdultProductDetail;