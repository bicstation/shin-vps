'use client'

import { SemanticAttribute } from '@/shared/types/semantic'
import { semanticRenderRegistry } from '@/shared/lib/semantic/semanticRenderRegistry'

type Props = {
  attribute?: SemanticAttribute | null
}

export default function SemanticBadge({ attribute }: Props) {
  if (!attribute) return null // 安全ガード

  const config = semanticRenderRegistry[attribute.type] || semanticRenderRegistry.default
  const isHighlight = attribute.semantic_role === 'highlight'
  const isStrong = (attribute.semantic_weight || 0) >= 80

  return (
    <div
      className={`
        inline-flex items-center gap-1
        px-2 py-1
        rounded-md
        text-xs font-semibold
        transition-all duration-200
        ${config.className || ''}
        ${isHighlight ? 'ring-2 ring-orange-400/40' : ''}
        ${isStrong ? 'scale-[1.03]' : ''}
      `}
    >
      {attribute.icon && <span>{attribute.icon}</span>}
      <span>{attribute.name ?? ''}</span>
    </div>
  )
}