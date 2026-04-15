// /home/maya/shin-vps/shared/lib/api/django/adult/navigation.ts
// @ts-nocheck
/**
 * =====================================================================
 * 🔞 アダルトナビゲーションサービス (Zenith v7.1 - Hardened)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【安全な大文字変換】apiSource や key が undefined でも toUpperCase で落ちないようガード。
 * 2. 【型チェックの厳格化】rawData が null の場合に Object.keys が爆発するのを防止。
 * 3. 【パラメータ正規化】URLSearchParams 構築時の undefined 混入を抑制。
 * =====================================================================
 */

import { normalizeParams } from './utils';
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';

/**
 * 💡 ナビゲーションフロア情報の取得
 * サイト（DMM/FANZA/MGS等）ごとのジャンルやカテゴリの階層構造を取得します。
 */
export async function getAdultNavigationFloors(params: any = {}, host: string = '') {
  // 1. パラメータの正規化 (undefined を空文字へ)
  const cleanParams = normalizeParams(params || {});
  const siteTag = cleanParams.site || 'avflash';
  const apiSource = cleanParams.api_source || ''; 

  const query = new URLSearchParams(cleanParams).toString();
  
  // 2. 接続先 URL の解決 (siteTag をリレー)
  const targetUrl = resolveApiUrl(`adult/navigation/floors/?${query}`, siteTag);
  
  try {
    const res = await fetch(targetUrl, { 
      headers: getDjangoHeaders(siteTag), 
      cache: 'no-store'
    });
    
    // 3. 共通レスポンスハンドラ (results 抽出ロジックを含む)
    const dataObj = await handleResponseWithDebug(res, targetUrl);
    
    // 🛡️ [ガード] レスポンス自体が null/undefined の場合を救済
    if (!dataObj) return {};

    /**
     * dataObj は { results: [...] } またはオブジェクト直下で返る可能性があるため正規化
     */
    const rawData = (dataObj.results && !Array.isArray(dataObj.results)) 
        ? dataObj.results 
        : (dataObj.results?.length > 0 ? dataObj.results : dataObj);

    // 4. APIソース（DMM/FANZA/MGS）によるフィルタリング
    // 🛡️ [ガード] rawData が null の場合に Object.keys() が死ぬのを防ぐ
    if (apiSource && rawData && typeof rawData === 'object') {
      const filteredData: any = {};
      
      // 🛡️ [安全な変換] apiSource が万が一 null の場合でも toUpperCase() を呼べるようにする
      const sourceUpper = (apiSource || "").toString().toUpperCase();

      Object.keys(rawData).forEach(key => {
        // 🛡️ [安全な変換] key 自体が不正な場合を考慮
        if (!key) return;
        const k = key.toString().toUpperCase();
        
        // 🛡️ DMM 特有の除外ロジック (DMMを指定した際は FANZA を含めない等の調整)
        let isMatch = false;
        if (sourceUpper === 'DMM') {
          isMatch = k.includes('DMM') && !k.includes('FANZA');
        } else {
          isMatch = k.includes(sourceUpper);
        }
          
        if (isMatch) filteredData[key] = rawData[key];
      });

      // マッチするものがあればフィルタ後を、なければ全体を返す
      return Object.keys(filteredData).length > 0 ? filteredData : rawData;
    }

    return rawData || {};
  } catch (error) {
    // 🚨 自宅PC環境などで通信に失敗した場合でも、UIを落とさないよう空オブジェクトを返却
    console.error(`🚨 [Adult-Nav Error] Target: ${targetUrl}`, error);
    return {};
  }
}