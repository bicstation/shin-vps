import { fetchPCProductRanking } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Ranking.module.css';
import RadarChart from '@/components/RadarChart';

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

  const allProducts = await fetchPCProductRanking();
  const products = allProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(allProducts.length / limit);

  // Mixed Content対策と画像URLの正規化
  const getSafeImageUrl = (url: string | null) => {
    if (!url) return '/no-image.png';
    if (url.startsWith('//')) return `https:${url}`;
    return url.replace('http://', 'https://');
  };

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
        "image": getSafeImageUrl(p.image_url),
      }
    }))
  };

  return (
    <main className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.header}>
        <h1 className={styles.title}>💻 PCスペック解析ランキング</h1>
        <p className={styles.subtitle}>AIが全PCのスペックを数値化。真のパフォーマンスを可視化しました。</p>
      </div>
      
      <div className={styles.grid}>
        {products.map((product, index) => {
          const rank = offset + index + 1;
          let rankClass = '';
          let chartColor = '#3182ce';
          
          if (rank === 1) { rankClass = styles.rank_1; chartColor = '#d69e2e'; }
          else if (rank === 2) { rankClass = styles.rank_2; chartColor = '#718096'; }
          else if (rank === 3) { rankClass = styles.rank_3; chartColor = '#975a16'; }

          const chartData = product.radar_chart || [
            { subject: 'CPU', value: 0, fullMark: 100 },
            { subject: 'GPU', value: 0, fullMark: 100 },
            { subject: 'コスパ', value: 0, fullMark: 100 },
            { subject: '携帯性', value: 0, fullMark: 100 },
            { subject: 'AI', value: 0, fullMark: 100 },
          ];

          return (
            <article key={product.unique_id} className={`${styles.card} ${rankClass}`}>
              <div className={styles.rankBadge}>{rank}位</div>
              
              <div className={styles.imageWrapper}>
                <Image
                  src={getSafeImageUrl(product.image_url)}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={rank <= 5}
                  unoptimized={true} // 🚩 画像が出ない問題を強制回避
                />
              </div>

              <div className={styles.content}>
                <p className={styles.maker}>{product.maker}</p>
                <h2 className={styles.productName}>{product.name}</h2>
                
                <div className={styles.scoreSection}>
                  <div className={styles.scoreHeader}>
                    <span className={styles.scoreValue}>{product.spec_score}</span>
                    <span className={styles.scoreLabel}>ANALYSIS SCORE</span>
                  </div>
                  <div className={styles.chartContainer}>
                    <RadarChart data={chartData} color={chartColor} />
                  </div>
                </div>

                <div className={styles.specBox}>
                   <div className={styles.specItem}>🚀 {product.cpu_model || 'CPU不明'}</div>
                   <div className={styles.specItem}>📟 {product.memory_gb}GB / {product.storage_gb}GB</div>
                   <div className={styles.specItem}>🖥️ {product.display_info}</div>
                </div>

                <div className={styles.bottomSection}>
                  <div className={styles.price}>
                    <span className={styles.currency}>¥</span>
                    {product.price?.toLocaleString()}
                  </div>
                  <a href={product.affiliate_url} target="_blank" rel="noopener" className={styles.button}>
                    公式サイト
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <nav className={styles.pagination}>
        {currentPage > 1 && <Link href={`?page=${currentPage - 1}`} className={styles.pageButton}>← 前へ</Link>}
        <div className={styles.pageInfo}><strong>{currentPage}</strong> / {totalPages}</div>
        {currentPage < totalPages && <Link href={`?page=${currentPage + 1}`} className={styles.pageButton}>次へ →</Link>}
      </nav>
    </main>
  );
}