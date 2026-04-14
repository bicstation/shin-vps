/**
 * =====================================================================
 * 🛰️ BIC-SAVING Intelligence Detail Master (v12.9.9)
 * 🛡️ Maya's Logic: Absolute Import & Multi-Node Relation Protocol
 * ---------------------------------------------------------------------
 * 🚀 統合・修正内容:
 * 1. 【BUILD_FIX】notFound のインポート元を 'next/navigation' に完全固定。
 * 2. 【DATA_FIX】自身を除外した最新3件の関連ノードを動的に取得・統合。
 * 3. 【UI_FIX】Strategic_Analysis セクションの視覚的深度を強化。
 * =====================================================================
 */

// @ts-nocheck
import React from 'react';
import { notFound } from 'next/navigation'; 
import { headers } from 'next/headers';
import Link from 'next/link';

// 共通API・ユーティリティ
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

    // --- 🎯 MAIN_CONTENT_FETCH ---
    const post = await fetchPostData(slug, currentProject);
    if (!post || !post.id) return notFound();

    // --- 🎯 RELATED_NODES_FETCH (最新4件取得して自分を除外) ---
    const relatedResponse = await fetchPostList(4, 0, currentProject);
    const relatedPosts = relatedResponse?.results
        ?.filter(p => p.slug !== slug)
        .slice(0, 3) || [];

    const { title, image, content, created_at, site, summary, extra_metadata } = post;
    const displayDate = created_at ? new Date(created_at).toLocaleDateString('ja-JP') : '2026-04-07';

    // HTML注入用のデータ整理
    const summaryHtml = extra_metadata?.summary || summary || "";
    const points = [
        extra_metadata?.point1,
        extra_metadata?.point2,
        extra_metadata?.point3
    ].filter(Boolean);

    /**
     * ⚡ CYBER_RENDER_STYLE
     * HTMLインジェクションされた要素を外部から支配するCSSパッチ
     */
    const cyberRenderStyle = `
        .cyber-article-body, .analysis-content {
            font-size: 1.15rem; line-height: 2.3; color: #cbd5e1;
        }
        .cyber-article-body h2 {
            font-size: 2rem; font-weight: 900; color: #fff;
            margin: 6rem 0 2.5rem; padding: 1rem 1.8rem;
            border-left: 5px solid ${siteColor};
            background: linear-gradient(90deg, rgba(0,242,255,0.1), transparent);
            text-transform: uppercase; font-style: italic;
            letter-spacing: -0.02em;
        }
        .cyber-article-body h3 {
            font-size: 1.6rem; font-weight: 800; color: #f3f4f6;
            margin: 4rem 0 2rem; display: flex; align-items: center; gap: 15px;
        }
        .cyber-article-body h3::before {
            content: ''; width: 10px; height: 10px; background: ${siteColor}; transform: rotate(45deg);
        }
        .cyber-article-body p { margin-bottom: 2.8rem; }
        .cyber-article-body img {
            max-width: 100%; height: auto; margin: 5rem 0;
            border: 1px solid rgba(0, 242, 255, 0.2);
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.7);
        }
        .cyber-article-body strong { 
            color: ${siteColor}; font-weight: 900; 
            text-shadow: 0 0 10px rgba(0, 242, 255, 0.4); 
        }
        .cyber-article-body a { 
            color: ${siteColor}; text-decoration: underline; 
            transition: all 0.3s ease;
        }
        .cyber-article-body a:hover { color: #fff; background: ${siteColor}/20; }
        .cyber-article-body blockquote {
            border-left: 3px solid ${siteColor};
            background: rgba(255,255,255,0.03);
            padding: 2rem; margin: 4rem 0; font-style: italic;
        }
    `;

    return (
        <div className="min-h-screen bg-[#05070a] text-gray-300 font-sans selection:bg-[#00f2ff]/30 overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: cyberRenderStyle }} />

            {/* --- 🛰️ BACKGROUND_LAYER --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(0,242,255,0.15),transparent)]"></div>
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>

            {/* --- 🛸 TOP_NAV --- */}
            <nav className="fixed top-0 w-full z-50 bg-[#05070a]/90 backdrop-blur-2xl border-b border-white/5">
                <div className="w-full px-6 py-5 flex justify-between items-center text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                    <Link href="/post" className="hover:text-[#00f2ff] transition-all flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform animate-pulse">«</span> CLOSE_DECRYPTOR
                    </Link>
                    <div className="text-[#00f2ff] flex items-center gap-3 font-bold">
                        <span className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-ping"></span>
                        LINK_ESTABLISHED: {slug.slice(0, 8).toUpperCase()}
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-36 pb-20 relative z-10">
                {/* --- 📟 HEADER --- */}
                <header className="mb-28">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="bg-[#00f2ff] text-black text-[9px] px-3 py-1 font-black tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(0,242,255,0.3)]">
                            {site || "SECURE_ARCHIVE"}
                        </span>
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-[#00f2ff]/40 to-transparent"></div>
                        <time className="text-[10px] font-mono text-[#00f2ff]/60 tracking-[0.3em]">[{displayDate}]</time>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter italic uppercase mb-16 drop-shadow-2xl">
                        {title}
                    </h1>
                    {image && (
                        <div className="relative aspect-video w-full overflow-hidden border border-white/10 shadow-2xl rounded-sm">
                            <img src={image} alt="" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent opacity-80" />
                        </div>
                    )}
                </header>

                {/* --- 🧪 STRATEGIC_ANALYSIS --- */}
                {(summaryHtml || points.length > 0) && (
                    <section className="mb-32 p-8 md:p-12 bg-white/[0.01] border-l-[3px] border-[#00f2ff] relative backdrop-blur-sm">
                        <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-[#00f2ff]/30 uppercase tracking-[0.5em]">Intelligence_Analysis</div>
                        
                        {summaryHtml && (
                            <div className="analysis-content text-gray-100 text-xl md:text-3xl leading-relaxed italic opacity-95 mb-16"
                                dangerouslySetInnerHTML={{ __html: summaryHtml }} />
                        )}

                        <div className="grid grid-cols-1 gap-8 w-full">
                            {points.map((html, idx) => (
                                <div key={idx} className="bg-white/[0.02] p-8 border border-white/5 relative group transition-all hover:bg-white/[0.04]">
                                    <div className="absolute top-0 left-0 w-[2px] h-full bg-[#00f2ff]/20 group-hover:bg-[#00f2ff] transition-all"></div>
                                    <div className="text-[9px] font-mono text-[#00f2ff]/40 mb-4 tracking-[0.3em]">NODE_0{idx + 1}</div>
                                    <div className="analysis-content text-gray-300 text-lg leading-loose"
                                        dangerouslySetInnerHTML={{ __html: html }} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* --- 🌊 MAIN_CONTENT_STREAM --- */}
                <main className="cyber-article-body mb-40">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </main>

                {/* --- 🛰️ RELATED_NODES --- */}
                {relatedPosts.length > 0 && (
                    <section className="mt-40 pt-20 border-t border-white/5">
                        <div className="flex items-center gap-6 mb-16">
                            <h3 className="text-[#00f2ff] font-mono text-xs tracking-[0.5em] uppercase italic font-black">Related_Archive_Nodes</h3>
                            <div className="h-[1px] flex-grow bg-gradient-to-r from-[#00f2ff]/20 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((rPost) => (
                                <UnifiedProductCard 
                                    key={rPost.id} 
                                    data={rPost} 
                                    siteConfig={siteData} 
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* --- 📟 FOOTER_FINALIZATION --- */}
                <footer className="mt-40">
                    <div className="p-16 md:p-24 bg-gradient-to-br from-[#0a121d] to-[#05070a] border border-white/5 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f2ff]/30 to-transparent"></div>
                        
                        <h4 className="text-[#00f2ff]/20 font-mono text-[10px] tracking-[1.5em] mb-12 uppercase">Access_Completion</h4>
                        <p className="text-white text-4xl md:text-6xl font-black mb-20 tracking-tighter italic uppercase drop-shadow-lg">
                            情報の「核心」へ。
                        </p>
                        
                        <div className="flex flex-col md:flex-row justify-center gap-8 relative z-10">
                            {(post.affiliate_url || post.source_url) && (
                                <a href={post.affiliate_url || post.source_url} target="_blank" rel="noopener noreferrer"
                                    className="px-16 py-7 bg-[#00f2ff] text-black font-black text-[11px] tracking-[0.3em] uppercase hover:bg-white transition-all transform hover:-translate-y-1 shadow-[0_0_40px_rgba(0,242,255,0.3)]">
                                    SOURCE_ARCHIVE _
                                </a>
                            )}
                            <Link href="/post" className="px-16 py-7 border border-[#00f2ff]/30 text-[#00f2ff] font-black text-[11px] tracking-[0.3em] uppercase hover:text-white hover:bg-[#00f2ff]/10 transition-all transform hover:-translate-y-1">
                                CLOSE_SESSION
                            </Link>
                        </div>
                    </div>
                    <div className="mt-24 flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[9px] text-gray-700 uppercase tracking-[0.4em] italic opacity-50 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-4">
                            <span className="text-[#00f2ff]">UUID:</span> {slug.slice(0, 18)} 
                            <span className="text-gray-800">//</span> 
                            <span className="text-[#00f2ff]">STATUS:</span> DECRYPTED
                        </div>
                        <div>© BICSTATION_NETWORK_OPERATIONS_2026</div>
                    </div>
                </footer>
            </article>
        </div>
    );
}