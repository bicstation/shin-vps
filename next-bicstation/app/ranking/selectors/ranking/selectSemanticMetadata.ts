// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/selectors/ranking/selectSemanticMetadata.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectSemanticMetadata(

  runtime?: any

) {

  /* ======================================
  🔥 Runtime
  ====================================== */

  const semantic =

    runtime?.semantic
    || {}

  const seo =

    runtime?.seo
    || {}

  /* ======================================
  🔥 Metadata
  ====================================== */

  return {

    /* ====================================
    🔥 Semantic
    ==================================== */

    slug:

      semantic?.slug
      || null,

    title:

      semantic?.title
      || semantic?.name
      || 'Semantic Ranking',

    description:

      semantic?.description
      || seo?.description
      || '',

    semanticRole:

      semantic?.semantic_role
      || 'ranking',

    semanticWeight:

      typeof
        semantic?.semantic_weight
      === 'number'

        ? semantic.semantic_weight

        : null,

    color:

      semantic?.color
      || null,

    icon:

      semantic?.icon
      || null,

    count:

      semantic?.count
      || null,

    /* ====================================
    🔥 SEO
    ==================================== */

    seoTitle:

      seo?.title
      || semantic?.title
      || null,

    seoDescription:

      seo?.description
      || semantic?.description
      || null,

    keywords:

      Array.isArray(
        seo?.keywords
      )

        ? seo.keywords

        : [],

    canonical:

      seo?.canonical
      || null,

  }
}