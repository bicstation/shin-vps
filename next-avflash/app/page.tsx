/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger */
// @ts-nocheck 
// /home/maya/shin-dev/shin-vps/next-avflash/app/page.tsx

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

/**
 * ✅ 重要: 「管制塔 (index.ts)」をスルーして「実体ファイル」を直撃。
 * Next.js 15 特有の依存関係エラーを物理的に回避します。
 */
import { getUnifiedProducts } from '@shared/lib/api/django/adult';
import AdultProductCard from '@shared/components/organisms/cards/AdultProductCard';

import styles from './page.module.css';

/**
 * 💡 Next.js 15 用の動的レンダリング設定
 * ビルド時の API 接続をスキップし、実行時の動的取得を強制します。
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
    // --- 🛠️ 初期状態 ---
    let host = 'localhost';
    let products = [];
    let totalCount = 0;
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'AV FLASH';

    try {
        // 1. headers() の取得を試行（ビルド時はここがスキップ、または catch されます）
        const headerList = await headers();
        host = headerList.get('host') || 'avflash.xyz';

        /**
         * 🚀 データ取得実行
         * api_source: 'DUGA' を指定して最新 20件を取得。
         */
        const response = await getUnifiedProducts({ 
            api_source: 'DUGA',
            limit: 20 
        });

        if (response) {
            products = response.results || [];
            totalCount = response.count || 0;
            console.log(`[AvFlash] Sync Success: ${products.length} items for host: ${host}`);
        }
    } catch (error) {
        // ビルド時 (ENOTFOUND django-v3) はここを通りますが、ビルドは止まりません。
        console.warn("[AvFlash] API Connection Deferred: System will sync at runtime.");
    }

    return (
        <div className={styles.container}>
            
            {/* --- 🛸 ヒーローヘッダー --- */}
            <header className={styles.heroHeader}>
                <div className={styles.heroBadge}>DUGA OFFICIAL ARCHIVE</div>
                <h1 className={styles.heroTitle}>{title}</h1>
                <p className={styles.heroSubtitle}>
                    AI解析によって厳選された <span style={{ color: '#ffc107' }}>DUGA</span> の最新作品・サンプル動画
                </p>
                <div className={styles.statsInfo}>
                    Total <strong>{totalCount.toLocaleString()}</strong> curated items
                </div>
            </header>

            {/* --- 💎 DUGA NEW RELEASES グリッド --- */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.titleWrapper}>
                        <h2 className={styles.sectionTitle}>NEW RELEASES</h2>
                        <div className={styles.titleLine} />
                    </div>
                    <Link href="/brand/duga" className={styles.viewAllLink}>
                        VIEW ALL DUGA →
                    </Link>
                </div>
                
                <div className={styles.productGrid}>
                    {products && products.length > 0 ? (
                        products.map((item) => (
                            <AdultProductCard key={item.id || item.slug} product={item} />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🔍</div>
                            <h3>CONNECTING_TO_MATRIX...</h3>
                            <p>
                                Djangoサーバー <code>DUGA_STREAM</code> を待機中...<br />
                                現在、ホスト <strong>{host}</strong> 用のコンテンツを同期しています。
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ページ下部：インフォメーションセクション */}
            <section className={styles.infoSection}>
                <div className={styles.infoCard}>
                    <h3>AI ANALYSIS SITE</h3>
                    <p>
                        本ポータルは、最新のアダルトコンテンツをAI技術を用いて多角的に分析し、
                        ユーザーの好みに最適な作品を提案する次世代のエンタメポータルです。
                    </p>
                </div>
            </section>
        </div>
    );
}