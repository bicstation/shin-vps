// /app/home/finder/HomeFinderGateway.tsx

import Link
  from 'next/link'

import SemanticIcon
  from '@/shared/lib/ui/semantic/SemanticIcon'

import styles
  from '../styles/v2/finder1.module.css'

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
            className={styles.finderIcon}
          >

            <SemanticIcon
              icon="search"
              color="cyan"
              size={28}
            />

          </div>

          <div
            className={styles.eyebrow}
          >
            PC Finder
          </div>

          <h2
            className={styles.title}
          >
            質問に答えるだけで
            あなたに合うPCが見つかる
          </h2>

          <p
            className={styles.description}
          >
            用途・予算・重視ポイントを
            選ぶだけ。

            スペックに詳しくなくても、
            Finder が最適なPC探しを
            サポートします。
          </p>

          <div
            className={styles.points}
          >

            <div
              className={styles.point}
            >
              🎮 ゲーム用途
            </div>

            <div
              className={styles.point}
            >
              🤖 AI用途
            </div>

            <div
              className={styles.point}
            >
              🎬 動画編集
            </div>

            <div
              className={styles.point}
            >
              💼 ビジネス用途
            </div>

          </div>

        </div>

        <div
          className={styles.actions}
        >

          <Link
            href="/pc-finder"
            className={styles.button}
          >
            PC Finder を開始する
          </Link>

        </div>

      </div>

    </section>

  )

}