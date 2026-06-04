// /home/maya/shin-vps/next-bicstation/app/home/orchestration/resolveRuntimeVisibility.ts

/* ============================================================================
🔥 Types
============================================================================ */

type ResolveRuntimeVisibilityProps = {
runtime?: any
topology?: any
injections?: any
}

/* ============================================================================
🔥 Resolve Runtime Visibility
============================================================================ */

export function resolveRuntimeVisibility({
runtime,
topology,
injections,
}: ResolveRuntimeVisibilityProps) {

// ======================================================
// Sections
// ======================================================

const sections =


Array.isArray(
  topology?.sections
)

  ? topology.sections

  : []


// ======================================================
// Injection Map
// ======================================================

const injectionMap =
injections?.injectionMap
|| {}

// ======================================================
// Runtime Flags
// ======================================================

const hasSemanticRuntime =
!!runtime?.semantic_runtime

const hasAdaptiveRuntime =
!!runtime?.adaptive_runtime

const hasRanking =


Array.isArray(
  runtime?.ranking?.products
)

  ? runtime.ranking.products.length > 0

  : false


const hasSidebar =
!!runtime?.sidebar

// ======================================================
// Visibility Resolver
// ======================================================

const resolvedSections =


sections.map(
  (section: any) => {

    const sectionType =
      section?.type

    const injection =
      injectionMap?.[
        sectionType
      ]


        // ==================================================
        // Base Visibility
        // ==================================================

        let visible =
          !!section?.visible

        let visibilityReason =
          'base visibility'

        let runtimeSource =
          'topology'

        // ==================================================
        // Injection Visibility
        // ==================================================

        if (
          injection &&
          !injection.enabled
        ) {

          visible = false

          visibilityReason =
            'injection disabled'

          runtimeSource =
            'injection'

        }

        // ==================================================
        // Runtime-Aware Visibility
        // ==================================================

        switch (
          sectionType
        ) {

          case 'hero_ranking':

          case 'ranking_grid':

            visible =
              hasRanking

            visibilityReason =
              hasRanking

                ? 'ranking products available'

                : 'ranking products missing'

            runtimeSource =
              'ranking'

            break

          case 'recommended_paths':

          case 'capability':

          case 'guide':

          case 'trust':

          case 'finder_cta':

            visible =
              hasSemanticRuntime
              || visible

            visibilityReason =
              hasSemanticRuntime

                ? 'semantic runtime enabled'

                : 'topology visibility fallback'

            runtimeSource =
              'semantic_runtime'

            break

          case 'hero':

          case 'intent_navigation':

          case 'bottom_cta':

          case 'sticky_cta':

            visible = true

            visibilityReason =
              'core section always enabled'

            runtimeSource =
              'system'

            break

          default:

            visibilityReason =
              visible

                ? 'topology visible'

                : 'topology hidden'

            runtimeSource =
              'topology'

            break

        }

    

    // ==================================================
    // Injection Visibility
    // ==================================================

    if (
      injection &&
      !injection.enabled
    ) {

      visible = false

    }

    // ==================================================
    // Runtime-Aware Visibility
    // ==================================================

    switch (
      sectionType
    ) {

      case 'hero_ranking':

      case 'ranking_grid':

        visible =
          hasRanking

        break

      case 'recommended_paths':

      case 'capability':

      case 'guide':

      case 'trust':

      case 'finder_cta':

        visible =
          hasSemanticRuntime
          || visible

        break

      case 'hero':

      case 'intent_navigation':

      case 'bottom_cta':

      case 'sticky_cta':

        visible = true

        break

    }

    // ==================================================
    // Return Section
    // ==================================================

    return {

      type:
        sectionType,

      priority:
        section?.priority || 0,

      runtime:
        section?.runtime,

      visible,

      visibilityReason,

      runtimeSource,

      runtimeAware:
        true,

      semanticRuntime:
        hasSemanticRuntime,

      adaptiveRuntime:
        hasAdaptiveRuntime,

      sidebar:
        hasSidebar,
    }

  }
)


// ======================================================
// Visible Sections
// ======================================================

const visibleSections =


resolvedSections.filter(
  (section: any) =>
    section.visible
)


// ======================================================
// Ordered Sections
// ======================================================

const orderedSections =


[...visibleSections].sort(

  (
    a,
    b
  ) =>

    a.priority
    -
    b.priority

)


// ======================================================
// Summary
// ======================================================

const summary = {


totalSections:
  sections.length,

visibleSections:
  orderedSections.length,

hasRanking,

hasSidebar,

hasSemanticRuntime,

hasAdaptiveRuntime,


}

console.log({

  hasRanking,

  productCount:
    runtime?.ranking?.products?.length,

})

// ======================================================
// Return
// ======================================================

return {


sections:
  orderedSections,

sectionCount:
  orderedSections.length,

summary,

runtime: {

  semantic:
    hasSemanticRuntime,

  adaptive:
    hasAdaptiveRuntime,
},

debug: {

  topologyResolved:
    true,

  visibleSections:
    orderedSections.length,
},


}

}
