// /app/home/reality/HomeRealityExamples.tsx

import Link
  from 'next/link'

import styles
  from '../styles/v2/reality-examples.module.css'

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

  const renderSection = (
    title: string,
    description: string,
    examples: NavigationItem[],
    badge: string,
  ) => {

    if (!examples.length) {
      return null
    }

    return (

      <section
        className={styles.group}
      >

        <div
          className={styles.groupHeader}
        >

          <h3
            className={styles.groupTitle}
          >
            {title}
          </h3>

          <p
            className={
              styles.groupDescription
            }
          >
            {description}
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
                    {badge}
                  </span>

                  <span
                    className={styles.count}
                  >
                    {example.product_count ?? 0}
                    製品
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
          PC選びの入口
        </div>

        <h2
          className={styles.title}
        >
          用途や種類から探す
        </h2>

        <p
          className={styles.description}
        >
          AI・ゲーム・動画編集・仕事用など、

          やりたいことや
          PCの種類から探せます。
        </p>

      </div>

      {renderSection(
        '用途から探す',
        'AI・ゲーム・仕事など目的から探せます',
        usageExamples,
        '用途',
      )}

      {renderSection(
        'PCの種類から探す',
        'ノートPCやデスクトップなど形状から探せます',
        deviceExamples,
        '種類',
      )}

    </section>

  )

}