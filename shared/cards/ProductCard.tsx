"use client";

/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import { decodeHtml } from '../lib/decode';

interface ProductCardProps {
  product: any;
  rank?: number;         // 1, 2, 3...
  showActions?: boolean;
}

// 属性ごとのカラー定義
const attrColorMap: { [key: string]: { bg: string, text: string, border: string } } = {
  cpu: { bg: '#eef2ff', text: '#3730a3', border: '#e0e7ff' },
  gpu: { bg: '#fef2f2', text: '#991b1b', border: '#fee2e2' },
  'GPUモデル': { bg: '#fef2f2', text: '#991b1b', border: '#fee2e2' },
  '1. 画面サイズ': { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
};

export default function ProductCard({ 
  product, 
  rank, 
  showActions = true 
}: ProductCardProps) {
  
  if (!product) return null;

  // 🚩 データの正規化
  const buyLink = product.affiliate_url || product.url || '#';
  const displayMaker = product.maker || product.maker_name || 'Brand';
  const displayPrice = product.price ? Number(product.price) : 0;
  const decodedProductName = decodeHtml(product.name || '');
  
  // AIコメント（「不明」を回避する思考型ロジック）
  const aiComment = product.ai_analysis || product.short_description || 
    `${displayMaker}の注目モデル。AI査定では、${product.cpu_model || '標準的なプロセッサ'}を搭載し、${(product.score_portable || product.portable_score) > 8 ? '優れた携帯性' : '安定した動作環境'}を実現していると評価されています。`;

  const getSafeImageUrl = () => {
    if (!product?.image_url) return 'https://placehold.jp/24/3b82f6/ffffff/300x200.png?text=No%20Image';
    return String(product.image_url).replace('http://', 'https://');
  };

  /**
   * 📊 五角形レーダーチャート描画
   */
  const renderPentagonChart = () => {
    const normalize = (val: any) => {
      let s = Number(val) || 50;
      return s <= 10 ? s * 10 : s; 
    };

    // 5軸の定義
    const scores = [
      normalize(product.score_cpu || product.cpu_score),      // 演算
      normalize(product.score_gpu || product.gpu_score),      // 描画
      normalize(product.score_ai || product.ai_score),        // AI
      normalize(product.score_portable || product.portable_score), // 軽さ
      normalize(product.score_cost || product.cost_performance)    // コスパ
    ];

    const radius = 40;
    const points = scores.map((score, i) => {
      const angle = (i * 72 - 90) * (Math.PI / 180);
      const r = (score / 100) * radius;
      return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
    }).join(" ");

    return (
      <div className={styles.chartContainer}>
        <svg viewBox="0 0 100 100" className={styles.chartSvg}>
          <circle cx="50" cy="50" r="40" className={styles.chartBg} />
          {[1, 2, 3, 4, 5].map((_, i) => {
            const a = (i * 72 - 90) * (Math.PI / 180);
            return <line key={i} x1="50" y1="50" x2={50 + 40 * Math.cos(a)} y2={50 + 40 * Math.sin(a)} className={styles.chartLine} />;
          })}
          <polygon points={points} className={styles.chartPolygon} />
        </svg>
      </div>
    );
  };

  return (
    <article className={`${styles.card} ${rank ? styles.rankingMode : ''} ${rank ? styles[`rank_${rank}`] : ''}`}>
      {rank && <div className={`${styles.rankBadge} ${styles[`rankBadge_${rank}`]}`}>{rank}</div>}
      
      {(product.spec_score || product.score_total) && (
        <div className={styles.scoreBadge}>
          AI SCORE: <span>{product.spec_score || product.score_total}</span>
        </div>
      )}

      <div className={styles.imageArea}>
        <img src={getSafeImageUrl()} alt={decodedProductName} className={styles.image} loading="lazy" />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.metaInfo}>
          <span className={styles.makerBadge}>{displayMaker}</span>
          {(product.is_ai_pc || (product.score_ai || product.ai_score) > 80) && <span className={styles.aiBadge}>AI PC</span>}
        </div>

        <h3 className={styles.productName}>
          <Link href={`/product/${product.unique_id}`}>{decodedProductName}</Link>
        </h3>

        {/* 🔗 属性リンク（意味の回廊） */}
        <div className={styles.attributeList}>
          {product.attributes?.map((attr: any) => {
            const colors = attrColorMap[attr.attr_type] || { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
            return (
              <Link 
                key={attr.id} 
                href={`/catalog?attribute=${attr.slug}`}
                className={styles.attrBadge} 
                style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, textDecoration: 'none' }}
              >
                <span className={styles.attrTypeLabel}>{attr.attr_type_display || attr.attr_type}:</span> {attr.name}
              </Link>
            );
          })}
        </div>

        {/* 📊 5軸解析セクション */}
        <div className={styles.analysisSection}>
          {renderPentagonChart()}
          <div className={styles.scoreDetail}>
             <div className={styles.scoreRow}><span>演算</span><strong>{product.score_cpu || product.cpu_score || '-'}</strong></div>
             <div className={styles.scoreRow}><span>描画</span><strong>{product.score_gpu || product.gpu_score || '-'}</strong></div>
             <div className={styles.scoreRow}><span>AI</span><strong>{product.score_ai || product.ai_score || '-'}</strong></div>
             <div className={styles.scoreRow}><span>携帯</span><strong>{product.score_portable || product.portable_score || '-'}</strong></div>
             <div className={styles.scoreRow}><span>コスパ</span><strong>{product.score_cost || product.cost_performance || '-'}</strong></div>
          </div>
        </div>

        <div className={styles.aiCommentBox}>
          <span className={styles.aiLabel}>AI DIAGNOSIS</span>
          <p className={styles.aiText}>{aiComment}</p>
        </div>

        <div className={styles.priceContainer}>
          <p className={styles.price}>
            {displayPrice > 0 ? (
              <>
                <span className={styles.currency}>¥</span>
                <span className={styles.amount}>{displayPrice.toLocaleString()}</span>
                <span className={styles.taxLabel}>(税込)</span>
              </>
            ) : <span className={styles.priceUnknown}>価格情報なし</span>}
          </p>
        </div>

        {showActions && (
          <div className={styles.actions}>
            <Link href={`/product/${product.unique_id}`} className={styles.detailBtn}>詳細を分析</Link>
            <a href={buyLink} target="_blank" rel="noopener noreferrer" className={styles.buyBtn}>公式サイト</a>
          </div>
        )}
      </div>
    </article>
  );
}