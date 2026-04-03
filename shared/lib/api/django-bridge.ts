/**
 * =====================================================================
 * 🌉 Django-Bridge 統合サービス層 (v7.7 - Final Production)
 * 🛡️ Maya's Logic: 指揮系統一本化・パス解決最適化
 * =====================================================================
 * 🚀 修正ポイント:
 * 1. 【パス解決】インポートを '@/shared/' 形式に統一し、Docker/Local両環境に対応。
 * 2. 【Middleware連携】x-django-hostヘッダーを最優先。再判定による不一致を根絶。
 * 3. 【一括置換】内部URL置換ロジックを強化し、閲覧環境に応じたURLへ動的変換。
 * =====================================================================
 */

import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import { getDjangoBaseUrl } from './config';

// 🚀 各ドメイン専門ロジック（shared内相対パス、またはエイリアス）
import { fetchPCProducts as fetchPCProductsLogic } from './django/pc';
import { getUnifiedProducts as getAdultProductsLogic } from './django/adult';
import { fetchPostList as fetchNewsLogic, fetchPostData as fetchNewsDetail } from './django/posts';

import { DjangoApiResponse } from './types';

/**
 * 🔄 【共通機能】内部URL・一括置換ユーティリティ
 * Djangoコンテナ内の内部ホスト名を、ブラウザからアクセス可能な公開URLへ一括変換します。
 */
export const replaceInternalUrls = (data: any): any => {
    if (!data) return data;
    const baseUrl = getDjangoBaseUrl(); // siteConfig 由来の URL
    if (!baseUrl) return data;
    
    if (typeof data === 'object') {
        try {
            let content = JSON.stringify(data);
            /**
             * 🔍 内部ネットワーク用ドメインを網羅的に検知して置換
             * django-v3, api-avflash-host, localhost 等を公開URLに書き換えます。
             */
            const internalPattern = /http:\/\/(django-v[23]|nginx-wp-v[23]|wordpress-.+v[23]|api-[a-z-]+-host|127\.0\.0\.1|localhost)(:[0-9]+)?/g;
            content = content.replace(internalPattern, baseUrl).replace(/([^:])\/\//g, '$1/'); 
            return JSON.parse(content);
        } catch (e) { 
            return data; 
        }
    }
    return data;
};

/**
 * 🛰️ 【安全なプロジェクト検知】
 * Middlewareで刻印された 'x-django-host' を最優先します。
 * これにより、SSR/ビルド時の判定ミスを物理的に防ぎます。
 */
const resolveCurrentMetadata = async (manualHost?: string) => {
    let host = manualHost || "";

    try {
        // 🚀 Next.js 15: headers() の動的取得
        const { headers } = await import('next/headers');
        const headerList = await headers();

        // 🛡️ Middlewareが判定・焼成した「身分証」があればそれを信じる
        const preCalculatedHost = headerList.get('x-django-host');
        if (preCalculatedHost && !manualHost) {
            // 再計算せず、既存のホスト名でメタデータを確定
            return getSiteMetadata(preCalculatedHost);
        }

        // ヘッダーがない（または手動指定がある）場合はHostヘッダーから判定
        host = host || headerList.get('host') || "";
    } catch (e) {
        // ビルド時 (Static Generation) や非リクエストコンテキストでのフォールバック
        host = host || process.env.NEXT_PUBLIC_SITE_DOMAIN || "";
    }

    return getSiteMetadata(host);
};

/**
 * 🚀 【司令塔】統合コンテンツ・スイッチャー
 * content_type に応じて適切な Django エンドポイントへ振り分けます。
 */
export async function fetchDjangoBridgeContent(params: any = {}): Promise<DjangoApiResponse<any>> {
    const meta = await resolveCurrentMetadata(params?.host);
    const contentType = params?.content_type || 'post';

    // 確定した django_host (身分証) を各ロジックに注入
    const contextHost = meta.django_host;

    // 1. 記事コンテンツ（News / Blog）
    if (contentType === 'news' || contentType === 'post') {
        return await fetchNewsLogic(params?.limit || 12, params?.offset || 0, contextHost);
    }

    // 2. 商品コンテンツ (アダルト/PCパーツの切り分け)
    if (meta.site_group === 'adult') {
        return await getAdultProductsLogic({ 
            ...params, 
            site_group: meta.site_tag, 
            host: contextHost 
        });
    }
    
    return await fetchPCProductsLogic({ 
        ...params, 
        site_group: meta.site_tag, 
        host: contextHost 
    });
}

/**
 * 📄 記事リスト取得のメインゲート
 * @param limit 取得件数
 * @param offset 開始位置
 * @param projectHost 手動ホスト指定（オプション）
 */
export async function fetchPostList(limit = 12, offset = 0, projectHost?: string) {
    const meta = await resolveCurrentMetadata(projectHost);
    return await fetchNewsLogic(limit, offset, meta.django_host);
}

/**
 * 📰 記事詳細取得のメインゲート
 * @param id 記事IDまたはスラグ
 * @param projectHost 手動ホスト指定（オプション）
 */
export async function fetchPostData(id: string, projectHost?: string) {
    const meta = await resolveCurrentMetadata(projectHost);
    return await fetchNewsDetail(id, meta.django_host);
}

/**
 * 💎 エイリアス & 互換性維持
 * 旧バージョンの関数名でも呼び出せるようにエクスポートします。
 */
export { 
    fetchNewsLogic as fetchNewsArticles,
    fetchNewsLogic as getSiteMainPosts,
    fetchPCProductsLogic as fetchPCProducts,
    getAdultProductsLogic as getAdultProducts,
    getAdultProductsLogic as getUnifiedProducts
};