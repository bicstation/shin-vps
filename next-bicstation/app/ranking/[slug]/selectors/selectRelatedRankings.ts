// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/selectors/selectRelatedRankings.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectRelatedRankings(

  runtime?: any,

  limit = 8

) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !runtime
    || typeof runtime !== 'object'
  ) {
    return []
  }

  /* ======================================
  🔥 Semantic
  ====================================== */

  const semantic =

    runtime?.semantic
    || {}

  /* ======================================
  🔥 Related Runtime
  ====================================== */

  const runtimeRelated =

    Array.isArray(
      runtime?.related_attributes
    )

      ? runtime.related_attributes

      : []

  /* ======================================
  🔥 Runtime Related
  ====================================== */

  if (runtimeRelated.length) {

    return runtimeRelated

      .filter(
        (
          attribute: any
        ) => (

          attribute
          && typeof attribute
            === 'object'

          && !!attribute?.slug
        )
      )

      .map(
        (
          attribute: any
        ) => ({

          ...attribute,

          semantic_role:
            attribute?.semantic_role
            || 'related',

          semantic_weight:

            typeof attribute
              ?.semantic_weight
              === 'number'

              ? attribute
                .semantic_weight

              : 0.72,
        })
      )

      .slice(
        0,
        limit
      )

  }

  /* ======================================
  🔥 Fallback Related
  ====================================== */

  const fallback = [

    {
      name:
        'Gaming PC',

      slug:
        'gaming',

      icon:
        'gamepad-2',

      color:
        'purple',

      count: 128,

      semantic_role:
        'related',

      semantic_weight:
        0.84,
    },

    {
      name:
        'Creator PC',

      slug:
        'creator',

      icon:
        'sparkles',

      color:
        'cyan',

      count: 82,

      semantic_role:
        'related',

      semantic_weight:
        0.78,
    },

    {
      name:
        'AI PC',

      slug:
        'ai',

      icon:
        'cpu',

      color:
        'blue',

      count: 64,

      semantic_role:
        'highlight',

      semantic_weight:
        0.92,
    },

    {
      name:
        'RTX 5070',

      slug:
        'rtx-5070',

      icon:
        'gpu',

      color:
        'green',

      count: 48,

      semantic_role:
        'related',

      semantic_weight:
        0.74,
    },

    {
      name:
        'Core Ultra 7',

      slug:
        'intel-core-ultra-7',

      icon:
        'cpu',

      color:
        'orange',

      count: 268,

      semantic_role:
        'primary',

      semantic_weight:
        0.92,
    },

  ]

  /* ======================================
  🔥 Exclude Self
  ====================================== */

  return fallback

    .filter(
      (
        attribute
      ) => (

        attribute.slug
        !== semantic?.slug
      )
    )

    .slice(
      0,
      limit
    )
}