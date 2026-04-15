/**
 * =====================================================================
 * 🛰️ BICSTATION Intelligence Detail Master (v13.5.1-WP_Fixed)
 * 🛡️ Maya's Logic: Multi-Source Fusion (WordPress & Django)
 * ---------------------------------------------------------------------
 */

// @ts-nocheck
import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';

// API・共通コンポーネント
// ✅ 全てのWP関連ロジックを wordpress.ts からインポートするように統一
import { fetchWPTechInsights, getWpFeaturedImage } from '@/shared/lib/api/django/wordpress';
import { fetchPostData, fetchPostList } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

export const dynamic = 'force-dynamic';

/**
 * 🛠️ WordPress 個別記事取得 (Slug指定)
 */
async function fetchWPPostBySlug(slug: string) {
    const WP_URL = "https://legacy.nabejuku.com/wp-json/wp/v2/posts";
    try {
        const res = await fetch(`${WP_URL}?slug=${slug}&_embed`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return null;
        const posts = await res.json();
        return posts.length > 0 ? posts[0] : null;
    } catch (e) {
        return null;
    }
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const headerList = await headers();
    
    // --- 🎯 ENVIRONMENT_DETECTION ---
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "";
    const siteData = getSiteMetadata(host);
    const currentProject = (siteData?.site_name || 'bicstation').replace(/\s+/g, '').toLowerCase();
    const siteColor = siteData?.theme_color || '#00f2ff';

    // --- 🎯 DATA_FETCHING (Hybrid Strategy) ---
    let postData = null;
    let isWordPress = false;

    // 1. WordPressからの取得を試行
    const wpPost = await fetchWPPostBySlug(slug);

    if (wpPost) {
        isWordPress = true;
        postData = {
            id: `wp-${wpPost.id}`,
            title: wpPost.title.rendered,
            content: wpPost.content.rendered,
            // ✅ wordpress.ts からインポートした関数を使用
            image: getWpFeaturedImage(wpPost, 'large') || '/images/common/no-image.jpg',
            created_at: wpPost.date,
            site: 'TECH_INSIGHT',
            summary: wpPost.excerpt.rendered,
            source_url: wpPost.link
        };
    } else {
        // 2. WPになければ Django API から取得
        const djangoPost = await fetchPostData(slug, currentProject);
        if (djangoPost && djangoPost.id) {
            postData = djangoPost;
        }
    }

    if (!postData) return notFound();

    // 関連記事の取得 (ハイブリッド取得)
    let relatedPosts = [];
    if (isWordPress) {
        const wpList = await fetchWPTechInsights(4);
        relatedPosts = wpList.filter(p => !p.link.includes(slug)).slice(0, 3);
    } else {
        const djangoRel = await fetchPostList(4, 0, currentProject);
        relatedPosts = djangoRel?.results?.filter(p => p.slug !== slug).slice(0, 3) || [];
    }

    const displayDate = postData.created_at ? new Date(postData.created_at).toLocaleDateString('ja-JP') : '2026-04-16';

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
        .cyber-content-stream strong { color: ${siteColor}; font-weight: 900; text-shadow: 0 0 12px rgba(0,242,255,0.5); }
        .cyber-content-stream img { width: 100%; height: auto; margin: 4.5rem 0; border: 1px solid rgba(255,255,255,0.15); }
        .cyber-content-stream p { margin-bottom: 2.8rem; }
        .cyber-content-stream a { color: ${siteColor}; text-decoration: underline; }
    `;

    return (
        <div className="min-h-screen bg-[#06080f] text-gray-300 font-sans selection:bg-[#00f2ff]/30 overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: cyberRenderStyle }} />

            <nav className="fixed top-0 w-full z-50 bg-[#06080f]/90 backdrop-blur-2xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                    <Link href="/post" className="hover:text-[#00f2ff] transition-all flex items-center gap-3 group">
                        <span className="group-hover:-translate-x-1 transition-transform">«</span> RETURN_TO_BASE
                    </Link>
                    <div className="text-[#00f2ff]/70 flex items-center gap-3 font-bold">
                        <span className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-ping"></span>
                        {isWordPress ? 'EXT_WP_LINK_ACTIVE' : 'DJANGO_CORE_LINK_ACTIVE'}
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-10">
                <header className="mb-24">
                    <div className="flex items-center gap-5 mb-10">
                        <span className="border border-[#00f2ff]/50 text-[#00f2ff] text-[10px] px-4 py-1.5 font-black tracking-[0.2em] uppercase">
                            {postData.site || "SYSTEM_ARCHIVE"}
                        </span>
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-white/10 to-transparent"></div>
                        <time className="text-[11px] font-mono text-gray-600 tracking-widest">[{displayDate}]</time>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter italic uppercase mb-14">
                        {postData.title}
                    </h1>
                    {postData.image && (
                        <div className="relative aspect-video w-full overflow-hidden border border-white/10 shadow-2xl rounded-sm">
                            <img src={postData.image} alt={postData.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-transparent to-transparent opacity-90" />
                        </div>
                    )}
                </header>

                {postData.summary && (
                    <section className="mb-28">
                        <div className="p-12 bg-slate-900/30 border-l-4 border-[#00f2ff] backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-5 font-mono text-[9px] text-[#00f2ff]/10 uppercase tracking-[0.5em]">Intelligence_Brief</div>
                            <div className="summary-html-node text-gray-100 text-2xl md:text-3xl leading-snug italic font-extralight opacity-95"
                                 dangerouslySetInnerHTML={{ __html: postData.summary }} />
                        </div>
                    </section>
                )}

                <main className="cyber-content-stream">
                    <div dangerouslySetInnerHTML={{ __html: postData.content }} />
                </main>

                {relatedPosts.length > 0 && (
                    <section className="mt-40 pt-20 border-t border-white/10">
                        <h3 className="text-sm font-mono font-black text-white tracking-[1em] uppercase italic mb-16">Related_Nodes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((relPost) => (
                                <UnifiedProductCard key={relPost.id} data={relPost} siteConfig={siteData} />
                            ))}
                        </div>
                    </section>
                )}

                <footer className="mt-32 pt-20 border-t border-white/5">
                    <div className="p-16 bg-gradient-to-br from-[#0a101a] to-[#06080f] border border-white/5 text-center relative overflow-hidden group">
                        <h4 className="text-[#00f2ff]/20 font-mono text-[10px] tracking-[1.5em] mb-12 uppercase">Access_Finalization</h4>
                        <div className="flex flex-col md:flex-row justify-center gap-10">
                            {postData.source_url && (
                                <a href={postData.source_url} target="_blank" rel="noopener noreferrer"
                                   className="px-20 py-7 bg-[#00f2ff] text-black font-black text-xs tracking-[0.3em] uppercase hover:bg-white transition-all transform hover:-translate-y-1">
                                   VIEW_ORIGINAL_SOURCE _
                                </a>
                            )}
                            <Link href="/post" className="px-20 py-7 border border-white/10 text-gray-400 font-black text-xs tracking-[0.3em] uppercase hover:text-white hover:bg-white/5 transition-all">
                                CLOSE_SESSION
                            </Link>
                        </div>
                    </div>
                    <div className="mt-24 flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[9px] text-gray-700 uppercase tracking-[0.4em] italic">
                        <div>UUID: {slug.slice(0, 16)}... // SOURCE: {isWordPress ? 'WP_LEGACY' : 'DJANGO_CORE'}</div>
                        <div>© {siteData?.site_name?.toUpperCase() || "BICSTATION"}_SECURE_NETWORK_2026</div>
                    </div>
                </footer>
            </article>
        </div>
    );
}