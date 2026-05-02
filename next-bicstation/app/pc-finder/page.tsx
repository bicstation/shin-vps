'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ==============================
// ■ 型
// ==============================
type Product = {
  id: number
  unique_id: string
  title: string
  price: number
  tags: string[]
  ranking_score: number
}

// ==============================
// ■ 質問
// ==============================
const QUESTIONS = [
  {
    id: 'use',
    title: '何に使いますか？',
    options: [
      { label: '普段使い', value: 'light' },
      { label: '仕事', value: 'work' },
      { label: '動画編集・ゲーム', value: 'heavy' },
    ],
  },
  {
    id: 'level',
    title: 'どのくらい使いますか？',
    options: [
      { label: '軽い（ネット・動画）', value: 'low' },
      { label: '普通（仕事・複数作業）', value: 'mid' },
      { label: '重い（編集・ゲーム）', value: 'high' },
    ],
  },
  {
    id: 'priority',
    title: '何を重視しますか？',
    options: [
      { label: '価格重視', value: 'price' },
      { label: 'バランス', value: 'balance' },
      { label: '性能重視', value: 'performance' },
    ],
  },
]

// ==============================
// ■ スコア
// ==============================
function scoreProduct(product: Product, answers: any) {
  let score = 0

  if (answers.use === 'light' && product.tags.includes('普段使い快適')) score += 3
  if (answers.use === 'work' && product.tags.includes('複数作業OK')) score += 3
  if (answers.use === 'heavy' && product.tags.includes('高性能')) score += 3

  if (answers.level === 'mid' && product.tags.includes('16GB')) score += 2
  if (answers.level === 'high') score += product.ranking_score * 0.1

  if (answers.priority === 'price' && product.price < 100000) score += 2
  if (answers.priority === 'performance') score += product.ranking_score * 0.2

  return score
}

function getBestProduct(products: Product[], answers: any) {
  return products
    .map(p => ({ ...p, score: scoreProduct(p, answers) }))
    .sort((a, b) => b.score - a.score)[0]
}

// ==============================
// ■ メイン
// ==============================
export default function PCFinderPage() {
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<any>({})
  const [result, setResult] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnswer = async (value: string) => {
    if (loading) return

    const key = QUESTIONS[step].id
    const newAnswers = { ...answers, [key]: value }

    console.log('回答:', newAnswers)

    setAnswers(newAnswers)

    // 次へ
    if (step < QUESTIONS.length - 1) {
      setStep(prev => prev + 1)
      return
    }

    // ======================
    // ■ 最終：結果取得
    // ======================
    try {
      setLoading(true)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/ranking/`
      )

      const products: Product[] = await res.json()

      console.log('products:', products)

      const best = getBestProduct(products, newAnswers)

      console.log('best:', best)

      setResult(best)
    } catch (e) {
      console.error('ERROR:', e)
      alert('データ取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // ==========================
  // ■ 結果画面
  // ==========================
  if (result) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 'bold' }}>
          あなたに最適な1台
        </h2>

        <div style={{ marginTop: 12 }}>
          {result.tags?.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: 6,
                padding: '4px 8px',
                fontSize: 12,
                background: '#f3f4f6',
                borderRadius: 6,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 style={{ marginTop: 16 }}>{result.title}</h3>

        <p style={{ fontSize: 20, fontWeight: 'bold' }}>
          ¥{result.price.toLocaleString()}
        </p>

        <button
          onClick={() => router.push(`/product/${result.unique_id}`)}
          style={{
            marginTop: 16,
            width: '100%',
            padding: 14,
            background: '#2563eb',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          👉 在庫・最安値を見る
        </button>
      </div>
    )
  }

  // ==========================
  // ■ 質問画面
  // ==========================
  const current = QUESTIONS[step]

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>
        {current.title}
      </h2>

      {current.options.map(opt => (
        <button
          key={opt.value}
          onClick={() => handleAnswer(opt.value)}
          disabled={loading}
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 12,
            padding: 14,
            background: '#f9fafb',
            borderRadius: 10,
            textAlign: 'left',
            cursor: 'pointer',
            border: '1px solid #e5e7eb',
          }}
        >
          {opt.label}
        </button>
      ))}

      {loading && (
        <p style={{ marginTop: 12, fontSize: 12 }}>
          診断中...
        </p>
      )}
    </div>
  )
}