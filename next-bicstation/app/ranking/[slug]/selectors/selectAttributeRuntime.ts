// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/selectors/selectAttributeRuntime.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectAttributeRuntime(

  runtime?: any,

  slug?: string

) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !runtime
    || typeof runtime !== 'object'
  ) {

    return {

      slug:
        slug || '',

      semantic: {},

      products: [],

      seo: {},

      faq: [],

      breadcrumbs: [],

      schemas: {},

      ui: {},
    }

  }

  /* ======================================
  🔥 Semantic
  ====================================== */

  const semantic =

    runtime?.semantic
    || {}

  /* ======================================
  🔥 Products
  ====================================== */

  const products =

    Array.isArray(
      runtime?.products
    )

      ? runtime.products

      : []

  /* ======================================
  🔥 FAQ
  ====================================== */

  const faq =

    Array.isArray(
      runtime?.faq
    )

      ? runtime.faq

      : []

  /* ======================================
  🔥 Breadcrumbs
  ====================================== */

  const breadcrumbs =

    Array.isArray(
      runtime?.breadcrumbs
    )

      ? runtime.breadcrumbs

      : []

  /* ======================================
  🔥 Normalize
  ====================================== */

  return {

    slug:

      semantic?.slug
      || slug
      || '',

    semantic: {

      name:
        semantic?.name
        || semantic?.title
        || '',

      title:
        semantic?.title
        || semantic?.name
        || '',

      description:
        semantic?.description
        || '',

      slug:
        semantic?.slug
        || slug
        || '',

      icon:
        semantic?.icon
        || '',

      color:
        semantic?.color
        || 'blue',

      semantic_role:
        semantic?.semantic_role
        || 'primary',

      semantic_weight:

        typeof semantic
          ?.semantic_weight
          === 'number'

          ? semantic
            .semantic_weight

          : 0,

      count:

        typeof semantic
          ?.count
          === 'number'

          ? semantic
            .count

          : products.length,
    },

    products,

    seo:
      runtime?.seo
      || {},

    faq,

    breadcrumbs,

    schemas:
      runtime?.schemas
      || {},

    ui:
      runtime?.ui
      || {},
  }
}