// /app/ranking/[type]/components/RankingTrustSection.tsx

import styles
  from '../page.module.css'

type Props = {
  type: string
}

export default function RankingTrustSection({
  type,
}: Props) {

  return (

    <section
      className={
        styles.trustSection
      }
    >

      <div
        className={
          styles.trustGrid
        }
      >

        <div
          className={
            styles.trustCard
          }
        >
          ✔ 初心者でも比較しやすい
        </div>

        <div
          className={
            styles.trustCard
          }
        >
          ✔ 用途別におすすめを整理
        </div>

        <div
          className={
            styles.trustCard
          }
        >
          ✔ GPU性能も考慮済み
        </div>

        <div
          className={
            styles.trustCard
          }
        >
          ✔ コスパも比較可能
        </div>

      </div>

    </section>

  )
}