// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/selectors/ontology/selectPopularAttributes.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectPopularAttributes(

  runtime?: any

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
  🔥 Flatten
  ====================================== */

  const attributes =

    Object.values(runtime)
      .flat()

      .filter(
        (
          attribute: any
        ) => (

          attribute
          && typeof attribute === 'object'

        )
      )

  /* ======================================
  🔥 Popular
  ====================================== */

  return attributes

    .filter(
      (
        attribute: any
      ) => (

        typeof
          attribute?.count
        === 'number'

      )
    )

    .sort(
      (
        a: any,
        b: any
      ) => (

        (
          b?.count
          || 0
        )

        -

        (
          a?.count
          || 0
        )

      )
    )

    .slice(0, 12)
}