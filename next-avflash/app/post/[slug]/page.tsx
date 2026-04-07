/**
 * =====================================================================
 * 🛰️ BIC-STATION Intelligence Detail Master (v14.5.0)
 * 🛡️ Strategic Patch: Full-Decoded All Intelligence Nodes
 * =====================================================================
 */
// @ts-nocheck
import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';

import { fetchPostData, fetchPostList } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';
import styles from './detail.module.css';

export const dynamic = 'force-dynamic';

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const headerList = await headers();
    
    // 1. 環境特定
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "";
    const siteConfig = getSiteMetadata(host);
    const rawProject = siteConfig?.site_name || 'avflash';
    const currentProject = rawProject.replace(/\s+/g, '').toLowerCase();

    // 2. データ取得
    const post = await fetchPostData(slug, currentProject);
    if (!post || !post.id) return notFound();

    const { results: relatedPosts } = await fetchPostList(4, 0, currentProject);
    const filteredRelated = relatedPosts.filter(p => p.id !== post.id).slice(0, 3);

    const { title, image, content, created_at, site, summary, extra_metadata } = post;
    const displayDate = created_at ? new Date(created_at).toLocaleDateString('ja-JP') : 'ARCHIVE_DATA';

    // 🛠️ 全インテリジェンス・ノードのHTML解凍準備
    const summaryHtml = extra_metadata?.summary || summary || "";
    const point1Html = extra_metadata?.point1 || "";
    const point2Html = extra_metadata?.point2 || "";
    const point3Html = extra_metadata?.point3 || "";

    return (
        <div className="min-h-screen bg-[#05070a] overflow-x-hidden text-gray-300">
            {/* 🛰️ BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(0,242,255,0.1),transparent)]"></div>
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>

            {/* 🛸 NAVIGATION */}
            <nav className="fixed top-0 w-full z-50 bg-[#05070a]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-[10px] font-mono tracking-widest text-gray-500">
                    <Link href="/post" className="hover:text-[#00f2ff] transition-all flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">«</span> RETURN_TO_ARCHIVE
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse"></span>
                        SYSTEM_NODE: {currentProject.toUpperCase()}
                    </div>
                </div>
            </nav>

            <article className={`${styles.detailContainer} relative z-10`}>
                <header className={styles.headerArea}>
                    <div className={styles.metaInfo}>
                        <span className={styles.siteBadge}>{site || currentProject.toUpperCase()}</span>
                        <time className={styles.date}>[{displayDate}]</time>
                        <span className="ml-auto text-[#00f2ff]/30 text-[9px] uppercase hidden md:inline">Secure_Signal_Verified</span>
                    </div>
                    <h1 className={styles.title}>{title}</h1>
                    <div className={styles.heroImageWrap}>
                        <img src={image} alt="" className={styles.heroImage} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent opacity-60"></div>
                    </div>
                </header>

                {/* 🧪 STRATEGIC ANALYSIS (全項目HTML展開 & メイン枠一杯表示) */}
                {(summaryHtml || point1Html || point2Html || point3Html) && (
                    <section className={styles.analysisBox}>
                        {/* Summary Node */}
                        {summaryHtml && (
                            <div 
                                className="italic text-gray-100 text-xl md:text-2xl leading-relaxed opacity-90 border-l-4 border-[#00f2ff] pl-6 mb-12 w-full"
                                dangerouslySetInnerHTML={{ __html: summaryHtml }}
                            />
                        )}

                        {/* Points Grid Node */}
                        <div className="grid grid-cols-1 gap-6 w-full">
                            {[point1Html, point2Html, point3Html].map((html, idx) => (
                                html && (
                                    <div key={idx} className="bg-white/5 p-8 border border-white/5 relative group overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#00f2ff]/20 group-hover:bg-[#00f2ff] transition-all duration-500"></div>
                                        <div 
                                            className="text-gray-300 text-lg leading-loose w-full"
                                            dangerouslySetInnerHTML={{ __html: html }}
                                        />
                                    </div>
                                )
                            ))}
                        </div>
                    </section>
                )}

                {/* 🖋️ CONTENT BODY */}
                <main 
                    className={styles.contentBody} 
                    dangerouslySetInnerHTML={{ __html: content }} 
                />

                {/* 🛡️ ACTION SECTION */}
                <footer className={styles.actionSection}>
                    <h2 className={styles.actionTitle}>核心を、その手に。</h2>
                    <div className={styles.buttonGroup}>
                        {(post.affiliate_url || post.source_url) && (
                            <a href={post.affiliate_url || post.source_url} target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
                                ACCESS_SOURCE_NODE _
                            </a>
                        )}
                        <Link href="/post" className={styles.secondaryBtn}>BACK_TO_TERMINAL</Link>
                    </div>
                </footer>
            </article>

            {/* 🛰️ RELATED_INTEL GRID */}
            {filteredRelated.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 pb-40 relative z-10">
                    <div className="flex items-center gap-6 mb-12">
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase font-sans">Related_Intelligence</h3>
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-[#00f2ff]/40 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {filteredRelated.map((relatedPost) => (
                            <UnifiedProductCard key={relatedPost.id} data={relatedPost} siteConfig={siteConfig} />
                        ))}
                    </div>
                </section>
            )}

            <footer className="py-16 border-t border-white/5 bg-black/40 text-center">
                <div className="text-[10px] font-mono text-gray-600 tracking-[0.5em] uppercase">Bic-Saving Intelligence Archive © 2026</div>
            </footer>
        </div>
    );
}