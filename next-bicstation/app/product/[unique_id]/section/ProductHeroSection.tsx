// ============================================================================
// FILE:
// app/product/[unique_id]/section/ProductHeroSection.tsx
// Product Runtime Hero Orchestrator V6
// ============================================================================

import ProductBreadcrumb
  from '../components/common/ProductBreadcrumb'

import ProductHero
  from '../components/hero/ProductHero'

import ProductAISummary
  from '../components/hero/ProductAISummary'

import ProductHeroCapability
  from '../components/hero/ProductHeroCapability'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,
  ProjectedSemanticRuntime,
  ProjectedCompiledRuntime,

} from '@/shared/lib/api/django/pc/product-detail'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product: ProjectedProduct

  semanticRuntime?: ProjectedSemanticRuntime

  compiledRuntime?: ProjectedCompiledRuntime

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductHeroSection({

  product,

  semanticRuntime,

  compiledRuntime,

}: Props) {

  return (

    <>

      {/* ==========================================================
      BREADCRUMB
      ========================================================== */}

      <ProductBreadcrumb

        breadcrumbs={

          (product as any).breadcrumbs

        }

      />

      {/* ==========================================================
      HERO
      ========================================================== */}

      <ProductHero

        product={

          product

        }

        semanticRuntime={

          semanticRuntime

        }

        compiledRuntime={

          compiledRuntime

        }

      />

      {/* ==========================================================
      AI SUMMARY
      ========================================================== */}

      <ProductAISummary

        semanticRuntime={

          semanticRuntime

        }

      />

      {/* ==========================================================
      CAPABILITY
      ========================================================== */}

      <ProductHeroCapability

        semanticRuntime={

          semanticRuntime

        }

        compiledRuntime={

          compiledRuntime

        }

      />

    </>

  )

}