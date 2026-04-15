// /home/maya/shin-vps/shared/lib/api/django/adult/taxonomy.ts
// @ts-nocheck
/**
 * =====================================================================
 * 🏷️ アダルト・タクソノミー取得層 (Taxonomy & Master Data)
 * 🛡️ Maya's Zenith v6.1: [HARDENED_LEGACY_SYNC] 
 * =====================================================================
 * 🚀 修正ポイント:
 * 1. 【安全な型変換】type パラメータが undefined でも .toLowerCase() で落ちないようガード。
 * 2. 【拡張配列の堅牢化】空の結果が返っても .totalCount を安全に参照可能に。
 * 3. 【置換パスの修正】django-bridge から最新の URL 置換ロジックをインポート。
 * =====================================================================
 */

import { resolveApiUrl, getDjangoHeaders, handleResponseWithDebug } from '../client';
import { replaceInternalUrls } from '../../django-bridge'; // 💡 最新の統合置換ロジックを使用
import { normalizeParams, safeExtract } from './utils';

/**
 * 💡 統合エンティティフェッチャー
 * 旧 master.ts の「拡張配列」ロジックを継承。
 * 配列にプロパティを注入する特殊な形式を維持しつつ、毒抜きを行います。
 */
export async function fetchAdultTaxonomyIndex(type: string, floorCodeOrParams?: string | any) {
    try {
        // 🛡️ [ガード] type 自体が不正な場合に備えて文字列化と小文字化を安全に行う
        const safeType = (type || "genres").toString().toLowerCase();

        // 1. パラメータの正規化と siteTag の特定
        const rawParams = typeof floorCodeOrParams === 'object' 
            ? floorCodeOrParams 
            : { floor_code: floorCodeOrParams };
            
        // 🚀 Maya's Logic: 投稿数順をデフォルトにしつつ正規化
        const cleanParams = normalizeParams({ 
            ordering: '-product_count',
            type: safeType, 
            ...rawParams 
        });

        // サイト識別子の確定
        const siteTag = cleanParams.site || 'avflash';
        const query = new URLSearchParams(cleanParams).toString();
        
        // 2. パス解決
        const url = resolveApiUrl(`adult/taxonomy/?${query}`, siteTag);
        
        const res = await fetch(url, { 
            headers: getDjangoHeaders(siteTag), 
            cache: 'no-store'
        });
        
        const data = await handleResponseWithDebug(res, url);
        if (!data) throw new Error("API returned null response");
        
        /**
         * 🛡️ URL置換
         * 女優の顔写真URLなどが内部ホスト名の場合を考慮
         */
        const cleanedData = replaceInternalUrls(data);
        
        /**
         * 🔍 拡張配列ロジック (Legacy Compatibility)
         * フロントエンドが「戻り値を配列として扱い、かつ .totalCount を参照する」
         * という挙動に対応するため、配列オブジェクトにプロパティを注入します。
         */
        const list = safeExtract(cleanedData);
        
        // 🛡️ [毒抜き] リスト内の各アイテムの文字列操作で落ちないようガード
        const hardenedList = (Array.isArray(list) ? list : []).map(item => ({
            ...item,
            id: item.id?.toString() || "",
            name: item.name || item.title || "Unknown"
        }));

        const extendedList = [...hardenedList] as any;
        
        // メタデータの注入 (これがフロントエンドの UI 制御に必須)
        extendedList.totalCount = cleanedData?.count || hardenedList.length;
        extendedList._debug = cleanedData?._debug || { url };

        return extendedList;
    } catch (error: any) {
        console.error(`🚨 [Taxonomy Fetch Error] ${type}:`, error.message);
        
        // 🛡️ エラー時も「拡張配列」のインターフェースを維持して返却（UIの墜落防止）
        const empty: any[] = [];
        empty.totalCount = 0;
        empty._debug = { error: error.message };
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