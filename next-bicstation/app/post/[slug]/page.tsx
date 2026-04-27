// @ts-nocheck
import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// ❌ headers削除

import { fetchPostData, fetchPostList } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

export const dynamic = 'force-dynamic';

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;

    // ✅ 固定
    const host = "bicstation.com";
    const siteData = getSiteMetadata(host);

    const rawProject = siteData?.site_name || 'bicstation';
    const currentProject = rawProject.replace(/\s+/g, '').toLowerCase();
    const siteColor = '#00f2ff';

    const post = await fetchPostData(slug, currentProject);
    if (!post || !post.id) return notFound();

    const relatedResponse = await fetchPostList(4, 0, currentProject);
    const relatedPosts = relatedResponse?.results
        ?.filter(p => p.slug !== slug)
        .slice(0, 3) || [];

    const { title, image, content, created_at, site, summary, extra_metadata } = post;
    const displayDate = created_at ? new Date(created_at).toLocaleDateString('ja-JP') : '2026-04-07';

    const primarySummary = summary;
    const secondarySummary = extra_metadata?.summary;
    const hasDifferentSummaries = secondarySummary && primarySummary !== secondarySummary;

    const cyberRenderStyle = `
        .cyber-content-stream { font-size: 1.15rem; line-height: 2.3; color: #d1d5db; }
        .cyber-content-stream h2 {
            font-size: 2.2rem; font-weight: 900; color: #ffffff;
            margin: 5rem 0 2rem; padding: 0.8rem 1.5rem;
            border-left: 5px solid ${siteColor};
            background: linear-gradient(90deg, rgba(0,242,255,0.1), transparent);
        }
    `;

    return (
        <div className="min-h-screen bg-[#06080f] text-gray-300">

            <style dangerouslySetInnerHTML={{ __html: cyberRenderStyle }} />

            <article className="max-w-4xl mx-auto px-6 pt-32 pb-20">

                <header className="mb-24">
                    <h1 className="text-5xl text-white mb-10">{title}</h1>
                    {image && <img src={image} alt={title} />}
                </header>

                {(primarySummary || secondarySummary) && (
                    <section className="mb-20">
                        {primarySummary && (
                            <div dangerouslySetInnerHTML={{ __html: primarySummary }} />
                        )}
                        {hasDifferentSummaries && (
                            <div dangerouslySetInnerHTML={{ __html: secondarySummary }} />
                        )}
                    </section>
                )}

                <main className="cyber-content-stream">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </main>

                {relatedPosts.length > 0 && (
                    <section className="mt-20">
                        <div className="grid md:grid-cols-3 gap-6">
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

                <footer className="mt-20 text-center">
                    <Link href="/post">戻る</Link>
                </footer>

            </article>
        </div>
    );
}