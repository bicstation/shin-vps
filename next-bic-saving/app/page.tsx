/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import React from 'react';
import { headers } from "next/headers";
import Link from 'next/link';
import { 
    BookOpen, 
    Zap, 
    ShieldCheck, 
    ArrowRight, 
    CreditCard, 
    Monitor, 
    Coffee,
    Flame,
    RefreshCw // ✅ 追加: これが抜けていたため ReferenceError が発生していました
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
 * 🛰️ メタデータ生成
 */
export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('x-django-host') || headerList.get('host') || "bic-saving.com";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name} | 賢い選択、豊かな暮らし。`,
        description: `${siteConfig.site_name}が提供する、独自の視点に基づいた最新の節約術とライフハック。`,
        host: host 
    });
}

/**
 * 🏠 ビック的節約生活 メインページ
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
                
                {/* 🚀 ピックアップ：REBUILD LOGS (新設) */}
                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8 border-l-4 border-emerald-500 pl-4">
                        <Flame className="text-orange-500 w-6 h-6" />
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Featured Series</h2>
                    </div>
                    <Link href="/series/rebuild-logs" className="block group">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-black border border-white/10 p-8 md:p-12 transition-all hover:border-emerald-500/50">
                            <div className="relative z-10">
                                <span className="text-emerald-500 font-mono text-sm mb-4 block">VOL.01 - VOL.10 [COMPLETE]</span>
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                                    REBUILD LOGS：再構築の記録
                                </h3>
                                <p className="text-slate-400 max-w-2xl mb-8 leading-relaxed">
                                    絶頂、崩壊、そして10年の沈黙を経て。最新スタック「Next.js × Docker」を手に、かつての成功者が「なべ塾 2.0」として再起するまでのドキュメンタリー。
                                </p>
                                <div className="flex items-center gap-2 text-white font-bold">
                                    連載を読む <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                                <RefreshCw className="w-40 h-40 text-white" />
                            </div>
                        </div>
                    </Link>
                </section>

                {/* 📊 シリーズ別アーカイブ */}
                <section className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <CreditCard className="text-blue-500 w-10 h-10 mb-6" />
                        <h4 className="text-xl font-bold text-white mb-3">Cashless Logic</h4>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                            三井住友カード、Olive、ガソリン割引。複数の決済レイヤーを重ね合わせ、還元率を極限まで高めるアルゴリズム。
                        </p>
                        <span className="text-xs font-mono text-blue-500">COMING SOON</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <Monitor className="text-emerald-500 w-10 h-10 mb-6" />
                        <h4 className="text-xl font-bold text-white mb-3">Dev & Ops</h4>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                            Django/Next.jsによる自炊システムの構築から、VPSサーバーの最適化まで。生活を自動化するエンジニアリング。
                        </p>
                        <span className="text-xs font-mono text-emerald-500">COMING SOON</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <Coffee className="text-purple-500 w-10 h-10 mb-6" />
                        <h4 className="text-xl font-bold text-white mb-3">Life Hack</h4>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                            格差社会を生き抜くためのマインドセット。公務員から個人事業主へ、経験者が語る「負けない」暮らしの整え方。
                        </p>
                        <span className="text-xs font-mono text-purple-500">COMING SOON</span>
                    </div>
                </section>

                {/* 📰 最新の記事リスト */}
                <section>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>LATEST ARTICLES</h2>
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
                                <p>独自の視点で分析した最新情報を準備しています。しばらくお待ちください。</p>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* 🛡️ 信頼性セクション（E-E-A-T強化） */}
            <section className={styles.aboutSection}>
                <div className={styles.aboutCard}>
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="text-emerald-500 w-8 h-8" />
                        <h3 className="m-0 text-2xl font-bold">OUR MISSION & VISION</h3>
                    </div>
                    <p className="leading-loose text-slate-300">
                        {siteConfig.site_name} は、単なる節約情報のまとめサイトではありません。
                        かつてIT業界の最前線で活動し、その後沈黙を貫いた運営者が、現代の「格差社会」と「AI時代」において、いかにして知恵と技術で家族を守り、豊かな生活を再構築するかを追求するメディアです。
                        <br /><br />
                        実体験に基づいた「一次情報」のみを発信し、読者の皆様が迷わず賢い選択ができるようサポートすること。それが私たちの使命です。
                    </p>
                </div>
            </section>

            {/* フッター */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <div className="text-white font-bold text-xl">{siteConfig.site_name}</div>
                        <nav className="flex gap-6 text-sm text-slate-400 font-mono">
                            <Link href="/about" className="hover:text-white transition-colors">ABOUT</Link>
                            <Link href="/guide/card" className="hover:text-white transition-colors">CARD GUIDE</Link>
                            <Link href="/privacy" className="hover:text-white transition-colors">PRIVACY POLICY</Link>
                        </nav>
                    </div>
                    <p className={styles.copyright}>&copy; 2026 {siteConfig.site_name} - SHIN CORE LINX</p>
                </div>
            </footer>
        </div>
    );
}