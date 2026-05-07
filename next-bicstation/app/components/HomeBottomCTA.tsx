import Link from 'next/link'

import styles
  from '../page.module.css'

export default function HomeBottomCTA() {

  return (
    <section
      className={
        styles.bottomSection
      }
    >

      <div
        className={
          styles.bottomCard
        }
      >

        <div
          className={
            styles.bottomLabel
          }
        >
          Semantic Ranking Explorer
        </div>

        <h2
          className={
            styles.bottomTitle
          }
        >
          すべてのsemanticランキングを見る
        </h2>

        <p
          className={
            styles.bottomDescription
          }
        >
          GPU /
          usage /
          maker /
          AI /
          recommendation
          を横断探索。
        </p>

        <Link
          href="/ranking"

          className={
            styles.bottomButton
          }
        >
          →
          semantic ranking を見る
        </Link>

      </div>

    </section>
  )
}