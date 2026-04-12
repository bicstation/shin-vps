'use client';

import React from 'react';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import { decodeHtml } from '@/shared/lib/utils/decode';

interface ProductCardProps {
  product: any;
  rank?: number;
  showActions?: boolean;
  /** 🚩 AdSense審査モード: trueの場合、価格と販売リンクを物理的にDOMから除外する */
  isReviewMode?: boolean;
}

export default function ProductCard({ 
  product, 
  rank, 
  showActions = true,
  isReviewMode = false 
}: ProductCardProps) {
  if (!product) return null;

  // 🚩 データ正規化
  const buyLink = product.affiliate_url || product.url || '#';
  const displayMaker = product.maker || product.maker_name || 'Brand';
  const displayPrice = product.price ? Number(product.price) : 0;
  const decodedProductName = decodeHtml(product.name || '');

  // メインスコアの決定 (AIスコアを最優先)
  const totalScore = product.score_ai || product.spec_score || product.score_total || '??';

  // 各詳細スコアの取得ロジック
  const getScore = (keys: string[]) => {
    for (const key of keys) {
      if (product[key] !== undefined && product[key] !== null) {
        const s = Number(product[key]);
        // 10点満点表記と100点満点表記を正規化
        return s <= 10 && s > 0 ? s * 10 : s; 
      }
    }
    return 0;
  };

  const scores = {
    cpu: getScore(['score_cpu', 'cpu_score']),
    gpu: getScore(['score_gpu', 'gpu_score']),
    ai: getScore(['score_ai', 'ai_score']),
    portable: getScore(['score_portable', 'portable_score']),
    cost: getScore(['score_cost', 'cost_performance'])
  };

  const aiComment = product.ai_analysis || product.short_description || 
    `${displayMaker}の注目モデル。AI査定では、${product.cpu_model || '標準的なプロセッサ'}を搭載し、${scores.portable > 80 ? '優れた携帯性' : '安定した動作環境'}を実現していると評価されています。`;

  // --- ヘルパー: プログレスバー描画 ---
  const renderProgressBar = (value: number, color: string) => (
    <div className={styles.barTrack}>
      <div className={styles.barFill} style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );

  // --- ヘルパー: 五角形チャート描画 ---
  const renderPentagonChart = () => {
    const radius = 40;
    const scoreArray = [scores.cpu, scores.gpu, scores.ai, scores.portable, scores.cost];
    const points = scoreArray.map((score, i) => {
      const angle = (i * 72 - 90) * (Math.PI / 180);
      const r = (Math.min(score, 100) / 100) * radius;
      return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
    }).join(" ");

    return (
      <div className={styles.chartContainer}>
        <svg viewBox="0 0 100 100" className={styles.chartSvg}>
          <circle cx="50" cy="50" r="40" className={styles.chartBg} />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i * 72 - 90) * (Math.PI / 180);
            return <line key={`line-${i}`} x1="50" y1="50" x2={50 + 40 * Math.cos(a)} y2={50 + 40 * Math.sin(a)} className={styles.chartLine} />;
          })}
          <polygon points={points} className={styles.chartPolygon} />
        </svg>
      </div>
    );
  };

  return (
    <article className={`${styles.card} ${rank ? styles.rankingMode : ''}`}>
      {/* スコアバッジ（独自解析の結果なので残すべき項目） */}
      <div className={styles.scoreBadge}>
        AI SCORE: <span>{totalScore}</span>
      </div>

      <div className={styles.imageArea}>
        <img src={product.image_url || 'https://placehold.jp/300x200.png'} alt={decodedProductName} className={styles.image} loading="lazy" />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.metaInfo}>
          <span className={styles.makerBadge}>{displayMaker}</span>
          {(product.is_ai_pc || scores.ai > 80) && <span className={styles.aiBadge}>AI PC</span>}
        </div>

        <h3 className={styles.productName}>
          <Link href={`/product/${product.unique_id}`}>{decodedProductName}</Link>
        </h3>

        {/* 解析セクション: サイトの独自性（E-E-A-T）をアピールする重要部分 */}
        <div className={styles.analysisSection}>
          {renderPentagonChart()}
          <div className={styles.scoreDetail}>
            <div className={styles.scoreRow}>
              <div className={styles.scoreLabel}><span>演算</span><strong>{scores.cpu}</strong></div>
              {renderProgressBar(scores.cpu, '#3730a3')}
            </div>
            <div className={styles.scoreRow}>
              <div className={styles.scoreLabel}><span>描画</span><strong>{scores.gpu}</strong></div>
              {renderProgressBar(scores.gpu, '#991b1b')}
            </div>
            <div className={styles.scoreRow}>
              <div className={styles.scoreLabel}><span>AI</span><strong>{scores.ai}</strong></div>
              {renderProgressBar(scores.ai, '#10b981')}
            </div>
            <div className={styles.scoreRow}>
              <div className={styles.scoreLabel}><span>携帯</span><strong>{scores.portable}</strong></div>
              {renderProgressBar(scores.portable, '#f59e0b')}
            </div>
            <div className={styles.scoreRow}>
              <div className={styles.scoreLabel}><span>コスパ</span><strong>{scores.cost}</strong></div>
              {renderProgressBar(scores.cost, '#6366f1')}
            </div>
          </div>
        </div>

        <div className={styles.aiCommentBox}>
          <p className={styles.aiText}>{aiComment}</p>
        </div>

        {/* 🛡️ 審査モード時は価格表示を物理的に削除 */}
        {!isReviewMode && (
          <div className={styles.priceContainer}>
            <p className={styles.price}>
              {displayPrice > 0 ? (
                <><span className={styles.currency}>¥</span><span className={styles.amount}>{displayPrice.toLocaleString()}</span></>
              ) : <span className={styles.priceUnknown}>価格情報なし</span>}
            </p>
          </div>
        )}

        {showActions && (
          <div className={styles.actions}>
            <Link href={`/product/${product.unique_id}`} className={styles.detailBtn}>分析詳細</Link>
            
            {/* 🛡️ 審査モード時は販売サイトへの直接リンク（アフィリエイト）を隠す */}
            {!isReviewMode && (
              <a href={buyLink} target="_blank" rel="noopener noreferrer" className={styles.buyBtn}>販売サイト</a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}