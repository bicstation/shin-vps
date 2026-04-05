/**
 * =====================================================================
 * 🛰️ BICSTATION Intelligence Detail Master (v11.5.0)
 * 🛡️ Maya's Logic: Pure HTML Injection with Global Style Patch
 * 修正内容: コンパイラを完全排除。dangerouslySetInnerHTML と 
 * Scoped Style による確実なレンダリングを実装。
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
    const host = headerList.get('host') || "";
    const siteData = getSiteMetadata(host);
    const currentProject = siteData?.site_name || 'bicstation';
    const siteColor = '#00f2ff';

    const post = await fetchPostData(slug, currentProject);
    if (!post || !post.id) return notFound();

    const { title, image, content, created_at, site, summary, extra_metadata } = post;
    const displayDate = created_at ? new Date(created_at).toLocaleDateString('ja-JP') : '2026-04-05';
    const displaySummary = extra_metadata?.summary || summary;

    /**
     * ⚡ CYBER_CORE_STYLE
     * 注入されたHTML要素に対して後付けでスタイルを適用します。
     */
    const cyberRenderStyle = `
        .cyber-content-stream {
            font-size: 1.15rem;
            line-height: 2.3;
            color: #d1d5db;
        }
        .cyber-content-stream h2 {
            font-size: 2rem; font-weight: 900; color: #ffffff;
            margin: 4.5rem 0 1.5rem; padding: 0.6rem 1.2rem;
            border-left: 4px solid ${siteColor};
            background: linear-gradient(90deg, rgba(0,242,255,0.1), transparent);
            text-transform: uppercase; font-style: italic;
        }
        .cyber-content-stream h3 {
            font-size: 1.5rem; font-weight: 800; color: #f3f4f6;
            margin: 3rem 0 1.2rem; display: flex; align-items: center; gap: 12px;
        }
        .cyber-content-stream h3::before {
            content: ''; width: 10px; height: 10px; background: ${siteColor}; transform: rotate(45deg);
        }
        .cyber-content-stream p { margin-bottom: 2.5rem; }
        .cyber-content-stream strong {
            color: ${siteColor}; font-weight: 900; text-shadow: 0 0 10px rgba(0,242,255,0.4);
        }
        .cyber-content-stream ul { margin: 2.5rem 0; padding-left: 1.5rem; list-style: none; }
        .cyber-content-stream li { margin-bottom: 1rem; position: relative; }
        .cyber-content-stream li::before {
            content: '▶'; position: absolute; left: -1.6rem; color: ${siteColor}; font-size: 0.8rem; top: 0.3rem;
        }
        .cyber-content-stream img {
            max-width: 100%; height: auto; margin: 4rem 0;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        }
        .cyber-content-stream blockquote {
            margin: 3.5rem 0; padding: 2.5rem;
            background: rgba(0, 242, 255, 0.03);
            border-left: 2px solid ${siteColor};
            font-style: italic; color: #94a3b8;
        }
        /* 埋め込みリンク等の調整 */
        .cyber-content-stream a { color: ${siteColor}; text-decoration: underline; opacity: 0.8; }
        .cyber-content-stream a:hover { opacity: 1; }
    `;

    return (
        <div className="min-h-screen bg-[#06080f] text-gray-300 font-sans selection:bg-[#00f2ff]/30 overflow-x-hidden">
            {/* スタイル・プロトコル注入 */}
            <style dangerouslySetInnerHTML={{ __html: cyberRenderStyle }} />

            {/* --- BG_DECORATION --- */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(0,242,255,0.05),transparent)]"></div>

            {/* --- TOP_NAV --- */}
            <nav className="fixed top-0 w-full z-50 bg-[#06080f]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                    <Link href="/post" className="hover:text-[#00f2ff] transition-colors flex items-center gap-2">
                        <span>«</span> RETURN_TO_BASE
                    </Link>
                    <div className="text-[#00f2ff]/60 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-pulse shadow-[0_0_8px_#00f2ff]"></span>
                        PORT: {currentProject.toUpperCase()}
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-32 pb-40 relative z-10">
                {/* --- HEADER --- */}
                <header className="mb-24">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="border border-[#00f2ff] text-[#00f2ff] text-[10px] px-3 py-1 font-black tracking-widest uppercase shadow-[0_0_10px_rgba(0,242,255,0.2)]">
                            {site}
                        </span>
                        <div className="h-[px] flex-grow bg-white/5"></div>
                        <time className="text-[11px] font-mono text-gray-600 tracking-tighter">[{displayDate}]</time>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-[0.95] tracking-tighter italic uppercase mb-12">
                        {title}
                    </h1>
                    <div className="relative aspect-video w-full overflow-hidden border border-white/10 shadow-2xl rounded-sm">
                        <img src={image} alt={title} className="w-full h-full object-cover grayscale-[0.2]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-transparent to-transparent opacity-80" />
                    </div>
                </header>

                {/* --- EXECUTIVE_SUMMARY --- */}
                {displaySummary && (
                    <section className="mb-24 p-10 bg-slate-900/40 border-l-2 border-[#00f2ff] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-[#00f2ff]/20 uppercase tracking-[0.4em]">Intel_Briefing</div>
                        <h2 className="text-[10px] font-mono font-bold text-[#00f2ff] tracking-[0.5em] uppercase mb-8">
                            {">>"} DATA_SUMMARY
                        </h2>
                        <div className="text-gray-200 text-xl md:text-2xl leading-relaxed italic font-light opacity-90">
                            {displaySummary}
                        </div>
                    </section>
                )}

                {/* --- MAIN_CONTENT_STREAM --- */}
                <main className="cyber-content-stream">
                    <div 
                        dangerouslySetInnerHTML={{ __html: content }} 
                    />
                </main>

                {/* --- FOOTER_ACTIONS --- */}
                <footer className="mt-40 pt-20 border-t border-white/5">
                    <div className="p-16 bg-[#0a101a] border border-white/5 text-center relative overflow-hidden group">
                        <h4 className="text-[#00f2ff]/30 font-mono text-[9px] tracking-[1em] mb-12 uppercase relative z-10">Access_Finalization</h4>
                        <p className="text-white text-3xl md:text-5xl font-black mb-16 tracking-tighter italic uppercase relative z-10">情報の「核心」へ。</p>
                        
                        <div className="flex flex-col md:flex-row justify-center gap-8 relative z-10">
                            {(post.affiliate_url || post.source_url) && (
                                <a href={post.affiliate_url || post.source_url} target="_blank" rel="noopener noreferrer"
                                    className="px-16 py-6 bg-[#00f2ff] text-black font-black text-xs tracking-widest uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]">
                                    ACCESS_SOURCE _
                                </a>
                            )}
                            <Link href="/post" className="px-16 py-6 border border-white/10 text-gray-500 font-black text-xs tracking-widest uppercase hover:text-white hover:bg-white/5 transition-all">
                                CLOSE_SESSION
                            </Link>
                        </div>
                    </div>
                    <div className="mt-20 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[9px] text-gray-700 uppercase tracking-widest italic">
                        <div>UUID: {slug} // STATUS: ARCHIVED</div>
                        <div>© BICSTATION_SECURE_NETWORK_2026</div>
                    </div>
                </footer>
            </article>
        </div>
    );
}