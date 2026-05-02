/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link from 'next/link'

import HeroRankingCard from '@/shared/components/organisms/cards/HeroRankingCard'
import ProductCard from '@/shared/components/organisms/cards/ProductCard'
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats'

export const dynamic = 'force-dynamic'

// -------------------------
// 安全fetch
// -------------------------
async function safeFetch(fetcher: any, args: any[], fallback: any) {
  try {
    const data = await fetcher(...args)
    return data ?? fallback
  } catch {
    return fallback
  }
}

// -------------------------
// タイトル変換
// -------------------------
function getTitle(type: string) {
  if (type === 'light') return '普段使い向けランキング'
  if (type === 'work') return '仕事・クリエイティブ向けランキング'
  if (type === 'gaming') return 'ゲーミングPCランキング'
  if (type === 'score') return '総合ランキング'
  return 'PCランキング'
}

// -------------------------
// ページ本体
// -------------------------
export default async function RankingPage({ params }: any) {
  const type = params.type
  const host = "bicstation.com"

  const data = await safeFetch(fetchPCProductRanking, [type, host], [])

  const products =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
      ? data.results
      : []

  if (!products.length) {
    return (
      <div className="p-10 text-center text-gray-400">
        ⚠️ データ取得中 or 商品がありません
      </div>
    )
  }

  const top1 = products[0]
  const others = products.slice(1, 6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-white px-4 py-8">

      <div className="max-w-3xl mx-auto">

        {/* =========================
          🔥 ナビ
        ========================= */}
        <section className="flex gap-3 mb-6 overflow-x-auto text-sm">
          <Link href="/ranking/score" className="px-3 py-1 bg-white/10 rounded">🏆 総合</Link>
          <Link href="/ranking/gaming" className="px-3 py-1 bg-white/10 rounded">🎮 ゲーミング</Link>
          <Link href="/ranking/price-low" className="px-3 py-1 bg-white/10 rounded">💰 コスパ</Link>
          <Link href="/ranking/gpu-rtx-4060" className="px-3 py-1 bg-white/10 rounded">⚡ RTX4060</Link>
        </section>

        {/* =========================
          🔥 タイトル
        ========================= */}
        <section className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">
            {getTitle(type)}
          </h1>
          <p className="text-gray-400 text-sm">
            今選ばれている最適な構成をランキング形式で紹介
          </p>
        </section>

        {/* =========================
          🥇 1位（ヒーロー）
        ========================= */}
        <section className="mb-8">
          <HeroRankingCard product={top1} />
        </section>

        {/* =========================
          🔥 CTA（超重要）
        ========================= */}
        {top1?.url && (
          <div className="mb-10 text-center">
            <a
              href={top1.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition"
            >
              👉 このPCでOKか確認する
            </a>
            <div className="text-xs text-gray-500 mt-2">
              在庫切れになることがあります
            </div>
          </div>
        )}

        {/* =========================
          🥈 2位以下
        ========================= */}
        <section className="mb-10">
          <h3 className="mb-4 font-semibold text-lg">
            他の人気モデル
          </h3>

          <div className="grid gap-4">
            {others.map((p: any) => (
              <ProductCard key={p.unique_id || p.id} product={p} />
            ))}
          </div>
        </section>

        {/* =========================
          🔥 診断導線
        ========================= */}
        <section className="mb-10">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">

            <h2 className="font-bold mb-2">
              迷っているなら診断で決める
            </h2>

            <p className="text-sm text-gray-400 mb-4">
              質問に答えるだけで最適な1台がわかる
            </p>

            <Link
              href="/pc-finder"
              className="inline-block bg-green-500 text-black font-bold px-6 py-3 rounded-lg hover:opacity-90"
            >
              👉 無料で診断する
            </Link>

          </div>
        </section>

        {/* =========================
          🔥 下部ナビ
        ========================= */}
        <section className="text-center">
          <Link href="/ranking" className="text-green-400 underline">
            → すべてのランキングを見る
          </Link>
        </section>

      </div>
    </div>
  )
}