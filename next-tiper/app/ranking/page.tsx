/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
import { Flame, BrainCircuit } from 'lucide-react';

/**
 * 🛠️ インポートセクション
 */
import { fetchAdultProductRanking } from '@shared/lib/api';
import AdultProductCard from '@shared/cards/AdultProductCard';
import Pagination from '@shared/common/Pagination';
import RadarChart from '@shared/ui/RadarChart';
import styles from './Ranking.module.css';

/**
 * ✅ SEOメタデータ生成
 */
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sParams = await searchParams;
  const page = sParams.page || '1';
  return {
    title: `【AI解析】アダルト作品徹底比較ランキング 第${page}ページ | Tiper`,
    description: `最新のAI解析スコアに基づいたアダルト作品ランキング。ルックス・演技・没入感を5軸チャートで徹底比較。`,
    alternates: {
      canonical: `https://tiper.live/ranking/?page=${page}`,
    },
  };
}

/**
 * 🔞 ランキングページ メインコンポーネント
 */
export default async function RankingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sParams = await searchParams;
  const currentPage = parseInt(sParams.page || '1', 10);
  const limit = 20; 
  const offset = (currentPage - 1) * limit;

  // アダルト作品解析データの取得
  const rankingResponse = await fetchAdultProductRanking();
  
  // APIレスポンスが { results: [], count: 0 } 形式か 配列直列化 かを判定
  const allProducts = Array.isArray(rankingResponse) ? rankingResponse : (rankingResponse.results || []);
  
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  // 構造化データ (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "アダルト作品AI解析スコアランキング",
    "itemListElement": products.map((p, i) => ({
      "@type": "ListItem",
      "position": offset + i + 1,
      "item": {
        "@type": "Product",
        "name": p.title || p.name,
        "image": (p.image_url_list?.[0] || p.image_url || '').replace('http://', 'https://'),
      }
    }))
  };

  // ランキング順位に応じたチャート色の取得
  const getChartColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#E91E63'; // Default Cyber Pink
  };

  return (
    <main className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ヘッダーエリア */}
      <div className={styles.header}>
        <div className={styles.badge}>
          <BrainCircuit className="w-4 h-4 mr-1" />
          AI ANALYSIS_STREAM
        </div>
        <h1 className={styles.title}>🔞 作品スペック解析ランキング</h1>
        <p className={styles.subtitle}>
          AIソムリエが全作品を独自のアルゴリズムで数値化。真の満足度を可視化しました。
        </p>
      </div>
      
      {/* グリッドレイアウト */}
      <div className={styles.grid}>
        {products.map((product, index) => {
          const rank = offset + index + 1;
          
          /**
           * 📊 チャートデータの整形 (重要)
           * 💡 既存モデル(AdultProduct)のフィールドを直接参照し、5角形を描画します
           */
          const chartData = [
            { subject: 'VISUAL', value: product.score_visual || 0, fullMark: 100 },
            { subject: 'STORY',  value: product.score_story || 0,  fullMark: 100 },
            { subject: 'COST',   value: product.score_cost || 0,   fullMark: 100 },
            { subject: 'EROTIC', value: product.score_erotic || 0, fullMark: 100 },
            { subject: 'RARITY', value: product.score_rarity || 0, fullMark: 100 },
          ];

          return (
            <AdultProductCard 
              key={product.product_id_unique || product.id} 
              product={product} 
              rank={rank}
            >
              {/* 🚩 解析チャートを注入：valueが0以外なら塗りつぶしが描画されます */}
              <div className={styles.chartWrapper}>
                <div className={styles.chartHeader}>
                  <Flame className="w-3 h-3 text-orange-500 mr-1" />
                  <span className={styles.analysisLabel}>AI_SPEC_REPORT: {product.spec_score || 0}%</span>
                </div>
                {/* グラフ背景とRadarChartの呼び出し */}
                <div className="flex justify-center items-center py-2 bg-black/20 rounded-lg">
                   <RadarChart 
                    data={chartData} 
                    color={getChartColor(rank)} 
                  />
                </div>
              </div>
            </AdultProductCard>
          );
        })}
      </div>

      {/* 共通 Pagination コンポーネント */}
      <div className={styles.paginationSection}>
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          baseUrl="/ranking" 
        />
      </div>
    </main>
  );
}