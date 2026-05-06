// /home/maya/shin-dev/shin-vps/shared/components/semantic/SemanticSection.tsx

import SemanticRenderer
  from './SemanticRenderer'

import { SemanticAttribute }
  from '@/shared/types/semantic'

// -------------------------
// Props
// -------------------------
type Props = {

  title?: string

  attributes?: SemanticAttribute[]

}

// -------------------------
// Semantic Section
// -------------------------
export default function SemanticSection({
  title,
  attributes = [],
}: Props) {

  // empty
  if (!attributes.length) return null

  return (
    <section className="space-y-2">

      {/* title */}
      {title && (
        <h3 className="
          text-sm font-bold text-gray-300
        ">
          {title}
        </h3>
      )}

      {/* semantic rendering */}
      <div className="
        flex flex-wrap gap-2
      ">

        {attributes.map((attribute) => (

          <SemanticRenderer
            key={`
              ${attribute.type}
              -
              ${attribute.slug}
            `}
            attribute={attribute}
          />

        ))}

      </div>

    </section>
  )
}