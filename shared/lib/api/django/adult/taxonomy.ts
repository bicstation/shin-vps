// @ts-nocheck
/**
 * =====================================================================
 * 🏷️ アダルト・タクソノミー取得層 (Taxonomy & Master Data)
 * 🛡️ Maya's Zenith v6.0: [UNIVERSAL_DOCKER_FINAL] 導線完全同期版
 * =====================================================================
 * 🚀 修正ポイント:
 * 1. 【識別子同期】siteTag (avflash/tiper) をリレーし、正しい接続先を確保。
 * 2. 【画像URL置換】女優の顔写真等が内部ドメインの場合、公開URLへ自動置換。
 * 3. 【拡張配列維持】Legacy Compatibility (totalCount 注入) を完全継承。
 * =====================================================================
 */

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { replaceInternalUrls } from '../posts'; // 💡 URL置換ロジックを再利用
import { normalizeParams, safeExtract } from './utils';

/**
 * 💡 統合エンティティフェッチャー
 * 旧 master.ts の「拡張配列」ロジックを継承し、型安全と互換性を両立します。
 */
export async function fetchAdultTaxonomyIndex(type: string, floorCodeOrParams?: string | any) {
    try {
        // 1. パラメータの正規化と siteTag の特定
        const rawParams = typeof floorCodeOrParams === 'object' 
            ? floorCodeOrParams 
            : { floor_code: floorCodeOrParams };
            
        // 🚀 Maya's Logic: 投稿数順（-product_count）をデフォルトにしつつ正規化
        const cleanParams = normalizeParams({ 
            ordering: '-product_count',
            type, 
            ...rawParams 
        });

        // サイト識別子の確定 (avflash, tiper, etc...)
        const siteTag = cleanParams.site || 'avflash';
        const query = new URLSearchParams(cleanParams).toString();
        
        // 2. パス解決（client.ts v11.0 仕様）
        const url = resolveApiUrl(`adult/taxonomy/?${query}`, siteTag);
        
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            cache: 'no-store' // 🔄 マスターデータは常に最新を反映
        });
        
        const data = await handleResponseWithDebug(res, url);
        
        /**
         * 🛡️ URL置換
         * 女優の顔写真URLなどが内部ホスト名（django-api-host等）の場合を考慮
         */
        const cleanedData = replaceInternalUrls(data);
        
        /**
         * 🔍 拡張配列ロジック (Legacy Compatibility)
         * フロントエンドが「戻り値を配列として扱い、かつ .totalCount を参照する」
         * という挙動に対応するため、配列オブジェクトにプロパティを注入します。
         */
        const list = safeExtract(cleanedData);
        const extendedList = [...list] as any;
        
        // メタデータの注入
        extendedList.totalCount = cleanedData?.count || list.length;
        extendedList._debug = cleanedData?._debug || { url };

        return extendedList;
    } catch (error: any) {
        console.error(`🚨 [Taxonomy Fetch Error] ${type}:`, error.message);
        const empty: any[] = [];
        (empty as any).totalCount = 0;
        (empty as any)._debug = { error: error.message };
        return empty;
    }
}

/**
 * ==========================================
 * 🚀 公開 API 関数群 (全エンティティ網羅)
 * ==========================================
 */

/** 🎭 ジャンル一覧 */
export const fetchGenres    = (p?: any) => fetchAdultTaxonomyIndex('genres', p);
/** 🏢 メーカー一覧 */
export const fetchMakers    = (p?: any) => fetchAdultTaxonomyIndex('makers', p);
/** 💃 女優一覧 */
export const fetchActresses = (p?: any) => fetchAdultTaxonomyIndex('actresses', p);
/** 🎞️ シリーズ一覧 */
export const fetchSeries    = (p?: any) => fetchAdultTaxonomyIndex('series', p);
/** 🏷️ レーベル一覧 */
export const fetchLabels    = (p?: any) => fetchAdultTaxonomyIndex('labels', p);
/** 🎬 監督一覧 */
export const fetchDirectors = (p?: any) => fetchAdultTaxonomyIndex('directors', p);
/** ✍️ 著者一覧 (Tipper/同人向け) */
export const fetchAuthors   = (p?: any) => fetchAdultTaxonomyIndex('authors', p);

/**
 * 💡 使用例:
 * const actresses = await fetchActresses({ site: 'avflash', limit: 20 });
 * console.log(actresses.totalCount); // データベース上の総女優数
 */