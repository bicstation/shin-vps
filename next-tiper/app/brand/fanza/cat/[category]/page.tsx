/* /app/brand/fanza/cat/[category]/page.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

/**
 * 🛰️ API インポート
 * 物理構造 shared/lib/api/django/adult.ts に準拠
 */
import { 
    fetchMakers, 
    fetchGenres, 
    fetchActresses, 
    fetchSeries,
    fetchDirectors,
    fetchAuthors 
} from '@/shared/lib/api/django/adult';

/**
 * ✅ 修正: 物理構造 shared/lib/utils/metadata.ts に合わせる
 */
import { constructMetadata } from '@/shared/lib/utils/metadata';
import styles from '@/app/brand/Archive.module.css';

export const dynamic = 'force-dynamic';

/**
 * 💡 カテゴリ定義の拡張
 */
const VALID_CATEGORIES: Record<string, { label: string; displayName: string; fetcher: any }> = {
    actress: { label: 'ACTRESS', displayName: '女優', fetcher: fetchActresses },
    genre: { label: 'GENRE', displayName: 'ジャンル', fetcher: fetchGenres },
    series: { label: 'SERIES', displayName: 'シリーズ', fetcher: fetchSeries },
    maker: { label: 'MAKER', displayName: 'メーカー', fetcher: fetchMakers },
    director: { label: 'DIRECTOR', displayName: '監督', fetcher: fetchDirectors },
    author: { label: 'AUTHOR', displayName: '著者', fetcher: fetchAuthors },
};

/**
 * 🛰️ METADATA_GENERATOR
 */
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params;
    const config = VALID_CATEGORIES[category];
    if (!config) return {};

    const displayTitle = `${config.displayName}一覧`;
    
    // ✅ 修正: 参照エラーを避けるため、メタデータ用に別途軽量なカウント取得、または静的な説明文に
    return constructMetadata({
        title: `FANZA ${displayTitle} | TIPER ARCHIVE`,
        description: `FANZAの${displayTitle}別アーカイブ。最新の解析データを網羅し、主要な${config.displayName}ノードをスキャン。`,
        canonical: `/brand/fanza/cat/${category}`
    });
}

/**
 * 🔳 FANZA_CATEGORY_LIST_PAGE
 * 役割: 特定カテゴリに属する全マスタデータ（女優一覧など）をグリッド表示する。
 */
export default async function FanzaCategoryListPage(props: { 
    params: Promise<{ category: string }> 
}) {
    // 1. パラメータの解決
    const { category } = await props.params;

    // 2. カテゴリの検証
    const config = VALID_CATEGORIES[category];
    if (!config) notFound();

    // 3. データ取得 (一括スキャン)
    const itemsRes = await config.fetcher({ 
        limit: 500, 
        api_source: 'fanza', 
        ordering: '-product_count' 
    }).catch(() => []);

    const items = Array.isArray(itemsRes) ? itemsRes : (itemsRes?.results || []);
    const accentColor = '#ff3366'; // FANZA PINK

    return (
        <div 
            className={styles.pageWrapper} 
            style={{ '--accent': accentColor } as any}
            data-platform="fanza"
        >
            <div className={styles.ambientGlow} />

            <main className={`${styles.mainContent} Archive_mainContent`}>
                {/* 🗺️ パンくずリスト */}
                <nav className={styles.breadcrumb}>
                    <Link href="/" className={styles.bcLink}>ROOT</Link>
                    <span className={styles.bcDivider}>/</span>
                    <Link href="/brand/fanza" className={styles.bcLink}>FANZA</Link>
                    <span className={styles.bcDivider}>/</span>
                    <span className={styles.bcActive}>{config.displayName} INDEX</span>
                </nav>

                <header className={styles.headerSection}>
                    <div className={styles.titleGroup}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-[1px] bg-[var(--accent)]"></span>
                            <span className="text-[10px] font-mono tracking-[0.4em] text-[var(--accent)] uppercase opacity-80">
                                CLASSIFICATION_INDEX / {config.label}
                            </span>
                        </div>
                        <h1 className={styles.titleMain}>{config.displayName} 一覧</h1>
                        
                        <div className={styles.statusInfo}>
                            <span className={styles.statusLabel}>ACTIVE_NODES:</span>
                            <span className={styles.statusValue}>{items.length}</span>
                        </div>
                    </div>
                </header>

                {/* 🔳 インデックス・グリッド */}
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-8">
                    {items.length > 0 ? (
                        items.map((item: any) => (
                            <Link 
                                key={item.id} 
                                href={`/brand/fanza/cat/${category}/${item.slug || item.id}`}
                                className="group relative bg-black/40 border border-white/5 p-4 hover:border-[var(--accent)] transition-all duration-300 overflow-hidden"
                            >
                                <div className="flex flex-col gap-1 relative z-10">
                                    <span className="text-gray-500 text-[9px] font-mono group-hover:text-[var(--accent)] transition-colors">
                                        ID_{String(item.id).padStart(6, '0')}
                                    </span>
                                    <span className="text-white font-bold text-sm leading-tight group-hover:translate-x-1 transition-transform duration-300">
                                        {item.name}
                                    </span>
                                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[var(--accent)] text-[10px] font-mono opacity-70">
                                            {item.product_count || 0} RECS
                                        </span>
                                        <span className="text-white/10 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all">→</span>
                                    </div>
                                </div>
                                {/* 💡 ホバー時に走るスキャンライン・エフェクト */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 group-hover:opacity-100 group-hover:top-full transition-all duration-1000 ease-in-out" />
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-40 text-center border border-dashed border-white/5 rounded">
                            <p className="text-gray-500 font-mono tracking-widest uppercase">No data nodes available in this sector.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}