// ============================================================================
// FILE:
// app/product/[unique_id]/page.tsx
// ============================================================================

/* ============================================================================
🔥 API
============================================================================ */

import {
  fetchProductDetail,
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

import ProductSemanticSection
  from './section/ProductSemanticSection'

import ProductSpecSection
  from './section/ProductSpecSection'

import ProductComparisonSection
  from './section/ProductComparisonSection'

import ProductRelatedSection
  from './section/ProductRelatedSection'

import ProductCTASection
  from './section/ProductCTASection'

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

    unique_id: string

  }

}

/* ============================================================================
🔥 Metadata
============================================================================ */

export async function generateMetadata({

  params,

}: Props): Promise<Metadata> {

  const runtime =

    await fetchProductDetail(
      params.unique_id
    )

  const product =
    runtime?.product

  if (!product) {

    return {

      title:
        'PCが見つかりません',

      description:
        'SHIN CORE LINX',

    }

  }

  const title =

    `${product.name} | SHIN CORE LINX`

  const description =

    runtime
      ?.product_semantic_runtime
      ?.semantic_summary

    ||

    product.ai_summary

    ||

    `${product.name} の詳細情報`

  return {

    title,

    description,

    openGraph: {

      title,

      description,

      images:

        product.image_url

          ? [

              {

                url:
                  product.image_url,

              },

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

  const uniqueId =
    params.unique_id

  const runtime =

    await fetchProductDetail(
      uniqueId
    )

  const product =
    runtime?.product

  const semanticRuntime =

    runtime
      ?.product_semantic_runtime

  const related =

    await fetchRelatedPC(
      uniqueId
    )

  if (!product) {

    return (

      <ProductEmptyState />

    )

  }

  const productSchema = {

    '@context':
      'https://schema.org',

    '@type':
      'Product',

    name:
      product.name,

    image:
      product.image_url,

    description:

      semanticRuntime
        ?.semantic_summary

      ||

      product.ai_summary

      ||

      '',

    brand: {

      '@type':
        'Brand',

      name:

        product.maker_name

        ||

        product.maker,

    },

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

  return (

    <>

      {/* ==========================================================
      JSON-LD
      ========================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              productSchema
            ),
        }}
      />

      {/* ==========================================================
      MAIN
      ========================================================== */}

      <main>

        {/* ======================================================
        Breadcrumb
        ====================================================== */}

        <ProductBreadcrumb
          product={product}
        />

        {/* ======================================================
        Hero
        ====================================================== */}

        <ProductHeroSection
          product={product}
          semanticRuntime={
            semanticRuntime
          }
        />

        {/* ======================================================
        Semantic
        ====================================================== */}

        <ProductSemanticSection
          product={product}
          semanticRuntime={
            semanticRuntime
          }
        />

        {/* ======================================================
        Specs
        ====================================================== */}

        <ProductSpecSection
          product={product}
        />

        {/* ======================================================
        Comparison
        ====================================================== */}

        <ProductComparisonSection
          product={product}
        />

        {/* ======================================================
        Related
        ====================================================== */}

        <ProductRelatedSection
          product={product}
          related={related}
          semanticRuntime={
            semanticRuntime
          }
        />

        {/* ======================================================
        FAQ
        ====================================================== */}

        <ProductFaq
          product={product}
        />

        {/* ======================================================
        CTA
        ====================================================== */}

        <ProductCTASection
          product={product}
          semanticRuntime={
            semanticRuntime
          }
        />

      </main>

    </>

  )

}