/* eslint-disable @next/next/no-img-element */

import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "PCランキング一覧｜用途・GPU・メーカー別",
  description: "目的・GPU・メーカー別にPCランキングを比較。失敗しない選び方ができます。",
}

const CATEGORY_GROUPS = [
  {
    title: "🏆 まずはここから",
    items: [
      {
        title: "総合ランキング",
        desc: "迷ったらこれ。失敗しないPC",
        href: "/ranking/score",
      },
      {
        title: "ゲーミングPC",
        desc: "ゲームするならこの構成",
        href: "/ranking/gaming",
      },
      {
        title: "コスパ重視",
        desc: "安くても後悔しない",
        href: "/ranking/price-low",
      },
      {
        title: "ビジネスPC",
        desc: "仕事効率を上げる",
        href: "/ranking/business",
      },
    ],
  },
  {
    title: "⚡ GPUで選ぶ",
    items: [
      {
        title: "RTX 4060",
        desc: "一番バランスがいいGPU",
        href: "/ranking/gpu-rtx-4060",
      },
      {
        title: "RTX 4070",
        desc: "ワンランク上の性能",
        href: "/ranking/gpu-rtx-4070",
      },
      {
        title: "RTX 4080以上",
        desc: "ハイエンド構成",
        href: "/ranking/gpu-high",
      },
    ],
  },
  {
    title: "🏢 メーカーで選ぶ",
    items: [
      {
        title: "ASUS",
        desc: "人気No.1メーカー",
        href: "/ranking/maker-asus",
      },
      {
        title: "Dell",
        desc: "安定・コスパ",
        href: "/ranking/maker-dell",
      },
      {
        title: "HP",
        desc: "ビジネスに強い",
        href: "/ranking/maker-hp",
      },
      {
        title: "Lenovo",
        desc: "コスパ最強",
        href: "/ranking/maker-lenovo",
      },
    ],
  },
]

export default function RankingIndexPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-white px-6 py-10">

      <div className="max-w-3xl mx-auto">

        {/* =========================
          HERO
        ========================= */}
        <section className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">
            PCランキング一覧
          </h1>
          <p className="text-gray-400">
            用途・性能・メーカーから最適な1台を選べます
          </p>
        </section>

        {/* =========================
          🔥 最強導線（重要）
        ========================= */}
        <section className="mb-10">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">

            <div className="text-lg font-semibold mb-2">
              👉 迷っているなら
            </div>

            <Link
              href="/pc-finder"
              className="block bg-green-500 text-black font-bold py-3 rounded-lg mt-3 hover:opacity-90 transition"
            >
              3問で最適なPCを診断する
            </Link>

          </div>
        </section>

        {/* =========================
          カテゴリ
        ========================= */}
        {CATEGORY_GROUPS.map((group) => (
          <section key={group.title} className="mb-10">

            <h2 className="text-xl font-bold mb-4">
              {group.title}
            </h2>

            <div className="grid gap-4">

              {group.items.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="block p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition"
                >
                  <div className="font-semibold mb-1">
                    {cat.title}
                  </div>
                  <div className="text-sm text-gray-400">
                    {cat.desc}
                  </div>
                </Link>
              ))}

            </div>

          </section>
        ))}

        {/* =========================
          CTA
        ========================= */}
        <section className="text-center mt-10">

          <Link
            href="/ranking/score"
            className="text-green-400 underline"
          >
            → 迷ったら総合ランキングを見る
          </Link>

        </section>

      </div>
    </main>
  )
}