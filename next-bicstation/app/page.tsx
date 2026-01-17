/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/common/Pagination';
import { fetchPostList, fetchPCProducts, fetchMakers } from '@/lib/api'; 
import styles from './MainPage.module.css';

/**
 * 💡 SEOメタデータの動的生成
 */
export async function generateMetadata({ searchParams }: PageProps) {
    const sParams = await searchParams;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    
    const baseUrl = "https://bicstation.com";
    const canonical = attribute ? `${baseUrl}/?attribute=${attribute}` : baseUrl;

    if (!attribute) {
        return {
            title: "BICSTATION - 最新PCスペック比較・最安価格カタログ",
            description: "Lenovo, Dell, HP, Mouseなど主要メーカーのノートPC・デスクトップPCをリアルタイムに比較。最新のNPU搭載モデルや価格情報を網羅したPC専門ポータルです。",
            alternates: { canonical }
        };
    }

    return {
        title: `${attribute.toUpperCase()} 搭載製品の一覧・比較`,
        description: `${attribute.toUpperCase()} を搭載した最新PCのスペックと価格をリアルタイムで更新。メーカー直販モデルから最適な1台を探せます。`,
        alternates: { canonical }
    };
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
    const sParams = await searchParams;
    
    const offsetStr = Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    
    const currentOffset = parseInt(offsetStr || '0', 10);
    const limit = 10;

    // 💡 取得件数を20件に増やし、注目記事とアーカイブに分割します
    const [wpData, pcData, makersData] = await Promise.all([
        fetchPostList(20), 
        fetchPCProducts('', currentOffset, limit, attribute || ''), 
        fetchMakers() 
    ]);

    const allPosts = wpData.results || [];
    // 最初の6件をグリッド表示、7件目以降をリスト表示
    const featuredPosts = allPosts.slice(0, 6);
    const archivePosts = allPosts.slice(6);

    const listTitle = attribute 
        ? `${attribute.toUpperCase()} 搭載製品一覧` 
        : "製品ラインナップ";

    const safeDecode = (str: string) => {
        if (!str) return '';
        return str
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ');
    };

    /**
     * 🚀 JSON-LD 構造化データの生成
     */
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "name": "BICSTATION",
                "url": "https://bicstation.com",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://bicstation.com/?attribute={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@type": "Organization",
                "name": "BICSTATION",
                "url": "https://bicstation.com",
                "logo": "https://bicstation.com/logo.png"
            },
            {
                "@type": "ItemList",
                "name": listTitle,
                "itemListElement": pcData.results.map((product: any, index: number) => ({
                    "@type": "ListItem",
                    "position": currentOffset + index + 1,
                    "url": `https://bicstation.com/product/${product.unique_id}`,
                    "name": product.name
                }))
            }
        ]
    };

    return (
        <div className={styles.wrapper}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <aside className={styles.sidebarSection}>
                <Sidebar 
                    activeMenu="all" 
                    makers={makersData} 
                    recentPosts={allPosts.slice(0, 10).map((p: any) => ({
                        id: p.id,
                        title: safeDecode(p.title.rendered),
                        slug: p.slug
                    }))}
                />
            </aside>

            <main className={styles.main}>
                <header className={styles.pageHeader}>
                    {!attribute ? (
                        <h1 className={styles.mainTitle}>
                            BICSTATION <span className={styles.subTitle}>PCスペック比較・最安価格カタログ</span>
                        </h1>
                    ) : (
                        <h1 className={styles.mainTitle}>{attribute.toUpperCase()} 搭載PCの比較・一覧</h1>
                    )}
                    <p className={styles.leadText}>
                        主要メーカーの最新モデルをスペック別・価格別にリアルタイム集計。
                    </p>
                </header>

                {!attribute && currentOffset === 0 && (
                    <>
                        {/* 🚩 注目のPCトピック (グリッド表示) */}
                        <section className={styles.newsSection}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.emoji}>🚀</span> 注目のPCトピック
                            </h2>
                            <div className={styles.newsGrid}>
                                {featuredPosts.length === 0 ? (
                                    <p className={styles.noData}>記事を読み込み中...</p>
                                ) : (
                                    featuredPosts.map((post: any) => {
                                        const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/no-image.png';
                                        return (
                                            <Link 
                                                href={`/bicstation/${post.slug}`} 
                                                key={post.id} 
                                                className={styles.newsCard}
                                            >
                                                <div className={styles.imageWrapper}>
                                                    <img 
                                                        src={imageUrl} 
                                                        alt={safeDecode(post.title.rendered)} 
                                                        className={styles.eyecatch}
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div className={styles.contentBody}>
                                                    <span className={styles.postDate}>
                                                        {new Date(post.date).toLocaleDateString('ja-JP')}
                                                    </span>
                                                    <h3 className={styles.articleTitle}>
                                                        {safeDecode(post.title.rendered)}
                                                    </h3>
                                                </div>
                                            </Link>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {/* 🚩 過去の記事アーカイブ (テキストリスト表示) */}
                        {archivePosts.length > 0 && (
                            <section className={styles.archiveSection}>
                                <h2 className={styles.sectionTitleSmall}>
                                    <span className={styles.emoji}>📝</span> 以前の記事を読む
                                </h2>
                                <ul className={styles.archiveList}>
                                    {archivePosts.map((post: any) => (
                                        <li key={post.id} className={styles.archiveItem}>
                                            <span className={styles.archiveDate}>
                                                {new Date(post.date).toLocaleDateString('ja-JP').replace(/\//g, '.')}
                                            </span>
                                            <Link href={`/bicstation/${post.slug}`} className={styles.archiveLink}>
                                                {safeDecode(post.title.rendered)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <div className={styles.archiveFooter}>
                                    <Link href="/bicstation" className={styles.viewAllButton}>
                                        すべての記事一覧へ
                                    </Link>
                                </div>
                            </section>
                        )}
                    </>
                )}

                <section className={styles.productSection}>
                    <h2 className={styles.productGridTitle}>
                        <span className={styles.titleIndicator}></span>
                        {currentOffset === 0 ? listTitle : `${listTitle} (${currentOffset / limit + 1}ページ目)`}
                    </h2>

                    {pcData.results.length === 0 ? (
                        <div className={styles.noDataLarge}>
                            <p>該当する製品データがありません。</p>
                            {attribute && (
                                <Link href="/" className={styles.resetLink}>絞り込みを解除する</Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className={styles.productGrid}>
                                {pcData.results.map((product: any) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            <div className={styles.paginationWrapper}>
                                <Pagination 
                                    currentOffset={currentOffset}
                                    limit={limit}
                                    totalCount={pcData.count}
                                    baseUrl="/" 
                                />
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}