// /home/maya/shin-vps/next-bicstation/app/ranking/[slug]/page.tsx

import Link from 'next/link'

import {
  fetchSemanticRankingRuntime,
} from '@/shared/lib/api/django/pc/ranking/fetchSemanticRankingRuntime'

type PageProps = {
  params: Promise<{
    slug: string
  }>

  searchParams: Promise<{
    debug?: string
  }>
}

export default async function RankingSlugPage({
  params,
  searchParams,
}: PageProps) {

  const { slug } =
    await params

  const { debug } =
    await searchParams

  const data =
    await fetchSemanticRankingRuntime(
      slug
    )

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">

      {/* SEO */}
      <section className="mb-10">

        <h1 className="text-4xl font-bold mb-4">
          {data.seo?.title}
        </h1>

        <p className="text-gray-400">
          {data.seo?.description}
        </p>

      </section>

      {/* Breadcrumbs */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-10">

        {(data.breadcrumbs || []).map(
          (item: any, index: number) => (

            <div
              key={index}
              className="flex items-center gap-2"
            >

              <Link
                href={item.url}
                className="hover:text-white transition"
              >
                {item.name}
              </Link>

              {index <
                data.breadcrumbs.length - 1 && (

                <span className="text-gray-700">
                  ›
                </span>

              )}

            </div>
          )
        )}

      </nav>

      {/* Products */}
      <section className="mb-16">

        <h2 className="text-2xl font-bold mb-6">
          ランキング商品
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {(data.products || []).map(
            (product: any) => (

              <article
                key={product.id}
                className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur"
              >

                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-56 object-cover rounded-xl mb-4"
                  />
                )}

                <h3 className="text-xl font-semibold mb-2">
                  {product.name}
                </h3>

                <div className="text-sm text-gray-400 mb-4">
                  {product.maker}
                </div>

                <div className="text-2xl font-bold mb-4">
                  ¥{Number(product.price).toLocaleString()}
                </div>

                {/* grouped attributes */}
                <div className="flex flex-wrap gap-2 mb-4">

                  {Object.entries(
                    product.grouped_attributes || {}
                  ).map(
                    ([groupKey, attrs]: any) =>

                      attrs.map((attr: any) => (

                        <div
                          key={attr.slug}
                          className="text-xs px-3 py-1 rounded-full bg-white/10"
                        >
                          {attr.name}
                        </div>

                      ))
                  )}

                </div>

                <p className="text-sm text-gray-300 mb-4">
                  {product.recommendation_reason}
                </p>

                <a
                  href={product.affiliate_url}
                  target="_blank"
                  className="inline-block px-4 py-2 rounded-xl bg-white text-black text-sm font-medium"
                >
                  詳細を見る
                </a>

              </article>
            )
          )}

        </div>

      </section>

      {/* FAQ */}
      <section className="mb-16">

        <h2 className="text-2xl font-bold mb-6">
          FAQ
        </h2>

        <div className="space-y-6">

          {(data.faq || []).map(
            (faq: any, index: number) => (

              <div
                key={index}
                className="border border-white/10 rounded-xl p-5"
              >

                <h3 className="font-semibold mb-2">
                  {faq.question}
                </h3>

                <p className="text-gray-400 text-sm">
                  {faq.answer}
                </p>

              </div>
            )
          )}

        </div>

      </section>

      {/* DEBUG */}
      {debug === '1' && (

        <section className="mt-20">

          <h2 className="text-xl font-bold mb-4">
            Debug JSON
          </h2>

          <pre className="text-xs text-green-400 overflow-auto border border-white/10 rounded-xl p-4 bg-black">
            {JSON.stringify(data, null, 2)}
          </pre>

        </section>

      )}

    </main>
  )
}