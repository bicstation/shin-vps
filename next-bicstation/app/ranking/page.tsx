/* eslint-disable @next/next/no-img-element */

import React from 'react'
import Link from 'next/link'

async function fetchSidebar() {
  const res = await fetch('http://localhost:8083/api/general/pc-sidebar-stats/', {
    cache: 'no-store',
  })

  if (!res.ok) return null

  return res.json()
}

export default async function RankingIndexPage() {

  const data = await fetchSidebar()

  const gpuList = data?.グラフィック || []
  const makerList = data?.maker_counts || []

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

            <Link
              href="/pc-finder"
              className="block bg-green-500 text-black font-bold py-3 rounded-lg mt-3"
            >
              3問で最適なPCを診断する
            </Link>
          </div>
        </section>

        {/* =========================
          🏆 固定（重要）
        ========================= */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">🏆 まずはここから</h2>

          <div className="grid gap-4">
            <Link href="/ranking/score" className="card">総合ランキング</Link>
            <Link href="/ranking/gaming" className="card">ゲーミングPC</Link>
            <Link href="/ranking/price-low" className="card">コスパ最強</Link>
            <Link href="/ranking/work" className="card">ビジネスPC</Link>
          </div>
        </section>

        {/* =========================
          ⚡ GPU（DB）
        ========================= */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">⚡ GPUで選ぶ</h2>

          <div className="grid gap-4">
            {gpuList.slice(0, 8).map((g: any) => (
              <Link
                key={g.slug}
                href={`/ranking/${g.slug}`}
                className="card"
              >
                {g.name}
                <span className="text-xs text-gray-400 ml-2">
                  ({g.count})
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* =========================
          🏢 メーカー（DB）
        ========================= */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">🏢 メーカーで選ぶ</h2>

          <div className="grid gap-4">
            {makerList.slice(0, 8).map((m: any) => (
              <Link
                key={m.maker}
                href={`/ranking/maker-${m.maker}`}
                className="card"
              >
                {m.name}
                <span className="text-xs text-gray-400 ml-2">
                  ({m.count})
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mt-10">
          <Link href="/ranking/score" className="text-green-400 underline">
            → 迷ったら総合ランキングを見る
          </Link>
        </section>

      </div>
    </main>
  )
}