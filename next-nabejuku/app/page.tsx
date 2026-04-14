/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import React from 'react';
import { headers } from "next/headers";
import Link from 'next/link';
import { 
    ShieldCheck, 
    ArrowRight, 
    CreditCard, 
    Monitor, 
    Coffee,
    Flame,
    RefreshCw,
    Layers,
    Cpu
} from 'lucide-react';

import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';
import { fetchPostList } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import { constructMetadata } from '@/shared/lib/utils/metadata';

import styles from './page.module.css';

export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('x-django-host') || headerList.get('host') || "bic-saving.com";
    const siteConfig = getSiteMetadata(host);

    const seoTitle = `${siteConfig.site_name} | 技術で支出をデバッグする家計戦略メディア`;

    return constructMetadata({
        title: seoTitle,
        description: `元公務員エンジニアがNext.js/Dockerで構築。ポイ活、クレカ積立、通信費の最適化など、実体験に基づいた「技術的節約術」を公開。`,
        host: host 
    });
}

export default async function Page() {
    const headerList = await headers();
    const host = headerList.get('x-django-host') || headerList.get('host') || "bic-saving.com";
    const siteConfig = getSiteMetadata(host); 

    let displayPosts = [];
    let count = 0;

    try {
        const response = await fetchPostList(12, 0, host);
        displayPosts = response?.results || [];
        count = response?.count || 0;
    } catch (error) {
        console.error("❌ FETCH_FAILED:", error.message);
    }

    return (
        <div className={styles.mainContainer}>
            {/* 🛸 ヒーロー：独自性と専門性を一瞬で伝える */}
            <header className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.brandBadge}>ENGINEERING × LIFESTYLE 2026</div>
                    <h1 className={styles.mainTitle}>{siteConfig.site_name}</h1>
                    <p className={styles.subTitle}>
                        家計をひとつのシステムとして捉え、無駄なコード（支出）をデバッグする。
                        <br className="hidden md:block" />
                        元公務員エンジニアが贈る、論理的かつ技術的な「負けない」ための暮らしの構築術。
                    </p>
                    {count > 0 && (
                        <div className={styles.liveCounter}>
                            <span className={styles.pulseDot}></span>
                            <strong>{count.toLocaleString()}</strong> 件の解析済みデータを公開中
                        </div>
                    )}
                </div>
            </header>

            <main className={styles.contentArea}>
                
                {/* 🚀 注目の連載：ここがオリジナルコンテンツの核 */}
                <section className="mb-24">
                    <div className="flex items-center justify-between mb-8 border-l-4 border-emerald-500 pl-4">
                        <div className="flex items-center gap-3">
                            <Flame className="text-orange-500 w-6 h-6" />
                            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Featured Project</h2>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 1. REBUILD LOGS */}
                        <Link href="/series/rebuild-logs" className="block group">
                            <div className="h-full relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/10 p-8 md:p-12 transition-all hover:border-emerald-500/50 hover:bg-[#111] shadow-2xl">
                                <div className="relative z-10">
                                    <span className="text-emerald-500 font-mono text-xs mb-4 block tracking-[0.3em]">PROJ_LOG // 01</span>
                                    <h3 className="text-2xl md:text-3xl font-black text-white mb-4 group-hover:text-emerald-400 transition-colors">
                                        REBUILD LOGS<br/>
                                        <span className="text-lg font-normal text-slate-400">「再起」のドキュメンタリー</span>
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-10 leading-relaxed line-clamp-3">
                                        IT業界での成功と挫折。10年のブランクを経て、Next.jsとDockerという武器を手に、ゼロから資産とシステムを再構築する実録記録。
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-white text-xs font-bold group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                        記録を確認する <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                                <RefreshCw className="absolute -right-12 -bottom-12 w-56 h-56 text-white opacity-[0.02] group-hover:opacity-5 transition-all duration-1000 group-hover:rotate-90" />
                            </div>
                        </Link>

                        {/* 2. SAVING_STACK */}
                        <Link href="/series/saving-stack" className="block group">
                            <div className="h-full relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/10 p-8 md:p-12 transition-all hover:border-blue-500/50 hover:bg-[#111] shadow-2xl">
                                <div className="relative z-10">
                                    <span className="text-blue-500 font-mono text-xs mb-4 block tracking-[0.3em]">PROJ_LOG // 02</span>
                                    <h3 className="text-2xl md:text-3xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors">
                                        SAVING_STACK<br/>
                                        <span className="text-lg font-normal text-slate-400">家計のフルスタック構成</span>
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-10 leading-relaxed line-clamp-3">
                                        dポイント、Vポイント、決済ルートの多層化。還元率を最大化する「決済のバックエンド構成」をエンジニア視点で定義する。
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-white text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        スタック図を見る <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                                <Layers className="absolute -right-12 -bottom-12 w-56 h-56 text-blue-500 opacity-[0.02] group-hover:opacity-5 transition-all duration-1000 group-hover:scale-110" />
                            </div>
                        </Link>
                    </div>
                </section>

                {/* 📊 専門カテゴリの深掘り */}
                <section className="mb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all">
                        <CreditCard className="text-blue-500 w-8 h-8 mb-6" />
                        <h4 className="text-lg font-bold text-white mb-3">Finance Logic</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Olive × 三井住友カードを核とした、高還元ルートの構築。
                        </p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all">
                        <Cpu className="text-emerald-500 w-8 h-8 mb-6" />
                        <h4 className="text-lg font-bold text-white mb-3">Home DevOps</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Django/Next.jsによる生活自動化とVPSサーバー運用。
                        </p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all">
                        <ShieldCheck className="text-purple-500 w-8 h-8 mb-6" />
                        <h4 className="text-lg font-bold text-white mb-3">Life Hack</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            元公務員の視点で語る、リスク回避と豊かな暮らしの整え方。
                        </p>
                    </div>
                </section>

                {/* 📰 最新アーカイブ */}
                <section>
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-xl font-bold text-white tracking-widest uppercase">Latest Updates</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
                    </div>

                    {displayPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {displayPosts.map((post) => (
                                <UnifiedProductCard 
                                    key={post.id} 
                                    data={post} 
                                    siteConfig={siteConfig} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center rounded-3xl border border-dashed border-white/10">
                            <Coffee className="w-10 h-10 text-slate-600 mx-auto mb-4 animate-pulse" />
                            <p className="text-slate-400 text-sm">最新の家計解析データを同期中...</p>
                        </div>
                    )}
                </section>
            </main>

            {/* 🛡️ 信頼性の担保（E-E-A-T） */}
            <section className="mt-24 py-20 bg-emerald-950/20 border-y border-white/5">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 mb-8">
                        <ShieldCheck className="text-emerald-500 w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-6">「技術」は、家族を守る盾になる。</h3>
                    <p className="text-slate-300 leading-loose text-lg">
                        情報の荒波の中で、何を選び、何を捨てるか。{siteConfig.site_name} は、流行りの節約術をただ並べるだけの場所ではありません。
                        <br/><br/>
                        かつてITの最前線にいた運営者が、そのスキルをすべて「家庭の幸福」と「資産防衛」に全振りし、自ら実験・検証した結果だけを掲載しています。
                        このサイト自体も、その「自動化」と「最適化」のひとつの答えです。
                    </p>
                </div>
            </section>

            {/* フッター */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <div className="text-white font-black text-2xl tracking-tighter">{siteConfig.site_name}</div>
                        <nav className="flex gap-8 text-xs text-slate-500 font-mono tracking-widest uppercase">
                            <Link href="/about" className="hover:text-emerald-400 transition-colors">About</Link>
                            <Link href="/guideline" className="hover:text-emerald-400 transition-colors">Guide</Link>
                            <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
                        </nav>
                    </div>
                    <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.5em] text-center">
                        &copy; 2026 {siteConfig.site_name} - ARCHITECTED BY SHIN CORE LINX
                    </p>
                </div>
            </footer>
        </div>
    );
}