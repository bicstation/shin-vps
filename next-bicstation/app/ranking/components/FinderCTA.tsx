// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/FinderCTA.tsx

import Link from 'next/link'

import styles from '../page.module.css'

/* =========================================
🔥 Props
========================================= */

type FinderCTAProps = {

  title?: string

  description?: string

  href?: string

  semanticKeywords?: string[]
}

/* =========================================
🔥 Default Semantic Keywords
========================================= */

const DEFAULT_KEYWORDS = [

  'gaming',
  'creator',
  'AI',
  'budget',
  'workload',
  'recommendation',
]

/* =========================================
🔥 Finder CTA
========================================= */

export function FinderCTA({
  title =
    'semantic recommendation engine',

  description =
    '用途・性能・semantic preference から最適構成を探索。',

  href =
    '/pc-finder',

  semanticKeywords =
    DEFAULT_KEYWORDS,
}: FinderCTAProps) {

  return (

    <section
      className={
        styles.finderSection
      }
    >

      <div
        className={
          styles.finderCard
        }
      >

        {/* ================================= */}
        {/* Label */}
        {/* ================================= */}

        <div
          className={
            styles.finderLabel
          }
        >
          AI Semantic Finder
        </div>

        {/* ================================= */}
        {/* Title */}
        {/* ================================= */}

        <h2
          className={
            styles.finderTitle
          }
        >
          {title}
        </h2>

        {/* ================================= */}
        {/* Description */}
        {/* ================================= */}

        <p
          className={
            styles.finderDescription
          }
        >
          {description}
        </p>

        {/* ================================= */}
        {/* Semantic Keywords */}
        {/* ================================= */}

        <div
          className={
            styles.finderKeywordRow
          }
        >

          {semanticKeywords.map(
            keyword => (

              <div
                key={keyword}

                className={
                  styles.finderKeyword
                }
              >
                {keyword}
              </div>

            )
          )}

        </div>

        {/* ================================= */}
        {/* CTA */}
        {/* ================================= */}

        <Link
          href={href}

          className={
            styles.finderButton
          }
        >
          → semantic finder を使う
        </Link>

      </div>

    </section>
  )
}
