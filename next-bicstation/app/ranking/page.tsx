/* eslint-disable @next/next/no-img-element */

import React from 'react'
import { getApiBase } from '@/shared/lib/config/api'

// -------------------------
// API取得
// -------------------------
async function fetchSidebar() {
  try {
    const base = getApiBase()

    const res = await fetch(`${base}/general/pc-sidebar-stats/`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('API ERROR:', res.status)
      return {}
    }

    return await res.json()
  } catch (e) {
    console.error('FETCH ERROR:', e)
    return {}
  }
}

// -------------------------
// ページ本体
// -------------------------
export default async function RankingIndexPage() {

  const data = await fetchSidebar() || {}

  const gpuList =
    data?.グラフィック ||
    data?.gpu ||
    data?.gpu_counts ||
    []

  const makerList =
    data?.maker_counts ||
    data?.maker ||
    []

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

        {/* 診断 */}
        <section className="mb-10">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
            <div className="text-lg font-semibold mb-2">
              👉 迷っているなら
            </div>

            <a href="/pc-finder">
              <div className="block bg-green-500 text-black font-bold py-3 rounded-lg mt-3 text-center cursor-pointer">
                3問で最適なPCを診断する
              </div>
            </a>
          </div>
        </section>

        {/* 固定ランキング */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">🏆 まずはここから</h2>

          <div className="grid gap-4">

            <a href="/ranking/score" className="card cursor-pointer">
              総合ランキング
            </a>

            <a href="/ranking/gaming" className="card cursor-pointer">
              ゲーミングPC
            </a>

            <a href="/ranking/price-low" className="card cursor-pointer">
              コスパ最強
            </a>

            <a href="/ranking/work" className="card cursor-pointer">
              ビジネスPC
            </a>

          </div>
        </section>

        {/* GPU */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">⚡ GPUで選ぶ</h2>

          <div className="grid gap-4">
            {gpuList?.slice(0, 8)?.map((g: any) => (
              <a
                key={g.slug}
                href={`/ranking/${g.slug}`}
                className="card cursor-pointer"
              >
                {g.name}
                <span className="text-xs text-gray-400 ml-2">
                  ({g.count})
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* メーカー */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">🏢 メーカーで選ぶ</h2>

          <div className="grid gap-4">
            {makerList?.slice(0, 8)?.map((m: any) => (
              <a
                key={m.maker}
                href={`/ranking/maker-${m.maker}`}
                className="card cursor-pointer"
              >
                {m.name}
                <span className="text-xs text-gray-400 ml-2">
                  ({m.count})
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mt-10">
          <a href="/ranking/score" className="text-green-400 underline cursor-pointer">
            → 迷ったら総合ランキングを見る
          </a>
        </section>

      </div>
    </main>
  )
}