/* eslint-disable @next/next/no-img-element */

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

import styles from './Ranking.module.css';

import { transformProducts } from '@/shared/lib/domain/product/transform';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import HeroRankingCard from '@/shared/components/organisms/cards/HeroRankingCard';

/** 🔥 API */
const API =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://django-v3:8000';

/** 🔥 設定 */
const RANKING_CONFIG: Record<string, any> = {
  score: {
    title: "PC総合ランキング",
    description: "迷ったらこれ。失敗しないPCランキング",
    heroTitle: "迷ったらこれを選べばOK",
    heroSub: "性能・価格・用途のバランス最強"
  },

  gaming: {
    title: "ゲーミングPCおすすめ",
    description: "FPS・高負荷ゲームも快適",
    heroTitle: "ゲームするならこの構成",
    heroSub: "フレームレート重視"
  },

  "price-low": {
    title: "安いPCランキング",
    description: "コスパ重視で選ぶならこれ",
    heroTitle: "安くても後悔しない構成",
    heroSub: "最低限＋快適ライン"
  },

  business: {
    title: "ビジネスPCランキング",
    description: "仕事効率が上がるPC",
    heroTitle: "仕事でストレスを減らす",
    heroSub: "軽さ・安定性重視"
  },

  // 🔥 GPU
  "gpu-rtx-4060": {
    title: "RTX4060搭載PCランキング",
    description: "コスパ最強GPUで選ぶならこれ",
    heroTitle: "迷ったらRTX4060",
    heroSub: "性能と価格のバランス最強"
  },

  "gpu-rtx-4070": {
    title: "RTX4070搭載PCランキング",
    description: "高性能ゲーミングPC",
    heroTitle: "ワンランク上ならRTX4070",
    heroSub: "重いゲームも快適"
  },

  "gpu-high": {
    title: "ハイエンドPCランキング",
    description: "RTX4080以上の最強構成",
    heroTitle: "妥協しない最強スペック",
    heroSub: "価格より性能重視"
  },

  // 🔥 メーカー（追加）
  "maker-asus": {
    title: "ASUS PCランキング",
    description: "ASUS製PCのおすすめランキング",
    heroTitle: "ASUSで選ぶならこれ",
    heroSub: "品質と性能のバランスが強い"
  },

  "maker-dell": {
    title: "Dell PCランキング",
    description: "Dell製PCのおすすめランキング",
    heroTitle: "DellならこれでOK",
    heroSub: "安定性とコスパ重視"
  },

  "maker-hp": {
    title: "HP PCランキング",
    description: "HP製PCのおすすめランキング",
    heroTitle: "HPの鉄板構成",
    heroSub: "ビジネスからゲーミングまで対応"
  },

  "maker-lenovo": {
    title: "Lenovo PCランキング",
    description: "Lenovo製PCのおすすめランキング",
    heroTitle: "Lenovoで選ぶならこれ",
    heroSub: "コスパと信頼性が強い"
  },
};

interface PageProps {
  params: { type: string };
}

/** 🔥 metadata */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const config = RANKING_CONFIG[params.type] || RANKING_CONFIG.score;

  return {
    title: config.title,
    description: config.description,
  };
}

/** 🔥 本体 */
export default async function RankingPage({ params }: PageProps) {

  const type = params.type || "score";
  const config = RANKING_CONFIG[type] || RANKING_CONFIG.score;

  let products: any[] = [];

  try {
    const res = await fetch(
      `${API}/api/products/ranking/?type=${type}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      const raw = await res.json();
      products = transformProducts(raw);
    }
  } catch {
    // noop
  }

  if (!products.length) {
    return (
      <main className={styles.container}>
        <div className={styles.noData}>
          データが見つかりませんでした
        </div>

        {/* 🔗 フォールバック導線 */}
        <section className={styles.links}>
          <h3>他のランキングを見る</h3>
          <div className={styles.linkGrid}>
            <Link href="/ranking/score">総合</Link>
            <Link href="/ranking/gaming">ゲーミング</Link>
          </div>
        </section>
      </main>
    );
  }

  const hero = products[0];
  const list = products.slice(1);

  return (
    <main className={styles.container}>

      {/* 🔥 HERO */}
      <section className={styles.heroText}>
        <h1>{config.heroTitle}</h1>
        <p>{config.heroSub}</p>

        {/* 🔥 件数表示（地味に効く） */}
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
          {products.length}件から厳選
        </div>
      </section>

      {/* 🏆 1位 */}
      {hero && (
        <div className={styles.heroCardWrapper}>
          <HeroRankingCard product={hero} />
        </div>
      )}

      {/* 📊 一覧 */}
      <div className={styles.grid}>
        {list.map((product: any) => (
          <ProductCard
            key={product.unique_id}
            product={product}
          />
        ))}
      </div>

      {/* 🔥 GPU導線 */}
      {type.includes("gpu") && (
        <section className={styles.links}>
          <h3>他のGPUも比較する</h3>

          <div className={styles.linkGrid}>
            <Link href="/ranking/gpu-rtx-4060">RTX4060</Link>
            <Link href="/ranking/gpu-rtx-4070">RTX4070</Link>
            <Link href="/ranking/gpu-high">ハイエンド</Link>
          </div>
        </section>
      )}

      {/* 🔥 メーカー導線 */}
      {type.includes("maker") && (
        <section className={styles.links}>
          <h3>他のメーカーも比較</h3>

          <div className={styles.linkGrid}>
            <Link href="/ranking/maker-asus">ASUS</Link>
            <Link href="/ranking/maker-dell">Dell</Link>
            <Link href="/ranking/maker-hp">HP</Link>
            <Link href="/ranking/maker-lenovo">Lenovo</Link>
          </div>
        </section>
      )}

      {/* 🔗 基本カテゴリ */}
      <section className={styles.links}>
        <h3>カテゴリ別ランキング</h3>

        <div className={styles.linkGrid}>
          <Link href="/ranking/score">総合</Link>
          <Link href="/ranking/gaming">ゲーミング</Link>
          <Link href="/ranking/price-low">コスパ</Link>
          <Link href="/ranking/business">ビジネス</Link>
        </div>
      </section>

    </main>
  );
}