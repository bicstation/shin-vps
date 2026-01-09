import React from 'react';
import { notFound } from 'next/navigation';
import { fetchProductDetail } from '@/lib/api';
import styles from './ProductDetail.module.css';

export default async function ProductDetailPage(props: { params: Promise<{ unique_id: string }> }) {
    const params = await props.params;
    const product = await fetchProductDetail(params.unique_id);

    if (!product) notFound();

    // リンクの優先順位（アフィリエイトURLがあればそれを使う）
    const finalUrl = product.affiliate_url || product.url;

    return (
        <div className={styles.wrapper}>
            <main className={styles.mainContainer}>
                {/* ヒーローセクション */}
                <div className={styles.topSection}>
                    <div className={styles.imageWrapper}>
                        <img src={product.image_url || '/no-image.png'} alt={product.name} className={styles.productImage} />
                    </div>
                    <div>
                        <div className={styles.badgeContainer}>
                            <span className={styles.makerBadge}>{product.maker}</span>
                            <span className={styles.genreBadge}>{product.unified_genre}</span>
                        </div>
                        <h1 className={styles.productTitle}>{product.name}</h1>
                        <div className={styles.priceBox}>
                            <div className={styles.priceValue}>
                                {product.price > 0 ? `¥${product.price.toLocaleString()}` : '価格情報なし'}
                            </div>
                        </div>
                        <a href={finalUrl} target="_blank" rel="nofollow noopener noreferrer" className={styles.ctaButton}>
                            {product.maker}公式サイトで詳細を見る
                        </a>
                    </div>
                </div>

                {/* 🚀 AI生成コンテンツセクション */}
                {product.ai_content && (
                    <div className={styles.aiContentSection}>
                        <h2 className={styles.specTitle}>エキスパートによる製品解説</h2>
                        <div 
                            className={styles.aiContentBody}
                            dangerouslySetInnerHTML={{ __html: product.ai_content }} 
                        />
                    </div>
                )}

                {/* スペック詳細 */}
                <div className={styles.specSection}>
                    <h2 className={styles.specTitle}>スペック詳細・構成内容</h2>
                    <div className={styles.specTable}>
                        {product.description?.split('/').map((spec, i) => (
                            <div key={i} className={styles.specRow}>
                                <span className={styles.specCheck}>✓</span>
                                <span>{spec.trim()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}