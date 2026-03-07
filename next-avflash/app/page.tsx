/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

/**
 * ✅ 重要: 「管制塔 (index.ts)」をスルーして「実体ファイル」を直撃します。
 * これにより、index.ts 内で getAdultNavigationFloors 等が undefined になる
 * Next.js 15 特有の依存関係エラー (TypeError) を物理的に回避します。
 */
import { getUnifiedProducts } from '@shared/lib/api/django/adult'; // 直通パスに変更
import AdultProductCard from '@shared/components/organisms/cards/AdultProductCard';

import styles from './page.module.css';

/**
 * 💡 Next.js 15 用の動的レンダリング設定
 */
export const dynamic = 'force-dynamic';

export default async function Page() {
    // 1. Next.js 15 の headers() を await
    const headerList = await headers();
    const host = headerList.get('host') || 'localhost';

    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'AV FLASH';
    
    // --- 🛠️ データ取得ロジック ---
    let products = [];
    let totalCount = 0;

    try {
        /**
         * 🚀 直通インポートした関数を実行
         * ログで 115 items 取れていることが確認できているため、
         * 関数の実体さえ正しく参照できれば、このままレンダリングへ進めます。
         */
        const response = await getUnifiedProducts({ 
            api_source: 'DUGA',
            limit: 20 // 必要に応じて追加
        });

        products = response?.results || [];
        totalCount = response?.count || 0;

        console.log(`[AvFlash] Rendering ${products.length} items for host: ${host}`);
    } catch (error) {
        console.error("[AvFlash] API Fetch Error:", error);
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
                            <AdultProductCard key={item.id} product={item} />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🔍</div>
                            <h3>NO PRODUCTS FOUND</h3>
                            <p>
                                Djangoサーバー <code>api_source='DUGA'</code> のデータを確認してください。<br />
                                現在、ホスト <strong>{host}</strong> 用のコンテンツが同期待ちの可能性があります。
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