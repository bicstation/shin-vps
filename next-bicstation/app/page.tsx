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
 * 検索結果でのクリック率を高めるため、キーワードを動的に挿入します。
 */
export async function generateMetadata({ searchParams }: PageProps) {
    const sParams = await searchParams;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    
    // Canonical URLの設定（重複コンテンツ対策：評価の分散を防ぐ）
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

    // WordPress APIからアイキャッチ画像（_embed）を含むデータを取得
    const [wpData, pcData, makersData] = await Promise.all([
        fetchPostList(6), 
        fetchPCProducts('', currentOffset, limit, attribute || ''), 
        fetchMakers() 
    ]);

    const posts = wpData.results || [];
    const listTitle = attribute 
        ? `${attribute.toUpperCase()} 搭載製品一覧` 
        : "製品ラインナップ";

    /**
     * エンティティのデコード処理
     */
    const safeDecode = (str: string) => {
        if (!str) return '';
        return str
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ');
    };

    return (
        <div className={styles.wrapper}>
            {/* サイドバーセクション */}
            <aside className={styles.sidebarSection}>
                <Sidebar 
                    activeMenu="all" 
                    makers={makersData} 
                    recentPosts={posts.map((p: any) => ({
                        id: p.id,
                        title: safeDecode(p.title.rendered),
                        slug: p.slug
                    }))}
                />
            </aside>

            {/* メインコンテンツエリア */}
            <main className={styles.main}>
                
                {/* 🚩 1. H1タグ: ページ固有の最重要キーワードを配置 */}
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

                {/* 🚩 2. 最新記事セクション: アイキャッチ画像付きカード形式 */}
                {/* 1ページ目かつ絞り込みなしの場合のみ表示（コンテンツの鮮度をアピール） */}
                {!attribute && currentOffset === 0 && (
                    <section className={styles.newsSection}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.emoji}>🚀</span> 注目のPCトピック
                        </h2>
                        <div className={styles.newsGrid}>
                            {posts.length === 0 ? (
                                <p className={styles.noData}>記事を読み込み中...</p>
                            ) : (
                                posts.map((post: any) => {
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
                )}

                {/* 🚩 3. 製品グリッドセクション: レスポンシブ対応のコンテナ */}
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
                            {/* CSS Gridを適用する親要素 */}
                            <div className={styles.productGrid}>
                                {pcData.results.map((product: any) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* ページネーション */}
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