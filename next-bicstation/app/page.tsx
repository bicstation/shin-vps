/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Link from 'next/link';

// ✅ 追加：1位専用
import HeroRankingCard from '@/shared/components/organisms/cards/HeroRankingCard';

// 既存
import ProductCard from '@/shared/components/organisms/cards/ProductCard';

import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats'; 
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

import {
  ArrowUpRight
} from 'lucide-react';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';

// ✅ 安全fetch
async function safeFetch<T>(fetcher: any, args: any[], fallback: T): Promise<T> {
    try {
        const data = await fetcher(...args);
        return data ?? fallback;
    } catch {
        return fallback;
    }
}

// ✅ metadata修正（headers完全排除）
export async function generateMetadata() {
    const host = "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name} | 最適PCはこれ`,
        description: `迷ったらこれ。失敗しないPCを断言します。`,
        manualHost: host
    });
}

// ✅ メイン
export default async function HomePageMain() {
    const IS_ADSENSE_REVIEW = true; 

    const host = "bicstation.com"; // ← 固定

    const scoreRank = await safeFetch(fetchPCProductRanking, ['score', host], []);
    const aiTop3 = Array.isArray(scoreRank) ? scoreRank.slice(0, 3) : [];

    const top1 = aiTop3[0];
    const others = aiTop3.slice(1);

    return (
        <div className={styles.mainWrapper}>

            {/* 🔥 ヒーロー */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>

                    <h1 className={styles.heroTitleStrong}>
                        迷ったらこれでOK
                    </h1>
                    <p className={styles.heroCatch}>
                        初心者でも迷わない・コスパ最強・失敗しない1台
                    </p>

                    {/* 👇 1位 */}
                    {top1 && (
                        <div style={{
                            marginTop: '16px',
                            maxWidth: '900px',
                            marginLeft: 'auto',
                            marginRight: 'auto'
                        }}>
                            <HeroRankingCard product={top1} />
                        </div>
                    )}

                    <div style={{
                        marginTop: '16px',
                        fontSize: '13px',
                        color: '#94a3b8',
                        textAlign: 'center'
                    }}>
                        ✔ 実務経験ベース  
                        ✔ AIスコア評価  
                        ✔ 用途別に検証済み  
                    </div>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Link href="/ranking" className={styles.ctaPrimary}>
                            👉 これで決まり（今すぐチェック）
                        </Link>

                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                            ※迷う人は下から診断できます
                        </div>

                        <Link 
                            href="/pc-finder"
                            style={{
                                display: 'inline-block',
                                marginTop: '6px',
                                fontSize: '12px',
                                opacity: 0.7,
                                textDecoration: 'underline'
                            }}
                        >
                            👉 3分で最適PCを診断する
                        </Link>
                    </div>

                </div>
            </section>

            {/* 理由 */}
            <section style={{
                marginTop: '24px',
                padding: '20px',
                background: '#0f172a',
                borderRadius: '12px',
                border: '1px solid #1e293b'
            }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
                    なぜこのPCが選ばれているのか？
                </h3>

                <ul style={{ lineHeight: '1.8', fontSize: '14px', color: '#cbd5f5' }}>
                    <li>✔ 44年のエンジニア実務経験ベース</li>
                    <li>✔ AIスコアによる客観評価</li>
                    <li>✔ 実際の用途で検証済み</li>
                </ul>

                <p style={{ marginTop: '12px', fontSize: '13px', color: '#94a3b8' }}>
                    → 迷ったらこれを選べば失敗しません
                </p>
            </section>

            {/* 2位・3位 */}
            <section className="mb-24 max-w-6xl mx-auto px-4">
                <h3 className="text-sm text-zinc-500 mb-4">
                    他の候補も見る
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {others.map((product: any, i: number) => (
                        <ProductCard 
                            key={product.id || i}
                            product={product}
                            rank={i + 2}
                            isReviewMode={IS_ADSENSE_REVIEW}
                        />
                    ))}
                </div>
            </section>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Link 
                    href="/ranking"
                    style={{
                        display: 'inline-block',
                        padding: '10px 18px',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#cbd5f5'
                    }}
                >
                    👉 他のランキングも見る
                </Link>
            </div>

            {/* ガイド誘導 */}
            <section style={{ marginTop: '40px', textAlign: 'center' }}>
                <div style={{
                    marginTop: '40px',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #1e293b',
                    background: '#020617',
                    textAlign: 'left'
                }}>
                    <h3 style={{ fontSize: '15px', marginBottom: '8px' }}>
                        まだ迷う人はここだけ見てください
                    </h3>

                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
                        失敗したくないなら、ここだけ見てください（3分で理解できます）
                    </p>

                    <div style={{ display: 'grid', gap: '10px' }}>
                        <Link href="/guide/pc-select" className={styles.subLinkCard}>
                            👉 3分でわかる：失敗しないPCの選び方
                        </Link>

                        <Link href="/guide/cpu" className={styles.subLinkCard}>
                            👉 サクッと理解：CPUの違い
                        </Link>

                        <Link href="/guide/laptop-vs-desktop" className={styles.subLinkCard}>
                            👉 迷った人へ：ノートとデスクトップどっち？
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}