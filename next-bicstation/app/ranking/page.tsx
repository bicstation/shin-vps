import { fetchPCProductRanking } from '@shared/components/lib/api';
import Link from 'next/link';
import styles from './Ranking.module.css';
import RadarChart from '@shared/components/ui/RadarChart';
import ProductCard from '@shared/components/product/ProductCard';

/**
 * =====================================================================
 * 🏆 PCスペック解析ランキング ページ
 * 汎用 ProductCard を使用し、デザインを統一した最新版
 * =====================================================================
 */

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sParams = await searchParams;
  const page = sParams.page || '1';
  return {
    title: `【2026年最新】PCスペック解析ランキング 第${page}ページ | Tiper`,
    description: `AI解析スコアに基づいたPC製品の最新ランキング。CPU・メモリ・コスパを5軸で徹底比較。`,
    alternates: {
      canonical: `https://bicstation.com/ranking/?page=${page}`,
    },
  };
}

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sParams = await searchParams;
  const currentPage = parseInt(sParams.page || '1', 10);
  const limit = 20; 
  const offset = (currentPage - 1) * limit;

  // APIデータの取得
  const allProducts = await fetchPCProductRanking();
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  // JSON-LD（構造化データ）の生成
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "PCスペック解析ランキング",
    "itemListElement": products.map((p, i) => ({
      "@type": "ListItem",
      "position": offset + i + 1,
      "item": {
        "@type": "Product",
        "name": p.name,
        "image": p.image_url?.replace('http://', 'https://'),
      }
    }))
  };

  // ランキング順位に応じたチャート色の取得
  const getChartColor = (rank: number) => {
    if (rank === 1) return '#d69e2e'; // Gold
    if (rank === 2) return '#718096'; // Silver
    if (rank === 3) return '#975a16'; // Bronze
    return '#3182ce'; // Default Blue
  };

  return (
    <main className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.header}>
        <div className={styles.badge}>RANKING</div>
        <h1 className={styles.title}>💻 PCスペック解析ランキング</h1>
        <p className={styles.subtitle}>AIが全PCのスペックを数値化。真のパフォーマンスを可視化しました。</p>
      </div>
      
      <div className={styles.grid}>
        {products.map((product, index) => {
          const rank = offset + index + 1;
          
          // チャートデータの整形
          const chartData = product.radar_chart || [
            { subject: 'CPU', value: 0, fullMark: 100 },
            { subject: 'GPU', value: 0, fullMark: 100 },
            { subject: 'コスパ', value: 0, fullMark: 100 },
            { subject: '携帯性', value: 0, fullMark: 100 },
            { subject: 'AI', value: 0, fullMark: 100 },
          ];

          return (
            <ProductCard 
              key={product.unique_id} 
              product={product} 
              rank={rank}
            >
              {/* 🚩 ProductCardのchildrenとしてレーダーチャートを注入 */}
              <div className={styles.chartWrapper}>
                <div className={styles.chartHeader}>
                  <span className={styles.analysisLabel}>AI解析詳細</span>
                </div>
                <RadarChart 
                  data={chartData} 
                  color={getChartColor(rank)} 
                />
              </div>
            </ProductCard>
          );
        })}
      </div>

      {/* ページネーション */}
      <nav className={styles.pagination}>
        {currentPage > 1 && (
          <Link href={`?page=${currentPage - 1}`} className={styles.pageButton}>
            ← 前のページ
          </Link>
        )}
        <div className={styles.pageInfo}>
          <strong>{currentPage}</strong> / {totalPages}
        </div>
        {currentPage < totalPages && (
          <Link href={`?page=${currentPage + 1}`} className={styles.pageButton}>
            次のページ →
          </Link>
        )}
      </nav>
    </main>
  );
}