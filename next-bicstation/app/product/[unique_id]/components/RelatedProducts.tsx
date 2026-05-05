import Link from 'next/link'
import { getApiBase } from '@/shared/lib/config/api'

// -------------------------
// 🔥 match_reason変換
// -------------------------
function formatMatchReason(reasons: any): string {

  // -------------------------
  // 🔥 配列に変換
  // -------------------------
  let list: string[] = []

  if (Array.isArray(reasons)) {
    list = reasons
  } else if (typeof reasons === 'string') {
    list = reasons.split(',') // ←ここ重要
  }

  const map: Record<string, string> = {
    price: '同価格帯で比較しやすい',
    gpu: '同等のGPU性能で安心',
    usage: '同じ用途に最適',
    balance: 'バランス構成が近い',
  }

  return list
    .slice(0, 2)
    .map(r => map[r.trim()])
    .filter(Boolean)
    .join('・')
}

// -------------------------
// 🔥 関連取得（修正済み）
// -------------------------
async function fetchRelated(uniqueId: string) {
  const base = getApiBase()
  if (!base || !uniqueId) return []

  const res = await fetch(
    `${base}/general/pc-products/${uniqueId}/related/`,
    { cache: 'no-store' }
  )

  if (!res.ok) return []

  const data = await res.json()

  return Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
    ? data.results
    : []
}

// -------------------------
// 🔥 メイン
// -------------------------
export default async function RelatedProducts({ product }: any) {

  if (!product?.unique_id) return null

  const related = await fetchRelated(product.unique_id)

  if (!related?.length) return null

  return (
    <section className="mt-10 px-4">

      <h3 className="text-center text-sm text-gray-400 mb-4">
        他にも選択肢あり
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {related.slice(0, 8).map((p: any) => {

          const price =
            typeof p.price === 'number'
              ? `¥${p.price.toLocaleString()}`
              : ''

          const reason = formatMatchReason(p.match_reason || [])

          return (
            <Link
              key={p.unique_id}
              href={`/product/${p.unique_id}`}
              className="
                block bg-white/5
                border border-white/10
                rounded-lg
                overflow-hidden
                transition-all duration-200
                hover:scale-[1.02] hover:shadow-lg
              "
            >
              {/* 🖼 画像 */}
              <div className="relative">
                <img
                  src={p.image_url || '/no-image.png'}
                  alt={p.name}
                  className="h-24 w-full object-cover object-center"
                />

                <div className="absolute bottom-0 w-full h-10 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* 📦 コンテンツ */}
              <div className="p-2">

                {/* 💰 価格 */}
                {price && (
                  <div className="text-xs font-bold text-orange-400">
                    {price}
                  </div>
                )}

                {/* 💡 理由（最重要） */}
                {reason && (
                  <div className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                    {reason}
                  </div>
                )}

                {/* 🏷 タイトル */}
                <div className="text-xs text-gray-200 mt-1 line-clamp-2">
                  {p.shortTitle || p.name}
                </div>

              </div>
            </Link>
          )
        })}

      </div>

    </section>
  )
}