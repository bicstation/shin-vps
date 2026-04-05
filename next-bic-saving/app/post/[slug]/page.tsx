/**
 * =====================================================================
 * 🛰️ AVFLASH Intelligence Detail Master (v12.6.0)
 * 🛡️ Maya's Logic: Pure HTML Injection / Neon-Adult Sector Patch
 * 修正内容: インデックスの超コントラスト設定を継承。
 * 記事本文の全要素を AVFlash 専用ネオン・スタイルで再定義。
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
    const siteColor = '#00f2ff';

    const post = await fetchPostData(slug, currentProject);
    if (!post || !post.id) return notFound();

    const { title, image, content, created_at, site, summary, extra_metadata } = post;
    const displayDate = created_at ? new Date(created_at).toLocaleDateString('ja-JP') : '2026-04-05';
    const displaySummary = extra_metadata?.summary || summary;

    /**
     * ⚡ AVFLASH_CYBER_PATCH
     * 注入されたHTMLを AVFlash セクター専用の視覚効果で上書きします。
     */
    const cyberRenderStyle = `
        .cyber-article-body {
            font-size: 1.15rem;
            line-height: 2.3;
            color: #cbd5e1;
            letter-spacing: 0.02em;
        }
        .cyber-article-body h2 {
            font-size: 1.8rem; font-weight: 900; color: #fff;
            margin: 6rem 0 2rem; padding: 1rem 1.5rem;
            border-left: 5px solid ${siteColor};
            background: linear-gradient(90deg, rgba(0,242,255,0.1), transparent);
            text-transform: uppercase; font-style: italic;
            box-shadow: -15px 0 30px -15px ${siteColor};
            letter-spacing: -0.05em;
        }
        .cyber-article-body h3 {
            font-size: 1.5rem; font-weight: 800; color: #f1f5f9;
            margin: 4rem 0 1.5rem; display: flex; align-items: center; gap: 15px;
        }
        .cyber-article-body h3::before {
            content: ''; width: 12px; height: 12px; background: ${siteColor}; 
            transform: rotate(45deg); box-shadow: 0 0 15px ${siteColor};
        }
        .cyber-article-body p { margin-bottom: 2.5rem; }
        .cyber-article-body strong {
            color: ${siteColor}; font-weight: 900;
            text-shadow: 0 0 10px rgba(0, 242, 255, 0.4);
            padding: 0 2px;
        }
        .cyber-article-body img {
            max-width: 100%; height: auto; margin: 5rem 0;
            border: 1px solid rgba(0, 242, 255, 0.2);
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 242, 255, 0.05);
            transition: all 0.5s ease;
        }
        .cyber-article-body img:hover {
            border-color: ${siteColor};
            box-shadow: 0 0 60px rgba(0, 242, 255, 0.15);
        }
        .cyber-article-body blockquote {
            margin: 4.5rem 0; padding: 3rem;
            background: rgba(0, 242, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-left: 4px solid ${siteColor};
            font-style: italic; color: #94a3b8;
            position: relative;
        }
        .cyber-article-body a { 
            color: ${siteColor}; text-decoration: none; 
            border-bottom: 1px solid rgba(0, 242, 255, 0.3);
            transition: all 0.3s; font-weight: bold;
        }
        .cyber-article-body a:hover { 
            background: rgba(0, 242, 255, 0.15); 
            border-bottom-color: ${siteColor};
        }
    `;

    return (
        <div className="min-h-screen bg-[#05070a] text-gray-300 font-sans selection:bg-[#00f2ff]/30 overflow-x-hidden">
            {/* 💉 サイバー・プロトコル注入 */}
            <style dangerouslySetInnerHTML={{ __html: cyberRenderStyle }} />

            {/* --- 🛰️ BACKGROUND_LAYER --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-[0.05]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(0,242,255,0.1),transparent)]"></div>
            </div>

            {/* --- 🛸 TOP_NAV --- */}
            <nav className="fixed top-0 w-full z-50 bg-[#05070a]/90 backdrop-blur-2xl border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                    <Link href="/post" className="hover:text-[#00f2ff] transition-all flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">«</span> CLOSE_DECRYPTOR
                    </Link>
                    <div className="text-[#00f2ff] flex items-center gap-3 font-bold opacity-70">
                        <span className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-pulse shadow-[0_0_10px_#00f2ff]"></span>
                        SIGNAL: {currentProject.toUpperCase()}
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-36 pb-48 relative z-10">
                {/* --- 📟 HEADER --- */}
                <header className="mb-28">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="bg-[#00f2ff] text-black text-[9px] px-3 py-1 font-black tracking-[0.2em] uppercase">
                            {site || "UNCENSORED"}
                        </span>
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-[#00f2ff]/40 to-transparent"></div>
                        <time className="text-[10px] font-mono text-[#00f2ff]/60 tracking-[0.3em]">[{displayDate}]</time>
                    </div>
                    
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter italic uppercase mb-16 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        {title}
                    </h1>

                    <div className="relative aspect-video w-full overflow-hidden border border-white/10 group shadow-2xl">
                        <img src={image} alt="" className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent opacity-90" />
                        <div className="absolute top-4 right-4 font-mono text-[8px] text-[#00f2ff] bg-black/50 px-2 py-1 backdrop-blur-md border border-[#00f2ff]/30">
                            DECRYPTED_STREAM_V.2.6
                        </div>
                    </div>
                </header>

                {/* --- 📝 BRIEFING --- */}
                {displaySummary && (
                    <section className="mb-28 p-12 bg-[#00f2ff]/[0.02] border-l-[3px] border-[#00f2ff] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-[#00f2ff]/20 uppercase tracking-[0.5em]">Intel_Briefing</div>
                        <h2 className="text-[11px] font-mono font-black text-[#00f2ff] tracking-[0.6em] uppercase mb-10 flex items-center gap-3">
                            <span className="w-2 h-2 bg-[#00f2ff] animate-ping"></span>
                            CORE_SUMMARY
                        </h2>
                        <div className="text-gray-100 text-xl md:text-3xl leading-relaxed italic font-light opacity-95 tracking-tight">
                            {displaySummary}
                        </div>
                    </section>
                )}

                {/* --- ⚡ CONTENT_STREAM --- */}
                <main className="cyber-article-body">
                    <div 
                        dangerouslySetInnerHTML={{ __html: content }} 
                    />
                </main>

                {/* --- 🏁 FINAL_SESSION --- */}
                <footer className="mt-48 pt-24 border-t border-[#00f2ff]/10">
                    <div className="p-16 md:p-24 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.05),transparent)] pointer-events-none"></div>
                        
                        <h4 className="text-[#00f2ff]/30 font-mono text-[10px] tracking-[1.5em] mb-12 uppercase relative z-10">Access_Finalization</h4>
                        <p className="text-white text-4xl md:text-6xl font-black mb-20 tracking-tighter italic uppercase relative z-10">
                            快楽の、<span className="text-[#00f2ff] drop-shadow-[0_0_15px_#00f2ff]">深淵</span>へ。
                        </p>
                        
                        <div className="flex flex-col md:flex-row justify-center gap-8 relative z-10">
                            {(post.affiliate_url || post.source_url) && (
                                <a href={post.affiliate_url || post.source_url} target="_blank" rel="noopener noreferrer"
                                    className="px-16 py-7 bg-[#00f2ff] text-black font-black text-[11px] tracking-[0.3em] uppercase hover:bg-white transition-all shadow-[0_0_40px_rgba(0,242,255,0.4)]">
                                    SOURCE_ARCHIVE _
                                </a>
                            )}
                            <Link href="/post" className="px-16 py-7 border border-[#00f2ff]/30 text-[#00f2ff] font-black text-[11px] tracking-[0.3em] uppercase hover:text-white hover:bg-[#00f2ff]/10 transition-all">
                                CLOSE_SESSION
                            </Link>
                        </div>
                    </div>
                    
                    <div className="mt-24 flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[10px] text-gray-700 uppercase tracking-[0.4em] italic">
                        <div className="flex gap-6">
                            <span>SESSION: {slug.slice(0, 12).toUpperCase()}</span>
                            <span className="text-white/10">|</span>
                            <span className="text-[#00f2ff]/40">ENCRYPTED_READ</span>
                        </div>
                        <div className="opacity-40">© AVFLASH_SECURE_NETWORK_2026</div>
                    </div>
                </footer>
            </article>
        </div>
    );
}