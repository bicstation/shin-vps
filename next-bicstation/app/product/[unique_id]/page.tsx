/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { getApiBase } from "@/shared/lib/config/api"

type Props = {
  params: { unique_id: string }
}

// -------------------------
// 商品取得
// -------------------------
async function fetchProduct(unique_id: string) {
  try {
    const base = getApiBase()
    if (!base) return null

    const res = await fetch(
      `${base}/general/pc-products/${unique_id}/`,
      { cache: "no-store" }
    )

    if (!res.ok) return null
    return await res.json()

  } catch {
    return null
  }
}

// -------------------------
// 関連
// -------------------------
async function fetchRelated(type: string) {
  try {
    const base = getApiBase()
    if (!base) return []

    const res = await fetch(
      `${base}/general/pc-products/ranking/${type}/`,
      { cache: "no-store" }
    )

    if (!res.ok) return []

    const data = await res.json()
    return Array.isArray(data) ? data : []

  } catch {
    return []
  }
}

// -------------------------
// ページ
// -------------------------
export default async function ProductPage({ params }: Props) {

  const { unique_id } = params
  const product = await fetchProduct(unique_id)

  if (!product) {
    return (
      <main className="p-6 text-white">
        <p>データなし</p>
      </main>
    )
  }

  const related = product?.gpu_model
    ? await fetchRelated(`gpu-${product.gpu_model.toLowerCase().replace(/\s+/g, "-")}`)
    : []

  return (
    <main className="min-h-screen bg-[#020617] text-white px-4 py-8">

      <div className="max-w-5xl mx-auto space-y-10">

        {/* 🔥 HERO（決断ゾーン） */}
        <section className="text-center space-y-4">

          {/* 結論 */}
          <h1 className="text-xl font-bold text-yellow-400">
            この価格帯ならこれでOK
          </h1>

          {/* 価格（主役） */}
          <div className="text-4xl font-extrabold text-orange-400">
            ¥{product.price?.toLocaleString() ?? "-"}
          </div>

          {/* CTA */}
          <a
            href="#buy"
            className="
              block w-full max-w-md mx-auto
              bg-orange-500
              text-white
              py-4 rounded-xl
              font-bold text-lg
              shadow-lg
            "
          >
            👉 今すぐこの価格で購入する
          </a>

          <p className="text-xs text-gray-400">
            ※在庫切れになる場合があります
          </p>

        </section>

        {/* 📦 メイン */}
        <section className="grid md:grid-cols-2 gap-6">

          {/* 画像 */}
          <div className="bg-black/30 rounded-xl overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-[320px] object-contain"
            />
          </div>

          {/* 情報 */}
          <div className="space-y-4">

            <h2 className="text-lg font-bold">
              {product.name}
            </h2>

            <div className="space-y-2 text-sm text-gray-300">
              <p>CPU: {product.cpu_model || "-"}</p>
              <p>GPU: {product.gpu_model || "-"}</p>
              <p>メモリ: {product.memory || "-"}</p>
              <p>ストレージ: {product.storage || "-"}</p>
            </div>

          </div>
        </section>

        {/* 🔁 CTA再提示 */}
        <section className="text-center">
          <a
            href="#buy"
            id="buy"
            className="
              block w-full max-w-md mx-auto
              bg-orange-500
              text-white
              py-4 rounded-xl
              font-bold
            "
          >
            👉 在庫があるうちに最安を確認する
          </a>
        </section>

        {/* 🔗 関連（弱く） */}
        {related.length > 0 && (
          <section>
            <h2 className="text-sm text-gray-400 mb-4">
              他にも選択肢あり
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.slice(0, 8).map((p: any) => {
                if (!p?.unique_id) return null

                return (
                  <Link
                    key={p.unique_id}
                    href={`/product/${p.unique_id}`}
                    className="block bg-white/5 rounded-lg p-2"
                  >
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-20 object-cover mb-1"
                    />

                    <div className="text-[10px] line-clamp-2 text-gray-300">
                      {p.name}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* 戻る */}
        <div className="text-center">
          <Link href="/ranking" className="text-xs text-gray-500 underline">
            ← ランキングに戻る
          </Link>
        </div>

      </div>
    </main>
  )
}