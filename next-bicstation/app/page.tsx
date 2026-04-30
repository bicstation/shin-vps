/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link from 'next/link';

import HeroRankingCard from '@/shared/components/organisms/cards/HeroRankingCard';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats';
import { transformProducts } from '@/shared/lib/domain/product/transform';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';

async function safeFetch(fetcher: any, args: any[], fallback: any) {
  try {
    const data = await fetcher(...args);
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export default async function HomePageMain() {

  const host = "bicstation.com";

  const data = await safeFetch(fetchPCProductRanking, ['score', host], []);
  const rawProducts = Array.isArray(data) ? data : (data?.results || []);

  const products = transformProducts(rawProducts);

  if (!products.length) return null;

  const top1 = products[0];
  const others = products.slice(1, 3);

  return (
    <div className={styles.mainWrapper}>

      {/* 🔥① 最強導線 */}
      <section className={styles.topNav}>
        <Link href="/ranking/score">🏆 総合</Link>
        <Link href="/ranking/gaming">🎮 ゲーミング</Link>
        <Link href="/ranking/price-low">💰 コスパ</Link>
        <Link href="/ranking/gpu-rtx-4060">⚡ RTX4060</Link>
      </section>

      {/* 🔥② 診断導線（超重要） */}
      <section className={styles.finderSection}>
        <div className={styles.finderBox}>
          <h2>迷ってるなら診断で決める</h2>
          <p>質問に答えるだけで最適な1台がわかる</p>

          <Link href="/pc-finder" className={styles.finderBtn}>
            👉 無料で診断する
          </Link>
        </div>
      </section>

      {/* 🔥③ HERO */}
      <section className={styles.hero}>

        <h1>
          迷ったらこれ。今一番バランスがいい構成
        </h1>

        <p>
          性能・価格・用途のバランスで選ぶならこれ1台
        </p>

        <HeroRankingCard product={top1} />

      </section>

      {/* 🔥④ CTA */}
      {top1.url && (
        <div className={styles.ctaPrimary}>
          <a href={top1.url} target="_blank" rel="noopener noreferrer">
            🔥 最安価格をチェック（在庫あり）
          </a>
          <span>在庫切れになることがあります</span>
        </div>
      )}

      {/* 🔥⑤ 比較 */}
      <section className={styles.compareSection}>
        <h3>この価格帯でよく比較されるモデル</h3>

        <div className={styles.grid}>
          {others.map((p: any) => (
            <ProductCard key={p.unique_id} product={p} />
          ))}
        </div>
      </section>

      {/* 🔥⑥ 中間導線 */}
      <section className={styles.midNav}>
        <h3>目的別に比較する</h3>

        <div>
          <Link href="/ranking/gaming">ゲーム用途</Link>
          <Link href="/ranking/business">仕事用途</Link>
          <Link href="/ranking/gpu-rtx-4070">高性能GPU</Link>
        </div>
      </section>

      {/* 🔥⑦ 下部導線 */}
      <section className={styles.bottomNav}>
        <Link href="/ranking">
          → すべてのランキングを見る
        </Link>
      </section>

      {/* 🔥⑧ CTA再提示 */}
      {top1.url && (
        <div className={styles.ctaSecondary}>
          <a href={top1.url} target="_blank" rel="noopener noreferrer">
            👉 迷ったらこれでOK
          </a>
        </div>
      )}

    </div>
  );
}