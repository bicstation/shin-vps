/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COLORS } from '@/constants';
import { fetchProductDetail } from '@/lib/api';
import styles from './ProductDetail.module.css';

/**
 * ISR (Incremental Static Regeneration)
 * 3600秒（1時間）ごとにバックグラウンドで再ビルドを行い、
 * Python側で更新された ai_content や価格を自動で反映させます。
 */
export const revalidate = 3600;

export async function generateMetadata(props: { params: Promise<{ unique_id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const product = await fetchProductDetail(params.unique_id);
    if (!product) return { title: "製品が見つかりません" };

    return {
        title: product.name,
        description: `${product.maker}のPC「${product.name}」のスペック詳細と最新価格情報。`,
        openGraph: {
            title: `${product.name} | BICSTATION`,
            images: [{ url: product.image_url }],
        },
    };
}

export default async function ProductDetailPage(props: { params: Promise<{ unique_id: string }> }) {
    const params = await props.params;
    const product = await fetchProductDetail(params.unique_id);

    if (!product) notFound();

    const siteColor = COLORS?.SITE_COLOR || '#007bff';
    const bgColor = COLORS?.BACKGROUND || '#f4f7f9';

    // --- アフィリエイトリンク生成ロジック ---
    let finalUrl = product.url;
    let beacon: React.ReactNode = null;
    let linkSource = "Original URL"; // デバッグ用

    const makerLower = product.maker.toLowerCase();
    const isLenovo = makerLower.includes('lenovo');
    const isDell = makerLower.includes('dell');
    const isHP = makerLower.includes('hp');

    if (isDell) {
        // --- Dell (LinkShare) 修正版 ---
        // 1. まずDBにアフィリエイトURL（affiliate_url）があるか確認
        if (product.affiliate_url) {
            finalUrl = product.affiliate_url;
            linkSource = "DB Affiliate URL";
        } else {
            // 2. なければ従来通りDeepLinkを生成（フォールバック）
            const yourId = "nNBA6GzaGrQ";
            const offerId = "1568114"; 
            const linkId = product.unique_id;
            const decodedUrl = product.url.includes('%') ? decodeURIComponent(product.url) : product.url;
            const encodedProductUrl = encodeURIComponent(decodedUrl);
            
            finalUrl = `https://click.linksynergy.com/link?id=${yourId}&offerid=${offerId}.${linkId}&type=15&murl=${encodedProductUrl}`;
            linkSource = "Generated DeepLink";
        }
        beacon = null; 
    } else if (isHP || isLenovo) {
        // --- HP / Lenovo (ValueCommerce) MyLink構築 ---
        const sid = "3697471";
        const pid = "892455531";
        const decodedUrl = product.url.includes('%') ? decodeURIComponent(product.url) : product.url;
        const encodedUrl = encodeURIComponent(decodedUrl);
        
        finalUrl = `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid={sid}&pid={pid}&vc_url={encodedUrl}`;
        linkSource = "ValueCommerce MyLink";
        beacon = (
            <img 
                src={`//ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=${sid}&pid=${pid}`} 
                height={1} width={1} alt="" 
                style={{ display: 'none', border: 'none' }} 
            />
        );
    }

    const dynamicStyle = {
        '--site-color': siteColor,
        backgroundColor: bgColor
    } as React.CSSProperties;

    const buttonLabel = `${product.maker}公式サイトで詳細を見る`;

    // デバッグ用表示コンポーネント
    const DebugLinkBox = () => (
        <div style={{
            marginTop: '15px',
            padding: '10px',
            background: '#f8f9fa',
            border: '1px dashed #ced4da',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#6c757d',
            wordBreak: 'break-all',
            fontFamily: 'monospace'
        }}>
            <strong>[DEBUG] Source: {linkSource}</strong><br />
            {finalUrl}
        </div>
    );

    return (
        <div className={styles.wrapper} style={dynamicStyle}>
            
            <div className={styles.breadcrumb}>
                <nav>
                    <Link href="/" className={styles.breadcrumbLink} style={{ color: siteColor }}>カタログトップ</Link>
                    <span style={{ margin: '0 10px' }}>&gt;</span>
                    <span style={{ color: '#999' }}>{product.name}</span>
                </nav>
            </div>

            <main className={styles.mainContainer}>
                
                <div className={styles.topSection}>
                    <div className={styles.imageWrapper}>
                        <img 
                            src={product.image_url || 'https://via.placeholder.com/500x400?text=No+Image'} 
                            alt={product.name}
                            className={styles.productImage}
                        />
                    </div>

                    <div>
                        <div className={styles.badgeContainer}>
                            <span className={styles.makerBadge}>{product.maker.toUpperCase()}</span>
                            <span className={styles.genreBadge}>{product.unified_genre}</span>
                        </div>

                        <h1 className={styles.productTitle}>{product.name}</h1>

                        <div className={styles.priceBox}>
                            <div className={styles.priceLabel}>参考価格 (税込)</div>
                            <div className={styles.priceValue}>
                                {product.price > 0 ? `¥${product.price.toLocaleString()}` : '価格情報なし'}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#666', marginTop: '10px' }}>
                                在庫状況: <span style={{ color: '#28a745', fontWeight: 'bold' }}>{product.stock_status}</span>
                            </div>
                        </div>

                        <a 
                            href={finalUrl} target="_blank" rel="nofollow noopener noreferrer"
                            className={styles.ctaButton}
                            style={{ 
                                boxShadow: `0 4px 15px ${siteColor}4d`,
                                backgroundColor: (isLenovo || isHP) ? '#ef4444' : siteColor 
                            }}
                        >
                            {buttonLabel}
                            {beacon}
                        </a>
                        
                        {/* デバッグ表示 */}
                        <DebugLinkBox />
                    </div>
                </div>

                <div className={styles.specSection}>
                    <h2 className={styles.specTitle}>スペック詳細・構成内容</h2>
                    <div className={styles.specTable}>
                        {product.description ? (
                            product.description.split('/').map((spec: string, i: number) => (
                                <div key={i} className={styles.specRow}>
                                    <span className={styles.specCheck}>✓</span>
                                    <span>{spec.trim()}</span>
                                </div>
                            ))
                        ) : (
                            <p className={styles.noSpec}>詳細スペック情報の配信はありません。</p>
                        )}
                    </div>
                </div>

                {product.ai_content && (
                    <div className={styles.aiContentSection}>
                        <h2 className={styles.specTitle}>エキスパートによる製品解説</h2>
                        <div 
                            className={styles.aiContentBody}
                            dangerouslySetInnerHTML={{ __html: product.ai_content }} 
                        />
                    </div>
                )}

                <div className={styles.bottomCtaSection}>
                    <div className={styles.bottomCtaCard}>
                        <p className={styles.bottomCtaText}>
                            最新の在庫状況やカスタマイズオプションは公式サイトをご確認ください。
                        </p>
                        <a 
                            href={finalUrl} target="_blank" rel="nofollow noopener noreferrer"
                            className={styles.ctaButton}
                            style={{ 
                                margin: '0 auto',
                                maxWidth: '450px',
                                boxShadow: `0 4px 15px ${siteColor}4d`,
                                backgroundColor: (isLenovo || isHP) ? '#ef4444' : siteColor 
                            }}
                        >
                            {buttonLabel}
                            {beacon}
                        </a>
                        <div style={{ maxWidth: '450px', margin: '0 auto' }}>
                            <DebugLinkBox />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}