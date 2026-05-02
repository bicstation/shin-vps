'use client'

import { useState } from 'react'

type Answers = {
  use?: 'light' | 'work' | 'gaming'
  level?: 'low' | 'high'
  priority?: 'price' | 'performance'
}

export default function PCFinderPage() {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>({})
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // -------------------------
  // 回答処理
  // -------------------------
  const handleAnswer = (key: keyof Answers, value: string) => {
    const next = { ...answers, [key]: value }
    setAnswers(next)

    if (step < 3) {
      setStep(step + 1)
    } else {
      fetchResult(next)
    }
  }
  // -------------------------
  // API呼び出し
  // -------------------------
  const fetchResult = async (data: Answers) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/finder/recommend/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )

      const text = await res.text()

      let json: any
      try {
        json = JSON.parse(text)
      } catch {
        throw new Error('APIレスポンスが不正です')
      }

      if (!res.ok) {
        throw new Error(json.error || 'API error')
      }

      setResult(json)
    } catch (e: any) {
      console.error(e)
      setError(e.message || '診断に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // LOADING
  // -------------------------
  if (loading) {
    return (
      <div className="p-6 text-center">
        最適な1台を選定中...
      </div>
    )
  }

  // -------------------------
  // ERROR
  // -------------------------
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={() => {
            setStep(1)
            setAnswers({})
            setResult(null)
          }}
        >
          もう一度診断する
        </button>
      </div>
    )
  }

  // -------------------------
  // RESULT（ここがコア）
  // -------------------------

  if (result && result.product) {
    const image = result.product.image?.replace(
      'http://django-v3:8000',
      'http://localhost:8083'
    )

    console.log(result.reasons[0])

    const parseSummary = (text: string) => {
      if (!text) return { points: [], target: '' }

      // 🔥 ここが抜けてると死ぬ
      const clean = text
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      const points: string[] = []
      let target = ''

      const p1 = clean.match(/POINT1:\s*(.*?)(?=POINT2:|POINT3:|TARGET:|$)/)
      const p2 = clean.match(/POINT2:\s*(.*?)(?=POINT3:|TARGET:|$)/)
      const p3 = clean.match(/POINT3:\s*(.*?)(?=TARGET:|$)/)
      const tg = clean.match(/TARGET:\s*(.*?)(?=$)/)

      if (p1) points.push(p1[1].trim())
      if (p2) points.push(p2[1].trim())
      if (p3) points.push(p3[1].trim())
      if (tg) target = tg[1].trim()

      return { points, target }
    }
   
    const { points, target } = parseSummary(result.reasons?.[0] || '')

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-white">

        {/* =========================
          ヒーロー（診断結果）
        ========================= */}
        <div className="relative overflow-hidden px-6 py-10 text-center">

          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,#22c55e,transparent_60%)]" />

          <div className="relative z-10 max-w-xl mx-auto">

            <div className="text-sm text-gray-400 mb-2">
              あなたの診断結果
            </div>

            <h1 className="text-2xl font-bold mb-4">
              最適な1台を選定しました
            </h1>

            {/* バッジ */}
            <div className="flex justify-center gap-3 flex-wrap">
              <div className="px-4 py-1 text-xs rounded-full bg-white/10 border border-white/20">
                {result.debug?.use === 'light' && '普段使い'}
                {result.debug?.use === 'work' && '仕事・クリエイティブ'}
                {result.debug?.use === 'gaming' && 'ゲーム'}
              </div>

              <div className="px-4 py-1 text-xs rounded-full bg-white/10 border border-white/20">
                {result.debug?.level === 'low' ? 'ライト' : 'ヘビー'}
              </div>

              <div className="px-4 py-1 text-xs rounded-full bg-white/10 border border-white/20">
                {result.debug?.priority === 'price' ? 'コスパ重視' : '性能重視'}
              </div>
            </div>

          </div>
        </div>

        {/* =========================
          商品カード（主役）
        ========================= */}
        <div className="max-w-xl mx-auto px-6 pb-12">

          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 shadow-2xl border border-white/10">

            {/* タイトル */}
            <h2 className="text-lg font-semibold mb-2">
              {result.product.title}
            </h2>

            {/* 価格 */}
            <div className="text-3xl font-bold text-green-400 mb-4">
              ¥{Number(result.product.price || 0).toLocaleString()}
            </div>

            {/* 画像 */}
            {image && (
              <div className="mb-6 overflow-hidden rounded-lg">
                <img
                  src={image}
                  alt={result.product.title}
                  className="w-full hover:scale-105 transition duration-300"
                />
              </div>
            )}

            {/* AI理由 */}
            {result.reasons?.[0] && (
              <div className="mb-6 text-sm leading-relaxed text-gray-300 bg-white/5 p-4 rounded-lg border border-white/10">
                
                <ul className="space-y-3 mb-4">
                  {points.map((p, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✔</span>
                      <span className="text-sm text-gray-300">
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>

                {target && (
                  <div className="text-xs text-gray-400">
                    🎯 このPCが向いている人：{target}
                  </div>
                )}

              </div>
            )}

            {/* 決断コピー */}
            <div className="mb-6 text-center font-bold text-green-400">
              👉 この1台を選べば間違いありません
            </div>

            {/* CTA */}
            <a
              href={result.product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-4 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition shadow-lg"
            >
              👉 今すぐチェックする
            </a>

          </div>

          {/* 再診断 */}
          <div className="text-center mt-6">
            <button
              className="text-sm text-gray-400 hover:text-white transition underline"
              onClick={() => {
                setStep(1)
                setAnswers({})
                setResult(null)
              }}
            >
              もう一度診断する
            </button>
          </div>

        </div>

      </div>
    )
  }
  // -------------------------
  // 質問UI
  // -------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-white flex items-center justify-center px-6">

      <div className="w-full max-w-xl">

        {/* タイトル */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2">
            PC診断
          </h1>
          <p className="text-sm text-gray-400">
            あなたに最適な1台をAIが選びます
          </p>
        </div>

        {/* =========================
          質問カード
        ========================= */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl">

          {/* ステップ表示 */}
          <div className="text-xs text-gray-400 mb-4">
            STEP {step} / 3
          </div>

          {/* 質問 */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold mb-6">
                用途を選んでください
              </h2>

              <div className="grid gap-4">
                <button
                  onClick={() => handleAnswer('use', 'light')}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition text-left"
                >
                  <div className="font-semibold">普段使い</div>
                  <div className="text-sm text-gray-400">
                    ネット・動画・軽作業
                  </div>
                </button>

                <button
                  onClick={() => handleAnswer('use', 'work')}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition text-left"
                >
                  <div className="font-semibold">仕事・クリエイティブ</div>
                  <div className="text-sm text-gray-400">
                    画像編集・開発・複数作業
                  </div>
                </button>

                <button
                  onClick={() => handleAnswer('use', 'gaming')}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition text-left"
                >
                  <div className="font-semibold">ゲーム</div>
                  <div className="text-sm text-gray-400">
                    高性能GPUが必要な用途
                  </div>
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold mb-6">
                使用レベルを選んでください
              </h2>

              <div className="grid gap-4">
                <button
                  onClick={() => handleAnswer('level', 'low')}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition text-left"
                >
                  <div className="font-semibold">ライト</div>
                  <div className="text-sm text-gray-400">
                    基本的な用途中心
                  </div>
                </button>

                <button
                  onClick={() => handleAnswer('level', 'high')}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition text-left"
                >
                  <div className="font-semibold">しっかり使う</div>
                  <div className="text-sm text-gray-400">
                    長時間・高負荷作業
                  </div>
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold mb-6">
                重視するポイントを選んでください
              </h2>

              <div className="grid gap-4">
                <button
                  onClick={() => handleAnswer('priority', 'price')}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition text-left"
                >
                  <div className="font-semibold">価格重視</div>
                  <div className="text-sm text-gray-400">
                    コストパフォーマンス優先
                  </div>
                </button>

                <button
                  onClick={() => handleAnswer('priority', 'performance')}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition text-left"
                >
                  <div className="font-semibold">性能重視</div>
                  <div className="text-sm text-gray-400">
                    スペックを最優先
                  </div>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  )
}