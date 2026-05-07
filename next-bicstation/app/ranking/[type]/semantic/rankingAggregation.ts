/* =========================================
🔥 Types
========================================= */

type SemanticGroupMap =
  Record<
    string,
    any[]
  >

/* =========================================
🔥 Aggregation
========================================= */

export function aggregateSemanticGroups(
  products: any[]
): SemanticGroupMap {

  if (!products?.length) {
    return {}
  }

  const groupedMap:
    SemanticGroupMap = {}

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
            groupedMap[group] = []
          }

          groupedMap[group]
            .push(...attrs)
        }
      )
    }
  )

  return groupedMap
}