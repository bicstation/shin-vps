import Link from 'next/link'

import styles
  from '../page.module.css'

export default function HomeFinderCTA() {

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

        <div
          className={
            styles.finderLabel
          }
        >
          AI Semantic Finder
        </div>

        <h2
          className={
            styles.finderTitle
          }
        >
          あなたの用途から
          semantic recommendation
        </h2>

        <p
          className={
            styles.finderDescription
          }
        >
          gaming /
          creator /
          AI /
          workload /
          budget
          をもとに
          recommendation。
        </p>

        <Link
          href="/pc-finder"

          className={
            styles.finderButton
          }
        >
          →
          semantic finder を使う
        </Link>

      </div>

    </section>
  )
}