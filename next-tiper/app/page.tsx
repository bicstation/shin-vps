/* /app/page.tsx */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

// ✅ スタイル & 共通コンポーネント
import styles from './page.module.css';
import AdultProductCard from '@shared/components/organisms/cards/AdultProductCard';

// ✅ API・ロジック
import { getUnifiedProducts } from '@shared/lib/api/django/adult'; 
import { constructMetadata } from '@shared/lib/utils/metadata';

// 🚀 Next.js 15 キャッシュ破壊設定（常に最新のファイルを読み込む）
export const dynamic = 'force-dynamic';
export const revalidate = 0; 

/**
 * 🛰️ メタデータ生成
 */
export async function generateMetadata() {
    return constructMetadata({
        title: "TIPER Live | プレミアム・統合デジタルアーカイブ",
        description: "AI解析に基づいたFANZA・DUGAの全件横断アーカイブ。",
        canonical: '/'
    });
}

/**
 * 🛰️ ローカルのMarkdownファイルを直接読み込む (絶対パス・非キャッシュ版)
 */
async function getLocalMarkdownPosts() {
    // コンテナ内の絶対パスを固定
    const postsDirectory = '/usr/src/app/content/posts';

    try {
        if (!fs.existsSync(postsDirectory)) {
            console.error("❌ Directory not found:", postsDirectory);
            return [];
        }

        const fileNames = fs.readdirSync(postsDirectory);
        const posts = fileNames
            .filter(fn => fn.endsWith('.md'))
            .map(fileName => {
                const fullPath = path.join(postsDirectory, fileName);
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // 改行で分割して確実にデータを抜く（正規表現のブレを防止）
                const lines = content.split('\n');
                const getVal = (key: string) => {
                    const line = lines.find(l => l.startsWith(`${key}:`));
                    return line ? line.split(':')[1].replace(/["']/g, '').trim() : null;
                };

                return {
                    id: fileName,
                    slug: fileName.replace(/\.md$/, ''),
                    title: getVal('title') || 'INTELLIGENCE_REPORT',
                    date: getVal('date') || '2026-03-20',
                    image: getVal('featured_image') || '/no-image.jpg',
                };
            });

        // 日付順にソートして最新6件を返す
        return posts.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
    } catch (e) {
        console.error("[MARKDOWN FETCH ERROR]:", e);
        return [];
    }
}

/**
 * 🛰️ セーフフェッチ
 */
async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        return data ?? fallback;
    } catch (e) {
        console.error("[API ERROR]:", e);
        return fallback;
    }
}

/**
 * 🎬 プラットフォーム別セクションレンダラー (1行4枚固定)
 */
const renderPlatformSection = (title: string, items: any[], source: string) => (
    <section className={styles.platformSection} key={source}>
        <div className={styles.platformTitle}>
            {title} <span className={styles.titleThin}>/LATEST_NODES</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {items.slice(0, 4).map((product) => (
                <AdultProductCard key={`${source}-${product.id}`} product={product} />
            ))}
        </div>
    </section>
);

/**
 * 🎬 メインホームコンポーネント
 */
export default async function Home() {
    // --- データ取得 ---
    const [
        latestPosts,
        fanzaRes,
        dugaRes
    ] = await Promise.all([
        getLocalMarkdownPosts(),
        safeFetch(getUnifiedProducts({ api_source: 'FANZA', limit: 4 }), { results: [] }),
        safeFetch(getUnifiedProducts({ api_source: 'DUGA', limit: 4 }), { results: [] }),
    ]);

    const isApiConnected = (fanzaRes?.results?.length || 0) > 0 || (dugaRes?.results?.length || 0) > 0;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentStream}>
                
                {/* 📰 1. INTELLIGENCE_REPORTS (最上部) */}
                {latestPosts.length > 0 && (
                    <section className={styles.newsSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionHeading}>INTELLIGENCE_REPORTS</h2>
                            <Link href="/news" className={styles.headerLink}>OPEN_ALL_FILES →</Link>
                        </div>
                        <div className={styles.newsGrid}>
                            {latestPosts.map((post) => (
                                <Link key={post.id} href={`/news/${post.slug}`} className={styles.newsCard}>
                                    <div className={styles.newsThumbWrap}>
                                        <img 
                                            src={post.image} 
                                            alt={post.title} 
                                            className={styles.newsThumb} 
                                            onError={(e) => { e.currentTarget.src = '/no-image.jpg'; }}
                                        />
                                    </div>
                                    <div className={styles.newsContent}>
                                        <span className={styles.newsDate}>{post.date}</span>
                                        <h3 className={styles.newsTitle}>{post.title}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* 📀 2. UNIFIED_DATA_STREAM (FANZA & DUGA) */}
                <div className={styles.archiveRegistry}>
                    <div className={styles.registryHeader}>
                        <h1 className={styles.registryMainTitle}>
                            UNIFIED_DATA_STREAM
                            <span className={styles.titleThin}>ZENITH_REGISTRY_v3.5</span>
                        </h1>
                    </div>

                    {isApiConnected ? (
                        <div className={styles.registryStack}>
                            {/* 1行目: FANZA */}
                            {fanzaRes?.results?.length > 0 && renderPlatformSection("FANZA", fanzaRes.results, "fanza")}
                            
                            {/* 2行目: DUGA */}
                            {dugaRes?.results?.length > 0 && renderPlatformSection("DUGA", dugaRes.results, "duga")}
                        </div>
                    ) : (
                        <div className={styles.loadingArea}>
                            <div className={styles.glitchBox}>
                                <div className={styles.glitchText}>SYNCHRONIZING_DATABASE...</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 底部アクションリンク */}
                <div className={styles.footerAction}>
                    <Link href="/videos" className={styles.megaTerminalBtn}>
                        ACCESS_FULL_REGISTRY_DATABASE
                    </Link>
                </div>
            </div>
        </div>
    );
}