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
 * layout.tsx で設定した template (%s | BICSTATION...) に基づき生成されます。
 * トップページでは、より具体的なキーワードを盛り込んでクリック率を高めます。
 */
export async function generateMetadata({ searchParams }: PageProps) {
    const sParams = await searchParams;
    const attribute = Array.isArray(sParams.attribute) ? sParams.attribute[0] : sParams.attribute;
    
    // 絞り込みがない（＝純粋なトップページ）場合は、サイトのブランドを強調
    if (!attribute) {
        return {
            title: "BICSTATION - 最安PC・スペック比較ポータル",
            description: "Lenovo, Dell, HP, Mouseなど主要メーカーのノートPC・デスクトップPCをリアルタイムに比較。最新の価格、在庫状況、詳細スペックを網羅したPC専門ポータルサイトです。",
        };
    }

    // 絞り込みがある場合（例：DELL 搭載製品）
    return {
        title: `${attribute.toUpperCase()} 搭載製品`,
        description: `${attribute.toUpperCase()} の最新PCスペック比較と価格情報をリアルタイムで更新。メーカー直販モデルから最適な1台を探せます。`,
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

    const [wpData, pcData, makersData] = await Promise.all([
        fetchPostList(5),
        fetchPCProducts('', currentOffset, limit, attribute || ''), 
        fetchMakers() 
    ]);

    const posts = wpData.results || [];

    // 表示用タイトルの動的決定（ページ内見出し）
    const listTitle = attribute 
        ? `${attribute.toUpperCase()} 搭載製品一覧` 
        : "製品ラインナップ";

    /**
     * 💡 重要：decodeHtml 関数は外部JS (common-utils.js) に移動したため削除しました。
     * サーバーサイド(このPageコンポーネント)で最低限必要なエスケープ解除を行うための
     * 簡易的なユーティリティです。
     */
    const safeDecode = (str: string) => {
        if (!str) return '';
        return str
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&nbsp;/g, ' ');
    };

    return (
        <div className={styles.wrapper}>
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

            <main className={styles.main}>
                {/* 🚩 絞り込みがない時かつ1ページ目の時だけお知らせを表示 */}
                {!attribute && currentOffset === 0 && (
                    <section className={styles.newsSection}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.emoji}>📢</span> 最新のお知らせ
                        </h2>
                        <div className={styles.newsContainer}>
                            {posts.length === 0 ? (
                                <div className={styles.noData}>
                                    <p>現在、表示できるお知らせはありません。</p>
                                </div>
                            ) : (
                                posts.map((post: any) => (
                                    <Link 
                                        href={`/bicstation/${post.slug}`} 
                                        key={post.id} 
                                        className={styles.newsLink}
                                    >
                                        <span className={styles.newsDate}>
                                            {new Date(post.date).toLocaleDateString('ja-JP')}
                                        </span>
                                        <span className={styles.newsTitle}>
                                            {safeDecode(post.title.rendered)}
                                        </span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </section>
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
                                <Link href="/" className={styles.resetLink} style={{ color: '#007bff', textDecoration: 'underline', marginTop: '10px', display: 'block' }}>
                                    絞り込みを解除する
                                </Link>
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