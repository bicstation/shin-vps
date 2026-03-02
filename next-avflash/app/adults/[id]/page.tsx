/* eslint-disable @next/next/no-img-element */
// @ts-nocheck 

import React from 'react';
import { notFound } from 'next/navigation';
// ✅ 既存のライブラリから取得関数をインポート
import { getAdultProductDetail } from '@shared/lib/api/django/adult';
import AdultProductGallery from '@shared/cards/AdultProductGallery';
import styles from './page.module.css';

/**
 * 💡 Next.js 15 用の設定
 * 1. params は Promise として扱う必要があります
 * 2. force-dynamic で常に最新データを取得
 */
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdultDetailPage({ params }: PageProps) {
    // 🚀 1. params を await (Next.js 15 の必須処理)
    const { id } = await params;

    // 🚀 2. データの取得
    // shared/lib/api/django/client.ts の resolveApiUrl が 
    // IS_SERVER 時に http://django-v2:8000 を返すように修正されていることが前提です
    const product = await getAdultProductDetail(id);

    // 🚀 3. データがない場合は 404
    if (!product || product._error) {
        console.error(`[AVFLASH] Product Not Found. ID: ${id}`);
        notFound();
    }

    // 画像配列の正規化
    const allImages = (product.sample_image_urls && product.sample_image_urls.length > 0)
        ? product.sample_image_urls
        : [product.image_url];

    return (
        <div className={styles.container}>
            {/* --- 🛸 ヒーローヘッダー --- */}
            <header className={styles.heroHeader}>
                <div className={styles.heroBadge}>
                    {product.api_source?.toUpperCase()} _DATABANK
                </div>
                <h1 className={styles.heroTitle}>{product.title}</h1>
                <div className={styles.statsInfo}>
                    IDENT_ID: <strong>{product.product_id_unique}</strong> | 
                    SYNC_DATE: <strong>{product.release_date}</strong>
                </div>
            </header>

            <div className={styles.mainLayout}>
                {/* 🖼️ ギャラリーセクション (AdultProductGallery) */}
                <section className={styles.galleryArea}>
                    <AdultProductGallery 
                        images={allImages} 
                        title={product.title}
                        apiSource={product.api_source}
                        sampleMovieData={product.sample_movie_url ? {
                            url: product.sample_movie_url,
                            preview_image: product.image_url
                        } : null}
                    />
                </section>

                {/* 📊 サイドスペックエリア */}
                <aside className={styles.specAside}>
                    <div className={styles.infoCard}>
                        <h3 className={styles.cardLabel}>UNIT_SPECIFICATIONS</h3>
                        <dl className={styles.specList}>
                            <div><dt>MAKER</dt><dd>{product.maker?.name || '---'}</dd></div>
                            <div><dt>LABEL</dt><dd>{product.label?.name || '---'}</dd></div>
                            <div><dt>SERIES</dt><dd>{product.series?.name || '---'}</dd></div>
                        </dl>
                        
                        <div className={styles.tagSection}>
                            <p className={styles.tagLabel}>CAST_ID:</p>
                            <div className={styles.tags}>
                                {product.actresses?.map(act => (
                                    <span key={act.id} className={styles.tagItem}>{act.name}</span>
                                ))}
                            </div>
                        </div>

                        <a 
                            href={product.affiliate_url} 
                            target="_blank" 
                            rel="nofollow" 
                            className={styles.actionButton}
                        >
                            ACCESS_OFFICIAL_GATEWAY
                        </a>
                    </div>
                </aside>
            </div>

            {/* 📝 詳細テキスト */}
            <section className={styles.descriptionArea}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>ARCHIVE_LOG</h2>
                    <div className={styles.titleUnderline} />
                </div>
                <p className={styles.descriptionText}>
                    {product.product_description}
                </p>
            </section>
        </div>
    );
}