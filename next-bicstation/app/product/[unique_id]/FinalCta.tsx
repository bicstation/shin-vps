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
        // AI要約データがある場合はそれを使用、ない場合はデフォルトを表示
        if (summary && (summary.p1 || summary.p2 || summary.p3)) {
            return [
                summary.p1 ? `✓ ${summary.p1}` : null,
                summary.p2 ? `✓ ${summary.p2}` : null,
                summary.p3 ? `✓ ${summary.p3}` : null,
            ].filter(Boolean) as string[];
        }

        return [
            "✓ 最新OS・構成のカスタマイズ対応",
            "✓ 公式限定キャンペーン適用対象",
            "✓ 最短当日出荷・安心のメーカー保証"
        ];
    };

    const features = getFeatures();

    return (
        <section className={styles.finalCtaSection}>
            <div className={styles.ctaGlassCard}>
                
                {/* --- 1段目：全体（フルサイズ）ヘッダーエリア --- */}
                <div className={styles.ctaHeader}>
                    <div className={styles.ctaBrandTag}>
                        <span className={styles.dot}></span>
                        {product.maker} 正規オンラインストア
                    </div>
                    
                    <h2 className={styles.ctaTitle}>
                        {isSoftware ? "究極のツールを、今すぐ。" : "未体験のパフォーマンスを解き放つ。"}
                    </h2>

                    {/* 💡 製品名を追加：ユーザーの安心感を醸成 */}
                    <div className={styles.ctaProductName}>
                        {product.name}
                    </div>
                </div>

                {/* --- 2段目：横2列のコンテンツレイアウト --- */}
                <div className={styles.ctaBodyRow}>
                    
                    {/* 左側：AIによるメリットポイント */}
                    <div className={styles.ctaPointsColumn}>
                        <div className={styles.ctaFeatureList}>
                            {features.map((feature, index) => (
                                <div key={index} className={styles.ctaFeatureItem}>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 右側：製品ビジュアル ＋ コンバージョンボタン */}
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
                                rel="nofollow" 
                                className={styles.ctaNeonButton}
                            >
                                <span className={styles.ctaButtonMain}>
                                    {product.maker}公式サイトで見る
                                </span>
                                <span className={styles.ctaButtonSub}>
                                    （外部ストアへ移動します）
                                </span>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FinalCta;