// /home/maya/shin-vps/next-bicstation/app/components/home/common/HomeSemanticCard.tsx

import Link
  from 'next/link'

import styles
  from '../styles/common.module.css'

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

      {/* =====================================
      TOP
      ===================================== */}

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

        {typeof count === 'number' && (

          <div
            className={
              styles.cardCount
            }
          >
            {count}
          </div>

        )}

      </div>

      {/* =====================================
      BODY
      ===================================== */}

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

      {/* =====================================
      ARROW
      ===================================== */}

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