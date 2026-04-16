/**
 * =====================================================================
 * 🛰️ BICSTATION Intelligence Detail Master (v14.5.0-Final)
 * 🛡️ Role: High-Fidelity Data Rendering (WP & Django Fusion)
 * ---------------------------------------------------------------------
 * 🛠️ 最終修正ログ:
 * - リンクが ID (wp-200) になる問題を解決（id に slug を強制注入）
 * - 内部ルーティングを /news に完全統一
 * - 関連記事のフィルタリングを slug ベースで厳格化
 * =====================================================================
 */

// @ts-nocheck
import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';

// API・共通コンポーネント
import { fetchWPPostBySlug, fetchWPTechInsights } from '@/shared/lib/api/django/wordpress';
import { fetchPostData, fetchPostList } from '@/shared/lib/api/django/posts';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// 🎨 分離したCSSモジュール
import styles from './news-detail.module.css';

export const dynamic = 'force-dynamic';

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const headerList = await headers();
    
    // --- 🎯 環境情報の特定 ---
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "";
    const siteData = getSiteMetadata(host);
    const currentProject = (siteData?.site_name || 'bicstation').replace(/\s+/g, '').toLowerCase();
    const siteColor = siteData?.theme_color || '#00f2ff';

    // --- 🎯 ハイブリッド取得戦略 ---
    let postData = null;
    let isWordPress = false;

    // 1. WordPress (WP-JSON) 優先スキャン
    const wpPostRaw = await fetchWPPostBySlug(slug);

    if (wpPostRaw) {
        isWordPress = true;
        postData = {
            // ID事故を防ぐため、一貫してスラッグをベースにする
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
        // 2. WPになければ Django API をスキャン
        const djangoPost = await fetchPostData(slug, currentProject);
        if (djangoPost && djangoPost.id) {
            postData = djangoPost;
        }
    }

    if (!postData) return notFound();

    // --- 🎯 関連記事の取得 (リンク事故防止ロジック適用) ---
    let relatedPosts = [];
    if (isWordPress) {
        // fetchWPTechInsights 側で id: post.slug が注入されている前提
        const wpList = await fetchWPTechInsights(6);
        // 現在表示中の記事をスラッグ比較で除外
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
            
            {/* --- 🛰️ ナビゲーション --- */}
            <nav className={styles.navBar}>
                <div className={styles.navContent}>
                    <Link href="/news" className="hover:text-[#00f2ff] transition-all flex items-center gap-3 group">
                        <span className="group-hover:-translate-x-1 transition-transform">«</span> RETURN_TO_INTELLIGENCE
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
                            <img src={postData.image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-transparent to-transparent opacity-90" />
                        </div>
                    )}
                </header>

                {/* --- 📝 要約セクション --- */}
                {postData.summary && (
                    <section className="mb-28">
                        <div className="p-12 bg-slate-900/30 border-l-4 border-[#00f2ff] backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-5 font-mono text-[9px] text-[#00f2ff]/10 uppercase tracking-[0.5em]">Intelligence_Brief</div>
                            <div className="text-gray-100 text-2xl md:text-3xl leading-snug italic font-extralight opacity-95"
                                 dangerouslySetInnerHTML={{ __html: postData.summary }} />
                        </div>
                    </section>
                )}

                {/* --- 📖 メインコンテンツ --- */}
                <main className={styles.contentStream}>
                    <div dangerouslySetInnerHTML={{ __html: postData.content }} />
                </main>

                {/* --- 🔗 関連記事 (Unified Grid) --- */}
                {relatedPosts.length > 0 && (
                    <section className="mt-40 pt-20 border-t border-white/10">
                        <h3 className="text-sm font-mono font-black text-white tracking-[1em] uppercase italic mb-16">Related_Nodes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((relPost) => (
                                <UnifiedProductCard 
                                    key={relPost.slug || relPost.id} 
                                    data={{
                                        ...relPost,
                                        // 🛡️ カードコンポーネントが内部で href を参照する場合の保険
                                        href: `/news/${relPost.slug}` 
                                    }}
                                    siteConfig={siteData} 
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* --- 👣 フッター・アクション --- */}
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
                            <Link href="/news" className="px-20 py-7 border border-white/10 text-gray-400 font-black text-xs tracking-[0.3em] uppercase hover:text-white hover:bg-white/5 transition-all">
                                CLOSE_SESSION
                            </Link>
                        </div>
                    </div>
                    
                    <div className="mt-24 flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[9px] text-gray-700 uppercase tracking-[0.4em] italic">
                        <div>UUID: {slug.slice(0, 16)}... // TYPE: {isWordPress ? 'WP_DATA' : 'DJANGO_CORE'}</div>
                        <div>© {siteData?.site_name?.toUpperCase() || "BICSTATION"}_SECURE_NETWORK_2026</div>
                    </div>
                </footer>
            </article>
        </div>
    );
}