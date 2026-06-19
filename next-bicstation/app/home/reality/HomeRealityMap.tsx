// /app/home/reality/HomeRealityMap.tsx

import Link
  from 'next/link'

import styles
  from '../styles/v2/reality-map.module.css'

import {
  ICON_MAP,
} from '@/shared/lib/ui/icon-map'

import {
  COLOR_MAP,
} from '@/shared/lib/ui/color-map'

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

          {universe.map(group => {

            const Icon =
              ICON_MAP[
                group.icon ?? ''
              ]

            const accentColor =
              COLOR_MAP[
                group.color ?? ''
              ]
              || '#64748b'

            return (

              <Link
                key={group.group_slug}
                href={`/discover/${group.group_slug}`}
                className={styles.chip}

                style={{

                  borderColor:
                    `${accentColor}33`,

                  background:
                    `${accentColor}08`,

                }}
              >

                <div
                  className={
                    styles.chipLeft
                  }
                >

                  {Icon && (

                    <div
                      className={
                        styles.chipIcon
                      }

                      style={{
                        color:
                          accentColor,
                      }}
                    >

                      <Icon
                        size={16}
                        strokeWidth={2.2}
                      />

                    </div>

                  )}

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

            )

          })}

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
        )}

        {renderUniverse(
          'PCの種類から探す',
          'ノートPCやデスクトップなど形状から探せます',
          deviceGroups,
        )}

      </div>

    </section>

  )

}