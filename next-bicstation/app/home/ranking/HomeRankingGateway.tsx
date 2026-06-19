// /app/home/ranking/HomeRankingGateway.tsx

import Link
  from 'next/link'

import styles
  from '../styles/ranking.module.css'

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

        <div
          className={styles.content}
        >

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

            AI・ゲーム・クリエイター用途など
            様々な視点から
            人気モデルを比較できます。
          </p>

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

        </div>

        <div
          className={styles.actions}
        >

          <Link
            href="/ranking/all"
            className={styles.button}
          >
            ランキングを見る
          </Link>

        </div>

      </div>

    </section>

  )

}