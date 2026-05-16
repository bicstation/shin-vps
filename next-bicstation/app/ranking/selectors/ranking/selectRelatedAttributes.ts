// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/selectors/ranking/selectRelatedAttributes.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectRelatedAttributes(

  runtime?: any

) {

  /* ======================================
  🔥 Runtime Related Rankings
  ====================================== */

  const relatedRankings =

    runtime?.related_rankings

  /* ======================================
  🔥 Runtime Priority
  ====================================== */

  if (
    Array.isArray(
      relatedRankings
    )
    &&
    relatedRankings.length
  ) {

    return relatedRankings

      .filter(
        (
          item: any
        ) => (

          item
          && typeof item
            === 'object'

          && item?.slug

        )
      )

      .map(
        (
          item: any
        ) => ({

          name:

            item?.title
            || item?.name
            || item?.slug,

          slug:
            item?.slug,

          href:

            item?.href
            || `/ranking/${item.slug}`,

          description:

            item?.description
            || '',

          semantic_role:

            item?.semantic_role
            || 'related',

          semantic_weight:

            item?.semantic_weight
            || null,

          count:

            item?.count
            || null,
        })
      )

  }

  /* ======================================
  🔥 Semantic Fallback
  ====================================== */

  const semantic =

    runtime?.semantic
    || {}

  const slug =

    semantic?.slug
    || null

  if (!slug) {
    return []
  }

  /* ======================================
  🔥 Generic Fallback
  ====================================== */

  return [

    {

      name:
        'GPU Ranking',

      slug:
        'gpu-rtx-4080',

      href:
        '/ranking/gpu-rtx-4080',

      description:
        'GPU semantic runtime ranking',

      semantic_role:
        'related',
    },

    {

      name:
        'AI PC',

      slug:
        'cpu-npu',

      href:
        '/ranking/cpu-npu',

      description:
        'AI / NPU semantic ranking',

      semantic_role:
        'highlight',
    },

    {

      name:
        'Laptop Ranking',

      slug:
        'device-laptop',

      href:
        '/ranking/device-laptop',

      description:
        'device semantic runtime',

      semantic_role:
        'primary',
    },

  ]
}