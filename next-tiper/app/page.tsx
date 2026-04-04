/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';
import { headers } from "next/headers";
import styles from './page.module.css';

// ✅ 共通コンポーネント
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ API・判定ロジック
import { fetchPostList } from '@/shared/lib/api/django/posts';
import { getUnifiedProducts } from '@/shared/lib/api/django-bridge';
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import { UnifiedPost } from '@/shared/lib/api/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

/**
 * 🛰️ メタデータ生成
 */
export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name} | プレミアム・統合デジタルアーカイブ`,
        description: `${siteConfig.site_name}のAI解析に基づいた最新アーカイブ。`,
        host: host 
    });
}

/**
 * 🛡️ 堅牢なフェッチ関数
 */
async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        return data ?? fallback;
    } catch (e) {
        console.warn(`⚠️ [API_SKIP]:`, e.message);
        return fallback;
    }
}

/**
 * 🧱 プラットフォーム別セクションのレンダリング
 */
const renderPlatformSection = (title: string, items: any[], source: string, siteConfig: any) => (
    <section className={styles.platformSection} key={source}>
        <div className={styles.platformTitle}>
            {title} <span className={styles.titleThin}>/LATEST_NODES</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {items.slice(0, 4).map((product) => (
                <UnifiedProductCard 
                    key={`${source}-${product.id}`} 
                    data={product} 
                    siteConfig={siteConfig} 
                />
            ))}
        </div>
    </section>
);

export default async function Home() {
    // --- 🎯 STEP 1: ドメインの特定とV5.1ホスト解決 ---
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 
    const siteTag = siteConfig.site_tag; 

    /**
     * 🛰️ V5.1 内部通信プロトコル
     * docker-compose の extra_hosts 設定に基づき、
     * 内部からはこのホスト名で Traefik 窓口(8083)を叩きます。
     */
    const INTERNAL_HOST = "api-bicstation-host";
    const fetchOptions = {
        next: { revalidate: 0 },
        headers: {
            'Host': INTERNAL_HOST, // Django Middleware 識別用
            'Accept': 'application/json'
        }
    };

    console.log(`⚓ [V5.1_SYNC]: ${host} -> Node: ${INTERNAL_HOST}`);

    // 🚩 ディレクトリ構造に合わせたルート設定
    const ROUTE_BASE = "/post"; 

    // --- 🎯 STEP 2: 並列データ同期実行 (内部ホスト経由) ---
    const [postResponse, fanzaRes, dugaRes] = await Promise.all([
        // 1. Django 記事データ (siteTag でフィルタ)
        safeFetch(
            fetchPostList(6, 0, siteTag, fetchOptions), 
            { results: [], count: 0 }
        ),
        // 2. FANZA 商品データ
        safeFetch(
            getUnifiedProducts({ site_group: siteTag, limit: 4, brand: 'FANZA' }, fetchOptions), 
            { results: [] }
        ),
        // 3. DUGA 商品データ
        safeFetch(
            getUnifiedProducts({ site_group: siteTag, limit: 4, brand: 'DUGA' }, fetchOptions), 
            { results: [] }
        ),
    ]);

    const latestPosts: UnifiedPost[] = postResponse?.results || [];
    const isApiConnected = (fanzaRes?.results?.length || 0) > 0 || (dugaRes?.results?.length || 0) > 0;

    return (
        <div className={styles.pageContainer}>
            {/* 🛠️ デバッグ用クライアントログ */}
            <script dangerouslySetInnerHTML={{
                __html: `console.log("🛰️ BRIDGE_SYNC_V5.1:", ${JSON.stringify({ 
                    site: siteConfig.site_name, 
                    tag: siteTag,
                    node: INTERNAL_HOST 
                })})`
            }} />

            <div className={styles.contentStream}>
                
                {/* 📰 1. INTELLIGENCE_REPORTS (最新記事) */}
                <section className={styles.newsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionHeading}>
                            LATEST_REPORTS <span className={styles.siteHighlight}>[{siteTag.toUpperCase()}]</span>
                        </h2>
                        <Link href={ROUTE_BASE} className={styles.headerLink}>OPEN_ALL_FILES →</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {latestPosts.length > 0 ? (
                            latestPosts.map((post) => (
                                <UnifiedProductCard 
                                    key={post.id} 
                                    data={post} 
                                    siteConfig={siteConfig} 
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-lg">
                                <p className={styles.glitchText}>NO_INTELLIGENCE_DATA_IN_STREAM</p>
                                <p className="text-xs text-white/30 mt-2">Target Node: {INTERNAL_HOST}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 📀 2. UNIFIED_DATA_STREAM (商品アーカイブ) */}
                <div className={styles.archiveRegistry}>
                    <div className={styles.registryHeader}>
                        <h1 className={styles.registryMainTitle}>
                            UNIFIED_DATA_STREAM
                            <span className={styles.titleThin}>/{siteTag.toUpperCase()}_v5.1_FINAL</span>
                        </h1>
                    </div>

                    {isApiConnected ? (
                        <div className={styles.registryStack}>
                            {fanzaRes?.results?.length > 0 && renderPlatformSection("FANZA", fanzaRes.results, "fanza", siteConfig)}
                            {dugaRes?.results?.length > 0 && renderPlatformSection("DUGA", dugaRes.results, "duga", siteConfig)}
                        </div>
                    ) : (
                        <div className={styles.loadingArea}>
                            <div className={styles.glitchBox}>
                                <div className={styles.glitchText}>
                                    RE-SYNCING_WITH_{INTERNAL_HOST}...
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 🚀 フッターアクション */}
                <div className={styles.footerAction}>
                    <Link href={ROUTE_BASE} className={styles.megaTerminalBtn}>
                        ACCESS_FULL_{siteTag.toUpperCase()}_INTELLIGENCE
                    </Link>
                </div>
            </div>

            {/* 🛡️ システムステータス表示 */}
            <footer className={styles.footerStatus}>
                <p>SYSTEM_CORE: V5.1-FINAL / DOMAIN: {host} / BRIDGE: {INTERNAL_HOST}</p>
            </footer>
        </div>
    );
}