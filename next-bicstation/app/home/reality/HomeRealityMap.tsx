// /app/home/reality/HomeRealityMap.tsx

import Link
  from 'next/link'

import styles
  from '../styles/v2/reality-map.module.css'

import SemanticIcon
  from '@/shared/lib/ui/semantic/SemanticIcon'

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

  const renderUniverse = (
    title: string,
    description: string,
    universe: FeaturedGroup[],
    variant: 'usage' | 'device',
  ) => {

    if (!universe.length) {
      return null
    }

    return (

      <section
        className={`
          ${styles.universe}
          ${
            variant === 'usage'
              ? styles.usageUniverse
              : styles.deviceUniverse
          }
        `}
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

              <div
                className={
                  styles.chipLeft
                }
              >

                <div
                  className={
                    styles.chipIcon
                  }
                >

                  <SemanticIcon
                    icon={group.icon}
                    color={group.color}
                    size={16}
                  />

                </div>

                <span
                  className={
                    styles.chipName
                  }
                >
                  {group.group_name}
                </span>

              </div>

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
          PCの探し方
        </div>

        <h2
          className={styles.title}
        >
          用途や種類から探す
        </h2>

        <p
          className={styles.description}
        >
          やりたいことやPCの種類から、
          あなたに合ったPCを見つけられます。
        </p>

      </div>

      <div
        className={styles.universeGrid}
      >

        {renderUniverse(
          '用途から探す',
          'AI・ゲーム・仕事など目的から探せます',
          usageGroups,
          'usage',
        )}

        {renderUniverse(
          'PCの種類から探す',
          'ノートPCやデスクトップなど形状から探せます',
          deviceGroups,
          'device',
        )}

      </div>

    </section>

  )

}