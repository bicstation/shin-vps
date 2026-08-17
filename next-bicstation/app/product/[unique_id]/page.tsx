// ============================================================================
// FILE:
// app/product/[unique_id]/page.tsx
//
// SHIN CORE LINX
// Product Detail Page
//
// EXPERIENCE FLOW
//
// 01 — Breadcrumb
//      ↓
// 02 — Product Hero
//      ↓
// 03 — Product AI Summary
//      ↓
// 04 — Product Points
//      ↓
// 05 — Product Evaluation
//      ↓
// 06 — Product Specification
//      ↓
// 07 — Product Related / Discovery
//      ↓
// 08 — FAQ
//      ↓
// 09 — Final CTA
//
// RESPONSIBILITY
//
// page.tsx
//      = Product Detail Experience Orchestrator
//
// ✓ Controls section order
// ✓ Loads Product Detail Runtime
// ✓ Loads Related Products
// ✓ Passes Runtime data to responsible sections
// ✓ Provides page-level SEO metadata
// ✓ Provides Product structured data
//
// ✗ Does not generate semantic meaning
// ✗ Does not generate product evaluation
// ✗ Does not generate recommendations
// ✗ Does not transform Product Reality
//
// ============================================================================


/* ============================================================================
🔥 API
============================================================================ */

import {
  getProductDetailRuntime,
} from '@/shared/lib/api/django/pc/product-detail'

import {
  fetchRelatedPC,
} from '@/shared/lib/api/django/pc/related/related'


/* ============================================================================
🔥 Next
============================================================================ */

import type {
  Metadata,
} from 'next'


/* ============================================================================
🔥 Sections
============================================================================ */

import ProductHeroSection
  from './section/ProductHeroSection'

import ProductAISection
  from './section/ProductAISection'

import ProductPointsSection
  from './section/ProductPointsSection'

import ProductSpecSection
  from './section/ProductSpecSection'

import ProductRelatedSection
  from './section/ProductRelatedSection'

import ProductCTASection
  from './section/ProductCTASection'

import ProductEvaluationSection
  from './section/ProductEvaluationSection'


/* ============================================================================
🔥 Common
============================================================================ */

import ProductBreadcrumb
  from './components/common/ProductBreadcrumb'


/* ============================================================================
🔥 FAQ
============================================================================ */

import ProductFaq
  from './components/faq/ProductFaq'


/* ============================================================================
🔥 States
============================================================================ */

import ProductEmptyState
  from './states/ProductEmptyState'


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  params: {

    unique_id:
      string

  }

}


/* ============================================================================
🔥 SEO Helpers
============================================================================ */

/**
 * ============================================================================
 * Product SEO Description
 * ============================================================================
 *
 * Priority
 *
 * Product AI Summary
 *        ↓
 * Semantic Runtime Summary
 *        ↓
 * Product Description
 *        ↓
 * Fallback
 *
 * Product AI Summary is preferred because it is also
 * the primary semantic explanation presented in the
 * Product Detail Experience.
 *
 * ============================================================================
 */

function getProductSeoDescription(
  product: any,
  semanticRuntime: any,
): string {

  return (

    product?.aiSummary?.trim()

    ||

    semanticRuntime?.semanticSummary?.trim()

    ||

    product?.description?.trim()

    ||

    `${product?.name || 'このPC'} の詳細情報`

  )

}


/**
 * ============================================================================
 * Product Brand
 * ============================================================================
 *
 * Prefer the explicit Product Brand.
 *
 * Fallback:
 *
 * brand
 *   ↓
 * maker
 *
 * No brand is generated or inferred here.
 *
 * ============================================================================
 */

function getProductBrand(
  product: any,
): string {

  return (

    product?.brand?.trim()

    ||

    product?.maker?.trim()

    ||

    ''

  )

}


/* ============================================================================
🔥 Metadata
============================================================================ */

export async function generateMetadata({

  params,

}: Props): Promise<Metadata> {

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 PRODUCT METADATA'
  )

  console.log(
    'params.unique_id =',
    params.unique_id
  )

  console.log(
    'decodeURIComponent =',
    decodeURIComponent(
      params.unique_id
    )
  )

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )


  /* ==========================================================================
  Unique ID
  ========================================================================== */

  const uniqueId =

    decodeURIComponent(
      params.unique_id
    )


  /* ==========================================================================
  Product Detail Runtime
  ========================================================================== */

  const runtime =

    await getProductDetailRuntime(
      uniqueId
    )


  /* ==========================================================================
  Not Found
  ========================================================================== */

  if (
    !runtime.found
  ) {

    return {

      title:
        'PCが見つかりません',

      description:
        'SHIN CORE LINX',

    }

  }


  /* ==========================================================================
  Product
  ========================================================================== */

  const product =
    runtime.product


  /* ==========================================================================
  Semantic Runtime
  ========================================================================== */

  const semanticRuntime =
    runtime.semanticRuntime


  /* ==========================================================================
  Breadcrumb Debug
  ========================================================================== */

  console.log(
    '🔥 [BREADCRUMB DEBUG]',
    {

      uniqueId:
        product.uniqueId,

      name:
        product.name,

      breadcrumbs:
        (product as any)?.breadcrumbs,

    }
  )


  /* ==========================================================================
  SEO Description
  ========================================================================== */

  const description =

    getProductSeoDescription(
      product,
      semanticRuntime
    )


  /* ==========================================================================
  Title
  ========================================================================== */

  const title =
    `${product.name} | SHIN CORE LINX`


  /* ==========================================================================
  Canonical
  ========================================================================== */

  const canonical =

    `https://bicstation.com/product/${encodeURIComponent(
      uniqueId
    )}`


  /* ==========================================================================
  Return Metadata
  ========================================================================== */

  return {

    title,

    description,

    alternates: {

      canonical,

    },

    openGraph: {

      type:
        'website',

      title,

      description,

      url:
        canonical,

      images:

        product.imageUrl

          ? [

              {

                url:
                  product.imageUrl,

              },

            ]

          : [],

    },

    twitter: {

      card:
        'summary_large_image',

      title,

      description,

      images:

        product.imageUrl

          ? [

              product.imageUrl,

            ]

          : [],

    },

  }

}


/* ============================================================================
🔥 Product Page
============================================================================ */

export default async function ProductPage({

  params,

}: Props) {

  /* ==========================================================================
  Debug
  ========================================================================== */

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 PRODUCT PAGE'
  )

  console.log(
    'params.unique_id =',
    params.unique_id
  )

  console.log(
    'decodeURIComponent =',
    decodeURIComponent(
      params.unique_id
    )
  )

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )


  /* ==========================================================================
  Unique ID
  ========================================================================== */

  const uniqueId =

    decodeURIComponent(
      params.unique_id
    )


  /* ==========================================================================
  Product Detail Runtime
  ========================================================================== */

  const runtime =

    await getProductDetailRuntime(
      uniqueId
    )


  /* ==========================================================================
  Product Not Found
  ========================================================================== */

  if (
    !runtime.found
  ) {

    console.log(
      '❌ PRODUCT NOT FOUND'
    )

    console.log(
      'requested =',
      uniqueId
    )

    return (
      <ProductEmptyState />
    )

  }


  /* ==========================================================================
  Product Found
  ========================================================================== */

  console.log(
    '✅ PRODUCT FOUND'
  )

  console.log(
    'runtime.product.uniqueId =',
    runtime.product.uniqueId
  )


  /* ==========================================================================
  Runtime
  ========================================================================== */

  const product =
    runtime.product


  const semanticRuntime =
    runtime.semanticRuntime


  const compiledRuntime =
    runtime.compiledRuntime


  /* ==========================================================================
  Related Products
  ========================================================================== */

  const related =

    await fetchRelatedPC(
      uniqueId
    )


  /* ==========================================================================
  SEO Description
  ========================================================================== */

  const seoDescription =

    getProductSeoDescription(
      product,
      semanticRuntime
    )


  /* ==========================================================================
  Product Brand
  ========================================================================== */

  const productBrand =

    getProductBrand(
      product
    )


  /* ==========================================================================
  Product Schema
  ========================================================================== */

  const productSchema = {

    '@context':
      'https://schema.org',

    '@type':
      'Product',

    name:
      product.name,

    image:
      product.imageUrl
        ? [
            product.imageUrl,
          ]
        : [],

    description:
      seoDescription,

    ...(productBrand
      ? {

          brand: {

            '@type':
              'Brand',

            name:
              productBrand,

          },

        }

      : {}),

    offers: {

      '@type':
        'Offer',

      price:
        product.price,

      priceCurrency:
        'JPY',

      availability:
        'https://schema.org/InStock',

    },

  }


  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <>

      {/* ======================================================================
      Structured Data
      ====================================================================== */}

      <script

        type="application/ld+json"

        dangerouslySetInnerHTML={{

          __html:
            JSON.stringify(
              productSchema
            ),

        }}

      />


      {/* ======================================================================
      Product Detail
      ====================================================================== */}

      <main>


        {/* ====================================================================
        01 — BREADCRUMB
        ==================================================================== */}

        <ProductBreadcrumb

          breadcrumbs={
            (product as any)?.breadcrumbs
          }

        />


        {/* ====================================================================
        02 — PRODUCT HERO
        ==================================================================== */}

        <ProductHeroSection

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


        {/* ====================================================================
        03 — PRODUCT AI SUMMARY
        ==================================================================== */}

        <ProductAISection

          product={
            product
          }

          semanticRuntime={
            semanticRuntime
          }

        />


        {/* ====================================================================
        04 — PRODUCT POINTS
        ==================================================================== */}

        <ProductPointsSection

          product={
            product
          }

        />


        {/* ====================================================================
        05 — PRODUCT EVALUATION
        ==================================================================== */}

        <ProductEvaluationSection

          product={
            product
          }

        />


        {/* ====================================================================
        06 — PRODUCT SPECIFICATION
        ==================================================================== */}

        <ProductSpecSection

          product={
            product
          }

        />


        {/* ====================================================================
        07 — PRODUCT RELATED / DISCOVERY
        ==================================================================== */}

        <ProductRelatedSection

          product={
            product
          }

          related={
            related
          }

          semanticRuntime={
            semanticRuntime
          }

        />


        {/* ====================================================================
        08 — FAQ
        ==================================================================== */}

        <ProductFaq

          product={
            product
          }

        />


        {/* ====================================================================
        09 — FINAL CTA
        ==================================================================== */}

        <ProductCTASection

          product={
            product
          }

          semanticRuntime={
            semanticRuntime
          }

        />


      </main>

    </>

  )

}