// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/selectors/ontology/selectSemanticGroups.ts

/* =========================================
🔥 Types
========================================= */

type SemanticAttribute = {

  name?: string

  slug?: string

  count?: number

  semantic_role?: string

  semantic_weight?: number
}

type SemanticGroup = {

  key: string

  label: string

  totalAttributes: number

  totalProducts: number

  attributes: SemanticAttribute[]
}

/* =========================================
🔥 Utils
========================================= */

function formatGroupLabel(
  key: string
) {

  return key

    .replaceAll(
      '_',
      ' '
    )

    .replace(
      /\b\w/g,
      (
        char
      ) => char.toUpperCase()
    )
}

/* =========================================
🔥 Selector
========================================= */

export function
selectSemanticGroups(

  runtime?: any

): SemanticGroup[] {

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
  🔥 Runtime Entries
  ====================================== */

  const entries =

    Object.entries(runtime)

  /* ======================================
  🔥 Groups
  ====================================== */

  const groups =

    entries

      .filter(
        (
          [, value]
        ) => (

          Array.isArray(value)
          && value.length > 0

        )
      )

      .map(
        (
          [
            key,
            attributes,
          ]
        ) => {

          /* ==============================
          VALID ATTRIBUTES
          ============================== */

          const validAttributes =

            attributes

              .filter(
                (
                  attribute: any
                ) => (

                  attribute
                  && typeof attribute
                    === 'object'

                  && attribute?.slug

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

          /* ==============================
          TOTAL PRODUCTS
          ============================== */

          const totalProducts =

            validAttributes.reduce(

              (
                total: number,
                attribute: any
              ) => (

                total
                + (
                  attribute?.count
                  || 0
                )

              ),

              0
            )

          /* ==============================
          RETURN
          ============================== */

          return {

            key,

            label:
              formatGroupLabel(
                key
              ),

            totalAttributes:
              validAttributes.length,

            totalProducts,

            attributes:
              validAttributes,

          }

        }
      )

  /* ======================================
  🔥 Sort Groups
  ====================================== */

  return groups.sort(
    (
      a,
      b
    ) => (

      b.totalProducts
      -
      a.totalProducts

    )
  )
}