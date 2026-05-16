// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/selectors/shared/selectBreadcrumbs.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectBreadcrumbs(

  runtime?: any

) {

  /* ======================================
  🔥 Runtime Breadcrumbs
  ====================================== */

  const runtimeBreadcrumbs =

    runtime?.breadcrumbs

  /* ======================================
  🔥 Runtime Priority
  ====================================== */

  if (
    Array.isArray(
      runtimeBreadcrumbs
    )
    &&
    runtimeBreadcrumbs.length
  ) {

    return runtimeBreadcrumbs

      .filter(
        (
          item: any
        ) => (

          item
          && typeof item
            === 'object'

        )
      )

      .map(
        (
          item: any
        ) => ({

          name:

            item?.name
            || item?.title
            || 'Untitled',

          href:

            item?.href
            || item?.url
            || '/',
        })
      )

  }

  /* ======================================
  🔥 Semantic Fallback
  ====================================== */

  const semantic =

    runtime?.semantic
    || {}

  const title =

    semantic?.title
    || semantic?.name
    || 'Semantic Ranking'

  const slug =

    semantic?.slug
    || null

  /* ======================================
  🔥 Default
  ====================================== */

  const items = [

    {

      name:
        'Home',

      href:
        '/',
    },

    {

      name:
        'Ranking',

      href:
        '/ranking',
    },

  ]

  /* ======================================
  🔥 Attribute
  ====================================== */

  if (slug) {

    items.push({

      name:
        title,

      href:
        `/ranking/${slug}`,
    })

  }

  /* ======================================
  🔥 Return
  ====================================== */

  return items
}