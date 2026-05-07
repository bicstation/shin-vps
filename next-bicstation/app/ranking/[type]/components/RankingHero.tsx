import HeroRankingCard
  from '@/shared/components/organisms/cards/HeroRankingCard'

import styles
  from '../page.module.css'

import {
  buildSemanticTitle,
} from '../semantic/rankingSemantic'

type Props = {
  type: string
  topProduct: any
}

export default function RankingHero({
  type,
  topProduct,
}: Props) {

  const copy =
    buildSemanticTitle(
      type
    )

  return (
    <section className={styles.hero}>

      <div className={styles.heroLabel}>
        SEMANTIC RANKING
      </div>

      <h1 className={styles.heroTitle}>
        {copy.title}
      </h1>

      <p className={styles.heroDescription}>
        {copy.description}
      </p>

      {topProduct && (
        <HeroRankingCard
          product={topProduct}
        />
      )}

    </section>
  )
}