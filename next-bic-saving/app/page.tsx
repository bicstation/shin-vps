/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import React from 'react';
import { headers } from "next/headers";

// ✅ 共通コンポーネント (最新の UnifiedCard を採用)
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ API・判定ロジック (統合ルートへ切り替え)
import { fetchPostList } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import { constructMetadata } from '@/shared/lib/utils/metadata';

import styles from './page.module.css';

/**
 * 💡 Next.js 15 用の動的レンダリング設定
 */
export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

/**
 * 🛰️ メタデータ生成
 */
export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('x-django-host') || headerList.get('host') || "bic-saving.com";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name} | 賢い選択、豊かな暮らし。`,
        description: `${siteConfig.site_name}が提供する、最新の節約術とライフハック。`,
        host: host 
    });
}

/**
 * 🏠 ビック的節約生活 メインページ
 */
export default async function Page() {
    // --- 🎯 STEP 1: ドメイン・コンテキストの特定 ---
    const headerList = await headers();
    
    // Middlewareの識別子を優先し、フォールバックをドメイン名に設定
    const host = headerList.get('x-django-host') || headerList.get('host') || "bic-saving.com";
    const siteConfig = getSiteMetadata(host); 

    // 🚀 サーバーログ (他サイトと書式を統一)
    console.log("⚓ --- SAVING_DEPLOY_REPORT ---");
    console.log("HOSTNAME:", host);
    console.log("SITE_NAME:", siteConfig.site_name); // "ビック的節約生活"
    console.log("---------------------------------");

    // --- 🎯 STEP 2: 統合API経由でのデータ取得 ---
    /**
     * 🛰️ fetchPostList を使用
     * 内部で client.ts v8.3 を通るため、site=saving/ ではなく site=saving でリクエストされます。
     */
    let displayPosts = [];
    let errorLog = null;

    try {
        const response = await fetchPostList(12, 0, host);
        displayPosts = response?.results || [];
        
        console.log(`📥 DATA_RECEIVED: ${displayPosts.length} items from Django fleet.`);
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
                    <span className={styles.titleThin}>/INTEGRATED_NODE</span>
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
                    /* 通信エラーまたはデータなしの場合 */
                    <div className={styles.noDataArea}>
                        <div className={styles.glitchBox}>
                            <div className={styles.glitchIcon}>📡</div>
                            <p className={styles.glitchText}>INTELLIGENCE_STREAM_DISCONNECTED</p>
                            <p className="text-xs opacity-50 mt-4 font-mono">
                                NODE: {host}<br />
                                ERROR: {errorLog || "Zero results from Django Bridge"}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* フッターセクション */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <p>SYSTEM_CORE: V8.3-FINAL / DOMAIN: {host} / PROTOCOL: Bridge-v3</p>
                    <p className={styles.copyright}>&copy; 2026 {siteConfig.site_name} INTEGRATED FLEET</p>
                </div>
            </footer>
        </div>
    );
}