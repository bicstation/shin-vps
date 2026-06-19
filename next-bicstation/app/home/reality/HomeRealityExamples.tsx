// /app/home/reality/HomeRealityExamples.tsx

import Link from 'next/link'

import styles
  from '../styles/reality-examples.module.css'

type NavigationItem = {
  slug: string
  name?: string
  title?: string
  description?: string
  type?: string
  parent_group?: string
  product_count?: number
}

type Props = {
  navigation?: {
    navigation?: NavigationItem[]
  }
}

export default function HomeRealityExamples({
  navigation,
}: Props) {

  const items =
    navigation?.navigation ?? []

  if (!items.length) {
    return null
  }

  // =====================================================
  // Usage First
  // Device Second
  // =====================================================

  const usageExamples =
    items.filter(
      item =>
        item.type === 'usage'
    )

  const deviceExamples =
    items.filter(
      item =>
        item.type === 'device'
    )

  const examples = [

    ...usageExamples,

    ...deviceExamples,

  ]

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
          Reality Examples
        </div>

        <h2
          className={styles.title}
        >
          Semantic Reality Examples
        </h2>

        <p
          className={styles.description}
        >
          SHIN CORE LINX が理解する
          Semantic Reality の代表例です。
        </p>

      </div>

      <div
        className={styles.examples}
      >

        {examples.map(example => (

          <Link
            key={example.slug}
            href={`/discover/${example.slug}`}
            className={styles.item}
          >

            <div
              className={styles.content}
            >

              <div
                className={styles.top}
              >

                <span
                  className={styles.type}
                >
                  {example.type}
                </span>

                <span
                  className={styles.count}
                >
                  {example.product_count ?? 0}
                </span>

              </div>

              <h3
                className={styles.name}
              >
                {example.title ||
                 example.name}
              </h3>

              {example.description && (

                <p
                  className={
                    styles.text
                  }
                >
                  {example.description}
                </p>

              )}

            </div>

            <div
              className={styles.arrow}
            >
              →
            </div>

          </Link>

        ))}

      </div>

    </section>

  )

}