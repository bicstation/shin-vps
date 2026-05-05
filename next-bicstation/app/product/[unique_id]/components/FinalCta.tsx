/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useMemo } from 'react';
import styles from './FinalCta.module.css';

interface FinalCtaProps {
  product: {
    maker: string;
    name: string;
    image_url?: string;
  };
  summary?: {
    p1?: string;
    p2?: string;
    p3?: string;
  } | null;
  finalUrl: string;
  isSoftware?: boolean;
}

const FinalCta: React.FC<FinalCtaProps> = ({
  product,
  summary,
  finalUrl,
  isSoftware = false
}) => {

  // -------------------------
  // 特徴（軽量＆安全）
  // -------------------------
  const features = useMemo(() => {
    if (summary && (summary.p1 || summary.p2 || summary.p3)) {
      return [
        summary.p1 && `✓ ${summary.p1}`,
        summary.p2 && `✓ ${summary.p2}`,
        summary.p3 && `✓ ${summary.p3}`,
      ].filter(Boolean) as string[];
    }

    return isSoftware
      ? [
          "✓ すぐに使えるシンプル設計",
          "✓ 初心者でも迷わない操作性",
          "✓ 導入後すぐに利用可能"
        ]
      : [
          "✓ 迷わず使える安心構成",
          "✓ 長く使える性能バランス",
          "✓ 初心者でもすぐ使える"
        ];
  }, [summary, isSoftware]);

  return (
    <section className={styles.finalCtaSection}>
      <div className={styles.ctaGlassCard}>

        {/* ===== ヘッダー ===== */}
        <div className={styles.ctaHeader}>

          <div className={styles.ctaBrandTag}>
            <span className={styles.dot}></span>
            {product.maker} 正規ストア
          </div>

          <h2 className={styles.ctaTitle}>
            最終チェックはこちら
          </h2>

          <div className={styles.ctaProductName}>
            {product.name}
          </div>
        </div>

        {/* ===== コンテンツ ===== */}
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
                id="buy"
                href={finalUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className={styles.ctaNeonButton}
              >
                <span className={styles.ctaButtonMain}>
                  👉 在庫があるうちに最安を確認する
                </span>

                <span className={styles.ctaButtonSub}>
                  公式サイトで詳細を見る
                </span>
              </a>

              {/* 安心 */}
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