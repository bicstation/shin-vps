import { fetchPCProductRanking } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Ranking.module.css';
import RadarChart from '@/components/RadarChart';

/**
 * =====================================================================
 * 🚀 SEO対策: 動的メタデータの生成
 * =====================================================================
 */
export async function generateMetadata({ searchParams }: { searchParams: { page?: string } }) {
  const page = searchParams.page || '1';
  return {
    title: `【2026年最新】PCスペック解析ランキング 第${page}ページ | Tiper`,
    description: `AI解析スコアに基づいたPC製品の最新ランキング。CPU・メモリ・コスパを5軸で徹底比較し、真の買い得PCを判定。`,
    alternates: {
      // canonical URLは実際の環境に合わせて修正してください
      canonical: `http://localhost:8083/bicstation/ranking/?page=${page}`,
    },
  };
}

/**
 * =====================================================================
 * 💻 ランキングページコンポーネント
 * =====================================================================
 */
export default async function RankingPage({ searchParams }: { searchParams: { page?: string } }) {
  // ページネーション設定
  const currentPage = parseInt(searchParams.page || '1', 10);
  const limit = 20; 
  const offset = (currentPage - 1) * limit;

  // APIからランキング全件取得 (Django側が1000件程度ならスライスで十分対応可能)
  const allProducts = await fetchPCProductRanking();
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  // --- SEO対策: 構造化データ (JSON-LD) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "PCスペック解析ランキング",
    "description": "AI解析スコアに基づいたパソコン製品の性能ランキング",
    "itemListElement": products.map((p, i) => ({
      "@type": "ListItem",
      "position": offset + i + 1,
      "item": {
        "@type": "Product",
        "name": p.name,
        "image": p.image_url,
        "offers": {
          "@type": "Offer",
          "price": p.price,
          "priceCurrency": "JPY"
        }
      }
    }))
  };

  return (
    <main className={styles.container}>
      {/* Google検索用構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.header}>
        <h1 className={styles.title}>💻 PCスペック解析ランキング</h1>
        <p className={styles.subtitle}>
          AIが全PCのスペックを独自アルゴリズムで数値化。真のパフォーマンスを可視化しました。
        </p>
      </div>
      
      <div className={styles.grid}>
        {products.map((product, index) => {
          const rank = offset + index + 1;
          
          // 1-3位までの特別クラス判定
          let rankClass = '';
          let chartColor = '#3182ce'; // デフォルト：青
          
          if (rank === 1) {
            rankClass = styles.rank_1;
            chartColor = '#d69e2e'; // ゴールド系
          } else if (rank === 2) {
            rankClass = styles.rank_2;
            chartColor = '#718096'; // シルバー系
          } else if (rank === 3) {
            rankClass = styles.rank_3;
            chartColor = '#975a16'; // ブロンズ系
          }

          // レーダーチャート用データの準備（APIにデータがない場合のフォールバック）
          const chartData = product.radar_chart || [
            { subject: 'CPU', value: 0, fullMark: 100 },
            { subject: 'GPU', value: 0, fullMark: 100 },
            { subject: 'コスパ', value: 0, fullMark: 100 },
            { subject: '携帯性', value: 0, fullMark: 100 },
            { subject: 'AI', value: 0, fullMark: 100 },
          ];

          return (
            <article key={product.unique_id} className={`${styles.card} ${rankClass}`}>
              {/* 順位バッジ */}
              <div className={styles.rankBadge}>{rank}位</div>
              
              {/* 画像エリア */}
              <div className={styles.imageWrapper}>
                <Image
                  src={product.image_url || '/no-image.png'}
                  alt={`${product.name} - ランキング第${rank}位`}
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* コンテンツエリア */}
              <div className={styles.content}>
                <p className={styles.maker}>{product.maker}</p>
                <h2 className={styles.productName}>{product.name}</h2>
                
                {/* AI解析スコア & チャートセクション */}
                <div className={styles.scoreSection}>
                  <div className={styles.scoreHeader}>
                    <span className={styles.scoreValue}>{product.spec_score}</span>
                    <span className={styles.scoreLabel}>ANALYSIS SCORE</span>
                  </div>
                  
                  <div className={styles.chartContainer}>
                    <RadarChart data={chartData} color={chartColor} />
                  </div>
                </div>

                {/* 簡易スペックリスト */}
                <div className={styles.specBox}>
                   <div className={styles.specItem}>🚀 {product.cpu_model || 'CPU型番不明'}</div>
                   <div className={styles.specItem}>📟 {product.memory_gb}GB / {product.storage_gb}GB SSD</div>
                   <div className={styles.specItem}>🖥️ {product.display_info}</div>
                </div>

                {/* 価格とアクション */}
                <div className={styles.bottomSection}>
                  <div className={styles.price}>
                    <span className={styles.currency}>¥</span>
                    {product.price?.toLocaleString()}
                    <span className={styles.taxIn}> (税込)</span>
                  </div>
                  
                  <a 
                    href={product.affiliate_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.button}
                  >
                    公式サイトで詳細を見る
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ページネーションコントロール */}
      <nav className={styles.pagination} aria-label="ページ選択">
        {currentPage > 1 && (
          <Link href={`?page=${currentPage - 1}`} className={styles.pageButton}>
            ← 前のページ
          </Link>
        )}
        
        <div className={styles.pageInfo}>
          <strong>{currentPage}</strong> / {totalPages} ページ
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