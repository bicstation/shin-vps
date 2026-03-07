// @ts-nocheck
import React from 'react';
import { getUnifiedProducts } from '@shared/lib/api/django/adult';
import AdultProductCard from '@shared/cards/AdultProductCard';
import styles from './ProductDetail.module.css';

/**
 * =============================================================================
 * 🛰️ 共通サブセクション：特定の軸（女優・メーカー等）に基づいたリスト表示
 * =============================================================================
 */
function RelatedSection({ title, subtitle, products }: { title: string, subtitle: string, products: any[] }) {
  // データが空の場合はセクション自体を描画しない
  if (!products || products.length === 0) return null;
  
  return (
    <div className="mb-24 last:mb-0">
      {/* セクションヘッダー：サイバーパンク・マトリックス演出 */}
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tighter text-gray-100 font-mono italic flex items-center gap-3">
            <span className="w-1.5 h-4 bg-pink-600 block"></span>
            {title}
          </h3>
          <p className="text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase pl-4">
            {subtitle}
          </p>
        </div>
        
        {/* 演出用ステータスバッジ */}
        <div className="hidden sm:flex flex-col items-end">
          <div className="text-[9px] font-mono text-pink-500/60 border border-pink-500/20 px-2 py-0.5 rounded animate-pulse mb-1">
            適合データ検出: {products.length} UNITS
          </div>
          <div className="text-[8px] font-mono text-gray-600 uppercase">Status: Synchronized</div>
        </div>
      </div>

      {/* 🚀 6カラム・レスポンシブ・グリッドレイアウト */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-10">
        {products.map((p) => (
          <div key={p.product_id_unique || p.id} className="group transition-all duration-500 hover:translate-y-[-4px]">
            <AdultProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * =============================================================================
 * 📦 メインコンポーネント：多次元アーカイブ解析
 * =============================================================================
 */
export default async function RelatedArchives({ product }: { product: any }) {
  const currentId = product.product_id_unique || product.id;
  const actresses = product.actresses || [];
  const maker = product.maker;
  const genres = product.genres || [];

  // 💡 自作品をリストから除外するフィルター関数（ID重複を防止）
  const filterSelf = (list: any[]) => (list || []).filter(p => (p.product_id_unique || p.id) !== currentId);

  /**
   * 📡 1. 出演女優ごとの関連作品を並列フェッチ
   * actresses 配列をループし、一人ずつ API を叩く Promise 配列を生成
   */
  const actressPromises = actresses.map(actress => 
    getUnifiedProducts({ actress_id: actress.id, page_size: 7 })
      .then(res => ({
        actressName: actress.name,
        actressId: actress.id,
        results: filterSelf(res?.results || [])
      }))
      .catch(() => ({ actressName: actress.name, results: [] }))
  );

  /**
   * 📡 2. メーカー & ジャンルの並列フェッチ
   */
  const makerPromise = maker?.id 
    ? getUnifiedProducts({ maker_id: maker.id, page_size: 7 })
        .then(res => filterSelf(res?.results || []))
        .catch(() => [])
    : Promise.resolve([]);

  const genrePromise = genres?.[0]
    ? getUnifiedProducts({ genre_id: genres[0].id, page_size: 7 })
        .then(res => filterSelf(res?.results || []))
        .catch(() => [])
    : Promise.resolve([]);

  // ⛓️ すべての非同期リクエストが完了するまで待機（パフォーマンス最適化）
  const [actressResults, makerProducts, genreProducts] = await Promise.all([
    Promise.all(actressPromises),
    makerPromise,
    genrePromise
  ]);

  // 全ての軸においてデータがゼロの場合はセクション全体を非表示（DOMの節約）
  const hasNoData = actressResults.every(r => r.results.length === 0) && 
                    makerProducts.length === 0 && 
                    genreProducts.length === 0;

  if (hasNoData) return null;

  return (
    <section className="mt-40 pt-20 border-t border-white/5 relative overflow-hidden">
      {/* 🌌 背景装飾：サイバーパンクなグリッドライン演出 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] bg-[radial-gradient(#e94560_1px,transparent_1px)] [background-size:40px_40px]"></div>

      {/* 🏷️ セクション大見出し */}
      <div className="mb-20 relative">
        <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase flex items-baseline gap-4">
          Related_Archives
          <span className="text-xs font-mono text-pink-500 font-normal tracking-[0.5em] animate-pulse">
            [ ANALYZING_PATTERN ]
          </span>
        </h2>
        <div className="flex gap-2 mt-4 items-center">
          <span className="h-[1px] w-24 bg-gradient-to-r from-pink-500 to-transparent"></span>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            Multi-Dimensional Analysis View
          </span>
        </div>
      </div>

      {/* 👩 女優軸：ループ処理で全員分（または主要キャスト分）を個別セクション化 */}
      {actressResults.map((result) => (
        <RelatedSection 
          key={`actress-node-${result.actressId}`}
          title={`ACTRESS: ${result.actressName}`} 
          subtitle="Matching Actress Protocol: Node Synchronization"
          products={result.results} 
        />
      ))}

      {/* 🏭 メーカー軸 */}
      {maker && makerProducts.length > 0 && (
        <RelatedSection 
          title={`STUDIO: ${maker.name}`} 
          subtitle="Production Stream Sync: Archive Identification"
          products={makerProducts} 
        />
      )}

      {/* 🏷️ ジャンル軸（1件目のメインジャンルを採用） */}
      {genres?.[0] && genreProducts.length > 0 && (
        <RelatedSection 
          title={`TAG: ${genres[0].name}`} 
          subtitle="Thematic Pattern Analysis: Data Intersection"
          products={genreProducts} 
        />
      )}
    </section>
  );
}