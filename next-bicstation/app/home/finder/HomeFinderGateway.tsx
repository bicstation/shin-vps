// /app/home/finder/HomeFinderGateway.tsx

import Link
  from 'next/link'

import styles
  from '../styles/finder1.module.css'

export default function HomeFinderGateway() {

  return (

    <section
      className={styles.section}
    >

      <div
        className={styles.card}
      >

        <div
          className={styles.content}
        >

          <div
            className={styles.eyebrow}
          >
            PC Finder
          </div>

          <h2
            className={styles.title}
          >
            どのPCを選べば良いか
            わからない方へ
          </h2>

          <p
            className={styles.description}
          >
            用途・予算・重視ポイントから、
            あなたに合うPCを絞り込みます。
            スペックに詳しくなくても
            Finder が選択をサポートします。
          </p>

        </div>

        <div
          className={styles.actions}
        >

          <Link
            href="/pc-finder"
            className={styles.button}
          >
            PC Finderを開始する
          </Link>

        </div>

      </div>

    </section>

  )

}