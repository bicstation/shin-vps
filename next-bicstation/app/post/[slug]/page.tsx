/**
 * =====================================================================
 * 🛰️ BICSTATION Intelligence Detail Master (v12.1.0)
 * 🛡️ Maya's Logic: Pure HTML Injection + Build Error Elimination
 * ---------------------------------------------------------------------
 * 🚀 修正・統合内容:
 * 1. 【BUILD_FIX】notFound のインポート元を 'next/navigation' へ修正。
 * 2. 【RELATED_NODES】最新3件の関連ノードを動的にフィルタリングして表示。
 * 3. 【CYBER_STYLE】dangerouslySetInnerHTML 内の HTML 要素を完全制圧。
 * =====================================================================
 */

// @ts-nocheck
import React from 'react';
import { notFound } from 'next/navigation'; // ✅ Fix: Next.js 標準の navigation を使用
import { headers } from 'next/headers';
import Link from 'next/link';

// API・共通コンポーネント
import { fetchPostData, fetchPostList } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

export const dynamic = 'force-dynamic';

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const headerList = await headers();
    
    // --- 🎯 ENVIRONMENT_DETECTION ---
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "";
    const siteData = getSiteMetadata(host);
    const rawProject = siteData?.site_name || 'bicstation';
    const currentProject = rawProject.replace(/\s+/g, '').toLowerCase();
    const siteColor = '#00f2ff';

    // --- 🎯 DATA_FETCHING ---
    const post = await fetchPostData(slug, currentProject);
    if (!post || !post.id) return notFound();

    // 関連記事の取得 (最新4件取得し、自分自身を除外して3件表示)
    const relatedResponse = await fetchPostList(4, 0, currentProject);
    const relatedPosts = relatedResponse?.results
        ?.filter(p => p.slug !== slug)
        .slice(0, 3) || [];

    const { title, image, content, created_at, site, summary, extra_metadata } = post;
    const displayDate = created_at ? new Date(created_at).toLocaleDateString('ja-JP') : '2026-04-07';
    const displaySummary = extra_metadata?.summary || summary;

    /**
     * ⚡ CYBER_CORE_STYLE
     * 注入されたHTMLを外部からCSSでハックし、サイトの世界観に強制同期させる
     */
    const cyberRenderStyle = `
        .cyber-content-stream { font-size: 1.15rem; line-height: 2.3; color: #d1d5db; }
        .cyber-content-stream h2 {
            font-size: 2.2rem; font-weight: 900; color: #ffffff;
            margin: 5rem 0 2rem; padding: 0.8rem 1.5rem;
            border-left: 5px solid ${siteColor};
            background: linear-gradient(90deg, rgba(0,242,255,0.1), transparent);
            text-transform: uppercase; font-style: italic;
        }
        .cyber-content-stream h3 {
            font-size: 1.6rem; font-weight: 800; color: #f3f4f6;
            margin: 3.5rem 0 1.5rem; display: flex; align-items: center; gap: 12px;
        }
        .cyber-content-stream h3::before {
            content: ''; width: 12px; height: 12px; background: ${siteColor}; transform: rotate(45deg);
        }
        .cyber-content-stream p { margin-bottom: 2.8rem; }
        .cyber-content-stream strong {
            color: ${siteColor}; font-weight: 900; text-shadow: 0 0 12px rgba(0,242,255,0.5);
        }
        .cyber-content-stream img {
            max-width: 100%; height: auto; margin: 4.5rem 0;
            border: 1px solid rgba(255,255,255,0.15);
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.8);
        }
        .cyber-content-stream blockquote {
            margin: 4rem 0; padding: 3rem;
            background: rgba(0, 242, 255, 0.04);
            border-left: 3px solid ${siteColor};
            font-style: italic; color: #94a3b8;
        }
        .cyber-content-stream a { color: ${siteColor}; text-decoration: underline; transition: 0.3s; }
        .cyber-content-stream a:hover { color: #fff; text-shadow: 0 0 8px ${siteColor}; }
    `;

    return (
        <div className="min-h-screen bg-[#06080f] text-gray-300 font-sans selection:bg-[#00f2ff]/30 overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: cyberRenderStyle }} />

            {/* --- BG_DECORATION --- */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,242,255,0.08),transparent)]"></div>

            {/* --- TOP_NAV --- */}
            <nav className="fixed top-0 w-full z-50 bg-[#06080f]/90 backdrop-blur-2xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                    <Link href="/post" className="hover:text-[#00f2ff] transition-all flex items-center gap-3 group">
                        <span className="group-hover:-translate-x-1 transition-transform">«</span> RETURN_TO_BASE
                    </Link>
                    <div className="text-[#00f2ff]/70 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-ping"></span>
                        LINK_ESTABLISHED: {currentProject.toUpperCase()}
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-10">
                {/* --- HEADER --- */}
                <header className="mb-24">
                    <div className="flex items-center gap-5 mb-10">
                        <span className="border border-[#00f2ff]/50 text-[#00f2ff] text-[10px] px-4 py-1.5 font-black tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(0,242,255,0.15)]">
                            {site || "SYSTEM_ARCHIVE"}
                        </span>
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-white/10 to-transparent"></div>
                        <time className="text-[11px] font-mono text-gray-600 tracking-widest">[{displayDate}]</time>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter italic uppercase mb-14 drop-shadow-2xl">
                        {title}
                    </h1>
                    {image && (
                        <div className="relative aspect-video w-full overflow-hidden border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] rounded-sm">
                            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-transparent to-transparent opacity-90" />
                        </div>
                    )}
                </header>

                {/* --- EXECUTIVE_SUMMARY --- */}
                {displaySummary && (
                    <section className="mb-28 p-12 bg-slate-900/30 border-l-4 border-[#00f2ff] backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-5 font-mono text-[9px] text-[#00f2ff]/10 uppercase tracking-[0.5em] group-hover:text-[#00f2ff]/30 transition-colors">Strategic_Summary</div>
                        <h2 className="text-[11px] font-mono font-bold text-[#00f2ff] tracking-[0.6em] uppercase mb-10 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-[#00f2ff]"></span> ANALYZING_DATA
                        </h2>
                        <div className="text-gray-100 text-2xl md:text-3xl leading-snug italic font-extralight tracking-tight opacity-95">
                            {displaySummary}
                        </div>
                    </section>
                )}

                {/* --- MAIN_CONTENT_STREAM --- */}
                <main className="cyber-content-stream">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </main>

                {/* --- RELATED_NODES --- */}
                {relatedPosts.length > 0 && (
                    <section className="mt-40 pt-20 border-t border-white/10">
                        <div className="flex items-center gap-4 mb-16">
                            <h3 className="text-sm font-mono font-black text-white tracking-[1em] uppercase italic">
                                Related_Nodes
                            </h3>
                            <div className="h-[1px] flex-grow bg-[#00f2ff]/20"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((relPost) => (
                                <UnifiedProductCard 
                                    key={relPost.id} 
                                    data={relPost} 
                                    siteConfig={siteData} 
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* --- FOOTER_ACTIONS --- */}
                <footer className="mt-32 pt-20 border-t border-white/5">
                    <div className="p-16 bg-gradient-to-br from-[#0a101a] to-[#06080f] border border-white/5 text-center relative overflow-hidden group shadow-2xl">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.03),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <h4 className="text-[#00f2ff]/20 font-mono text-[10px] tracking-[1.5em] mb-12 uppercase relative z-10">Access_Finalization</h4>
                        <p className="text-white text-4xl md:text-6xl font-black mb-16 tracking-tighter italic uppercase relative z-10 drop-shadow-lg">
                            深層部へ、到達せよ。
                        </p>
                        
                        <div className="flex flex-col md:flex-row justify-center gap-10 relative z-10">
                            {(post.affiliate_url || post.source_url) && (
                                <a href={post.affiliate_url || post.source_url} target="_blank" rel="noopener noreferrer"
                                    className="px-20 py-7 bg-[#00f2ff] text-black font-black text-xs tracking-[0.3em] uppercase hover:bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all transform hover:-translate-y-1">
                                    ACCESS_SOURCE _
                                </a>
                            )}
                            <Link href="/post" className="px-20 py-7 border border-white/10 text-gray-400 font-black text-xs tracking-[0.3em] uppercase hover:text-white hover:bg-white/5 hover:border-white/30 transition-all transform hover:-translate-y-1">
                                CLOSE_SESSION
                            </Link>
                        </div>
                    </div>
                    <div className="mt-24 flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[9px] text-gray-700 uppercase tracking-[0.4em] italic">
                        <div className="flex items-center gap-4">
                            <span className="text-[#00f2ff]/40">UUID:</span> {slug.slice(0, 16)}...
                            <span className="text-gray-800">//</span> 
                            <span className="text-[#00f2ff]/40">STATUS:</span> ARCHIVED_CORE
                        </div>
                        <div>© BICSTATION_SECURE_NETWORK_2026</div>
                    </div>
                </footer>
            </article>
        </div>
    );
}