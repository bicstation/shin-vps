/* eslint-disable @next/next/no-img-element */

import React from 'react'
import Link from 'next/link'
import { getApiBase } from '@/shared/lib/config/api'

// -------------------------
// API取得（完全防御）
// -------------------------
async function fetchSidebar() {
  try {
    const base = getApiBase()

    console.log('[API BASE]', base)

    // ❗ base未定義防止
    if (!base) {
      console.error('[ERROR] API BASE MISSING')
      return { gpu: [], maker_counts: [] }
    }

    const res = await fetch(`${base}/general/pc-sidebar-stats/`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[API ERROR]', res.status)
      return { gpu: [], maker_counts: [] }
    }

    const data = await res.json()

    console.log('[SIDEBAR DATA]', data)

    return {
      gpu: Array.isArray(data?.gpu) ? data.gpu : [],
      maker_counts: Array.isArray(data?.maker_counts)
        ? data.maker_counts
        : [],
    }

  } catch (e) {
    console.error('[FETCH ERROR]', e)
    return { gpu: [], maker_counts: [] }
  }
}

// -------------------------
// ページ本体
// -------------------------
export default async function RankingIndexPage() {

  const { gpu, maker_counts } = await fetchSidebar()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-white px-6 py-10">

      <div className="max-w-3xl mx-auto">

        {/* HERO */}
        <section className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">
            PCランキング一覧
          </h1>
          <p className="text-gray-400">
            用途・性能・メーカーから最適な1台を選べます
          </p>
        </section>

        {/* 固定ランキング */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">🏆 まずはここから</h2>

          <div className="grid gap-4">

            <Link href="/ranking/score" className="card hover:opacity-90">
              総合ランキング
            </Link>

            <Link href="/ranking/gaming" className="card hover:opacity-90">
              ゲーミングPC
            </Link>

            <Link href="/ranking/price-low" className="card hover:opacity-90">
              コスパ最強
            </Link>

            <Link href="/ranking/work" className="card hover:opacity-90">
              ビジネスPC
            </Link>

          </div>
        </section>

        {/* GPU */}
        {gpu.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">⚡ GPUで選ぶ</h2>

            <div className="grid grid-cols-2 gap-3">

              {gpu.slice(0, 8).map((g: any, i: number) => {
                const slug = g?.slug || `gpu-${g?.name}`

                return (
                  <Link
                    key={slug || i}
                    href={`/ranking/${slug}`}
                    className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:bg-white/10 transition"
                  >
                    <span>{g?.name || 'Unknown'}</span>
                    <span className="text-xs text-gray-400">
                      ({g?.count || 0})
                    </span>
                  </Link>
                )
              })}

            </div>
          </section>
        )}

        {/* メーカー */}
        {maker_counts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">🏢 メーカーで選ぶ</h2>

            <div className="grid grid-cols-2 gap-3">

              {maker_counts.slice(0, 8).map((m: any, i: number) => {
                const slug = m?.slug || `maker-${m?.name}`

                return (
                  <Link
                    key={slug || i}
                    href={`/ranking/${slug}`}
                    className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:bg-white/10 transition"
                  >
                    <span>{m?.name || 'Unknown'}</span>
                    <span className="text-xs text-gray-400">
                      ({m?.count || 0})
                    </span>
                  </Link>
                )
              })}

            </div>
          </section>
        )}

        {/* CTA */}
        <section className="text-center mt-10">
          <Link
            href="/ranking/score"
            className="text-green-400 underline hover:opacity-80"
          >
            → 迷ったら総合ランキングを見る
          </Link>
        </section>

      </div>
    </main>
  )
}