/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COLORS } from '@/constants';
import { fetchProductDetail } from '@/lib/api';
import styles from './ProductDetail.module.css';

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

    if (product.maker.toLowerCase().includes('lenovo')) {
        const sid = "3697471";
        const pid = "892455531";
        const encodedUrl = encodeURIComponent(product.url);
        
        finalUrl = `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodedUrl}`;
        
        // エラー箇所の修正：border属性を削除し、styleで対応。height/widthを数値に。
        beacon = (
            <img 
                src={`//ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=${sid}&pid=${pid}`} 
                height={1} 
                width={1} 
                alt="" 
                style={{ display: 'none', border: 'none' }} 
            />
        );
    }

    const dynamicStyle = {
        '--site-color': siteColor,
        backgroundColor: bgColor
    } as React.CSSProperties;

    return (
        <div className={styles.wrapper} style={dynamicStyle}>
            
            {/* ナビゲーション（パン屑リスト） */}
            <div className={styles.breadcrumb}>
                <nav>
                    <Link href="/" className={styles.breadcrumbLink} style={{ color: siteColor }}>カタログトップ</Link>
                    <span style={{ margin: '0 10px' }}>&gt;</span>
                    <span style={{ color: '#999' }}>{product.name}</span>
                </nav>
            </div>

            <main className={styles.mainContainer}>
                
                {/* メインセクション：製品画像と価格 */}
                <div className={styles.topSection}>
                    
                    {/* 左側：商品画像 */}
                    <div className={styles.imageWrapper}>
                        <img 
                            src={product.image_url || 'https://via.placeholder.com/500x400?text=No+Image'} 
                            alt={product.name}
                            className={styles.productImage}
                        />
                    </div>

                    {/* 右側：基本情報 */}
                    <div>
                        <div className={styles.badgeContainer}>
                            <span className={styles.makerBadge}>
                                {product.maker.toUpperCase()}
                            </span>
                            <span className={styles.genreBadge}>
                                {product.unified_genre}
                            </span>
                        </div>

                        <h1 className={styles.productTitle}>
                            {product.name}
                        </h1>

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
                            href={finalUrl} 
                            target="_blank" 
                            rel="nofollow noopener noreferrer"
                            className={styles.ctaButton}
                            style={{ 
                                boxShadow: `0 4px 15px ${siteColor}4d`,
                                backgroundColor: product.maker.toLowerCase().includes('lenovo') ? '#ef4444' : siteColor 
                            }}
                        >
                            Lenovo公式サイトで詳細を見る
                            {beacon}
                        </a>
                    </div>
                </div>

                {/* スペック詳細セクション */}
                <div className={styles.specSection}>
                    <h2 className={styles.specTitle}>
                        スペック詳細・構成内容
                    </h2>
                    
                    <div className={styles.specTable}>
                        {product.description ? (
                            product.description.split('/').map((spec, i) => (
                                <div key={i} className={styles.specRow}>
                                    <span className={styles.specCheck}>✓</span>
                                    <span style={{ color: '#444' }}>{spec.trim()}</span>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#999', textAlign: 'center', padding: '40px', background: '#fff' }}>
                                詳細スペック情報の配信はありません。
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}