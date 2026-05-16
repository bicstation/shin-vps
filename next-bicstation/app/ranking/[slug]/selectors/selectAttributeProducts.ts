// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/selectors/selectAttributeProducts.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectAttributeProducts(

  runtime?: any,

  limit = 24

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
  🔥 Products
  ====================================== */

  const products =

    Array.isArray(
      runtime?.products
    )

      ? runtime.products

      : []

  /* ======================================
  🔥 Normalize
  ====================================== */

  const normalized =

    products

      .filter(
        (
          product: any
        ) => (

          product
          && typeof product
            === 'object'

          && !!product?.unique_id
        )
      )

      .map(
        (
          product: any,
          index: number
        ) => ({

          ...product,

          ranking_position:
            index + 1,

          semantic_role:
            product?.semantic_role
            || 'ranking',

          semantic_weight:

            typeof product
              ?.semantic_weight
              === 'number'

              ? product
                .semantic_weight

              : 0.82,
        })
      )

  /* ======================================
  🔥 Sort
  ====================================== */

  const sorted =

    normalized.sort(
      (
        a: any,
        b: any
      ) => {

        const scoreA =

          Number(
            a?.score
            || 0
          )

        const scoreB =

          Number(
            b?.score
            || 0
          )

        return (
          scoreB - scoreA
        )

      }
    )

  /* ======================================
  🔥 Limit
  ====================================== */

  return sorted.slice(
    0,
    limit
  )
}