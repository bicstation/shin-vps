/**
 * =====================================================================
 * 🛰️ BIC-STATION Intelligence Detail Master (v14.1.0)
 * 🛡️ Strategic Patch: HTML Rendering Fix & Related Nodes Sync
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

// 専用のCSSモジュール（先ほど定義した Bicstation-Detail-CSS）
import styles from './detail.module.css';

export const dynamic = 'force-dynamic';

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
    // 1. Next.js 15 用のパラメータ解凍
    const { slug } = await params;
    const headerList = await headers();
    
    // 2. ホスト判定 & サイト設定取得
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "";
    const siteConfig = getSiteMetadata(host);
    const rawProject = siteConfig?.site_name || 'avflash';
    const currentProject = rawProject.replace(/\s+/g, '').toLowerCase();

    // 3. メイン記事データの取得
    const post = await fetchPostData(slug, currentProject);
    
    if (!post || !post.id) {
        console.error(`❌ [DETAIL-ERROR] Post not found. Slug: ${slug}`);
        return notFound();
    }

    // 4. 関連記事の取得 (同じプロジェクトから3件)
    const { results: relatedPosts } = await fetchPostList(4, 0, currentProject);
    const filteredRelated = relatedPosts.filter(p => p.id !== post.id).slice(0, 3);

    const { title, image, content, created_at, site, summary, extra_metadata } = post;
    const displayDate = created_at ? new Date(created_at).toLocaleDateString('ja-JP') : 'ARCHIVE_DATA';
    const displaySummary = extra_metadata?.summary || summary;

    return (
        <div className="min-h-screen bg-[#05070a] overflow-x-hidden text-gray-300">
            {/* 🛰️ BACKGROUND DECORATION (背景演出) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(0,242,255,0.1),transparent)]"></div>
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>

            {/* 🛸 TOP NAVIGATION (固定ナビゲーション) */}
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
                {/* 📋 HEADER SECTION (見出し・メタ情報) */}
                <header className={styles.headerArea}>
                    <div className={styles.metaInfo}>
                        <span className={styles.siteBadge}>{site || currentProject.toUpperCase()}</span>
                        <time className={styles.date}>[{displayDate}]</time>
                        <span className="ml-auto text-[#00f2ff]/30 text-[9px] uppercase hidden md:inline">
                            Secure_Signal_Layer_Verified
                        </span>
                    </div>
                    
                    <h1 className={styles.title}>{title}</h1>

                    <div className={styles.heroImageWrap}>
                        <img src={image || '/api/placeholder/1200/600'} alt={title} className={styles.heroImage} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent opacity-60"></div>
                    </div>
                </header>

                {/* 🧪 STRATEGIC ANALYSIS (要約セクション) */}
                {/* --- 🧪 STRATEGIC ANALYSIS (Summary Box) --- */}
                {displaySummary && (
                    <section className={styles.analysisBox}>
                        {/* ❌ 修正前: <div>{displaySummary}</div> 
                        ✅ 修正後: dangerouslySetInnerHTML を使用してHTMLとして展開
                        */}
                        <div 
                            className="italic text-gray-100 text-xl md:text-2xl leading-relaxed opacity-90 border-l-2 border-[#00f2ff] pl-6"
                            dangerouslySetInnerHTML={{ __html: displaySummary }}
                        />
                    </section>
                )}

                {/* 🖋️ CONTENT BODY (ここがHTMLとして描画される核心部) */}
                <main 
                    className={styles.contentBody} 
                    dangerouslySetInnerHTML={{ __html: content }} 
                />

                {/* 🛡️ ACTION SECTION (CTA) */}
                <footer className={styles.actionSection}>
                    <h2 className={styles.actionTitle}>核心を、その手に。</h2>
                    <div className={styles.buttonGroup}>
                        {(post.affiliate_url || post.source_url) && (
                            <a href={post.affiliate_url || post.source_url} 
                               target="_blank" rel="noopener noreferrer" 
                               className={styles.primaryBtn}>
                                ACCESS_SOURCE_NODE _
                            </a>
                        )}
                        <Link href="/post" className={styles.secondaryBtn}>
                            BACK_TO_TERMINAL
                        </Link>
                    </div>
                </footer>
            </article>

            {/* 🛰️ RELATED_INTEL GRID (関連記事) */}
            {filteredRelated.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 pb-40 relative z-10">
                    <div className="flex items-center gap-6 mb-12">
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase font-sans">
                            Related_Intelligence
                        </h3>
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-[#00f2ff]/40 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {filteredRelated.map((relatedPost) => (
                            <UnifiedProductCard 
                                key={relatedPost.id} 
                                data={relatedPost} 
                                siteConfig={siteConfig} 
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* 🚪 FINAL FOOTER */}
            <footer className="py-16 border-t border-white/5 bg-black/40 text-center">
                <div className="text-[10px] font-mono text-gray-600 tracking-[0.5em] uppercase">
                    Bic-Saving Intelligence Archive © 2026
                </div>
            </footer>
        </div>
    );
}