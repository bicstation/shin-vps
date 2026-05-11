'use client'

import SemanticSection
  from '@/shared/components/semantic/SemanticSection'

type Props = {
  product: any
}

/* =========================================
🔥 Utils
========================================= */

function formatPrice(
  price?: number
) {

  if (
    typeof price !==
    'number'
  ) {
    return null
  }

  return `¥${price.toLocaleString()}`
}

/* =========================================
🔥 Component
========================================= */

export default function ProductHero({
  product,
}: Props) {

  // --------------------------------
  // Empty
  // --------------------------------
  if (!product) {
    return null
  }

  // --------------------------------
  // Basic
  // --------------------------------
  const title =
    product.shortTitle
    || product.name
    || 'おすすめPC'

  const image =
    product.image_url
    || '/no-image.png'

  const price =
    formatPrice(
      product.price
    )

  // --------------------------------
  // Semantic
  // --------------------------------
  const grouped =
    product
      ?.grouped_attributes
      || {}

  const confidence =
    product
      ?.semantic_confidence
      || 92

  const reasons =
    product
      ?.semantic_reason
      || []

  return (
    <section
      className="
        relative

        overflow-hidden

        rounded-[32px]

        border
        border-white/10

        bg-gradient-to-b
        from-slate-900
        to-slate-950

        p-6
        md:p-10
      "
    >

      {/* ========================= */}
      {/* background glow */}
      {/* ========================= */}

      <div
        className="
          pointer-events-none

          absolute
          inset-0

          bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_60%)]
        "
      />

      {/* ========================= */}
      {/* content */}
      {/* ========================= */}

      <div
        className="
          relative
          z-10

          grid
          gap-10

          lg:grid-cols-2
          lg:items-center
        "
      >

        {/* ================================= */}
        {/* left */}
        {/* ================================= */}

        <div
          className="
            flex
            flex-col

            gap-6
          "
        >

          {/* semantic label */}
          <div
            className="
              inline-flex
              w-fit
              items-center

              rounded-full

              border
              border-yellow-400/20

              bg-yellow-400/10

              px-4
              py-1.5

              text-[11px]
              font-extrabold

              uppercase
              tracking-[0.08em]

              text-yellow-200
            "
          >
            Semantic Recommendation
          </div>

          {/* title */}
          <div
            className="
              flex
              flex-col
              gap-4
            "
          >

            <h1
              className="
                text-4xl
                font-black

                leading-[1.05]
                tracking-[-0.05em]

                text-white

                md:text-6xl
              "
            >
              {title}
            </h1>

            <p
              className="
                max-w-2xl

                text-sm
                leading-7

                text-slate-400

                md:text-base
              "
            >
              semantic recommendation analysis に基づく
              高一致構成。
              gaming・creator・workload を総合分析。
            </p>

          </div>

          {/* confidence */}
          <div
            className="
              flex
              items-center

              gap-4
            "
          >

            <div
              className="
                flex
                h-20
                w-20

                items-center
                justify-center

                rounded-full

                border
                border-orange-400/20

                bg-orange-500/10

                text-2xl
                font-black

                text-orange-300
              "
            >
              {confidence}%
            </div>

            <div
              className="
                flex
                flex-col
                gap-1
              "
            >

              <span
                className="
                  text-sm
                  font-bold

                  text-white
                "
              >
                おすすめ一致度
              </span>

              <span
                className="
                  text-xs
                  leading-6

                  text-slate-400
                "
              >
                semantic similarity /
                workload /
                recommendation balance
              </span>

            </div>

          </div>

          {/* reasons */}
          {reasons.length > 0 && (

            <div
              className="
                grid
                gap-3
              "
            >

              {reasons
                .slice(0, 3)
                .map((
                  reason: string,
                  index: number
                ) => (

                  <div
                    key={index}
                    className="
                      flex
                      items-start

                      gap-3

                      rounded-2xl

                      border
                      border-white/5

                      bg-white/[0.03]

                      px-4
                      py-3
                    "
                  >

                    <div
                      className="
                        mt-0.5

                        text-orange-300
                      "
                    >
                      ✓
                    </div>

                    <div
                      className="
                        text-sm
                        leading-7

                        text-slate-300
                      "
                    >
                      {reason}
                    </div>

                  </div>

                ))}

            </div>

          )}

          {/* semantic grouped */}
          <div
            className="
              grid
              gap-4
            "
          >

            {Object.entries(
              grouped
            )
              .slice(0, 3)
              .map((
                [
                  group,
                  attrs,
                ]
              ) => (

                <SemanticSection
                  key={group}
                  title={group}
                  groupType={group}
                  attributes={
                    attrs as any[]
                  }
                />

              ))}

          </div>

          {/* CTA */}
          <div
            className="
              flex
              flex-col

              gap-3

              pt-2
            "
          >

            {/* price */}
            {price && (

              <div
                className="
                  text-5xl
                  font-black

                  tracking-[-0.04em]

                  text-orange-400
                "
              >
                {price}
              </div>

            )}

            {/* CTA */}
            <a
              href={
                product.url
                || '#buy'
              }

              target="_blank"

              rel="noopener noreferrer"

              className="
                flex
                min-h-[64px]

                items-center
                justify-center

                rounded-2xl

                bg-gradient-to-r
                from-orange-500
                to-orange-600

                px-6

                text-lg
                font-black

                text-white

                transition-all
                duration-200

                hover:translate-y-[-1px]
                hover:opacity-95
              "
            >
              👉
              今すぐこの価格で購入する
            </a>

            <span
              className="
                text-xs
                text-slate-500
              "
            >
              ※価格・在庫は変動する場合があります
            </span>

          </div>

        </div>

        {/* ================================= */}
        {/* right */}
        {/* ================================= */}

        <div
          className="
            relative
          "
        >

          <div
            className="
              overflow-hidden

              rounded-[28px]

              border
              border-white/10

              bg-slate-900
            "
          >

            <img
              src={image}
              alt={title}

              className="
                aspect-[4/3]
                w-full

                object-cover
              "
            />

          </div>

        </div>

      </div>

    </section>
  )
}