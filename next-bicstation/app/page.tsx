/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link from 'next/link'

import HeroRankingCard from '@/shared/components/organisms/cards/HeroRankingCard'
import ProductCard from '@/shared/components/organisms/cards/ProductCard'
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats'

import styles from './page.module.css'

export const dynamic = 'force-dynamic'

// -------------------------
// ページ本体
// -------------------------
export default async function HomePageMain() {
  let products: any[] = []

  try {
    const data = await fetchPCProductRanking('score')
    // console.log('[FETCH RESULT RAW]', data)

    const rawProducts = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
      ? data.results
      : []

    console.log('[TOP RAW COUNT]', rawProducts.length)

    products = rawProducts
  } catch (e) {
    console.error('[TOP FETCH ERROR]', e)
  }

  if (!products.length) {
    console.warn('[TOP PAGE WARNING] products array is empty')
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>⚠️ データが取得できません</h2>
        <p>APIまたはデータ状態を確認してください</p>
      </div>
    )
  }

  const top1 = products[0] ?? null
  const others = products.slice(1, 3) ?? []

  console.log('[TOP1 PRODUCT]', top1)
  console.log('[OTHERS PRODUCTS]', others)

  return (
    <div className={styles.mainWrapper}>

      {/* 🔥① ナビ */}
      <section className={styles.topNav}>
        <Link href="/ranking/score">🏆 総合</Link>
        <Link href="/ranking/gaming">🎮 ゲーミング</Link>
        <Link href="/ranking/work">💼 仕事</Link>
        <Link href="/ranking/price-low">💰 コスパ</Link>
        <Link href="/ranking/gpu-rtx-4060">⚡ RTX4060</Link>
      </section>

      {/* 🔥② HERO（決断ゾーン） */}
      {top1 && (
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            迷ったらこれでOK
          </h1>
          <p className={styles.heroSub}>
            この価格帯で一番バランスがいい構成
          </p>

          {/* HEROカード */}
          {top1 && (
            <>
              {console.log('[HERO CARD]', top1)}
              <HeroRankingCard
                product={top1 ?? {}}
                className={styles.heroCard ?? ''}
              />
            </>
          )}

          {/* CTA（1本化） */}
          {top1?.url && (
            <a
              href={top1.url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroCTA ?? ''}
            >
              👉 今すぐこの価格で購入する
            </a>
          )}

          <span className={styles.heroNotice ?? ''}>
            ※在庫切れになることがあります
          </span>
        </section>
      )}

      {/* 🔥③ 診断導線（弱め） */}
      <section className={styles.finderSection}>
        <div className={styles.finderBox}>
          <h2>迷っているなら診断で決める</h2>
          <p>質問に答えるだけで最適な1台がわかる</p>

          <Link href="/pc-finder" className={styles.finderBtn ?? ''}>
            👉 無料診断はこちら
          </Link>
        </div>
      </section>

      {/* 🔥④ 比較（補助） */}
      {others.length > 0 && (
        <section className={styles.compareSection}>
          <h3>他にも選択肢あり</h3>

          <div className={styles.grid}>
            {others.map((p: any, i: number) => {
              console.log('[PRODUCT MAP]', { index: i, product: p })

              if (!p) {
                console.warn('[MAP WARNING] undefined element at index', i)
                return null
              }

              return (
                <ProductCard
                  key={p.unique_id ?? i}
                  product={p ?? {}}
                  rank={i + 2 ?? 0}
                  className={styles.productCard ?? ''}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* 🔥⑤ 中間導線 */}
      <section className={styles.midNav}>
        <h3>目的別で探す</h3>
        <div>
          <Link href="/ranking/gaming">ゲーム用途</Link>
          <Link href="/ranking/work">仕事用途</Link>
          <Link href="/ranking/gpu-rtx-4070">高性能GPU</Link>
        </div>
      </section>

      {/* 🔥⑥ 下部導線 */}
      <section className={styles.bottomNav}>
        <Link href="/ranking">
          → すべてのランキングを見る
        </Link>
      </section>
    </div>
  )
}