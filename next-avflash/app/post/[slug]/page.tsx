/**
 * =====================================================================
 * 🛰️ AVFLASH/TIPER Intelligence Detail Master (v13.0.0)
 * 🛡️ Strategic Patch: Domain Identity & Adult Sector Bypass
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
    // 1. Next.js 15 の Promise 解消
    const { slug } = await params;
    const headerList = await headers();
    
    // 2. ホスト判定の強化（x-forwarded-host を優先）
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "";
    const siteData = getSiteMetadata(host);
    
    // 🚨 重要: 判定失敗時のデフォルトを 'avflash' に変更、かつスペース除去
    const rawProject = siteData?.site_name || 'avflash';
    const currentProject = rawProject.replace(/\s+/g, '').toLowerCase();

    // 📡 デバッグログ
    console.log(`📡 [PAGE-IDENTITY] Host: ${host} -> Resolved: ${currentProject}`);

    // 3. 記事取得（修正済み posts.ts を使用）
    const post = await fetchPostData(slug, currentProject);
    
    // 記事が見つからない、または ID が欠落している場合は即 404
    if (!post || !post.id) {
        console.error(`❌ [PAGE-ERROR] Post not found. Slug: ${slug} | Project: ${currentProject}`);
        return notFound();
    }

    const { title, image, content, created_at, site, summary, extra_metadata } = post;
    const displayDate = created_at ? new Date(created_at).toLocaleDateString('ja-JP') : '2026-04-06';
    const displaySummary = extra_metadata?.summary || summary;
    const siteColor = '#00f2ff';

    /**
     * ⚡ CYBER_INJECT_STYLE (dangerouslySetInnerHTML 用の装飾)
     */
    const cyberRenderStyle = `
        .cyber-article-body { font-size: 1.15rem; line-height: 2.2; color: #cbd5e1; }
        .cyber-article-body h2 {
            font-size: 2rem; font-weight: 900; color: #fff; margin: 6rem 0 2.5rem; padding: 1rem 2rem;
            border-left: 5px solid ${siteColor};
            background: linear-gradient(90deg, rgba(0,242,255,0.1), transparent);
            font-style: italic; text-transform: uppercase;
            box-shadow: -15px 0 30px -15px ${siteColor};
        }
        .cyber-article-body p { margin-bottom: 2.5rem; opacity: 0.9; }
        .cyber-article-body strong { color: ${siteColor}; font-weight: 900; text-shadow: 0 0 10px rgba(0,242,255,0.5); }
        .cyber-article-body img { max-width: 100%; height: auto; margin: 4rem 0; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 30px 60px rgba(0,0,0,0.7); }
    `;

    return (
        <div className="min-h-screen bg-[#05070a] text-gray-300 font-sans selection:bg-[#00f2ff]/30 overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: cyberRenderStyle }} />

            {/* --- 🛰️ BACKGROUND_DECORATION --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(0,242,255,0.1),transparent)]"></div>
            </div>

            {/* --- 🛸 NAVIGATION --- */}
            <nav className="fixed top-0 w-full z-50 bg-[#05070a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center text-[10px] font-mono tracking-widest text-gray-500">
                    <Link href="/post" className="hover:text-[#00f2ff] transition-all flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">«</span> BACK_TO_ARCHIVE
                    </Link>
                    <div className="text-[#00f2ff]/60 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-ping"></span>
                        SECURE_NODE: {currentProject.toUpperCase()}
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-32 pb-40 relative z-10">
                {/* --- 📟 HEADER --- */}
                <header className="mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="bg-[#00f2ff] text-[#05070a] text-[10px] px-3 py-1 font-black tracking-widest uppercase">
                            {site || currentProject}
                        </span>
                        <time className="text-[10px] font-mono text-gray-500 tracking-widest">[{displayDate}]</time>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tighter italic uppercase mb-12">
                        {title}
                    </h1>

                    <div className="relative aspect-video w-full overflow-hidden border border-[#00f2ff]/20 bg-black">
                        <img src={image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] to-transparent opacity-60" />
                    </div>
                </header>

                {/* --- 📝 SUMMARY --- */}
                {displaySummary && (
                    <section className="mb-24 p-10 bg-[#00f2ff]/5 border-l-4 border-[#00f2ff] relative">
                        <h2 className="text-[10px] font-mono font-bold text-[#00f2ff] tracking-[0.4em] uppercase mb-6 flex items-center gap-2">
                            STRATEGIC_SUMMARY
                        </h2>
                        <div className="text-gray-200 text-xl md:text-2xl leading-relaxed italic opacity-90">
                            {displaySummary}
                        </div>
                    </section>
                )}

                {/* --- ⚡ CONTENT --- */}
                <main className="cyber-article-body">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </main>

                {/* --- 🏁 ACTIONS --- */}
                <footer className="mt-40 pt-20 border-t border-white/5 text-center">
                    <p className="text-white text-3xl md:text-5xl font-black mb-16 tracking-tighter italic uppercase">核心を、その手に。</p>
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        {(post.affiliate_url || post.source_url) && (
                            <a href={post.affiliate_url || post.source_url} target="_blank" rel="noopener noreferrer"
                                className="px-14 py-6 bg-[#00f2ff] text-[#05070a] font-black text-xs tracking-widest uppercase hover:bg-white transition-all shadow-[0_0_30px_rgba(0,242,255,0.4)]">
                                ACCESS_SOURCE _
                            </a>
                        )}
                        <Link href="/post" className="px-14 py-6 border border-white/10 text-gray-500 font-black text-xs tracking-widest uppercase hover:text-white hover:border-[#00f2ff] transition-all">
                            RETURN
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}