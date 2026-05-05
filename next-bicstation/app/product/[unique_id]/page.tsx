/* eslint-disable @next/next/no-img-element */

import { getApiBase } from '@/shared/lib/config/api'

import ProductHero from './components/ProductHero'
import ProductSpec from './components/ProductSpec'
import ProductRadar from './components/ProductRadar'
import AiSummary from './components/AiSummary'
import FinalCta from './components/FinalCta'
import RelatedProducts from './components/RelatedProducts'
import AiContent from './components/AiContent'

// -------------------------
// データ取得
// -------------------------
async function fetchProduct(unique_id: string) {
  const base = getApiBase()
  if (!base) return null

  const res = await fetch(
    `${base}/general/pc-products/${unique_id}/`,
    { cache: 'no-store' }
  )

  if (!res.ok) return null
  return res.json()
}

// -------------------------
// ページ
// -------------------------
export default async function Page({ params }: any) {

  const product = await fetchProduct(params.unique_id)

  if (!product) {
    return <div className="p-6 text-center text-white">データなし</div>
  }

  return (
    <main className="bg-[#020617] text-white">

      <ProductHero product={product} />

      <ProductSpec product={product} />

      <ProductRadar product={product} />

      <AiSummary summary={product.summary} />

      <FinalCta
        product={{
          maker: product.maker,
          name: product.name,
          image_url: product.image_url
        }}
        summary={product.summary}
        finalUrl={product.url}
        isSoftware={false}
      />

      <AiContent content={product.ai_content} />

      <RelatedProducts product={product} />

    </main>
  )
}