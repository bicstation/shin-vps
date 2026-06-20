// /app/home/discover/HomeDiscoverGateway.tsx

import Link
  from 'next/link'

import SemanticIcon
  from '@/shared/lib/ui/semantic/SemanticIcon'

import styles
  from '../styles/v2/discover.module.css'

type NavigationItem = {
  slug: string

  title?: string
  name?: string

  description?: string

  type?: string

  icon?: string
  color?: string

  product_count?: number
}

type Props = {
  navigation?: {
    navigation?: NavigationItem[]
  }
}

export default function HomeDiscoverGateway({
  navigation,
}: Props) {

  const items =
    navigation?.navigation ?? []

  if (!items.length) {
    return null
  }

  const discoverItems = items

    .filter(
      item =>
        item.type === 'usage'
    )

    .sort(
      (a, b) =>
        (b.product_count ?? 0)
        -
        (a.product_count ?? 0)
    )

  console.log(
    'DISCOVER_ITEMS',
    discoverItems
  )

  if (!discoverItems.length) {
    return null
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
          PCを探す
        </div>

        <h2
          className={styles.title}
        >
          用途からPCを探す
        </h2>

        <p
          className={styles.description}
        >
          AI・ゲーム・動画編集など、
          やりたいことから
          最適なPCを探せます。
        </p>

      </div>

      <div
        className={styles.grid}
      >

        {discoverItems.map(item => (

          <Link
            key={item.slug}
            href={`/discover/${item.slug}`}
            className={styles.card}
          >

            <div
              className={styles.cardBody}
            >

              <div
                className={styles.cardIcon}
              >

                <SemanticIcon
                  icon={item.icon ?? 'box'}
                  color={item.color}
                  size={22}
                />

              </div>

              <h3
                className={styles.cardTitle}
              >
                {item.title
                  || item.name
                  || item.slug}
              </h3>

              {item.description && (

                <p
                  className={
                    styles.cardDescription
                  }
                >
                  {item.description}
                </p>

              )}

            </div>

            <div
              className={styles.cardFooter}
            >

              <span>
                掲載製品数
              </span>

              <strong>
                {item.product_count ?? 0}
              </strong>

            </div>

          </Link>

        ))}

      </div>

    </section>

  )

}