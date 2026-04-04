/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import React from 'react';
import { headers } from "next/headers";
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import styles from './page.module.css';

/**
 * 💡 Next.js 15 用の動的レンダリング設定
 * キャッシュを無効化し、常に最新のAPIデータを取得します。
 */
export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

/**
 * 🏠 ビック的節約生活 メインページ (V5.1 Domain Matching Edition)
 * ドメイン名: bic-saving.com
 */
export default async function Page() {
    // --- 🎯 STEP 1: ドメイン・コンテキストの特定 ---
    const headerList = await headers();
    // 提督指定のドメイン "bic-saving.com" を基準に設定をロード
    const host = headerList.get('host') || "bic-saving.com";
    const siteConfig = getSiteMetadata(host); 

    // --- 🎯 STEP 2: ターゲットURL設定 (ホスト名による仕分け) ---
    /**
     * 🛰️ ホスト名 'api-saving-host' を使用
     * docker-compose の extra_hosts により、コンテナ内から Traefik 窓口へ繋がります。
     */
    const TARGET_API_URL = "http://api-saving-host:8083/api/posts/";
    
    console.log("\n" + "🏁".repeat(20));
    console.log(`⚓ [V5.1_DOMAIN_LOCKED]: ${host}`);
    console.log(`🔗 API_PROXY_TARGET: ${TARGET_API_URL}`);

    let displayPosts = [];
    let errorLog = null;

    try {
        /**
         * 🚀 APIへリクエストを送信 (limit=20)
         * Django側の V5.1 Middleware が 'Host' ヘッダーを読み取り、
         * 自動的に「Savingサイト用」の記事（および共通記事）を抽出します。
         */
        const response = await fetch(`${TARGET_API_URL}?limit=20`, { 
            cache: 'no-store',
            headers: { 
                'Accept': 'application/json',
                // 重要: Django側が識別に使用する内部ホスト名を明示
                'Host': 'api-saving-host'
            },
            signal: AbortSignal.timeout(5000) 
        });
        
        if (!response.ok) throw new Error(`HTTP_STATUS: ${response.status}`);

        const jsonPayload = await response.json();
        const results = jsonPayload?.results || [];

        console.log(`📥 DATA_RECEIVED: ${results.length} items from Django V5.1 engine.`);

        /**
         * 🛡️ フェイルセーフ・マッピング
         * Django側でフィルタ済みですが、アダルトフラグ等の最終検閲を行います。
         */
        displayPosts = results.filter(item => {
            if (item.is_adult === true) return false;
            return true; 
        });

        console.log(`🎯 DISPLAY_READY: ${displayPosts.length} items matched.`);
        console.log("🏁".repeat(20) + "\n");

    } catch (error) {
        console.error("❌ FETCH_FAILED:", error.message);
        errorLog = error.message;
    }

    return (
        <div className={styles.mainContainer}>
            {/* ヘッダーセクション */}
            <header className={styles.header}>
                <h2 className={styles.pageTitle}>
                    {siteConfig.site_name} 
                    <span className={styles.titleThin}>/DOMAIN_SYNC</span>
                </h2>
                {displayPosts.length > 0 && (
                    <span className={styles.countBadge}>
                        ONLINE: {displayPosts.length}
                    </span>
                )}
            </header>
            
            {/* メインコンテンツエリア */}
            <div className={styles.contentArea}>
                {displayPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {displayPosts.map((post) => (
                            <UnifiedProductCard 
                                key={post.id} 
                                data={post} 
                                siteConfig={siteConfig} 
                            />
                        ))}
                    </div>
                ) : (
                    /* 通信エラーまたはデータなしの場合の表示 */
                    <div className={styles.noDataArea}>
                        <div className={styles.glitchBox}>
                            <div className={styles.glitchIcon}>📡</div>
                            <p className={styles.glitchText}>DOMAIN_CONNECTION_ERROR</p>
                            <p className="text-xs opacity-50 mt-4 font-mono">
                                TARGET: {TARGET_API_URL}<br />
                                DOMAIN: {host}<br />
                                ERROR: {errorLog || "Empty response from server"}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* フッターセクション */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <p>SYSTEM_CORE: V5.1-FINAL / DOMAIN: {host} / NODE: api-saving-host</p>
                    <p className={styles.copyright}>&copy; 2026 {siteConfig.site_name} INTEGRATED FLEET</p>
                </div>
            </footer>
        </div>
    );
}