/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
// /home/maya/shin-dev/shin-vps/next-bic-saving/app/page.tsx

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
    TrendingUp
} from 'lucide-react';

// ✅ 共通コンポーネント
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ API・判定ロジック
import { fetchPostList } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import { constructMetadata } from '@/shared/lib/utils/metadata';

import styles from './page.module.css';

/**
 * 💡 Next.js 15 レンダリング設定
 */
export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

/**
 * 🛰️ メタデータ生成（SEO強化パッチ）
 */
export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('x-django-host') || headerList.get('host') || "bic-saving.com";
    const siteConfig = getSiteMetadata(host);

    // 日本語のサイト名をベースに、検索需要の高いワードを付与
    const seoTitle = `${siteConfig.site_name} | ポイ活・通信費・クレカを技術で最適化する`;

    return constructMetadata({
        title: seoTitle,
        description: `${siteConfig.site_name}は、元IT成功者がNext.jsとDockerで構築した「家計のデバッグ」メディア。dポイント、Vポイント、決済ルートの最適化など、一次情報に基づいた技術的節約術を公開中。`,
        host: host 
    });
}

/**
 * 🏠 メインコンテンツ
 */
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
            {/* 🛸 ヒーローセクション */}
            <header className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.brandBadge}>LIFESTYLE ARCHIVE 2026</div>
                    <h1 className={styles.mainTitle}>{siteConfig.site_name}</h1>
                    <p className={styles.subTitle}>
                        独自のロジックで「支出をデバッグ」し、変化の激しい現代を賢く生き抜く。
                        <br className="hidden md:block" />
                        元公務員・アフィリエイターが辿り着いた、技術と節約の融合。
                    </p>
                    {count > 0 && (
                        <div className={styles.liveCounter}>
                            <span className={styles.pulseDot}></span>
                            現在 <strong>{count.toLocaleString()}</strong> 件の知恵を共有中
                        </div>
                    )}
                </div>
            </header>

            <main className={styles.contentArea}>
                
                {/* 🚀 ピックアップ連載：Featured Series */}
                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8 border-l-4 border-emerald-500 pl-4">
                        <Flame className="text-orange-500 w-6 h-6" />
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">注目の連載シリーズ</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 1. REBUILD LOGS */}
                        <Link href="/series/rebuild-logs" className="block group">
                            <div className="h-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-black border border-white/10 p-8 md:p-10 transition-all hover:border-emerald-500/50 shadow-2xl">
                                <div className="relative z-10">
                                    <span className="text-emerald-500 font-mono text-xs mb-3 block tracking-widest">SERIES_01 // 完結</span>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                                        REBUILD LOGS（再構築記録）
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-8 leading-relaxed line-clamp-3">
                                        絶頂、崩壊、そして10年の沈黙を経て。最新スタック「Next.js × Docker」を武器に、かつての成功者が再起するまでのドキュメンタリー。
                                    </p>
                                    <div className="flex items-center gap-2 text-white text-sm font-bold">
                                        連載を読む <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                                <RefreshCw className="absolute -right-8 -bottom-8 w-40 h-40 text-white opacity-[0.03] group-hover:opacity-10 transition-all duration-700 group-hover:rotate-180" />
                            </div>
                        </Link>

                        {/* 2. SAVING_STACK */}
                        <Link href="/series/saving-stack" className="block group">
                            <div className="h-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/50 to-black border border-white/10 p-8 md:p-10 transition-all hover:border-blue-500/50 shadow-2xl">
                                <div className="relative z-10">
                                    <span className="text-blue-400 font-mono text-xs mb-3 block tracking-widest">SERIES_02 // 新着</span>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                                        SAVING_STACK（節約スタック）
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-8 leading-relaxed line-clamp-3">
                                        家計を「資産」へデプロイせよ。dポイント、Vポイント、決済ルートの最適化を「技術スタック」として定義する、エンジニアのための家計戦略。
                                    </p>
                                    <div className="flex items-center gap-2 text-white text-sm font-bold">
                                        構成案を見る <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                                <Layers className="absolute -right-8 -bottom-8 w-40 h-40 text-blue-500 opacity-[0.03] group-hover:opacity-10 transition-all duration-700 group-hover:scale-110" />
                            </div>
                        </Link>
                    </div>
                </section>

                {/* 📊 カテゴリ別アーカイブ */}
                <section className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <CreditCard className="text-blue-500 w-10 h-10 mb-6" />
                        <h4 className="text-xl font-bold text-white mb-3">キャッシュレス・ロジック</h4>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                            三井住友カード、Olive、決済ルートの多層化。還元率を極限まで高める独自のアルゴリズム。
                        </p>
                        <span className="text-xs font-mono text-blue-500">最適化中...</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <Monitor className="text-emerald-500 w-10 h-10 mb-6" />
                        <h4 className="text-xl font-bold text-white mb-3">開発と運用 (DevOps)</h4>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                            Django/Next.jsによる自炊システムの構築、VPSサーバーの最適化。生活を自動化するエンジニアリング。
                        </p>
                        <span className="text-xs font-mono text-emerald-500">ビルド中...</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <Coffee className="text-purple-500 w-10 h-10 mb-6" />
                        <h4 className="text-xl font-bold text-white mb-3">ライフハック・思考法</h4>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                            公務員から個人事業主へ。経験者が語る、格差社会を生き抜くための「負けない」暮らしの整え方。
                        </p>
                        <span className="text-xs font-mono text-purple-500">考案中...</span>
                    </div>
                </section>

                {/* 📰 最新の記事リスト */}
                <section>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>最新記事アーカイブ</h2>
                        <div className={styles.titleUnderline}></div>
                    </div>

                    {displayPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {displayPosts.map((post) => (
                                <UnifiedProductCard 
                                    key={post.id} 
                                    data={post} 
                                    siteConfig={siteConfig} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.loadingArea}>
                            <div className={styles.statusBox}>
                                <div className={styles.loadingIcon}>☕</div>
                                <p>最新の解析データを準備しています。しばらくお待ちください。</p>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* 🛡️ 信頼性セクション（E-E-A-T） */}
            <section className={styles.aboutSection}>
                <div className={styles.aboutCard}>
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="text-emerald-500 w-8 h-8" />
                        <h3 className="m-0 text-2xl font-bold">ミッション ＆ ビジョン</h3>
                    </div>
                    <div className="leading-loose text-slate-300">
                        <p>
                            <strong>{siteConfig.site_name}</strong> は、単なる節約情報のまとめサイトではありません。
                        </p>
                        <p className="mt-4">
                            かつてIT業界の最前線で活動し、その後沈黙を貫いた運営者が、現代の「格差社会」と「AI時代」において、いかにして知恵と技術で家族を守り、豊かな生活を再構築するかを追求するメディアです。
                        </p>
                        <p className="mt-4">
                            実体験に基づいた「一次情報」のみを発信し、読者の皆様が迷わず賢い選択ができるようサポートすること。それが私たちの使命です。
                        </p>
                    </div>
                </div>
            </section>

            {/* フッター */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <div className="text-white font-bold text-xl">{siteConfig.site_name}</div>
                        <nav className="flex gap-6 text-sm text-slate-400 font-mono">
                            <Link href="/about" className="hover:text-white transition-colors">サイトについて</Link>
                            <Link href="/guide/card" className="hover:text-white transition-colors">カードガイド</Link>
                            <Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link>
                        </nav>
                    </div>
                    <p className={styles.copyright}>&copy; 2026 {siteConfig.site_name} - SHIN CORE LINX</p>
                </div>
            </footer>
        </div>
    );
}