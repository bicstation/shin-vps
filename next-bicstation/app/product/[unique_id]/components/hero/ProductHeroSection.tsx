// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductHeroSection.tsx
// Product Runtime Hero Orchestrator V6
// ============================================================================
//
// SHIN CORE LINX
//
// Product Detail Hero Experience
//
// Product
//      ↓
// ProductHero
//      ↓
// ProductAISummary
//      ↓
// ProductHeroCapability
//
// Experience Structure
//
// ① Product Identity
//      └─ 製品名 / メーカー / 画像 / 価格
//
// ② Product Understanding
//      └─ {product.name} は、どんなPC？
//
// ③ Product Capability / Evidence
//      ├─ {product.name} でできること
//      └─ {product.name} が選ばれる理由
//
// Authority
//
// ProjectedProduct
// ProjectedSemanticRuntime
//      ↓
// Product Experience
//
// ============================================================================

import ProductBreadcrumb
  from '../common/ProductBreadcrumb'

import ProductHero
  from './ProductHero'

import ProductAISummary
  from './ProductAISummary'

import ProductHeroCapability
  from './ProductHeroCapability'

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

  product:
    ProjectedProduct

  semanticRuntime?:
    ProjectedSemanticRuntime

  compiledRuntime?:
    ProjectedCompiledRuntime

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

      {/* ======================================================================
      BREADCRUMB
      ====================================================================== */}

      <ProductBreadcrumb

        breadcrumbs={

          product?.breadcrumbs

        }

      />


      {/* ======================================================================
      HERO
      ====================================================================== */}

      <ProductHero

        product={
          product
        }

        // semanticRuntime={
        //   semanticRuntime
        // }

      />


      {/* ======================================================================
      PRODUCT UNDERSTANDING
      ====================================================================== */}

      <ProductAISummary

        product={
          product
        }

        semanticRuntime={
          semanticRuntime
        }

      />


      {/* ======================================================================
      PRODUCT CAPABILITY / EVIDENCE
      ====================================================================== */}

      <ProductHeroCapability

        product={
          product
        }

        semanticRuntime={
          semanticRuntime
        }

      />

    </>

  )

}