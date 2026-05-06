'use client'

import SemanticBadge from './SemanticBadge'
import { SemanticAttribute } from '@/shared/types/semantic'

type Props = {
  attribute?: SemanticAttribute | null
}

export default function SemanticRenderer({ attribute }: Props) {
  if (!attribute) {
    console.warn('[SemanticRenderer WARNING] attribute is null or undefined')
    return null
  }

  // -------------------------
  // type-based rendering
  // -------------------------
  switch (attribute.type) {
    case 'gpu':
    case 'usage':
    case 'maker':
    case 'memory':
    case 'storage':
      return <SemanticBadge attribute={attribute ?? { slug: '', name: '', type: '' }} />

    default:
      return <SemanticBadge attribute={attribute ?? { slug: '', name: '', type: '' }} />
  }
}