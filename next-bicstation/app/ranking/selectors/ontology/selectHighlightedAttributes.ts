// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/selectors/ontology/selectHighlightedAttributes.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectHighlightedAttributes(

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
  🔥 Highlight
  ====================================== */

  return attributes

    .filter(
      (
        attribute: any
      ) => (

        attribute?.semantic_role
        === 'highlight'

      )
    )

    .sort(
      (
        a: any,
        b: any
      ) => (

        (
          b?.semantic_weight
          || 0
        )

        -

        (
          a?.semantic_weight
          || 0
        )

      )
    )

    .slice(0, 12)
}