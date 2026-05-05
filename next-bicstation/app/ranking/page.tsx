/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { getApiBase } from '@/shared/lib/config/api'

// -------------------------
// API取得（完全防御 + 型整理）
// -------------------------
async function fetchSidebar() {
  try {
    const base = getApiBase()

    if (!base) {
      console.error('[ERROR] API BASE MISSING')
      return { gpu: [], makers: [] }
    }

    const res = await fetch(`${base}/general/pc-sidebar-stats/`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[API ERROR]', res.status)
      return { gpu: [], makers: [] }
    }

    const data = await res.json()

    return {
      gpu: Array.isArray(data?.gpu) ? data.gpu : [],
      makers: Array.isArray(data?.maker_counts)
        ? data.maker_counts
        : [],
    }
  } catch (e) {
    console.error('[FETCH ERROR]', e)
    return { gpu: [], makers: [] }
  }
}

// -------------------------
// UIパーツ
// -------------------------
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold mb-4 tracking-wide">
      {children}
    </h2>
  )
}

function CardLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="block bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:bg-white/10 transition-all hover:scale-[1.02]"
    >
      {children}
    </Link>
  )
}

// -------------------------
// ページ本体
// -------------------------
export default async function RankingIndexPage() {
  const { gpu, makers } = await fetchSidebar()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-white px-6 py-12">

      <div className="max-w-4xl mx-auto">

        {/* HERO */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            PCランキング
          </h1>
          <p className="text-gray-400 text-sm">
            用途・性能・メーカーから、最適な1台を最短で見つける
          </p>
        </section>

        {/* 固定ランキング */}
        <section className="mb-12">
          <SectionTitle>🏆 人気ランキング</SectionTitle>

          <div className="grid gap-4">

            <CardLink href="/ranking/score">
              <div className="font-semibold">総合ランキング</div>
              <div className="text-xs text-gray-400">
                迷ったらここ。全指標のバランス
              </div>
            </CardLink>

            <CardLink href="/ranking/gaming">
              <div className="font-semibold">ゲーミングPC</div>
              <div className="text-xs text-gray-400">
                FPS・高性能GPU重視
              </div>
            </CardLink>

            <CardLink href="/ranking/price-low">
              <div className="font-semibold">コスパ最強</div>
              <div className="text-xs text-gray-400">
                価格と性能のバランス
              </div>
            </CardLink>

            <CardLink href="/ranking/work">
              <div className="font-semibold">ビジネスPC</div>
              <div className="text-xs text-gray-400">
                安定性・作業効率重視
              </div>
            </CardLink>

          </div>
        </section>

        {/* GPU */}
        {gpu.length > 0 && (
          <section className="mb-12">
            <SectionTitle>⚡ GPUで選ぶ</SectionTitle>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

              {gpu.slice(0, 12).map((g: any) => {
                // ❗ slugは必須。なければ表示しない
                if (!g?.slug) return null

                return (
                  <Link
                    key={g.slug}
                    href={`/ranking/${g.slug}`}
                    className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:bg-white/10 transition"
                  >
                    <span className="text-sm">{g.name}</span>
                    <span className="text-xs text-gray-400">
                      {g.count ?? 0}
                    </span>
                  </Link>
                )
              })}

            </div>
          </section>
        )}

        {/* メーカー */}
        {makers.length > 0 && (
          <section className="mb-12">
            <SectionTitle>🏢 メーカーで選ぶ</SectionTitle>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

              {makers.slice(0, 12).map((m: any) => {
                if (!m?.slug) return null

                return (
                  <Link
                    key={m.slug}
                    href={`/ranking/${m.slug}`}
                    className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:bg-white/10 transition"
                  >
                    <span className="text-sm">{m.name}</span>
                    <span className="text-xs text-gray-400">
                      {m.count ?? 0}
                    </span>
                  </Link>
                )
              })}

            </div>
          </section>
        )}

        {/* CTA */}
        <section className="text-center mt-12">
          <Link
            href="/ranking/score"
            className="inline-block text-green-400 underline hover:opacity-80"
          >
            → まずは総合ランキングを見る
          </Link>
        </section>

      </div>
    </main>
  )
}