import Link from 'next/link'

import styles
  from '../page.module.css'

export default function RankingEmpty() {

  return (
    <div className={styles.empty}>

      <h2>
        ⚠️ データがありません
      </h2>

      <p>
        semantic ranking が取得できませんでした
      </p>

      <Link href="/">
        →
        TOPへ戻る
      </Link>

    </div>
  )
}