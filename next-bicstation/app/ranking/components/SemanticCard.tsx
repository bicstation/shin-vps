// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/SemanticCard.tsx

import Link
  from 'next/link'

import styles
  from '../page.module.css'

/* =========================================
🔥 Types
========================================= */

export type SemanticCardItem = {

  name: string

  slug: string

  href?: string

  count?: number

  icon?: string

  color?: string

  semantic_role?: string

  semantic_weight?: number

  description?: string
}

/* =========================================
🔥 Icon Map
========================================= */

const ICON_MAP: Record<
  string,
  string
> = {

  gamepad:
    '🎮',

  cpu:
    '🧠',

  monitor:
    '🖥',

  briefcase:
    '💼',

  pen:
    '✏️',

  penTool:
    '✏️',

  sparkles:
    '✨',

  hardDrive:
    '💾',

  memoryStick:
    '⚡',

  badgeDollarSign:
    '💴',

  workflow:
    '🚀',

  ai:
    '🤖',

  server:
    '🖥️',

  shield:
    '🛡️',

  laptop:
    '💻',
}

/* =========================================
🔥 Semantic Role Label
========================================= */

function getSemanticRoleLabel(
  role?: string
) {

  switch (role) {

    case 'highlight':
      return '注目'

    case 'primary':
      return '人気'

    case 'secondary':
      return 'おすすめ'

    case 'supportive':
      return '関連'

    default:
      return 'ranking'
  }
}

/* =========================================
🔥 Semantic Card
========================================= */

export default function SemanticCard({
  item,
}: {
  item: SemanticCardItem
}) {

  // ======================================
  // Safe
  // ======================================

  if (
    !item?.name
    ||
    !item?.slug
  ) {

    return null

  }

  // ======================================
  // Href
  // ======================================

  const href =

    item.href
    || `/ranking/${item.slug}`

  // ======================================
  // Icon
  // ======================================

  const icon =

    ICON_MAP[
      item.icon || ''
    ]

      || '✨'

  // ======================================
  // Description
  // ======================================

  const description =

    item.description

    || `${item.name} の人気ランキングを表示します。`

  // ======================================
  // Count
  // ======================================

  const countText =

    typeof item.count
      === 'number'

      ? `${item.count}件`

      : null

  // ======================================
  // Semantic Role
  // ======================================

  const semanticRole =

    getSemanticRoleLabel(
      item.semantic_role
    )

  // ======================================
  // Semantic Weight
  // ======================================

  const weight =

    typeof item.semantic_weight
      === 'number'

      ? Math.round(
          item.semantic_weight * 100
        )

      : null

  // ======================================
  // Render
  // ======================================

  return (

    <Link
      href={href}

      prefetch={false}

      className={
        styles.semanticCard
      }
    >

      {/* ================================= */}
      {/* Top */}
      {/* ================================= */}

      <div
        className={
          styles.semanticCardTop
        }
      >

        {/* ============================= */}
        {/* Icon */}
        {/* ============================= */}

        <div
          className={
            styles.semanticIcon
          }
        >

          {icon}

        </div>

        {/* ============================= */}
        {/* Count */}
        {/* ============================= */}

        {countText && (

          <div
            className={
              styles.semanticCount
            }
          >

            {countText}

          </div>

        )}

      </div>

      {/* ================================= */}
      {/* Title */}
      {/* ================================= */}

      <h3
        className={
          styles.semanticCardTitle
        }
      >

        {item.name}

      </h3>

      {/* ================================= */}
      {/* Description */}
      {/* ================================= */}

      <p
        className={
          styles.semanticDescription
        }
      >

        {description}

      </p>

      {/* ================================= */}
      {/* Meta */}
      {/* ================================= */}

      <div
        className={
          styles.semanticMeta
        }
      >

        <span>

          {semanticRole}

        </span>

        {weight !== null && (

          <span>

            • {weight}%

          </span>

        )}

      </div>

      {/* ================================= */}
      {/* Bottom */}
      {/* ================================= */}

      <div
        className={
          styles.semanticArrow
        }
      >

        ランキングを見る →

      </div>

    </Link>

  )
}