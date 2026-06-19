// /app/home/discover/HomeDiscoverGateway.tsx

import Link
  from 'next/link'

import styles
  from '../styles/discover.module.css'

type NavigationItem = {
  slug: string

  title?: string
  name?: string

  description?: string

  type?: string

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

  // =====================================================
  // Discover Runtime
  //
  // Temporary:
  // usage universe
  //
  // Future:
  // runtime.top.discover
  // =====================================================

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
          Discover
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
          あなたの目的から
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

              <h3
                className={styles.cardTitle}
              >
                {item.title ||
                 item.name ||
                 item.slug}
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
                Products
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