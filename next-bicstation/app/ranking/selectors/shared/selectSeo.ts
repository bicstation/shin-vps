// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/selectors/shared/selectSeo.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectSeo(

  runtime?: any

) {

  /* ======================================
  🔥 Runtime
  ====================================== */

  const seo =

    runtime?.seo
    || {}

  const semantic =

    runtime?.semantic
    || {}

  /* ======================================
  🔥 Normalize
  ====================================== */

  return {

    title:

      seo?.title
      || semantic?.title
      || semantic?.name
      || 'Semantic Ranking',

    description:

      seo?.description
      || semantic?.description
      || '',

    canonical:

      seo?.canonical
      || null,

    keywords:

      Array.isArray(
        seo?.keywords
      )

        ? seo.keywords

        : [],

    openGraph:

      seo?.openGraph
      || seo?.open_graph
      || {},

    twitter:

      seo?.twitter
      || {},

  }
}