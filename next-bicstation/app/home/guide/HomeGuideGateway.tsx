// /app/home/guide/HomeGuideGateway.tsx

import Link
  from 'next/link'

import styles
  from '../styles/guide1.module.css'

export default function HomeGuideGateway() {

  return (

    <section
      className={styles.section}
    >

      <div
        className={styles.card}
      >

        {/* ==================================== */}
        {/* Content */}
        {/* ==================================== */}

        <div
          className={styles.content}
        >

          <div
            className={styles.eyebrow}
          >
            Guide
          </div>

          <h2
            className={styles.title}
          >
            PC選びの知識を学ぶ
          </h2>

          <p
            className={styles.description}
          >
            CPU・GPU・メモリ・ストレージなど、
            PC選びに必要な知識を
            わかりやすく解説します。

            初めてPCを購入する方でも、
            用途に合わせて理解できる
            Guide Universe を提供します。
          </p>

          <div
            className={styles.tags}
          >

            <span
              className={styles.tag}
            >
              GPU
            </span>

            <span
              className={styles.tag}
            >
              CPU
            </span>

            <span
              className={styles.tag}
            >
              AI
            </span>

            <span
              className={styles.tag}
            >
              Gaming
            </span>

            <span
              className={styles.tag}
            >
              Creator
            </span>

          </div>

        </div>

        {/* ==================================== */}
        {/* Action */}
        {/* ==================================== */}

        <div
          className={styles.actions}
        >

          <Link
            href="/guide"
            className={styles.button}
          >
            Guideを見る
          </Link>

        </div>

      </div>

    </section>

  )

}