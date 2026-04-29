/* eslint-disable @next/next/no-img-element */
import React from 'react';
import styles from './FinalCta.module.css';

interface FinalCtaProps {
    product: {
        maker: string;
        name: string;
        image_url?: string;
    };
    summary?: {
        p1: string;
        p2: string;
        p3: string;
    } | null;
    finalUrl: string;
    isSoftware: boolean;
}

const FinalCta: React.FC<FinalCtaProps> = ({ product, summary, finalUrl, isSoftware }) => {

    const getFeatures = () => {
        if (summary && (summary.p1 || summary.p2 || summary.p3)) {
            return [
                summary.p1 && `✓ ${summary.p1}`,
                summary.p2 && `✓ ${summary.p2}`,
                summary.p3 && `✓ ${summary.p3}`,
            ].filter(Boolean) as string[];
        }

        return [
            "✓ 迷わず使える安心構成",
            "✓ 長く使える性能バランス",
            "✓ 初心者でもそのまま使える"
        ];
    };

    const features = getFeatures();

    return (
        <section className={styles.finalCtaSection}>
            <div className={styles.ctaGlassCard}>
                
                {/* 🔥 決断コピー */}
                <div className={styles.ctaHeader}>
                    <div className={styles.ctaBrandTag}>
                        <span className={styles.dot}></span>
                        {product.maker} 正規ストア
                    </div>
                    
                    <h2 className={styles.ctaTitle}>
                        迷ったらこれで終わり
                    </h2>

                    <div className={styles.ctaProductName}>
                        {product.name}
                    </div>
                </div>

                {/* コンテンツ */}
                <div className={styles.ctaBodyRow}>
                    
                    {/* メリット */}
                    <div className={styles.ctaPointsColumn}>
                        <div className={styles.ctaFeatureList}>
                            {features.map((feature, index) => (
                                <div key={index} className={styles.ctaFeatureItem}>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ビジュアル＋CTA */}
                    <div className={styles.ctaVisualColumn}>
                        <div className={styles.ctaImageWrapper}>
                            <img
                                src={product.image_url || '/no-image.png'}
                                alt={product.name}
                                className={styles.ctaFloatingImage}
                            />
                        </div>
                        
                        <div className={styles.ctaActionWrapper}>
                            <a 
                                href={finalUrl} 
                                target="_blank" 
                                rel="nofollow noopener noreferrer"
                                className={styles.ctaNeonButton}
                            >
                                <span className={styles.ctaButtonMain}>
                                    👉 今すぐ確認（在庫あり）
                                </span>
                                <span className={styles.ctaButtonSub}>
                                    公式サイトで詳細を見る
                                </span>
                            </a>

                            {/* 安心補強 */}
                            <div className={styles.ctaTrust}>
                                正規ストア・メーカー保証あり
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FinalCta;