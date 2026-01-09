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
 * 1時間ごとにバックグラウンドで再ビルドを行い、
 * 価格やAI生成コンテンツの更新を反映させます。
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

    const makerLower = product.maker.toLowerCase();
    const isLenovo = makerLower.includes('lenovo');
    const isDell = makerLower.includes('dell');
    const isHP = makerLower.includes('hp');

    // ビーコン共通スタイル（ビルドエラー回避と非表示化）
    const beaconStyle: React.CSSProperties = { 
        border: 'none', 
        display: 'none',
        visibility: 'hidden'
    };

    if (isDell) {
        // --- Dell (LinkShare) ---
        if (product.affiliate_url) {
            finalUrl = product.affiliate_url;
            const bidMatch = product.affiliate_url.match(/bids=([^&]+)/);
            if (bidMatch) {
                beacon = (
                    <img 
                        src={`https://ad.linksynergy.com/fs-bin/show?id=nNBA6GzaGrQ&bids=${bidMatch[1]}&type=15&subid=0`} 
                        width="1" height="1" alt="" 
                        style={beaconStyle}
                    />
                );
            }
        } else {
            // デフォルト: 今週のおすすめ製品
            finalUrl = "https://click.linksynergy.com/fs-bin/click?id=nNBA6GzaGrQ&offerid=1568114.10014115&type=3&subid=0";
            beacon = (
                <img 
                    src="https://ad.linksynergy.com/fs-bin/show?id=nNBA6GzaGrQ&bids=1568114.10014115&type=3&subid=0" 
                    width="1" height="1" alt="" 
                    style={beaconStyle}
                />
            );
        }
    } else if (isHP || isLenovo) {
        // --- HP / Lenovo (ValueCommerce) ---
        const sid = "3697471";
        const pid = "892455531";
        const decodedUrl = product.url.includes('%') ? decodeURIComponent(product.url) : product.url;
        const encodedUrl = encodeURIComponent(decodedUrl);
        
        finalUrl = `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid={sid}&pid={pid}&vc_url=${encodedUrl}`;
        beacon = (
            <img 
                src={`//ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=${sid}&pid=${pid}`} 
                height={1} width={1} alt="" 
                style={beaconStyle} 
            />
        );
    }

    const dynamicStyle = {
        '--site-color': siteColor,
        backgroundColor: bgColor
    } as React.CSSProperties;

    const buttonLabel = `${product.maker}公式サイトで詳細を見る`;

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
                    </div>
                </div>
            </main>
        </div>
    );
}