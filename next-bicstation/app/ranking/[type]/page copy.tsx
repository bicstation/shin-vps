/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link from 'next/link'

import HeroRankingCard from '@/shared/components/organisms/cards/HeroRankingCard'
import ProductCard from '@/shared/components/organisms/cards/ProductCard'
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats'

export const dynamic = 'force-dynamic'

// -------------------------
// 安全fetch（強化版）
// -------------------------
async function safeFetch(fetcher: any, args: any[], fallback: any) {
  try {
    const data = await fetcher(...args)

    if (!data) {
      console.warn('[SAFE FETCH EMPTY]', args)
      return fallback
    }

    return data
  } catch (e) {
    console.error('[SAFE FETCH ERROR]', e)
    return fallback
  }
}

// -------------------------
// タイトル
// -------------------------
function getTitle(type: string) {
  switch (type) {
    case 'gaming':
      return '🎮 ゲーミングPCランキング'
    case 'work':
      return '💼 仕事・クリエイティブ向け'
    case 'price-low':
      return '💰 コスパ最強ランキング'
    default:
      return '🏆 総合ランキング'
  }
}

// -------------------------
// type正規化（重要）
// -------------------------
function normalizeType(type: string) {
  const valid = ['score', 'gaming', 'work', 'price-low']
  return valid.includes(type) ? type : 'score'
}

// -------------------------
// ページ本体
// -------------------------
export default async function RankingPage({ params }: any) {

  const rawType = params?.type || 'score'
  const type = normalizeType(rawType)

  // 🔥 API呼び出し（安定）
  const data = await safeFetch(
    fetchPCProductRanking,
    [type, 'score'],
    []
  )

  // 🔥 データ正規化（強化）
  let products: any[] = []

  if (Array.isArray(data)) {
    products = data
  } else if (data?.results && Array.isArray(data.results)) {
    products = data.results
  } else {
    console.warn('[INVALID DATA FORMAT]', data)
    products = []
  }

  // 🔥 デバッグ（重要）
  console.log('[RANKING]', {
    type,
    count: products.length,
  })

  if (!products.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        ⚠️ データがありません
      </div>
    )
  }

  const top1 = products[0]
  const others = products.slice(1, 6)

  return (
    <div style={{ padding: '20px', maxWidth: '720px', margin: '0 auto' }}>

      {/* =========================
         ナビ（上）
      ========================= */}
      <section style={{
        marginBottom: '20px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <Link href="/ranking/score">🏆 総合</Link>
        <Link href="/ranking/gaming">🎮 ゲーミング</Link>
        <Link href="/ranking/work">💼 仕事</Link>
        <Link href="/ranking/price-low">💰 コスパ</Link>
      </section>

      {/* =========================
         タイトル
      ========================= */}
      <section>
        <h1>{getTitle(type)}</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          今選ばれている最適な構成をランキング形式で紹介
        </p>
      </section>

      {/* =========================
         👑 1位（最重要）
      ========================= */}
      <section style={{ marginTop: '20px' }}>
        <HeroRankingCard product={top1} />
      </section>

      {/* =========================
         CTA（即行動）
      ========================= */}
      {top1?.url && (
        <div style={{
          margin: '20px 0',
          padding: '16px',
          background: '#f97316',
          color: '#fff',
          textAlign: 'center',
          borderRadius: '12px',
          fontWeight: '700'
        }}>
          <a href={top1.url} target="_blank" rel="noopener noreferrer">
            👉 今すぐ最安価格をチェック
          </a>
        </div>
      )}

      {/* =========================
         ⚔ 比較ゾーン（重要）
      ========================= */}
      <section style={{ marginTop: '30px' }}>
        <h2>⚔ 人気モデルを比較</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: '12px',
          marginTop: '10px'
        }}>
          {others.map((p: any) => (
            <ProductCard key={p.id || p.unique_id} product={p} />
          ))}
        </div>
      </section>

      {/* =========================
         🧠 迷い回収（診断）
      ========================= */}
      <section style={{
        marginTop: '30px',
        padding: '20px',
        background: '#f8fafc',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h2>迷っているなら診断が一番早い</h2>
        <p style={{ fontSize: '14px', color: '#666' }}>
          質問に答えるだけで最適な1台がわかる
        </p>

        <Link href="/pc-finder" style={{
          display: 'inline-block',
          marginTop: '10px',
          padding: '12px 18px',
          background: '#111827',
          color: '#fff',
          borderRadius: '10px',
          fontWeight: '700'
        }}>
          👉 無料で診断する
        </Link>
      </section>

      {/* =========================
         下ナビ
      ========================= */}
      <section style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link href="/ranking">
          → 他のランキングを見る
        </Link>
      </section>

    </div>
  )
}