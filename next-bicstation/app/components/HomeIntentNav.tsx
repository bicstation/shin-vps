// /home/maya/shin-dev/shin-vps/next-bicstation/app/components/HomeIntentNav.tsx
import Link from 'next/link'

import styles
  from '../page.module.css'

import {
  INTENT_NAV,
} from '../lib/homeConstants'

export default function HomeIntentNav() {

  return (

    <section
      className={
        styles.intentSection
      }
    >

      <div
        className={
          styles.intentHeader
        }
      >

        <div
          className={
            styles.intentLabel
          }
        >
          Multi Intent Finder
        </div>

        <h2
          className={
            styles.intentTitle
          }
        >
          やりたいことから探す
        </h2>

        <p
          className={
            styles.intentDescription
          }
        >
          用途・予算・性能から、
          あなたに合う構成を比較できます。
        </p>

      </div>

      <div
        className={
          styles.intentGrid
        }
      >

        {INTENT_NAV.map(
          intent => (

            <Link
              key={intent.slug}

              href={
                `/ranking/${intent.slug}`
              }

              className={
                styles.intentCard
              }
            >

              <div
                className={
                  styles.intentCardTop
                }
              >

                <div
                  className={
                    styles.intentIcon
                  }
                >
                  {intent.icon}
                </div>

                <div>

                  <div
                    className={
                      styles.intentCardTitle
                    }
                  >
                    {intent.label}
                  </div>

                  <div
                    className={
                      styles.intentCardText
                    }
                  >
                    {intent.description}
                  </div>

                </div>

              </div>

              <div
                className={
                  styles.intentCardFooter
                }
              >
                おすすめを見る →
              </div>

            </Link>

          )
        )}

      </div>

    </section>
  )
}