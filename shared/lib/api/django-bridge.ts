// @ts-nocheck
/**
 * =====================================================================
 * 🌉 Django-Bridge 統合サービス層 (v8.1 - Hardened & Tag-Synchronized)
 * 🛡️ Maya's Logic: 指揮系統の完全同期 ＋ 不死身のガードレール
 * =====================================================================
 * [役割]
 * 1. 実行環境(URL)から、どのサイト(tiper, bicstation等)か特定する。
 * 2. 特定したサイトの識別子(site_tag)を、Django APIのクエリへ正しく注入する。
 * 3. 内部用URL(Dockerホスト名等)を公開用URLへリアルタイム置換する。
 */

import { getSiteMetadata } from '../utils/siteConfig';
import { getDjangoBaseUrl } from './config';

// 🚀 各ドメイン専門ロジック（専門職への依頼）
import { fetchPCProducts as fetchPCProductsLogic } from './django/pc';
import { getUnifiedProducts as getAdultProductsLogic } from './django/adult';
import { fetchPostList as fetchNewsLogic, fetchPostData as fetchNewsDetail } from './django/posts';

import { DjangoApiResponse } from './types';

/**
 * 🔄 【URL正規化】内部URL・一括置換ユーティリティ
 * Django内部(Docker)のURLを、フロントエンド公開URLへ変換する。
 * JSON文字列として一括置換することで、深い階層のデータも漏らさず処理。
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    
    const baseUrl = getDjangoBaseUrl(); 
    if (!baseUrl) return data;
    
    // API末尾の /api 等をカットしてオリジン部分だけを抽出
    const cleanBaseUrl = baseUrl.split('?')[0].replace(/\/+$/, '');

    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            /**
             * 🔍 内部ホスト名パターンの正規表現
             * 開発・本番・Docker内のあらゆるホスト名エイリアスを網羅
             */
            const internalPattern = /http:\/\/(django-v[23]|django-api-host|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            
            content = content.replace(internalPattern, cleanBaseUrl);
            
            // 🚨 [スラッシュ事故防止] http://domain.com//path のような二重スラッシュを修正
            content = content.replace(/([^:])\/\//g, '$1/'); 
            
            return JSON.parse(content);
        } catch (e) { 
            console.error("🚨 [ReplaceURL Error]:", e);
            return data; 
        }
    }
    return data;
};

/**
 * 🛰️ 【心臓部：プロジェクト検知】resolveCurrentMetadata
 * 現在のホスト名から site_tag (識別子) を決定する。
 * 自宅PC(localhost)やVPS、Middleware経由など全パターンで「undefined」を許さない。
 */
const resolveCurrentMetadata = async (manualHost?: string) => {
    let host = manualHost || "";

    try {
        // Next.js Server Components 環境からのヘッダー取得
        const { headers } = await import('next/headers');
        const headerList = await headers();

        // 1. Middlewareが刻印した身分証(x-django-host)を最優先
        const preCalculatedHost = headerList.get('x-django-host') || headerList.get('x-project-id');
        
        if (preCalculatedHost && !manualHost) {
            host = preCalculatedHost;
        } else {
            // 2. 直接のHostヘッダー
            host = host || headerList.get('host') || "";
        }
    } catch (e) {
        // 3. SSR以外（クライアントサイド等）や環境変数のフォールバック
        host = host || (typeof window !== 'undefined' ? window.location.host : "") || process.env.NEXT_PUBLIC_SITE_DOMAIN || "bicstation";
    }

    /**
     * 🛡️ [不死身のガード] 
     * hostが空やundefinedの場合、toLowerCase()でシステムが墜落するのを防ぐ。
     */
    const safeHost = (host || "bicstation").toString();
    const cleanHost = safeHost.split(':')[0].replace(/\/+$/, '').trim().toLowerCase();
    
    // v22.0 仕様のメタデータを取得（siteConfig.ts から取得）
    const meta = getSiteMetadata(cleanHost);

    // 🛡️ [最終防衛ライン] メタデータ自体が見つからない場合でも、基本構造を返却してクラッシュを回避
    return {
        site_tag: meta?.site_tag || 'bicstation',
        site_group: meta?.site_group || 'general',
        django_host: meta?.django_host || 'api-bicstation-host',
        ...meta
    };
};

/**
 * 🚀 【総司令部】統合コンテンツ・スイッチャー
 * ページ側はこの関数を呼ぶだけで、適切なAPI(PC用/アダルト用/記事用)へ自動配分される。
 */
export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    const meta = await resolveCurrentMetadata(params?.host);
    const contentType = params?.content_type || 'post';

    /**
     * 🎯 [指揮系統の同期] 
     * Django 側の ?site= パラメータには、物理ホスト名ではなくこの tag (例: tiper) を送る。
     * これにより、DB内の site カラムと完全に一致する。
     */
    const contextTag = meta.site_tag;

    // 1. 記事コンテンツ（News / Blog）
    if (contentType === 'news' || contentType === 'post') {
        return await fetchNewsLogic(params?.limit || 12, params?.offset || 0, contextTag);
    }

    // 2. 商品コンテンツ（特化型ロジックへの橋渡し）
    const logicParams = { 
        ...params, 
        site: contextTag,        // Django ViewSet 用の識別子
        site_group: meta.site_group, 
        host: meta.django_host   // 実際の通信先(nginxエイリアス等)
    };

    if (meta.site_group === 'adult') {
        return await getAdultProductsLogic(logicParams);
    }
    
    return await fetchPCProductsLogic(logicParams);
}

/**
 * 📄 記事リスト取得 (PostList 専門ゲート)
 */
export async function fetchPostList(limit = 12, offset = 0, projectHost?: string) {
    const meta = await resolveCurrentMetadata(projectHost);
    // site_tag を渡すことで、どのドメインから呼ばれても正しい記事を抽出
    return await fetchNewsLogic(limit, offset, meta.site_tag);
}

/**
 * 📰 記事詳細取得 (Detail 専門ゲート)
 */
export async function fetchPostData(id: string, projectHost?: string) {
    if (!id) return null;
    const meta = await resolveCurrentMetadata(projectHost);
    const cleanId = id.toString().replace(/\/+$/, '');
    return await fetchNewsDetail(cleanId, meta.site_tag);
}

/**
 * 💎 エイリアス & 互換性維持レイヤー
 * 過去のバージョン(v7.0以前)の関数名で呼んでいる箇所を救済
 */
export { 
    fetchNewsLogic as fetchNewsArticles,
    fetchNewsLogic as getSiteMainPosts,
    fetchPCProductsLogic as fetchPCProducts,
    getAdultProductsLogic as getAdultProducts,
    getAdultProductsLogic as getUnifiedProducts
};