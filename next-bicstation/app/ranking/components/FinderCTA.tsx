import Link
  from 'next/link'

import styles
  from '../page.module.css'

/* =========================================
🔥 Types
========================================= */

type SemanticKeyword = {

  label: string

  slug: string
}

type FinderCTAProps = {

  title?: string

  description?: string

  href?: string

  semanticKeywords?: SemanticKeyword[]
}

/* =========================================
🔥 Default Keywords
========================================= */

const DEFAULT_KEYWORDS = [

  {
    label: 'ゲーミングPC',
    slug: 'usage-gaming',
  },

  {
    label: 'AI画像生成',
    slug: 'usage-ai',
  },

  {
    label: '動画編集',
    slug: 'usage-creator',
  },

  {
    label: 'RTX 4070',
    slug: 'gpu-rtx-4070',
  },

  {
    label: 'RTX 4080',
    slug: 'gpu-rtx-4080',
  },

  {
    label: 'コスパ重視',
    slug: 'usage-budget',
  },

  {
    label: '初心者向け',
    slug: 'usage-beginner',
  },

  {
    label: 'クリエイター向け',
    slug: 'usage-creator',
  },

]

/* =========================================
🔥 Finder CTA
========================================= */

export default function FinderCTA({

  title =
    '用途から最適なPCを探す',

  description =
    'ゲーム・AI画像生成・動画編集など、やりたいことから最適なPCを探せます。',

  href =
    '/pc-finder',

  semanticKeywords =
    DEFAULT_KEYWORDS,

}: FinderCTAProps) {

  return (

    <section
      className={
        styles.finder
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

          AI PC FINDER

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
        {/* Keywords */}
        {/* ================================= */}

        <div
          className={
            styles.finderTags
          }
        >

          {semanticKeywords.map(
            (
              keyword,
              index
            ) => (

              <Link

                key={
                  keyword.slug
                  || index
                }

                href={
                  `/ranking/${keyword.slug}`
                }

                className={
                  styles.finderTag
                }
              >

                {keyword.label}

              </Link>

            )
          )}

        </div>

        {/* ================================= */}
        {/* Actions */}
        {/* ================================= */}

        <div
          className={
            styles.finderAction
          }
        >

          <Link
            href={href}

            className={
              styles.finderButton
            }
          >

            PC Finder を使う

          </Link>

          <Link
            href="/ranking"

            className={
              styles.finderSubButton
            }
          >

            ランキング一覧を見る

          </Link>

        </div>

      </div>

    </section>
  )
}