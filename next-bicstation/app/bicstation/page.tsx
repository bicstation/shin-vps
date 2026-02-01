/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { fetchPostList, fetchMakers } from '@shared/components/lib/api';
import Sidebar from '@shared/components/layout/Sidebar';
import Pagination from '@shared/components/common/Pagination';
import styles from '../MainPage.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * 💡 SEOメタデータの動的生成
 * ページ番号に応じてタイトルを変化させ、正規URL（canonical）を正しく設定します。
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const sParams = await searchParams;
    const offset = parseInt(Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset || '0', 10);
    const pageNum = offset > 0 ? ` | ${Math.floor(offset / 12) + 1}ページ目` : '';
    
    const title = `PCトピックス・ニュース一覧${pageNum} - BICSTATION`;
    const description = `最新のPCスペック情報、メーカー動向、選び方の解説記事一覧です。Lenovo, Dell, HPなどの最新モデル情報を網羅しています。${pageNum}`;
    const baseUrl = "https://bicstation.com/bicstation";
    const canonical = offset > 0 ? `${baseUrl}?offset=${offset}` : baseUrl;

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            siteName: 'BICSTATION',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

export default async function BicstationListPage({ searchParams }: PageProps) {
    const sParams = await searchParams;
    const offsetStr = Array.isArray(sParams.offset) ? sParams.offset[0] : sParams.offset;
    const currentOffset = parseInt(offsetStr || '0', 10);
    const limit = 12;

    /**
     * 🛠️ 修正ポイント:
     * fetchPostList に limit と currentOffset の両方を渡します。
     * lib/api.ts 側で offset パラメータを処理するようにしたため、これでページが切り替わります。
     */
    const [wpDataResponse, makersData] = await Promise.all([
        fetchPostList(limit, currentOffset) as any, 
        fetchMakers()
    ]);

    const posts = wpDataResponse.results || [];
    // APIのレスポンスヘッダーから取得した全記事数（count）を使用します
    const totalCount = wpDataResponse.count || 0;

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
        "@type": "CollectionPage",
        "name": "BICSTATION PCトピックス一覧",
        "description": "最新のPC情報、レビュー、スペック比較に関する記事の一覧ページです。",
        "url": `https://bicstation.com/bicstation${currentOffset > 0 ? `?offset=${currentOffset}` : ''}`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": posts.map((post: any, index: number) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://bicstation.com/bicstation/${post.slug}`,
                "name": safeDecode(post.title.rendered)
            }))
        }
    };

    return (
        <div className={styles.wrapper}>
            {/* 🚩 構造化データの挿入 */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <aside className={styles.sidebarSection}>
                <Sidebar 
                    activeMenu="all" 
                    makers={makersData} 
                    recentPosts={posts.slice(0, 10).map((p: any) => ({
                        id: p.id,
                        title: safeDecode(p.title.rendered),
                        slug: p.slug
                    }))}
                />
            </aside>

            <main className={styles.main}>
                <header className={styles.pageHeader}>
                    <h1 className={styles.mainTitle}>
                        PCトピックス <span className={styles.subTitle}>最新ニュース・解説記事一覧</span>
                    </h1>
                    <p className={styles.leadText}>
                        最新モデルの発表情報から、スペックの詳細比較まで。PC選びに役立つ情報を配信中。
                    </p>
                </header>

                <section className={styles.newsSection}>
                    {posts.length === 0 ? (
                        <div className={styles.noDataLarge}>
                            <p>現在、表示できる記事がありません。</p>
                            <Link href="/" className={styles.resetLink}>トップページへ戻る</Link>
                        </div>
                    ) : (
                        <>
                            <div className={styles.newsGrid}>
                                {posts.map((post: any) => {
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
                                                <h2 className={styles.articleTitle}>
                                                    {safeDecode(post.title.rendered)}
                                                </h2>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* ページネーション */}
                            <div className={styles.paginationWrapper}>
                                <Pagination 
                                    currentOffset={currentOffset}
                                    limit={limit}
                                    totalCount={totalCount}
                                    baseUrl="/bicstation" 
                                />
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}