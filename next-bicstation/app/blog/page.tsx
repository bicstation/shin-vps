/* eslint-disable @next/next/no-img-element */
/**
 * 💻 Bicstation 記事一覧 (Hybrid Markdown Edition)
 * 🛡️ Maya's Logic: Integration V12.1 (Final Fix)
 * 物理パス: app/blog/page.tsx
 * 修正内容: インポートパスを実体に合わせて django/posts に修正
 */

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

// ✅ 修正ポイント: grepの結果に基づき、正しい物理パスを指定
import { getWpFeaturedImage } from '@/shared/lib/api';
import { fetchPostList } from '@/shared/lib/api/django/posts'; 

// ✅ その他のユーティリティとコンポーネント
import { getPostsFromFolder } from '@/shared/lib/utils/markdown'; 
import { decodeHtml } from '@/shared/lib/utils/decode';
import Sidebar from '@/shared/layout/Sidebar/PCSidebar';
import Pagination from '@/shared/components/molecules/Pagination';
import { fetchMakers } from '@/shared/lib/api/django/pc';

// スタイルシート
import styles from './Page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * 💡 SEOメタデータ生成
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const sParams = await searchParams;
    const offset = Math.max(0, parseInt(String(sParams.offset || '0'), 10));
    const pageNum = offset > 0 ? ` | ${Math.floor(offset / 12) + 1}ページ目` : '';
    
    return {
        title: `PCトピックス・ニュース一覧${pageNum} - BICSTATION`,
        description: `最新のPCスペック情報やテックニュース、詳細な解説記事の一覧です。44年のエンジニアリング・ナレッジを集約。`,
    };
}

/**
 * 💡 メインページコンポーネント
 */
export default async function BicstationListPage({ searchParams }: PageProps) {
    const sParams = await searchParams;
    const currentOffset = Math.max(0, parseInt(String(sParams.offset || '0'), 10));
    const limit = 12;

    /**
     * 🚀 データフェッチ並列実行
     * エラーログにあった TypeError 回避のため、空レスポンスを保証
     */
    const [wpDataResponse, localPosts, makersData] = await Promise.all([
        fetchPostList(100, 0, 'bicstation').catch(() => ({ results: [], count: 0 })), 
        getPostsFromFolder('content/bicstation').catch(() => []),
        fetchMakers().catch(() => [])
    ]);

    // 1. ローカル記事（Markdown）を共通フォーマットに変換
    const formattedLocalPosts = (localPosts || []).map(lp => ({
        id: `local-${lp.slug}`,
        slug: lp.slug,
        title: { rendered: lp.title },
        date: lp.date,
        isMarkdown: true,
        featured_media_src_url: lp.thumbnail || '/no-image.png'
    }));

    // 2. API記事の抽出 (wpDataResponse.results が undefined の場合を考慮)
    const apiPosts = wpDataResponse?.results || [];
    
    // 3. 全記事統合 & 日付順に降順ソート
    const combinedPosts = [...formattedLocalPosts, ...apiPosts].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });

    // 4. 現在のページ分をスライス
    const allPosts = combinedPosts.slice(currentOffset, currentOffset + limit);
    const totalCount = combinedPosts.length;

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebarSection}>
                <Sidebar 
                    activeMenu="all" 
                    makers={makersData || []} 
                    recentPosts={combinedPosts.slice(0, 5).map((p: any) => ({
                        id: p.id,
                        title: decodeHtml(p.title?.rendered || 'Untitled'),
                        slug: p.slug
                    }))}
                />
            </aside>

            <main className={styles.main}>
                <header className={styles.pageHeader}>
                    <h1 className={styles.mainTitle}>
                        PCトピックス <span className={styles.subTitle}>最新ニュース・テック解説</span>
                    </h1>
                </header>

                <section className={styles.newsSection}>
                    {allPosts.length === 0 ? (
                        <div className={styles.noDataLarge}>
                            <p>該当する記事が見つかりませんでした。</p>
                            <Link href="/" className={styles.backLink}>トップへ戻る</Link>
                        </div>
                    ) : (
                        <>
                            <div className={styles.newsGrid}>
                                {allPosts.map((post: any) => {
                                    const imageUrl = post.isMarkdown 
                                        ? post.featured_media_src_url 
                                        : getWpFeaturedImage(post, 'large');

                                    return (
                                        <Link 
                                            href={`/blog/${post.slug}`} 
                                            key={post.id} 
                                            className={styles.newsCard}
                                        >
                                            <div className={styles.imageWrapper}>
                                                {post.isMarkdown && (
                                                    <span className={styles.mdBadge}>LOCAL GUIDE</span>
                                                )}
                                                <img 
                                                    src={imageUrl || '/no-image.png'} 
                                                    alt="" 
                                                    className={styles.eyecatch}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/no-image.png';
                                                    }}
                                                />
                                            </div>
                                            <div className={styles.contentBody}>
                                                <div className={styles.postMeta}>
                                                    <span className={styles.postDate}>
                                                        {new Date(post.date).toLocaleDateString('ja-JP', {
                                                            year: 'numeric', month: '2-digit', day: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <h2 className={styles.articleTitle}>
                                                    {decodeHtml(post.title?.rendered || 'Untitled')}
                                                </h2>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className={styles.paginationWrapper}>
                                <Pagination 
                                    currentOffset={currentOffset}
                                    limit={limit}
                                    totalCount={totalCount}
                                    baseUrl="/blog" 
                                />
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}