import Link from 'next/link'

import styles
  from '../page.module.css'

type Props = {
  href: string
  icon?: string
  title: string
  description?: string
  count?: number
  emphasis?: boolean
}

export default function HomeSemanticCard({
  href,
  icon,
  title,
  description,
  count,
  emphasis = false,
}: Props) {

  return (
    <Link
      href={href}

      prefetch={false}

      className={
        emphasis
          ? styles.semanticCardStrong
          : styles.semanticCard
      }
    >

      <div
        className={
          styles.cardTop
        }
      >

        <div
          className={
            styles.cardIcon
          }
        >
          {icon}
        </div>

        {typeof count ===
          'number' && (
          <div
            className={
              styles.cardCount
            }
          >
            {count}
          </div>
        )}

      </div>

      <div
        className={
          styles.cardBody
        }
      >

        <div
          className={
            styles.cardTitle
          }
        >
          {title}
        </div>

        {description && (
          <div
            className={
              styles.cardDescription
            }
          >
            {description}
          </div>
        )}

      </div>

      <div
        className={
          styles.cardArrow
        }
      >
        →
      </div>

    </Link>
  )
}