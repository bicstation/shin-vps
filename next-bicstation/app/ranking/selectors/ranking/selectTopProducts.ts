// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/selectors/ranking/selectTopProducts.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectTopProducts(

  products?: any[],

  limit = 12

) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !Array.isArray(products)
    || !products.length
  ) {
    return []
  }

  /* ======================================
  🔥 Normalize
  ====================================== */

  const normalized =

    products.filter(
      (
        product: any
      ) => (

        product
        && typeof product
          === 'object'

        && product?.unique_id

      )
    )

  /* ======================================
  🔥 Sort
  ====================================== */

  const sorted =

    [...normalized]

      .sort(
        (
          a: any,
          b: any
        ) => {

          /* ============================
          SCORE PRIORITY
          ============================ */

          const scoreDiff =

            (
              b?.score
              || 0
            )

            -

            (
              a?.score
              || 0
            )

          if (scoreDiff !== 0) {
            return scoreDiff
          }

          /* ============================
          PRICE FALLBACK
          ============================ */

          return (

            (
              b?.price
              || 0
            )

            -

            (
              a?.price
              || 0
            )

          )

        }
      )

  /* ======================================
  🔥 Slice
  ====================================== */

  return sorted.slice(
    0,
    limit
  )
}