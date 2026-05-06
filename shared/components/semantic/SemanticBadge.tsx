// /home/maya/shin-dev/shin-vps/shared/components/semantic/SemanticBadge.tsx

import { SemanticAttribute }
  from '@/shared/types/semantic'

import { semanticRenderRegistry }
  from '@/shared/lib/semantic/semanticRenderRegistry'

// -------------------------
// Props
// -------------------------
type Props = {
  attribute: SemanticAttribute
}

// -------------------------
// Semantic Badge
// -------------------------
export default function SemanticBadge({
  attribute
}: Props) {

  // -------------------------
  // registry config
  // -------------------------
  const config =
    semanticRenderRegistry[attribute.type]
    || semanticRenderRegistry.default

  // -------------------------
  // semantic emphasis
  // -------------------------
  const isHighlight =
    attribute.semantic_role === 'highlight'

  const isStrong =
    (attribute.semantic_weight || 0) >= 80

  return (
    <div
      className={`
        inline-flex items-center gap-1

        px-2 py-1
        rounded-md

        text-xs font-semibold

        transition-all duration-200

        ${config.className}

        ${
          isHighlight
            ? 'ring-2 ring-orange-400/40'
            : ''
        }

        ${
          isStrong
            ? 'scale-[1.03]'
            : ''
        }
      `}
    >

      {/* icon */}
      {attribute.icon && (
        <span>
          {attribute.icon}
        </span>
      )}

      {/* label */}
      <span>
        {attribute.name}
      </span>

    </div>
  )
}