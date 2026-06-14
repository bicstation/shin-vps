/* ============================================================================
🔥 Normalize Discover Runtime
============================================================================ */

export function normalizeDiscoverRuntime(

  payload?: any

): DiscoverRuntime {

  // ======================================
  // Compatibility Layer
  // ======================================
  //
  // Legacy
  // {
  //   success,
  //   products,
  //   results
  // }
  //
  // Semantic API v3
  // {
  //   meaning,
  //   seo,
  //   data
  // }
  //
  // ======================================

  const source =

    payload?.data

    ??

    payload

    ??

    {}

  // ======================================
  // Canonical Continuity
  // ======================================

  const products =
    normalizeProducts(source)

  const clusters =
    normalizeDiscoverClusters(source)

  const intents =
    normalizeDiscoverIntents(source)

  const paths =
    normalizePaths(source)

  const recommendations =
    normalizeRecommendations(source)

  // ======================================
  // Runtime Debug
  // ======================================

  console.log(
    '🔥 DISCOVER NORMALIZE',
    {

      products:
        products.length,

      clusters:
        clusters.length,

      intents:
        intents.length,

      paths:
        paths.length,

      recommendations:
        recommendations.length,

      source:
        payload?.data
          ? 'semantic-v3'
          : 'legacy',
    }
  )

  // ======================================
  // Return
  // ======================================

  return {

    // ====================================
    // Success Compatibility
    // ====================================

    success:

      payload?.success === true

      ||

      !!payload?.data

      ||

      !!payload,

    // ====================================
    // Semantic Runtime
    // ====================================

    semantic_schema_version:

      payload?.semantic_schema_version

      ||

      source?.semantic_schema_version

      ||

      1,

    semantic_runtime:

      payload?.semantic_runtime

      ||

      source?.semantic_runtime

      ||

      {},

    adaptive_runtime:

      payload?.adaptive_runtime

      ||

      source?.adaptive_runtime

      ||

      {},

    render_hints:

      payload?.render_hints

      ||

      source?.render_hints

      ||

      {},

    // ====================================
    // Canonical Continuity
    // ====================================

    products,

    clusters,

    intents,

    paths,

    recommendations,

    // ====================================
    // Exploration Continuity
    // ====================================

    grouped_attributes:

      source?.grouped_attributes

      ||

      {},

    semantic_graph:

      Array.isArray(
        source?.semantic_graph
      )

        ? source.semantic_graph

        : [],

    workflow_tags:

      Array.isArray(
        source?.workflow_tags
      )

        ? source.workflow_tags

        : [],

    semantic_labels:

      Array.isArray(
        source?.semantic_labels
      )

        ? source.semantic_labels

        : [],

    // ====================================
    // Observatory
    // ====================================

    observatory: {

      topology_source:

        source?.topology_source

        ||

        'discover-runtime',

      continuity_status:

        'normalized',

      normalized:

        true,

      runtime_path:

        'discover/normalize',

      warnings: [],
    },

    // ====================================
    // Meaning Layer
    // ====================================

    meaning:

      payload?.meaning

      ||

      {},

    // ====================================
    // SEO
    // ====================================

    seo:

      payload?.seo

      ||

      source?.seo

      ||

      {},

    faq:

      Array.isArray(
        source?.faq
      )

        ? source.faq

        : [],

    breadcrumbs:

      Array.isArray(
        source?.breadcrumbs
      )

        ? source.breadcrumbs

        : [],

    schemas:

      source?.schemas

      ||

      {},

    // ====================================
    // Raw Backup
    // ====================================

    raw:

      payload,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeDiscoverRuntime