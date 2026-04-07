/**
 * =====================================================================
 * 🛰️ Tiper Intelligence Detail Master (v12.8.5)
 * 🛡️ Complete Metadata Fusion & HTML Summary Parser
 * ---------------------------------------------------------------------
 * 🚀 更新ログ:
 * 1. 要約エリアのHTMLタグ描画問題を完全修正。
 * 2. 記事 summary と extra_metadata.summary の両方を漏らさず表示。
 * 3. モバイル・デスクトップ両対応のサイバー・タイポグラフィ。
 * =====================================================================
 */
// @ts-nocheck
import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';

import { fetchPostData } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

export const dynamic = 'force-dynamic';

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "";
    
    // 🏛️ SITE_CONFIG: ホスト情報からサイト設定を復元
    const siteConfig = getSiteMetadata(host);
    const siteColor = siteConfig?.theme_color || '#00f2ff'; 

    // 🎯 DATA_FETCH: 記事データを抽出
    const post = await fetchPostData(slug, siteConfig?.site_tag || 'avflash');
    if (!post || !post.id) return notFound();

    const { title, image, content, created_at, site, summary, extra_metadata } = post;
    const displayDate = created_at ? new Date(created_at).toLocaleDateString('ja-JP') : '2026-04-07';

    // 🔍 INTEGRITY_LOGIC: メタデータの完全照合
    const primarySummary = summary;
    const secondarySummary = extra_metadata?.summary;
    // 内容が完全に一致しない場合のみ、セカンダリを表示（情報のとりこぼし防止）
    const hasDifferentSummaries = secondarySummary && primarySummary !== secondarySummary;

    /**
     * ⚡ CYBER_BODY_PATCH
     * 外部注入HTMLに対する全自動デザイン・プログラム
     */
    const cyberRenderStyle = `
        .cyber-article-body { font-size: 1.15rem; line-height: 2.2; color: #cbd5e1; }
        .cyber-article-body h2 {
            font-size: clamp(1.5rem, 4vw, 2.1rem); font-weight: 900; color: #fff;
            margin: 6rem 0 2.5rem; padding: 1.2rem 1.8rem;
            border-left: 6px solid ${siteColor};
            background: linear-gradient(90deg, ${siteColor}1A, transparent);
            text-transform: uppercase; font-style: italic;
            box-shadow: -15px 0 40px -20px ${siteColor};
        }
        .cyber-article-body h3 {
            font-size: 1.5rem; font-weight: 800; color: #f1f5f9;
            margin: 4.5rem 0 1.8rem; border-bottom: 1px solid rgba(255,255,255,0.05);
            padding-bottom: 0.8rem; display: flex; align-items: center; gap: 10px;
        }
        .cyber-article-body h3::before { content: '>>'; color: ${siteColor}; font-size: 0.8rem; font-family: monospace; }
        .cyber-article-body p { margin-bottom: 2.5rem; opacity: 0.9; }
        .cyber-article-body strong { color: ${siteColor}; font-weight: 900; text-shadow: 0 0 12px ${siteColor}4D; }
        .cyber-article-body img { 
            max-width: 100%; border-radius: 2px; margin: 5rem 0; 
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
        }
        .summary-html-content p { margin-bottom: 1rem; }
        .summary-html-content p:last-child { margin-bottom: 0; }
    `;

    return (
        <div className="min-h-screen bg-[#05070a] text-gray-300 selection:bg-[#00f2ff]/30 overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: cyberRenderStyle }} />

            {/* 🛸 BACKGROUND_FX: 空間の奥行きを演出 */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,${siteColor}14,transparent)]"></div>
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>

            {/* 🛰️ TOP_NAV: 境界線のシミュレーション */}
            <nav className="fixed top-0 w-full z-50 bg-[#05070a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
                    <Link href="/post" className="text-[10px] font-mono tracking-[0.3em] text-gray-500 hover:text-[#00f2ff] transition-all flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">«</span> RETURN_TO_ARCHIVE
                    </Link>
                    <div className="text-[#00f2ff] flex items-center gap-3 font-mono text-[10px] font-bold tracking-widest">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2ff] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f2ff]"></span>
                        </span>
                        STREAM: {siteConfig.site_name.toUpperCase()}
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-40 pb-48 relative z-10">
                {/* 📟 HEADER_SECTION */}
                <header className="mb-32">
                    <div className="flex items-center gap-5 mb-12">
                        <span className="bg-[#00f2ff] text-black text-[10px] px-4 py-1.5 font-black tracking-[0.25em] uppercase">
                            {site || siteConfig.site_tag || "SECURE_ENTRY"}
                        </span>
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-[#00f2ff]/30 to-transparent"></div>
                        <time className="text-[11px] font-mono text-[#00f2ff]/50 tracking-[0.4em]">[{displayDate}]</time>
                    </div>
                    
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter italic uppercase mb-20 drop-shadow-2xl">
                        {title}
                    </h1>

                    <div className="relative aspect-video w-full overflow-hidden border border-white/10 group shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
                        <img 
                            src={image || "/img/no-image.png"} 
                            alt="" 
                            className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[3s]" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-6 right-8 font-mono text-[9px] text-[#00f2ff] tracking-[0.2em] bg-black/60 px-3 py-1.5 backdrop-blur-md border border-[#00f2ff]/20">
                            DATA_ID: {slug.slice(0, 8).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* 📝 DOUBLE_SUMMARY_MODULE: HTMLパース対応・とりこぼし防止 */}
                {(primarySummary || secondarySummary) && (
                    <section className="mb-32 space-y-10">
                        {/* 記事オリジナルの要約 (HTMLタグをレンダリング) */}
                        {primarySummary && (
                            <div className="p-10 md:p-16 bg-[#00f2ff]/[0.02] border-l-4 border-[#00f2ff] relative overflow-hidden backdrop-blur-sm">
                                <h2 className="text-[12px] font-mono font-black text-[#00f2ff] tracking-[0.5em] uppercase mb-12 flex items-center gap-4">
                                    <span className="w-2.5 h-0.5 bg-[#00f2ff]"></span>
                                    CORE_DATA_SYNOPSIS
                                </h2>
                                <div 
                                    className="summary-html-content text-gray-100 text-xl md:text-3xl leading-relaxed italic font-light opacity-90 tracking-tight"
                                    dangerouslySetInnerHTML={{ __html: primarySummary }}
                                />
                            </div>
                        )}

                        {/* 別ルートのメタデータが存在する場合 */}
                        {hasDifferentSummaries && (
                            <div className="p-10 bg-white/[0.01] border-l-2 border-white/10 italic">
                                <h2 className="text-[10px] font-mono text-gray-500 mb-6 uppercase tracking-[0.4em]">Extended_Intel_Report</h2>
                                <div 
                                    className="summary-html-content text-base md:text-xl text-gray-400 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: secondarySummary }}
                                />
                            </div>
                        )}
                    </section>
                )}

                {/* ⚡ CONTENT_STREAM: メイン記事本文 */}
                <main className="cyber-article-body">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </main>

                {/* 🏁 SESSION_TERMINATION: アクションフッター */}
                <footer className="mt-56 pt-32 border-t border-white/5">
                    <div className="p-12 md:p-28 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,${siteColor}0F,transparent)] pointer-events-none"></div>
                        
                        <h4 className="text-[#00f2ff]/20 font-mono text-[10px] tracking-[2em] mb-16 uppercase relative z-10">Endpoint_Access</h4>
                        <p className="text-white text-4xl md:text-6xl font-black mb-24 tracking-tighter italic uppercase relative z-10 leading-tight">
                            官能の、<span className="text-[#00f2ff] drop-shadow-[0_0_20px_#00f2ff]">特異点</span>を暴け。
                        </p>
                        
                        <div className="flex flex-col md:flex-row justify-center gap-10 relative z-10">
                            {(post.affiliate_url || post.source_url) && (
                                <a href={post.affiliate_url || post.source_url} target="_blank" rel="noopener noreferrer"
                                    className="px-20 py-8 bg-[#00f2ff] text-black font-black text-[12px] tracking-[0.4em] uppercase hover:bg-white transition-all shadow-[0_0_50px_#00f2ff66] hover:-translate-y-1">
                                    OPEN_ARCHIVE_DATA _
                                </a>
                            )}
                            <Link href="/post" className="px-20 py-8 border border-[#00f2ff]/40 text-[#00f2ff] font-black text-[12px] tracking-[0.4em] uppercase hover:text-white hover:bg-[#00f2ff]/10 transition-all hover:-translate-y-1">
                                DISCONNECT_SESSION
                            </Link>
                        </div>
                    </div>
                    
                    <div className="mt-32 flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-[10px] text-gray-700 uppercase tracking-[0.5em] italic">
                        <div className="flex items-center gap-6">
                            <span className="text-[#00f2ff]/40">AVFLASH_DECRYPTOR_V.12.8.5</span>
                            <span className="text-white/10">|</span>
                            <span>NODE: {slug.slice(0, 16).toUpperCase()}</span>
                        </div>
                        <div className="opacity-30">© 2026 {siteConfig.site_name.toUpperCase()}_NETWORK</div>
                    </div>
                </footer>
            </article>
        </div>
    );
}