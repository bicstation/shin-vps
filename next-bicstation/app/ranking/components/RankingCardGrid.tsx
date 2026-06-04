// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/RankingCardGrid.tsx
// ============================================================================

import styles from '../RankingPage.module.css'

import RankingCard from './RankingCard'

import {
  getHumanSummary,
} from '../lib/humanSummary'

type Props = {
  items: any[]
}

/* ============================================================================
🔥 Ranking Card Grid
============================================================================ */

export default function RankingCardGrid({
  items,
}: Props) {

  return (

    <section className={styles.cardSection}>

      <div className={styles.cardGrid}>

        {items.map((attr: any) => (

          <RankingCard
            key={attr.slug}
            attr={attr}
            summary={
              getHumanSummary(attr)
            }
          />

        ))}

      </div>

    </section>

  )
}