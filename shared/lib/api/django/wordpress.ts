/**
 * =====================================================================
 * 🛰️ BICSTATION WordPress Intelligence Bridge (v14.2.0)
 * 🛡️ Role: External Data Normalization & Cyber-Standard Mapping
 * ---------------------------------------------------------------------
 * 【役割】
 * WordPress(WP-JSON)から取得した生のデータを、Next.jsアプリの
 * 共通コンポーネント（UnifiedProductCard等）が理解できる形式に変換します。
 * =====================================================================
 */

// @ts-nocheck

/**
 * 🖼️ WordPressの複雑な画像オブジェクトからURLを抽出
 * @param {any} post - WP-JSONから返却された記事単体オブジェクト
 * @param {string} size - 取得したい画像サイズ ('thumbnail' | 'medium' | 'large' | 'full')
 * @returns {string | null} 画像URL
 */
export function getWpFeaturedImage(post: any, size = 'large') {
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        // 指定されたサイズが存在すればそれを返し、なければ source_url (オリジナル) を返す
        return media.media_details?.sizes?.[size]?.source_url || media.source_url;
    }
    return null;
}

/**
 * 📡 WordPressから技術記事を柔軟に取得・整形
 * * --- 入口 (INPUT) ---
 * @param {number} limit - 取得件数 (デフォルト: 6)
 * @param {string} endpoint - APIのエンドポイントURL
 * * --- 出口 (OUTPUT) ---
 * @returns {Promise<Array>} BicStation規格に準拠した記事オブジェクトの配列
 * { id, title, excerpt, link, date, image, category, source, site }
 */
export async function fetchWPTechInsights(
    limit = 6, 
    endpoint = "https://legacy.nabejuku.com/wp-json/wp/v2/posts"
) {
    try {
        /**
         * 🚀 [STEP 1] Fetch実行
         * _embed パラメータを付与することで、アイキャッチ画像やカテゴリ情報を一度に取得
         */
        const res = await fetch(`${endpoint}?per_page=${limit}&_embed`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 3600 } // 1時間キャッシュ (ISR対応)
        });
        
        if (!res.ok) {
            throw new Error(`🛰️ [WP_FETCH_FAILED] Endpoint: ${endpoint}, Status: ${res.status}`);
        }
        
        const posts = await res.json();
        if (!Array.isArray(posts)) return [];

        /**
         * 🛠️ [STEP 2] BicStation Core規格へのマッピング（正規化）
         */
        return posts.map((post: any) => {
            // 画像の抽出
            let featuredImage = getWpFeaturedImage(post, 'large');
            
            // 🔍 [SECURITY_LOGIC] 画像URLの正規化
            // プロトコル部分を除き、二重スラッシュ（//）が混入している場合に1つに洗浄
            if (featuredImage) {
                featuredImage = featuredImage.replace(/([^:])\/\//g, '$1/');
            }

            return {
                // IDの競合を防ぐためプレフィックスを付与
                id: `wp-${post.id}`,
                
                // タイトルのレンダリング
                title: post.title?.rendered || 'UNTITLED_NODE',
                
                // サマリー生成：HTMLタグを除去してプレーンテキスト化
                excerpt: post.excerpt?.rendered 
                    ? post.excerpt.rendered.replace(/<[^>]*>?/gm, '').slice(0, 100) + '...'
                    : '',
                
                // リンクと日付
                link: post.link,
                date: post.date,
                
                // 画像フォールバック処理
                image: featuredImage || '/images/common/no-image.jpg',
                
                // --- 🏷️ システム識別用メタデータ ---
                category: 'TECH_INSIGHT',
                source: 'wordpress',
                site: 'bicstation' 
            };
        });

    } catch (error) {
        /**
         * 🚨 [ERROR_LOGIC] システム停止を防ぐためのサイレント・フォールバック
         */
        console.error("🚨 [WP_BRIDGE_ERROR]:", error);
        return []; // エラー時は空配列を返し、フロントエンドのレンダリング崩れを防ぐ
    }
}

/** * 🚀 [ALIAS] 旧関数名での呼び出しに対する互換性を維持 
 */
export const fetchExternalTechNews = fetchWPTechInsights;