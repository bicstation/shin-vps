// /home/maya/shin-dev/shin-vps/shared/components/semantic/SemanticRenderer.tsx

import SemanticBadge
  from './SemanticBadge'

import { SemanticAttribute }
  from '@/shared/types/semantic'

// -------------------------
// Props
// -------------------------
type Props = {
  attribute: SemanticAttribute
}

// -------------------------
// Semantic Renderer
// -------------------------
export default function SemanticRenderer({
  attribute
}: Props) {

  // -------------------------
  // type based rendering
  // -------------------------
  switch (attribute.type) {

    // GPU
    case 'gpu':
      return (
        <SemanticBadge
          attribute={attribute}
        />
      )

    // usage
    case 'usage':
      return (
        <SemanticBadge
          attribute={attribute}
        />
      )

    // maker
    case 'maker':
      return (
        <SemanticBadge
          attribute={attribute}
        />
      )

    // memory
    case 'memory':
      return (
        <SemanticBadge
          attribute={attribute}
        />
      )

    // storage
    case 'storage':
      return (
        <SemanticBadge
          attribute={attribute}
        />
      )

    // default
    default:
      return (
        <SemanticBadge
          attribute={attribute}
        />
      )
  }
}