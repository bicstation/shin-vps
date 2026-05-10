// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/FinderCTA.tsx

import Link
  from 'next/link'

import styles
  from '../page.module.css'

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
🔥 Default Keywords
========================================= */

const DEFAULT_KEYWORDS = [

  'ゲーミングPC',
  'AI画像生成',
  '動画編集',
  'RTX 4070',
  'RTX 4080',
  'コスパ重視',
  '初心者向け',
  'クリエイター向け',
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
                  keyword
                  || index
                }

                href={
                  `/ranking/${encodeURIComponent(keyword)}`
                }

                className={
                  styles.finderTag
                }
              >

                {keyword}

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