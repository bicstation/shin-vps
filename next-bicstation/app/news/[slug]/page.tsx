// @ts-nocheck
import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// ❌ headers削除

import { fetchWPPostBySlug, fetchWPTechInsights } from '@/shared/lib/api/django/wordpress';
import { fetchPostData, fetchPostList } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

import styles from './news-detail.module.css';

export const dynamic = 'force-dynamic';

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;

    // ✅ 固定
    const host = "bicstation.com";
    const siteData = getSiteMetadata(host);

    const currentProject = (siteData?.site_name || 'bicstation')
        .replace(/\s+/g, '')
        .toLowerCase();

    const siteColor = siteData?.theme_color || '#00f2ff';

    // --- データ取得 ---
    let postData = null;
    let isWordPress = false;

    const wpPostRaw = await fetchWPPostBySlug(slug);

    if (wpPostRaw) {
        isWordPress = true;
        postData = {
            id: wpPostRaw.slug,
            wp_numeric_id: wpPostRaw.id,
            title: wpPostRaw.title?.rendered,
            content: wpPostRaw.content?.rendered,
            image: wpPostRaw._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/common/no-image.jpg',
            created_at: wpPostRaw.date,
            site: 'TECH_INSIGHT',
            summary: wpPostRaw.excerpt?.rendered,
            source_url: wpPostRaw.link,
            slug: wpPostRaw.slug 
        };
    } else {
        const djangoPost = await fetchPostData(slug, currentProject);
        if (djangoPost && djangoPost.id) {
            postData = djangoPost;
        }
    }

    if (!postData) return notFound();

    // --- 関連記事 ---
    let relatedPosts = [];

    if (isWordPress) {
        const wpList = await fetchWPTechInsights(6);
        relatedPosts = wpList.filter(p => p.slug !== slug).slice(0, 3);
    } else {
        const djangoRel = await fetchPostList(6, 0, currentProject);
        relatedPosts = djangoRel?.results?.filter(p => p.slug !== slug).slice(0, 3) || [];
    }

    const displayDate = postData.created_at 
        ? new Date(postData.created_at).toLocaleDateString('ja-JP') 
        : '2026.04.16';

    return (
        <div className={styles.detailContainer} style={{ '--theme-color': siteColor } as React.CSSProperties}>
            
            <nav className={styles.navBar}>
                <div className={styles.navContent}>
                    <Link href="/news" className="hover:text-[#00f2ff] transition-all flex items-center gap-3 group">
                        <span className="group-hover:-translate-x-1 transition-transform">«</span>
                        RETURN_TO_INTELLIGENCE
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
                        <time className="text-[11px] font-mono text-gray-600 tracking-widest">
                            [{displayDate}]
                        </time>
                    </div>
                    
                    <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter italic uppercase mb-14">
                        {postData.title}
                    </h1>

                    {postData.image && (
                        <div className="relative aspect-video w-full overflow-hidden border border-white/10 shadow-2xl rounded-sm">
                            <img src={postData.image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-transparent to-transparent opacity-90" />
                        </div>
                    )}
                </header>

                {postData.summary && (
                    <section className="mb-28">
                        <div className="p-12 bg-slate-900/30 border-l-4 border-[#00f2ff] backdrop-blur-sm">
                            <div dangerouslySetInnerHTML={{ __html: postData.summary }} />
                        </div>
                    </section>
                )}

                <main className={styles.contentStream}>
                    <div dangerouslySetInnerHTML={{ __html: postData.content }} />
                </main>

                {relatedPosts.length > 0 && (
                    <section className="mt-40 pt-20 border-t border-white/10">
                        <h3 className="text-sm font-mono font-black text-white tracking-[1em] uppercase italic mb-16">
                            Related_Nodes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((relPost) => (
                                <UnifiedProductCard 
                                    key={relPost.slug || relPost.id} 
                                    data={{
                                        ...relPost,
                                        href: `/news/${relPost.slug}` 
                                    }}
                                    siteConfig={siteData} 
                                />
                            ))}
                        </div>
                    </section>
                )}

                <footer className="mt-32 pt-20 border-t border-white/5">
                    <div className="text-center">
                        <Link href="/news">戻る</Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}