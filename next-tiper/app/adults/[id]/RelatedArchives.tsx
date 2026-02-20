// @ts-nocheck
import React from 'react';
import { getUnifiedProducts } from '@shared/lib/api/django/adult';
import AdultProductCard from '@shared/cards/AdultProductCard';
import styles from './ProductDetail.module.css';

/**
 * 🛰️ 共通サブセクション：特定の軸（女優・メーカー等）に基づいたリスト表示
 */
function RelatedSection({ title, subtitle, products }: { title: string, subtitle: string, products: any[] }) {
  if (!products || products.length === 0) return null;
  
  return (
    <div className="mb-20">
      {/* セクションヘッダー：サイバーパンク・マトリックス演出 */}
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tighter text-gray-200 font-mono italic">
            {title}
          </h3>
          <p className="text-[10px] text-gray-500 font-mono mt-1 tracking-widest uppercase">
            {subtitle}
          </p>
        </div>
        {/* 演出用ステータスバッジ */}
        <div className="text-[9px] font-mono text-pink-500/60 border border-pink-500/20 px-2 py-0.5 rounded animate-pulse">
          適合データ検出: {products.length} 件
        </div>
      </div>

      {/* 6カラムグリッドレイアウト */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {products.map((p) => (
          <div key={p.product_id_unique || p.id} className="transition-all duration-500 hover:scale-[1.02]">
            <AdultProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 📦 メインコンポーネント：複数女優ループ & 各種カテゴリ解析
 */
export default async function RelatedArchives({ product }: { product: any }) {
  const currentId = product.product_id_unique || product.id;
  const actresses = product.actresses || [];
  const maker = product.maker;
  const genres = product.genres || [];

  // 自作品をリストから除外するフィルター関数
  const filterSelf = (list: any[]) => (list || []).filter(p => (p.product_id_unique || p.id) !== currentId);

  /**
   * 📡 1. 全女優の関連作品を並列フェッチ
   * actresses 配列をループし、一人ずつ API を叩く Promise を生成
   */
  const actressPromises = actresses.map(actress => 
    getUnifiedProducts({ actress_id: actress.id, page_size: 7 })
      .then(res => ({
        actressName: actress.name,
        actressId: actress.id,
        results: filterSelf(res?.results || [])
      }))
  );

  /**
   * 📡 2. メーカー & ジャンルの並列フェッチ
   */
  const makerPromise = maker?.id 
    ? getUnifiedProducts({ maker_id: maker.id, page_size: 7 }).then(res => filterSelf(res?.results))
    : Promise.resolve([]);

  const genrePromise = genres?.[0]
    ? getUnifiedProducts({ genre: genres[0].id, page_size: 7 }).then(res => filterSelf(res?.results))
    : Promise.resolve([]);

  // すべてのリクエストが完了するまで待機
  const [actressResults, makerProducts, genreProducts] = await Promise.all([
    Promise.all(actressPromises),
    makerPromise,
    genrePromise
  ]);

  // 表示すべきデータが一つもない場合はセクション全体を非表示
  const hasNoData = actressResults.every(r => r.results.length === 0) && 
                    makerProducts.length === 0 && 
                    genreProducts.length === 0;

  if (hasNoData) return null;

  return (
    <section className="mt-40 pt-20 border-t border-white/10">
      {/* メインセクションヘッダー：関連アーカイブ解析 */}
      <div className="mb-16">
        <h2 className={styles.relatedTitle}>関連アーカイブ解析</h2>
        <div className="flex gap-4 mt-2">
          <span className="h-[2px] w-12 bg-pink-500"></span>
          <span className="text-[10px] text-pink-500 font-mono tracking-[0.3em] uppercase">
            Multi-Dimensional Analysis View
          </span>
        </div>
      </div>

      {/* 👩 女優軸セクション：ループ処理で全員分出力 */}
      {actressResults.map((result) => (
        <RelatedSection 
          key={`actress-section-${result.actressId}`}
          title={`出演者: ${result.actressName}`} 
          subtitle="Matching Actress Protocol: Synchronized Node"
          products={result.results} 
        />
      ))}

      {/* 🏭 メーカー軸セクション */}
      {maker && makerProducts.length > 0 && (
        <RelatedSection 
          title={`メーカー: ${maker.name}`} 
          subtitle="Studio Stream Sync: Production Archive"
          products={makerProducts} 
        />
      )}

      {/* 🏷️ ジャンル軸セクション（代表的な1件目のジャンル） */}
      {genres?.[0] && genreProducts.length > 0 && (
        <RelatedSection 
          title={`カテゴリー: ${genres[0].name}`} 
          subtitle="Thematic Data Analysis: Pattern Matching"
          products={genreProducts} 
        />
      )}
    </section>
  );
}