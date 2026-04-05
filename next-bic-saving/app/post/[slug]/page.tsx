// @ts-nocheck
import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { fetchPostData } from '@/shared/lib/api/django-bridge';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import Link from 'next/link';
import styles from './detail.module.css'; // ✅ CSS Moduleをインポート

export const dynamic = 'force-dynamic';

export default async function SavingsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    let host = "bic-saving.com";
    let currentProject = 'bic-saving';
    try {
        const headerList = await headers();
        host = headerList.get('x-django-host') || headerList.get('host') || "bic-saving.com";
        currentProject = getSiteMetadata(host)?.site_name || 'bic-saving';
    } catch (e) {}

    const post = await fetchPostData('saving', slug, host);
    if (!post) notFound();

    const displayImage = post.eye_catch || post.image || post.main_image_url || '/no-image.jpg';
    const displayDate = post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP') : '2026.03.18';

    // 🖋️ 本文パースロジック (CSSクラスを注入するように変更)
    const renderContentHtml = (text: string) => {
        if (!text) return "";
        return text
            .replace(/\[SUMMARY_BOX\]/g, '<div style="margin: 2rem 0; padding: 2rem; background: #fffcf0; border-left: 5px solid #facc15; border-radius: 8px;">')
            .replace(/\[\/SUMMARY_BOX\]/g, '</div>')
            .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.8rem; font-weight: 800; margin-top: 4rem; border-bottom: 3px solid #fde047; padding-bottom: 0.5rem;">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.4rem; font-weight: 700; margin-top: 2.5rem; border-left: 4px solid #facc15; padding-left: 1rem;">$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #9a3412; background: linear-gradient(transparent 70%, #fef9c3 70%);">$1</strong>')
            .replace(/\n\n/g, '<br/><br/>');
    };

    return (
        <div className={styles.detailWrapper}>
            <nav className={styles.stickyNav}>
                <div className={styles.navInner}>
                    <Link href="/post" className={styles.backLink}>← ARCHIVE_FEED</Link>
                    <div className={styles.statusBadge}>SECURE_DATA_LINK</div>
                </div>
            </nav>

            <article className={styles.detailContainer}>
                <header className={styles.articleHeader}>
                    <div className={styles.metaRow}>
                        <span className={styles.categoryTag}>{post.category_name || 'STRATEGY'}</span>
                        <time className={styles.publishDate}>[{displayDate}]</time>
                    </div>
                    <h1 className={styles.mainTitle}>{post.title}</h1>
                </header>

                <div className={styles.heroImageWrapper}>
                    <img src={displayImage} alt={post.title} className={styles.heroImage} />
                </div>

                <div 
                    className={styles.articleBody}
                    dangerouslySetInnerHTML={{ __html: renderContentHtml(post.body_text || post.content) }} 
                />

                <footer className={styles.articleFooter}>
                    <div className={styles.footerInfo}>
                        ID: {slug.substring(0, 8).toUpperCase()} / NODE: {currentProject.toUpperCase()}
                    </div>
                    <div className={styles.copyright}>© BIC_SAVING_NETWORK</div>
                </footer>
            </article>
        </div>
    );
}