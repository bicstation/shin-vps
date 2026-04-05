/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import React from 'react';
import { headers } from "next/headers";

// ✅ 共通コンポーネント
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ API・判定ロジック
import { fetchPostList } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import { constructMetadata } from '@/shared/lib/utils/metadata';

import styles from './page.module.css';

/**
 * 💡 Next.js 15 レンダリング設定
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
    // --- 🎯 STEP 1: コンテキスト特定 ---
    const headerList = await headers();
    const host = headerList.get('x-django-host') || headerList.get('host') || "bic-saving.com";
    const siteConfig = getSiteMetadata(host); 

    // --- 🎯 STEP 2: データ取得 ---
    let displayPosts = [];
    let count = 0;

    try {
        // fetchPostList v9.1 ロジックにより、ホスト名から正確に 'saving' を抽出
        const response = await fetchPostList(12, 0, host);
        displayPosts = response?.results || [];
        count = response?.count || 0;
    } catch (error) {
        console.error("❌ FETCH_FAILED:", error.message);
    }

    return (
        <div className={styles.mainContainer}>
            {/* 🛸 ヒーローセクション [LIFESTYLE_DESIGN] */}
            <header className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.brandBadge}>LIFESTYLE ARCHIVE</div>
                    <h1 className={styles.mainTitle}>{siteConfig.site_name}</h1>
                    <p className={styles.subTitle}>
                        日々の暮らしをより豊かに、より賢く。
                        <br className="hidden md:block" />
                        最新の節約術からライフハックまで、厳選された知恵をお届けします。
                    </p>
                    {count > 0 && (
                        <div className={styles.liveCounter}>
                            <span className={styles.pulseDot}></span>
                            現在 <strong>{count.toLocaleString()}</strong> 件の知恵を共有中
                        </div>
                    )}
                </div>
            </header>
            
            {/* 📰 メインコンテンツエリア */}
            <main className={styles.contentArea}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>LATEST ARTICLES</h2>
                    <div className={styles.titleUnderline}></div>
                </div>

                {displayPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {displayPosts.map((post) => (
                            <UnifiedProductCard 
                                key={post.id} 
                                data={post} 
                                siteConfig={siteConfig} 
                            />
                        ))}
                    </div>
                ) : (
                    /* 待機・エラー状態の優雅な表示 */
                    <div className={styles.loadingArea}>
                        <div className={styles.statusBox}>
                            <div className={styles.loadingIcon}>☕</div>
                            <p>最新の節約術を準備しています...</p>
                        </div>
                    </div>
                )}
            </main>

            {/* 🛡️ 信頼性セクション (審査対策) */}
            <section className={styles.aboutSection}>
                <div className={styles.aboutCard}>
                    <h3>ABOUT OUR MISSION</h3>
                    <p>
                        {siteConfig.site_name} は、変化する経済環境の中で「無理のない豊かな暮らし」を実現するための情報ポータルです。
                        独自の分析に基づき、実生活に役立つヒントをアーカイブ化し、皆様の賢い選択をサポートします。
                    </p>
                </div>
            </section>

            {/* フッター [PROD_READY] */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <p className={styles.copyright}>&copy; 2026 {siteConfig.site_name} - Smart Life Network</p>
                </div>
            </footer>
        </div>
    );
}