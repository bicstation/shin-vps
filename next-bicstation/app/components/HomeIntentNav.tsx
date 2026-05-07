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
          用途から探す
        </h2>

        <p
          className={
            styles.intentDescription
          }
        >
          semantic intent から
          最適構成を探索。
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

            </Link>

          )
        )}

      </div>

    </section>
  )
}