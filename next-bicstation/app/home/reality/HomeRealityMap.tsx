// /app/home/reality/HomeRealityMap.tsx

import Link
  from 'next/link'

import styles
  from '../styles/v2/reality-map.module.css'

type FeaturedGroup = {
  group_slug: string
  group_name: string

  type?: string
  icon?: string
  color?: string

  parent_group?: string
  description?: string
  title?: string

  product_count?: number
}

type Props = {
  groups?: FeaturedGroup[]
}

export default function HomeRealityMap({
  groups = [],
}: Props) {

  if (!groups.length) {
    return null
  }

  // =====================================================
  // Universe Separation
  // =====================================================

  const usageGroups =
    groups.filter(
      group =>
        group.type === 'usage'
    )

  const deviceGroups =
    groups.filter(
      group =>
        group.type === 'device'
    )

  // =====================================================
  // Universe Renderer
  // =====================================================

  const renderUniverse = (
    title: string,
    description: string,
    universe: FeaturedGroup[],
  ) => {

    if (!universe.length) {
      return null
    }

    return (

      <section
        className={styles.universe}
      >

        <div
          className={styles.universeHeader}
        >

          <h3
            className={
              styles.universeTitle
            }
          >
            {title}
          </h3>

          <p
            className={
              styles.universeDescription
            }
          >
            {description}
          </p>

        </div>

        <div
          className={styles.chipGrid}
        >

          {universe.map(group => (

            <Link
              key={group.group_slug}
              href={`/discover/${group.group_slug}`}
              className={styles.chip}
            >

              <span
                className={
                  styles.chipName
                }
              >
                {group.group_name}
              </span>

              <span
                className={
                  styles.chipCount
                }
              >
                {group.product_count ?? 0}
              </span>

            </Link>

          ))}

        </div>

      </section>

    )

  }

  return (

    <section
      className={styles.section}
    >

      <div
        className={styles.header}
      >

        <div
          className={styles.eyebrow}
        >
          Reality Map
        </div>

        <h2
          className={styles.title}
        >
          SHIN CORE LINX Universe
        </h2>

        <p
          className={styles.description}
        >
          SHIN CORE LINX が理解する
          Semantic Reality の構造です。
        </p>

      </div>

      <div
        className={styles.universeGrid}
      >

        {renderUniverse(
          'Usage Universe',
          'PCを何に使うかという用途の世界',
          usageGroups,
        )}

        {renderUniverse(
          'Device Universe',
          'PCの形状や種類の世界',
          deviceGroups,
        )}

      </div>

    </section>

  )

}