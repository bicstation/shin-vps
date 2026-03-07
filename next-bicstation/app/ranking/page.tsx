/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🏆 BICSTATION PCスペック解析ランキング
 * 🛡️ Maya's Logic: 物理構造 v3.2 完全同期版 (ビルドエラー解消済み)
 * 物理パス: app/ranking/page.tsx
 * =====================================================================
 */

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

// ✅ 修正ポイント 1: インポートパスを物理構造 [STRUCTURE] に合わせる
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
// 物理構造上、charts/ ディレクトリはなく atoms/RadarChart.tsx に存在するため修正
import RadarChart from '@/shared/components/atoms/RadarChart';

import styles from './Ranking.module.css';

/**
 * ⚙️ サーバーセクション (Metadata & Configuration)
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

/**
 * 💡 SEOメタデータ生成
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const sParams = await props.searchParams;
  const page = sParams.page || '1';
  
  const title = `【2026年最新】PCスペック解析ランキング 第${page}ページ | BICSTATION`;
  const description = `AI解析スコアに基づいたPC製品の最新ランキング。CPU・GPU・コスパ・携帯性・AI性能を5軸スコアで徹底比較。真に「買い」のモデルを抽出。`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://bicstation.com/ranking/${page !== '1' ? `?page=${page}` : ''}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
    }
  };
}

/**
 * 🏗️ ページエントリポイント (Suspense搭載)
 */
export default function RankingPage(props: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
        <div className="w-8 h-8 border-t-2 border-blue-500 animate-spin mb-4 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
        CALCULATING_RANKINGS_V2.0...
      </div>
    }>
      <RankingContent {...props} />
    </Suspense>
  );
}

/**
 * 📄 コンテンツ描画 (Server Component)
 */
async function RankingContent(props: PageProps) {
  const sParams = await props.searchParams;
  const currentPage = parseInt(sParams.page || '1', 10);
  const limit = 20; 
  const offset = (currentPage - 1) * limit;

  // 1. APIデータの取得
  const allProducts = await fetchPCProductRanking().catch(() => []);
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  // 2. 構造化データの生成 (ItemList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "PCスペック解析ランキング",
    "description": "AIによる5軸スコアに基づいた最新PCランキング",
    "numberOfItems": allProducts.length,
    "itemListElement": products.map((p: any, i: number) => ({
      "@type": "ListItem",
      "position": offset + i + 1,
      "item": {
        "@type": "Product",
        "name": p.name,
        "image": p.image_url?.replace('http://', 'https://'),
        "brand": { "@type": "Brand", "name": p.maker }
      }
    }))
  };

  /**
   * 順位に応じたアクセントカラー (TOP3を際立たせる)
   */
  const getChartColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#E2E2E2'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#3b82f6'; // BICSTATION Blue
  };

  return (
    <main className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 🌌 ヒーローセクション */}
      <header className={styles.header}>
        <div className={styles.heroInner}>
          <div className={styles.badge}>PC_ANALYTICS_v2.0</div>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>💻</span>
            PCスペック解析ランキング
          </h1>
          <p className={styles.subtitle}>
            全アーカイブのスペックをAIが5軸で完全数値化。<br />
            広告やブランド力に惑わされない、<strong>真のコストパフォーマンス</strong>を可視化しました。
          </p>
        </div>
      </header>
      
      {/* 📊 ランキンググリッド */}
      <div className={styles.grid}>
        {products.map((product: any, index: number) => {
          const rank = offset + index + 1;
          
          // レーダーチャートデータの構築
          const chartData = [
            { subject: 'CPU', value: product.score_cpu || 0, fullMark: 100 },
            { subject: 'GPU', value: product.score_gpu || 0, fullMark: 100 },
            { subject: 'コスパ', value: product.score_cost || 0, fullMark: 100 },
            { subject: '携帯性', value: product.score_portable || 0, fullMark: 100 },
            { subject: 'AI性能', value: product.score_ai || 0, fullMark: 100 },
          ];

          const totalScore = Math.round(chartData.reduce((acc, cur) => acc + cur.value, 0) / 5);

          return (
            <div key={product.unique_id || product.id} className={styles.rankingCardWrapper}>
              <ProductCard 
                product={product} 
                rank={rank}
              >
                <div className={styles.analysisOverlay}>
                  <div className={styles.chartHeader}>
                    <div className={styles.labelGroup}>
                      <span className={styles.analysisLabel}>AI_ANALYSIS_SCORE</span>
                      <span className={styles.scoreDetail}>Comprehensive evaluation</span>
                    </div>
                    <div className={styles.totalScoreBox}>
                      <span className={styles.scoreValue}>{totalScore}</span>
                      <span className={styles.scoreUnit}>/100</span>
                    </div>
                  </div>

                  <div className={styles.radarContainer}>
                    
                    <RadarChart 
                      data={chartData} 
                      color={getChartColor(rank)} 
                    />
                  </div>
                </div>
              </ProductCard>
            </div>
          );
        })}
      </div>

      {/* 🧭 ナビゲーション */}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Ranking pages">
          <div className={styles.paginationInner}>
            {currentPage > 1 ? (
              <Link href={`?page=${currentPage - 1}`} className={styles.pageButton}>
                <span className={styles.btnArrow}>←</span> PREV
              </Link>
            ) : (
              <span className={`${styles.pageButton} ${styles.disabled}`}>← PREV</span>
            )}

            <div className={styles.pageIndicator}>
              <span className={styles.current}>PAGE {currentPage}</span>
              <span className={styles.divider}>/</span>
              <span className={styles.total}>{totalPages}</span>
            </div>

            {currentPage < totalPages ? (
              <Link href={`?page=${currentPage + 1}`} className={styles.pageButton}>
                NEXT <span className={styles.btnArrow}>→</span>
              </Link>
            ) : (
              <span className={`${styles.pageButton} ${styles.disabled}`}>NEXT →</span>
            )}
          </div>
        </nav>
      )}

      {/* 📝 フッター注記 */}
      <footer className={styles.rankingFooter}>
        <div className={styles.footerNote}>
          <p>※本ランキングは24時間ごとにAM4:00に更新されます。</p>
          <p>※スコアは最新の市場価格とベンチマークデータの変動を元にAIが自動算出したものです。</p>
        </div>
      </footer>
    </main>
  );
}