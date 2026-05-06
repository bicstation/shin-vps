// /shared/components/semantic/SemanticSection.tsx
'use client';

import SemanticRenderer from './SemanticRenderer';
import { SemanticAttribute } from '@/shared/types/semantic';

// -------------------------
// Props
// -------------------------
type Props = {
  title?: string;
  attributes?: (SemanticAttribute | null | undefined)[];
};

// -------------------------
// Semantic Section
// -------------------------
export default function SemanticSection({
  title,
  attributes = [],
}: Props) {
  // -------------------------
  // safety guard
  // -------------------------
  if (!attributes || !attributes.length) return null;

  return (
    <section className="space-y-2">
      {/* title */}
      {title && (
        <h3 className="text-sm font-bold text-gray-300">
          {title}
        </h3>
      )}

      {/* semantic rendering */}
      <div className="flex flex-wrap gap-2">
        {attributes.map((attribute, index) => {
          if (!attribute) {
            console.warn('[SemanticSection WARNING] undefined attribute at index', index);
            return null;
          }

          // fallback key
          const key = attribute.slug && attribute.type
            ? `${attribute.type}-${attribute.slug}`
            : `attr-${index}`;

          return <SemanticRenderer key={key} attribute={attribute} />;
        })}
      </div>
    </section>
  );
}