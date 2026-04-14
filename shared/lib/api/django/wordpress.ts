// @ts-nocheck
/**
 * =====================================================================
 * 🛰️ WordPress 外部連携サービス (v2.0 - Universal Bridge)
 * 🛡️ Maya's Logic: 外部ソースの統合マッピング & 安全な画像解決
 * =====================================================================
 */

import { getWpFeaturedImage } from '../index'; // 先ほど index.ts に定義した共通関数を活用

/**
 * 🛠️ WordPress から技術記事（Tech Insights）を取得
 * Django DB ではなく、外部の WP-JSON 経由で取得します。
 */
export async function fetchWPTechInsights(limit = 6) {
  // 外部 WP エンドポイント (技術情報の源泉)
  const WP_URL = "https://wp552476.wpx.jp/wp-json/wp/v2/posts";
  
  try {
    /**
     * 🚀 Fetch 実行
     * _embed: アイキャッチ画像やカテゴリ情報を展開して取得
     * per_page: 取得件数
     */
    const res = await fetch(`${WP_URL}?per_page=${limit}&_embed`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // 1時間キャッシュ (ISR)
    });
    
    if (!res.ok) {
        throw new Error(`🛰️ [WP_FETCH_FAILED] Status: ${res.status}`);
    }
    
    const posts = await res.json();
    
    if (!Array.isArray(posts)) return [];

    /**
     * 🎯 統一フォーマット（UnifiedPost 互換）へマッピング
     */
    return posts.map((post: any) => {
      // アイキャッチ画像の取得 (共通ユーティリティを使用)
      let featuredImage = getWpFeaturedImage(post, 'large');
      
      // 画像 URL の正規化 (二重スラッシュ等の洗浄)
      if (featuredImage) {
        featuredImage = featuredImage.replace(/([^:])\/\//g, '$1/');
      }

      return {
        id: `wp-${post.id}`, // Django の ID と衝突しないよう接頭辞を付与
        title: post.title?.rendered || 'Untitled',
        excerpt: post.excerpt?.rendered 
            ? post.excerpt.rendered.replace(/<[^>]*>?/gm, '').slice(0, 100) + '...' // HTMLタグ除去と短縮
            : '',
        link: post.link,
        date: post.date,
        image: featuredImage || '/images/common/no-image.jpg',
        category: 'TECH_INSIGHT',
        source: 'wordpress', // データソースを明示
        // テンプレート側での判定用
        site: 'bicstation' 
      };
    });

  } catch (error) {
    console.error("🚨 [WP_BRIDGE_ERROR]:", error);
    // 失敗時は空配列を返し、フロントエンドがクラッシュするのを防ぐ
    return [];
  }
}

/** 🚀 互換性維持のためのエイリアス */
export const fetchExternalTechNews = fetchWPTechInsights;