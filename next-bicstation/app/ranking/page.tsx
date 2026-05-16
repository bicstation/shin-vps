// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/page.tsx

import Link from 'next/link'

import {
  fetchSemanticGroupedAttributes,
} from '@/shared/lib/api/django/pc/semantic/fetchSemanticGroupedAttributes'

type PageProps = {
  searchParams: Promise<{
    debug?: string
  }>
}

export default async function RankingPage({
  searchParams,
}: PageProps) {

  const { debug } =
    await searchParams

  const data =
    await fetchSemanticGroupedAttributes()

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold mb-10">
        ランキングカテゴリ
      </h1>

      <div className="space-y-12">
        {Object.entries(data).map(
          ([groupKey, attributes]: any) => (
            <section key={groupKey}>

              <h2 className="text-2xl font-semibold mb-4 capitalize">
                {groupKey}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {(attributes || []).map(
                  (attr: any) => (

                    <Link
                      key={attr.slug}
                      href={`/ranking/${attr.slug}`}
                      className="border rounded-xl p-5 hover:shadow-lg transition duration-200"
                    >

                      <div className="flex items-center justify-between">

                        <div className="text-lg font-semibold">
                          {attr.name}
                        </div>

                        <div className="text-sm text-gray-500">
                          {attr.count}
                        </div>

                      </div>

                      <div className="text-sm text-gray-500 mt-2">
                        {attr.slug}
                      </div>

                      <div className="text-xs text-gray-400 mt-2">
                        role: {attr.semantic_role}
                      </div>

                    </Link>
                  )
                )}

              </div>

            </section>
          )
        )}
      </div>

      {debug === '1' && (
        <div className="mt-20">

          <h2 className="text-xl font-bold mb-4">
            Debug JSON
          </h2>

          <pre className="text-xs overflow-auto border rounded-xl p-4 bg-black text-green-400">
            {JSON.stringify(data, null, 2)}
          </pre>

        </div>
      )}

    </main>
  )
}