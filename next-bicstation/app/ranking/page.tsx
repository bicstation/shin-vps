/* eslint-disable @next/next/no-img-element */
// /home/maya/dev/shin-vps/next-bicstation/app/ranking/page.tsx

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

// API & UIコンポーネント
import { fetchPCProductRanking } from '@shared/lib/api/django/pc';
import ProductCard from '@shared/cards/ProductCard';
import RadarChart from '@shared/ui/RadarChart';

import styles from './Ranking.module.css';

/**
 * ✅ 修正ポイント: 動的レンダリングの強制と Next.js 15 対応
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
  return {
    title: `【2026年最新】PCスペック解析ランキング 第${page}ページ | BICSTATION`,
    description: `AI解析スコアに基づいたPC製品の最新ランキング。CPU・グラフィック・コスパを5軸スコアで徹底比較。`,
    alternates: {
      canonical: `https://bicstation.com/ranking/?page=${page}`,
    },
  };
}

/**
 * 💡 メインページコンポーネント
 */
export default function RankingPage(props: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
        <div className="w-8 h-8 border-t-2 border-blue-500 animate-spin mb-4 rounded-full"></div>
        CALCULATING_RANKINGS...
      </div>
    }>
      <RankingContent {...props} />
    </Suspense>
  );
}

/**
 * ランキングコンテンツの実体
 */
async function RankingContent(props: PageProps) {
  const sParams = await props.searchParams;
  const currentPage = parseInt(sParams.page || '1', 10);
  const limit = 20; 
  const offset = (currentPage - 1) * limit;

  // 1. APIデータの取得
  // Rankingデータは全件取得してJS側でスライスする仕様を維持
  const allProducts = await fetchPCProductRanking().catch(() => []);
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  // 2. JSON-LD（構造化データ）の生成
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "PCスペック解析ランキング",
    "itemListElement": products.map((p: any, i: number) => ({
      "@type": "ListItem",
      "position": offset + i + 1,
      "item": {
        "@type": "Product",
        "name": p.name,
        "image": p.image_url?.replace('http://', 'https://'),
      }
    }))
  };

  /**
   * ランキング順位に応じたアクセントカラーの取得
   */
  const getChartColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#3182ce'; // Default Blue
  };

  return (
    <main className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ヘッダーセクション */}
      <div className={styles.header}>
        <div className={styles.badge}>PC ANALYTICS RANKING</div>
        <h1 className={styles.title}>💻 PCスペック解析ランキング</h1>
        <p className={styles.subtitle}>AIが全PCのスペックを数値化。表面的な価格だけでなく、真のコストパフォーマンスを可視化しました。</p>
      </div>
      
      {/* ランキンググリッド */}
      
      <div className={styles.grid}>
        {products.map((product: any, index: number) => {
          const rank = offset + index + 1;
          
          // レーダーチャート用データの整形（APIにデータがない場合のフォールバック）
          const chartData = product.radar_chart || [
            { subject: 'CPU', value: product.score_cpu || 0, fullMark: 100 },
            { subject: 'GPU', value: product.score_gpu || 0, fullMark: 100 },
            { subject: 'コスパ', value: product.score_cost || 0, fullMark: 100 },
            { subject: '携帯性', value: product.score_portable || 0, fullMark: 100 },
            { subject: 'AI', value: product.score_ai || 0, fullMark: 100 },
          ];

          return (
            <ProductCard 
              key={product.unique_id || product.id} 
              product={product} 
              rank={rank}
            >
              {/* ProductCardのchildrenとして解析チャートを注入 */}
              <div className={styles.chartWrapper}>
                <div className={styles.chartHeader}>
                  <span className={styles.analysisLabel}>AI解析スコア</span>
                  <span className={styles.totalScore}>
                    Total: <strong>{Math.round(chartData.reduce((acc: number, cur: any) => acc + cur.value, 0) / 5)}</strong>
                  </span>
                </div>
                <div className={styles.radarContainer}>
                  <RadarChart 
                    data={chartData} 
                    color={getChartColor(rank)} 
                  />
                </div>
              </div>
            </ProductCard>
          );
        })}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="ページ選択">
          {currentPage > 1 ? (
            <Link href={`?page=${currentPage - 1}`} className={styles.pageButton}>
              ← 前のページ
            </Link>
          ) : (
            <span className={`${styles.pageButton} ${styles.disabled}`}>← 前のページ</span>
          )}

          <div className={styles.pageInfo}>
            PAGE <strong>{currentPage}</strong> / {totalPages}
          </div>

          {currentPage < totalPages ? (
            <Link href={`?page=${currentPage + 1}`} className={styles.pageButton}>
              次のページ →
            </Link>
          ) : (
            <span className={`${styles.pageButton} ${styles.disabled}`}>次のページ →</span>
          )}
        </nav>
      )}

      {/* 補足情報 */}
      <footer className={styles.rankingFooter}>
        <p>※ランキングは毎日AM4:00に最新のスペック・価格データを元に再計算されます。</p>
      </footer>
    </main>
  );
}