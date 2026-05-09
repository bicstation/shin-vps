
import {

  resolveSemanticPresentations,

} from '@/shared/lib/semantic'

/* =========================================
🔥 Main Transform
========================================= */

export const transformProduct = (
  p: any
) => {

  if (!p) {
    return null
  }

  // ======================================
  // tags
  // ======================================

  const tags =
    normalizeTags(
      p.tags
    )

  // ======================================
  // matched semantics
  // ======================================

  const matched_attributes =

    Array.isArray(
      p.matched_attributes
    )

      ? p.matched_attributes

      : []

  // ======================================
  // semantic presentations
  // ======================================

  const recommendation_reasons =

    resolveSemanticPresentations(
      matched_attributes
    )

  // ======================================
  // return
  // ======================================

  return {

    id: p.id,

    unique_id:
      p.unique_id
      || String(p.id),

    title:
      p.title
      || 'おすすめ商品',

    shortTitle:
      shorten(
        p.title
      ),

    image:
      p.image
      || '/no-image.png',

    price:
      normalizePrice(
        p.price
      ),

    url:
      normalizeUrl(
        p.url
      ),

    label:
      p.label || '',

    displayLabel:
      convertLabel(
        p.label
      ),

    tags,

    mainTag:
      tags[0] || '',

    rankingScore:
      p.ranking_score ?? 0,

    // ====================================
    // semantic
    // ====================================

    matched_attributes,

    recommendation_reasons,
  }
}

