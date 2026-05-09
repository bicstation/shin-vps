// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/semantic/rankingAggregation.ts

/* =========================================
🔥 Types
========================================= */

type SemanticAttribute = {

  slug?: string

  name?: string

  icon?: string

  semantic_role?: string

  semantic_weight?: number

  count?: number

  [key: string]: any
}

type SemanticGroupMap =
  Record<
    string,
    SemanticAttribute[]
  >

/* =========================================
🔥 Aggregation
========================================= */

export function
aggregateSemanticGroups(
  products: any[]
): SemanticGroupMap {

  // ======================================
  // Empty
  // ======================================

  if (!products?.length) {
    return {}
  }

  // ======================================
  // Internal Map
  // ======================================

  const groupedMap:
    Record<
      string,
      Record<
        string,
        SemanticAttribute
      >
    > = {}

  // ======================================
  // Aggregate
  // ======================================

  products.forEach(
    (product) => {

      const grouped =
        product
          ?.grouped_attributes
          || {}

      Object.entries(
        grouped
      ).forEach(
        ([group, attrs]) => {

          if (
            !groupedMap[group]
          ) {
            groupedMap[group] = {}
          }

          ;(
            attrs as
            SemanticAttribute[]
          ).forEach(
            (attr) => {

              const slug =
                attr?.slug
                || attr?.name

              if (!slug) {
                return
              }

              // --------------------------
              // First Insert
              // --------------------------

              if (
                !groupedMap[group][slug]
              ) {

                groupedMap[group][slug] = {

                  ...attr,

                  count: 1,
                }

                return
              }

              // --------------------------
              // Count Up
              // --------------------------

              groupedMap[group][slug]
                .count += 1
            }
          )
        }
      )
    }
  )

  // ======================================
  // Normalize
  // ======================================

  const normalized:
    SemanticGroupMap = {}

  Object.entries(
    groupedMap
  ).forEach(
    ([group, attrsMap]) => {

      normalized[group] =
        Object.values(
          attrsMap
        )
        .sort(
          (a, b) =>
            (b.count || 0)
            - (a.count || 0)
        )
    }
  )

  return normalized
}