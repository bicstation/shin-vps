/**
 * =====================================================================
 * 🛰️ Tiper Intelligence Detail Master (v12.7.0)
 * 🛡️ Maya's Logic: Pure HTML Injection / Neon-Adult Sector Patch
 * ---------------------------------------------------------------------
 * 🚀 修正・統合ポイント:
 * 1. 【Cyber Render】注入HTML（h2, h3, strong, img）を強制サイバー・リデザイン。
 * 2. 【Briefing Section】CORE_SUMMARYを大型のイタリック・タイポグラフィで強調。
 * 3. 【Navigation】セッションの中断（CLOSE_SESSION）をUXの核に配置。
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
    const siteData = getSiteMetadata(host);
    const currentProject = siteData?.site_name || 'avflash';
    const siteColor = '#00f2ff'; // AVFlash Cyan

    // --- 🎯 DATA_FETCH ---
    const post = await fetchPostData(slug, currentProject);
    if (!post || !post.id) return notFound();

    const { title, image, content, created_at, site, summary, extra_metadata } = post;
    const displayDate = created_at ? new Date(created_at).toLocaleDateString('ja-JP') : '2026-04-05';
    const displaySummary = extra_metadata?.summary || summary;

    /**
     * ⚡ AVFLASH_CYBER_PATCH
     * 注入されたHTML要素に対し、グローバル汚染を避けつつ強力な装飾を施します。
     */
    const cyberRenderStyle = `
        .cyber-article-body {
            font-size: 1.15rem;
            line-height: 2.2;
            color: #cbd5e1;
            letter-spacing: 0.015em;
        }
        .cyber-article-body h2 {
            font-size: clamp(1.6rem, 4vw, 2.2rem); 
            font-weight: 900; color: #fff;
            margin: 6rem 0 2.5rem; padding: 1.2rem 1.8rem;
            border-left: 6px solid ${siteColor};
            background: linear-gradient(90deg, rgba(0,242,255,0.12), transparent);
            text-transform: uppercase; font-style: italic;
            box-shadow: -15px 0 40px -20px ${siteColor};
            letter-spacing: -0.02em;
            font-family: 'JetBrains Mono', monospace;
        }
        .cyber-article-body h3 {
            font-size: 1.5rem; font-weight: 800; color: #f1f5f9;
            margin: 4.5rem 0 1.8rem; display: flex; align-items: center; gap: 15px;
        }
        .cyber-article-body h3::before {
            content: ''; width: 10px; height: 10px; background: ${siteColor}; 
            transform: rotate(45deg); box-shadow: 0 0 15px ${siteColor};
        }
        .cyber-article-body p { margin-bottom: 2.5rem; opacity: 0.9; }
        .cyber-article-body strong {
            color: ${siteColor}; font-weight: 900;
            text-shadow: 0 0 15px rgba(0, 242, 255, 0.4);
        }
        .cyber-article-body img {
            max-width: 100%; height: auto; margin: 5rem 0;
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
            transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cyber-article-body img:hover {
            transform: scale(1.02);
            border-color: ${siteColor};
        }
        .cyber-article-body blockquote {
            margin: 5rem 0; padding: 3rem;
            background: rgba(0, 242, 255, 0.02);
            border: 1px solid rgba(0, 242, 255, 0.1);
            border-left: 4px solid ${siteColor};
            font-style: italic; color: #94a3b8;
        }
        .cyber-article-body a { 
            color: ${siteColor}; text-decoration: none; 
            border-bottom: 1px solid rgba(0, 242, 255, 0.2);
            transition: 0.3s; font-weight: 800;
        }
        .cyber-article-body a:hover { 
            background: rgba(0, 242, 255, 0.1); 
            border-bottom-color: ${siteColor};
            color: #fff;
        }
    `;

    return (
        <div className="min-h-screen bg-[#05070a] text-gray-300 font-sans selection:bg-[#00f2ff]/30 overflow-x-hidden">
            {/* 💉 CYBER_STYLE_INJECTION */}
            <style dangerouslySetInnerHTML={{ __html: cyberRenderStyle }} />

            {/* --- 🛰️ FX_LAYER --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(0,242,255,0.08),transparent)]"></div>
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>

            {/* --- 🛸 GLOBAL_NAV --- */}
            <nav className="fixed top-0 w-full z-50 bg-[#05070a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
                    <Link href="/post" className="text-[10px] font-mono tracking-[0.3em] text-gray-500 hover:text-[#00f2ff] transition-all flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">«</span> RETURN_TO_ARCHIVE
                    </Link>
                    <div className="text-[#00f2ff] flex items-center gap-3 font-mono text-[10px] font-bold tracking-widest">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2ff] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f2ff]"></span>
                        </span>
                        STREAM: {currentProject.toUpperCase()}
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-40 pb-48 relative z-10">
                {/* --- 📟 HEADER --- */}
                <header className="mb-32">
                    <div className="flex items-center gap-5 mb-12">
                        <span className="bg-[#00f2ff] text-black text-[10px] px-4 py-1.5 font-black tracking-[0.25em] uppercase">
                            {site || "SECURE_ENTRY"}
                        </span>
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-[#00f2ff]/30 to-transparent"></div>
                        <time className="text-[11px] font-mono text-[#00f2ff]/50 tracking-[0.4em]">[{displayDate}]</time>
                    </div>
                    
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.02] tracking-tighter italic uppercase mb-20 drop-shadow-2xl">
                        {title}
                    </h1>

                    <div className="relative aspect-video w-full overflow-hidden border border-white/10 group shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
                        <img 
                            src={image} 
                            alt="" 
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s]" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-6 right-8 font-mono text-[9px] text-[#00f2ff] tracking-[0.2em] bg-black/60 px-3 py-1.5 backdrop-blur-md border border-[#00f2ff]/20">
                            DATA_ID: {slug.slice(0, 8).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* --- 📝 INTEL_BRIEFING --- */}
                {displaySummary && (
                    <section className="mb-32 p-10 md:p-16 bg-[#00f2ff]/[0.02] border-l-4 border-[#00f2ff] relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 right-0 p-6 font-mono text-[9px] text-[#00f2ff]/20 uppercase tracking-[0.8em] pointer-events-none">
                            Summary_Report
                        </div>
                        <h2 className="text-[12px] font-mono font-black text-[#00f2ff] tracking-[0.5em] uppercase mb-12 flex items-center gap-4">
                            <span className="w-2.5 h-0.5 bg-[#00f2ff]"></span>
                            CORE_DATA_SYNOPSIS
                        </h2>
                        <div className="text-gray-100 text-xl md:text-3xl leading-relaxed italic font-light opacity-90 tracking-tight">
                            “{displaySummary}”
                        </div>
                    </section>
                )}

                {/* --- ⚡ CONTENT_STREAM --- */}
                <main className="cyber-article-body">
                    <div 
                        dangerouslySetInnerHTML={{ __html: content }} 
                    />
                </main>

                {/* --- 🏁 SESSION_TERMINATION --- */}
                <footer className="mt-56 pt-32 border-t border-white/5">
                    <div className="p-12 md:p-28 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.06),transparent)] pointer-events-none"></div>
                        
                        <h4 className="text-[#00f2ff]/20 font-mono text-[10px] tracking-[2em] mb-16 uppercase relative z-10">Endpoint_Access</h4>
                        <p className="text-white text-4xl md:text-6xl font-black mb-24 tracking-tighter italic uppercase relative z-10 leading-tight">
                            官能の、<span className="text-[#00f2ff] drop-shadow-[0_0_20px_#00f2ff]">特異点</span>を暴け。
                        </p>
                        
                        <div className="flex flex-col md:flex-row justify-center gap-10 relative z-10">
                            {(post.affiliate_url || post.source_url) && (
                                <a href={post.affiliate_url || post.source_url} target="_blank" rel="noopener noreferrer"
                                    className="px-20 py-8 bg-[#00f2ff] text-black font-black text-[12px] tracking-[0.4em] uppercase hover:bg-white transition-all shadow-[0_0_50px_rgba(0,242,255,0.4)] hover:-translate-y-1">
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
                            <span className="text-[#00f2ff]/40">AVFLASH_DECRYPTOR_V.12.7</span>
                            <span className="text-white/10">|</span>
                            <span>NODE: {slug.slice(0, 16).toUpperCase()}</span>
                        </div>
                        <div className="opacity-30">© 2026 AVFLASH_SECURE_NETWORK</div>
                    </div>
                </footer>
            </article>
        </div>
    );
}