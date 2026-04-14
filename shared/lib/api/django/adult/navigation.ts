// @ts-nocheck
/**
 * =====================================================================
 * 🔞 アダルトナビゲーションサービス (Zenith v7.0 - Adult Domain Sync)
 * =====================================================================
 * 🛡️ 修正ポイント:
 * 1. 【識別子同期】siteTag (avflash等) を正確に client.ts へ伝え、正しい API 接続先を確保。
 * 2. 【フィルタ強化】api_source (DMM/FANZA等) によるフロアフィルタをより堅牢に。
 * 3. 【デバッグ統合】handleResponseWithDebug を使用し、SSR 時のログ出力を標準化。
 * =====================================================================
 */

import { normalizeParams } from './utils';
import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';

/**
 * 💡 ナビゲーションフロア情報の取得
 * サイト（DMM/FANZA/MGS等）ごとのジャンルやカテゴリの階層構造を取得します。
 */
export async function getAdultNavigationFloors(params: any = {}, host: string = '') {
  // 1. パラメータの正規化
  const cleanParams = normalizeParams(params);
  const siteTag = cleanParams.site || 'avflash'; // avflash / tiper 等
  const apiSource = cleanParams.api_source || ''; // DMM / FANZA / MGS 等

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
    
    /**
     * dataObj は { results: [...], count: ... } または 
     * オブジェクト直下 { 'DVD': {...}, 'FANZA': {...} } で返る可能性があるため正規化
     */
    const rawData = (dataObj.results && !Array.isArray(dataObj.results)) 
        ? dataObj.results 
        : (dataObj.results?.length > 0 ? dataObj.results : dataObj);

    // 4. APIソース（DMM/FANZA/MGS）によるフィルタリングロジック
    if (apiSource && typeof rawData === 'object') {
      const filteredData: any = {};
      const sourceUpper = apiSource.toUpperCase();

      Object.keys(rawData).forEach(key => {
        const k = key.toUpperCase();
        
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

    return rawData;
  } catch (error) {
    console.error(`🚨 [Adult-Nav Error] Target: ${targetUrl}`, error);
    return {};
  }
}