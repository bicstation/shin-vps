import Link from 'next/link'

import styles
  from '../page.module.css'

export default function RankingNavigation() {

  return (
    <section
      className={
        styles.bottomNav
      }
    >

      <Link href="/">
        →
        TOPへ戻る
      </Link>

      <Link href="/ranking">
        →
        他ランキングを見る
      </Link>

    </section>
  )
}