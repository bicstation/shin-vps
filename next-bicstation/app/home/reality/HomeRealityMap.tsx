// /app/home/reality/HomeRealityMap.tsx

import Link
  from 'next/link'

import styles
  from '../styles/reality-map.module.css'

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

        {!!usageGroups.length && (

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
                Usage Universe
              </h3>

              <p
                className={
                  styles.universeDescription
                }
              >
                PCを何に使うかという
                用途の世界
              </p>

            </div>

            <div
              className={
                styles.universeList
              }
            >

              {usageGroups.map(group => (

                <Link
                  key={group.group_slug}
                  href={`/discover/${group.group_slug}`}
                  className={styles.row}
                >

                  <div
                    className={styles.name}
                  >
                    {group.group_name}
                  </div>

                  <div
                    className={styles.right}
                  >

                    <span
                      className={
                        styles.count
                      }
                    >
                      {group.product_count ?? 0}
                    </span>

                    <span
                      className={
                        styles.arrow
                      }
                    >
                      →
                    </span>

                  </div>

                </Link>

              ))}

            </div>

          </section>

        )}

        {!!deviceGroups.length && (

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
                Device Universe
              </h3>

              <p
                className={
                  styles.universeDescription
                }
              >
                PCの形状や種類の世界
              </p>

            </div>

            <div
              className={
                styles.universeList
              }
            >

              {deviceGroups.map(group => (

                <Link
                  key={group.group_slug}
                  href={`/discover/${group.group_slug}`}
                  className={styles.row}
                >

                  <div
                    className={styles.name}
                  >
                    {group.group_name}
                  </div>

                  <div
                    className={styles.right}
                  >

                    <span
                      className={
                        styles.count
                      }
                    >
                      {group.product_count ?? 0}
                    </span>

                    <span
                      className={
                        styles.arrow
                      }
                    >
                      →
                    </span>

                  </div>

                </Link>

              ))}

            </div>

          </section>

        )}

      </div>

    </section>

  )

}