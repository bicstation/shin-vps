// /app/home/ranking/HomeRankingGateway.tsx

import Link
  from 'next/link'

import SemanticIcon
  from '@/shared/lib/ui/semantic/SemanticIcon'

import styles
  from '../styles/v2/ranking.module.css'

type Props = {
  totalProducts?: number
}

export default function HomeRankingGateway({
  totalProducts = 0,
}: Props) {

  return (

    <section
      className={styles.section}
    >

      <div
        className={styles.card}
      >

        {/* ===================================== */}
        {/* Content */}
        {/* ===================================== */}

        <div
          className={styles.content}
        >

          <div
            className={styles.rankingIcon}
          >

            <SemanticIcon
              icon="trophy"
              color="orange"
              size={28}
            />

          </div>

          <div
            className={styles.eyebrow}
          >
            Ranking
          </div>

          <h2
            className={styles.title}
          >
            人気ランキングから
            PCを探す
          </h2>

          <p
            className={styles.description}
          >
            現在注目されている
            人気PCをランキング形式で確認できます。

            AI・ゲーム・クリエイター用途など、
            様々な視点から比較できます。
          </p>

          <div
            className={styles.points}
          >

            <div
              className={styles.point}
            >
              🏆 人気モデル
            </div>

            <div
              className={styles.point}
            >
              📈 注目度上昇
            </div>

            <div
              className={styles.point}
            >
              🎮 ゲーミング
            </div>

            <div
              className={styles.point}
            >
              🤖 AI対応
            </div>

          </div>

        </div>

        {/* ===================================== */}
        {/* Action Panel */}
        {/* ===================================== */}

        <div
          className={styles.actions}
        >

          <div
            className={styles.stats}
          >

            <span>
              対象製品数
            </span>

            <strong>
              {totalProducts}
            </strong>

          </div>

          <Link
            href="/ranking/all"
            className={styles.button}
          >
            🏆 ランキングを見る
          </Link>

        </div>

      </div>

    </section>

  )

}