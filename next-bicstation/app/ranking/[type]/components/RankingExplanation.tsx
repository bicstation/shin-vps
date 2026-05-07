import SemanticSection
  from '@/shared/components/semantic/SemanticSection'

import styles
  from '../page.module.css'

import {
  aggregateSemanticGroups,
} from '../semantic/rankingAggregation'

type Props = {
  products: any[]
}

export default function RankingExplanation({
  products,
}: Props) {

  if (!products?.length) {
    return null
  }

  const groupedMap =
    aggregateSemanticGroups(
      products
    )

  return (
    <section
      className={
        styles.explanation
      }
    >

      <div
        className={
          styles.sectionHeader
        }
      >

        <span
          className={
            styles.sectionLabel
          }
        >
          SEMANTIC ANALYSIS
        </span>

        <h2>
          このランキングの特徴
        </h2>

      </div>

      <div
        className={
          styles.explanationGrid
        }
      >

        {Object.entries(
          groupedMap
        )
          .slice(0, 4)
          .map(
            (
              [
                group,
                attrs,
              ]
            ) => (

              <SemanticSection
                key={group}
                title={group}
                groupType={group}
                attributes={attrs}
              />

            )
          )}

      </div>

    </section>
  )
}