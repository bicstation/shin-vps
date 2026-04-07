/**
 * =====================================================================
 * 🛰️ Tiper.live Intelligence Detail Omni (v15.0.4)
 * 🛡️ Ultra-Secure Logic & High-Resolution Monitization
 * ---------------------------------------------------------------------
 * 🚀 更新ログ:
 * 1. 関連記事のフィルタリングを強化し slug undefined エラーを物理的に排除。
 * 2. 4連装バナー (bicbic-014) をアダルトフラグ連動で統合。
 * 3. 二重サマリーロジックとサイバーレイアウトの完全復元。
 * 4. シリアライズ・エラーを防ぐためのデータクレンジング処理を実装。
 * =====================================================================
 */
// @ts-nocheck
import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';

// API・共通コンポーネント
import { fetchPostData, fetchPostList } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

export const dynamic = 'force-dynamic';

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
    // --- 🛡️ PARAMS_SHIELD ---
    const resolvedParams = await params;
    const currentSlug = resolvedParams?.slug;
    if (!currentSlug) return notFound();

    const headerList = await headers();
    
    // --- 🎯 ENVIRONMENT_DETECTION ---
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "";
    const siteConfig = getSiteMetadata(host);
    const rawProject = siteConfig?.site_name || 'avflash';
    const currentProject = rawProject.replace(/\s+/g, '').toLowerCase();
    const siteColor = siteConfig?.theme_color || '#00f2ff';
    const targetAffId = "bicbic-014"; 

    // --- 🎯 DATA_FETCHING ---
    const post = await fetchPostData(currentSlug, currentProject);
    if (!post || !post.id || !post.slug) return notFound();

    // 🔄 RELEVANT_NODES: 徹底したクレンジング（slugが存在しない「幽霊データ」を物理排除）
    const relatedResponse = await fetchPostList(10, 0, currentProject);
    const rawResults = relatedResponse?.results || [];
    
    const relatedPosts = rawResults
        .filter(p => (
            p && 
            typeof p === 'object' && 
            p.slug && 
            p.slug !== currentSlug &&
            p.id
        ))
        .slice(0, 3);

    const { title, image, content, created_at, site, summary, extra_metadata, is_adult } = post;
    const displayDate = created_at ? new Date(created_at).toLocaleDateString('ja-JP') : '2026-04-07';

    // 🔍 SUMMARY_LOGIC
    const primarySummary = summary;
    const secondarySummary = extra_metadata?.summary;
    const hasDifferentSummaries = secondarySummary && primarySummary !== secondarySummary;

    /**
     * ⚡ CYBER_CORE_STYLE
     */
    const cyberRenderStyle = `
        .cyber-content-stream { font-size: 1.15rem; line-height: 2.3; color: #d1d5db; }
        .cyber-content-stream h2 {
            font-size: 2.2rem; font-weight: 900; color: #ffffff;
            margin: 5rem 0 2rem; padding: 0.8rem 1.5rem;
            border-left: 5px solid ${siteColor};
            background: linear-gradient(90deg, ${siteColor}1A, transparent);
            text-transform: uppercase; font-style: italic;
        }
        .cyber-content-stream h3 {
            font-size: 1.6rem; font-weight: 800; color: #f3f4f6;
            margin: 3.5rem 0 1.5rem; display: flex; align-items: center; gap: 12px;
        }
        .cyber-content-stream h3::before {
            content: ''; width: 12px; height: 12px; background: ${siteColor}; transform: rotate(45deg);
        }
        .cyber-content-stream strong { color: ${siteColor}; font-weight: 900; text-shadow: 0 0 12px ${siteColor}80; }
        .cyber-content-stream img { width: 100%; height: auto; margin: 4.5rem 0; border: 1px solid rgba(255,255,255,0.1); }
        .cyber-content-stream p { margin-bottom: 2.8rem; }
        
        .summary-html-node p { margin-bottom: 1rem; }
        .quad-slot { 
            width: 300px; height: 250px; 
            background: rgba(255,255,255,0.02); 
            border: 1px solid rgba(255,255,255,0.05);
            display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
    `;

    return (
        <div className="min-h-screen bg-[#06080f] text-gray-300 font-sans selection:bg-[#00f2ff]/30 overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: cyberRenderStyle }} />

            {/* --- BG_FX --- */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_-10%,${siteColor}14,transparent)]"></div>

            {/* --- TOP_NAV --- */}
            <nav className="fixed top-0 w-full z-50 bg-[#06080f]/90 backdrop-blur-2xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                    <Link href="/post" className="hover:text-[#00f2ff] transition-all flex items-center gap-3 group">
                        <span className="group-hover:-translate-x-1 transition-transform">«</span> RETURN_TO_BASE
                    </Link>
                    <div className="text-[#00f2ff]/70 flex items-center gap-3 font-bold">
                        <span className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-ping"></span>
                        SESSION_ESTABLISHED: {currentProject.toUpperCase()}
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-10">
                <header className="mb-24">
                    <div className="flex items-center gap-5 mb-10">
                        <span className="border border-[#00f2ff]/50 text-[#00f2ff] text-[10px] px-4 py-1.5 font-black tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                            {site || "SYSTEM_ARCHIVE"}
                        </span>
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-white/10 to-transparent"></div>
                        <time className="text-[11px] font-mono text-gray-600 tracking-widest">[{displayDate}]</time>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter italic uppercase mb-14 drop-shadow-2xl">
                        {title}
                    </h1>
                    {image && (
                        <div className="relative aspect-video w-full overflow-hidden border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] rounded-sm group">
                            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-transparent to-transparent opacity-90" />
                        </div>
                    )}
                </header>

                {/* --- DOUBLE_SUMMARY_LAYER --- */}
                {(primarySummary || secondarySummary) && (
                    <section className="mb-28 space-y-10">
                        {primarySummary && (
                            <div className="p-12 bg-slate-900/30 border-l-4 border-[#00f2ff] backdrop-blur-sm relative overflow-hidden group">
                                <h2 className="text-[11px] font-mono font-bold text-[#00f2ff] tracking-[0.6em] uppercase mb-10 flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-[#00f2ff]"></span> ANALYZING_DATA
                                </h2>
                                <div className="summary-html-node text-gray-100 text-2xl md:text-3xl leading-snug italic font-extralight tracking-tight opacity-95"
                                     dangerouslySetInnerHTML={{ __html: primarySummary }} />
                            </div>
                        )}
                        {hasDifferentSummaries && (
                            <div className="p-10 bg-white/[0.01] border-l-2 border-white/10 italic">
                                <h2 className="text-[10px] font-mono text-gray-500 mb-6 uppercase tracking-[0.4em]">Extended_Intelligence</h2>
                                <div className="summary-html-node text-base md:text-xl text-gray-400 leading-relaxed"
                                     dangerouslySetInnerHTML={{ __html: secondarySummary }} />
                            </div>
                        )}
                    </section>
                )}

                {/* --- MAIN_CONTENT_STREAM --- */}
                <main className="cyber-content-stream">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </main>

                {/* 🚀 QUAD_CANNON_MATRIX (Adult Only) */}
                {is_adult === 1 && (
                    <section className="mt-40 mb-32 p-8 bg-white/[0.02] border border-white/5 shadow-2xl relative overflow-hidden text-center">
                        <div className="text-[10px] font-mono text-red-500 mb-10 tracking-[0.4em] uppercase">
                            📡 LINKING_TO_HIGH_RESOLUTION_COMMUNICATION_CHANNELS
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
                            <div className="quad-slot"><iframe frameBorder="0" scrolling="no" width="300" height="250" src={`https://livechat.dmm.co.jp/publicads?&size=S&design=A&affiliate_id=${targetAffId}`} /></div>
                            <div className="quad-slot"><iframe frameBorder="0" scrolling="no" width="300" height="250" src={`https://www.dmm.co.jp/live/api/-/online-banner/?size=300_250&type=avevent&af_id=${targetAffId}`} /></div>
                            <div className="quad-slot">
                                <ins className="widget-banner"></ins>
                                <script dangerouslySetInnerHTML={{ __html: `(function(){var s=document.createElement('script');s.src="https://widget-view.dmm.co.jp/js/banner_placement.js?affiliate_id=${targetAffId}&banner_id=1277_300_250";s.async=true;document.currentScript.parentNode.insertBefore(s,document.currentScript);})();` }} />
                            </div>
                            <div className="quad-slot">
                                <ins className="widget-banner"></ins>
                                <script dangerouslySetInnerHTML={{ __html: `(function(){var s=document.createElement('script');s.src="https://widget-view.dmm.co.jp/js/banner_placement.js?affiliate_id=${targetAffId}&banner_id=122_300_250";s.async=true;document.currentScript.parentNode.insertBefore(s,document.currentScript);})();` }} />
                            </div>
                        </div>
                    </section>
                )}

                {/* --- RELATED_NODES (Unified Grid with Shield) --- */}
                {relatedPosts.length > 0 && (
                    <section className="mt-40 pt-20 border-t border-white/10">
                        <div className="flex items-center gap-4 mb-16">
                            <h3 className="text-sm font-mono font-black text-white tracking-[1em] uppercase italic">Related_Nodes</h3>
                            <div className="h-[1px] flex-grow bg-[#00f2ff]/20"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((relPost) => {
                                // 各ループでも念のためガード（slugがない場合は描画しない）
                                if (!relPost?.slug) return null;
                                return (
                                    <UnifiedProductCard 
                                        key={relPost.id || Math.random().toString()} 
                                        post={relPost} 
                                        siteConfig={siteConfig} 
                                    />
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* --- FOOTER_ACTIONS --- */}
                <footer className="mt-32 pt-20 border-t border-white/5 text-center">
                    <div className="p-16 bg-gradient-to-br from-[#0a101a] to-[#06080f] border border-white/5 shadow-2xl relative overflow-hidden group">
                        <p className="text-white text-4xl md:text-6xl font-black mb-16 tracking-tighter italic uppercase relative z-10">深層部へ、到達せよ。</p>
                        <div className="flex flex-col md:flex-row justify-center gap-10 relative z-10">
                            {(post.affiliate_url || post.source_url) && (
                                <a href={post.affiliate_url || post.source_url} target="_blank" rel="noopener noreferrer"
                                   className="px-20 py-8 bg-[#00f2ff] text-black font-black text-xs tracking-[0.4em] uppercase hover:bg-white transition-all transform hover:-translate-y-1">
                                    OPEN_ARCHIVE_DATA _
                                </a>
                            )}
                            <Link href="/post" className="px-20 py-8 border border-white/10 text-gray-400 font-black text-xs tracking-[0.3em] uppercase hover:text-white hover:bg-white/5 transition-all">
                                DISCONNECT
                            </Link>
                        </div>
                    </div>
                    <div className="mt-24 font-mono text-[9px] text-gray-700 uppercase tracking-[0.4em] italic">
                        © {siteConfig?.site_name?.toUpperCase() || "NETWORK"} 2026
                    </div>
                </footer>
            </article>
        </div>
    );
}