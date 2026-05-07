'use client'

import SemanticRenderer
  from './SemanticRenderer'

import {
  SemanticAttribute,
} from '@/shared/types/semantic'

/* =========================================
🔥 Backend Semantic Authority
========================================= */

const GROUP_ORDER = [
  'usage',
  'gpu',
  'cpu',
  'maker',
  'memory',
  'storage',
  'feature',
] as const

/* =========================================
🔥 Group Labels
========================================= */

const GROUP_LABELS: Record<
  string,
  string
> = {

  usage: '用途',

  gpu: 'GPU',

  cpu: 'CPU',

  maker: 'メーカー',

  memory: 'メモリ',

  storage: 'ストレージ',

  feature: '特徴',
}

/* =========================================
🔥 Config
========================================= */

const IS_DEV =
  process.env.NODE_ENV ===
  'development'

/* =========================================
🔥 Props
========================================= */

type Props = {

  title?: string

  attributes?: (
    SemanticAttribute
    | null
    | undefined
  )[]

  grouped?: Record<
    string,
    (
      SemanticAttribute
      | null
      | undefined
    )[]
  >
}

/* =========================================
🔥 Logger
========================================= */

function logWarn(
  label: string,
  payload?: unknown
) {

  if (!IS_DEV) {
    return
  }

  console.warn(
    `[${label}]`,
    payload ?? ''
  )
}

/* =========================================
🔥 Normalize Attribute
========================================= */

function normalizeAttribute(
  attribute?: (
    SemanticAttribute
    | null
    | undefined
  )
): SemanticAttribute | null {

  if (!attribute) {
    return null
  }

  return {

    ...attribute,

    type:
      attribute.attr_type
      || attribute.type
      || 'default',

    name:
      attribute.name || '',

    slug:
      attribute.slug || '',

    semantic_role:
      attribute.semantic_role
      || 'supportive',

    semantic_weight:
      typeof attribute.semantic_weight
        === 'number'
          ? Math.max(
              0,
              Math.min(
                1,
                attribute.semantic_weight
              )
            )
          : 0,
  }
}

/* =========================================
🔥 Sort Attributes
========================================= */

function sortAttributes(
  attributes: SemanticAttribute[]
) {

  return [...attributes].sort(
    (a, b) => {

      const aWeight =
        a.semantic_weight || 0

      const bWeight =
        b.semantic_weight || 0

      return bWeight - aWeight
    }
  )
}

/* =========================================
🔥 Component
========================================= */

export default function SemanticSection({

  title,

  attributes = [],

  grouped,

}: Props) {

  // =====================================
  // grouped mode
  // =====================================
  if (
    grouped &&
    typeof grouped === 'object'
  ) {

    return (

      <section className="space-y-5">

        {/* title */}
        {title && (

          <h2
            className="
              text-sm
              font-black
              tracking-wide
              text-white
            "
          >
            {title}
          </h2>

        )}

        {/* grouped rendering */}
        {GROUP_ORDER.map(groupKey => {

          const rawAttributes =
            grouped[groupKey]

          if (
            !Array.isArray(
              rawAttributes
            )
          ) {
            return null
          }

          // -------------------------
          // normalize
          // -------------------------
          const normalized = (
            rawAttributes
              .map(normalizeAttribute)
              .filter(Boolean)
          ) as SemanticAttribute[]

          if (
            normalized.length <= 0
          ) {
            return null
          }

          // -------------------------
          // semantic sort
          // -------------------------
          const sorted =
            sortAttributes(
              normalized
            )

          return (

            <div
              key={groupKey}
              className="
                space-y-2
              "
            >

              {/* group title */}
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <div
                  className="
                    h-[1px]
                    flex-1
                    bg-white/5
                  "
                />

                <h3
                  className="
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                  "
                >
                  {
                    GROUP_LABELS[groupKey]
                    || groupKey
                  }
                </h3>

                <div
                  className="
                    h-[1px]
                    flex-1
                    bg-white/5
                  "
                />

              </div>

              {/* attributes */}
              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                "
              >

                {sorted.map(
                  (
                    attribute,
                    index
                  ) => {

                    const key =
                      attribute.slug
                      && attribute.type
                        ? `${attribute.type}-${attribute.slug}`
                        : `${groupKey}-${index}`

                    return (

                      <SemanticRenderer
                        key={key}
                        attribute={attribute}
                      />

                    )
                  }
                )}

              </div>

            </div>
          )
        })}

      </section>
    )
  }

  // =====================================
  // flat mode
  // =====================================

  const normalized = (
      attributes
        .map(normalizeAttribute)
        .filter(Boolean)
    ) as SemanticAttribute[]

  if (
    normalized.length <= 0
  ) {

    logWarn(
      'SemanticSection empty attributes'
    )

    return null
  }

  // -------------------------------------
  // semantic sort
  // -------------------------------------
  const sorted =
    sortAttributes(
      normalized
    )

  return (

    <section
      className="
        space-y-3
      "
    >

      {/* title */}
      {title && (

        <h2
          className="
            text-sm
            font-black
            tracking-wide
            text-white
          "
        >
          {title}
        </h2>

      )}

      {/* semantic rendering */}
      <div
        className="
          flex
          flex-wrap
          gap-2
        "
      >

        {sorted.map(
          (
            attribute,
            index
          ) => {

            const key =
              attribute.slug
              && attribute.type
                ? `${attribute.type}-${attribute.slug}`
                : `attr-${index}`

            return (

              <SemanticRenderer
                key={key}
                attribute={attribute}
              />

            )
          }
        )}

      </div>

    </section>
  )
}