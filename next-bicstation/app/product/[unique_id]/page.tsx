// ============================================================================
// FILE:
// app/product/[unique_id]/page.tsx
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

// import ProductSemanticSection
//   from './section/ProductSemanticSection'

// import ProductSpecSection
//   from './section/ProductSpecSection'

// import ProductComparisonSection
//   from './section/ProductComparisonSection'

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

    await getProductDetailRuntime(

      params.unique_id,

    )

  if (!runtime.found) {

    return {

      title:
        'PCが見つかりません',

      description:
        'SHIN CORE LINX',

    }

  }

  const product =

    runtime.product

  const semanticRuntime =

    runtime.semanticRuntime

  const title =

    `${product.name} | SHIN CORE LINX`

  const description =

    semanticRuntime?.semanticSummary

    ||

    product.description

    ||

    `${product.name} の詳細情報`

  const canonical =

    `https://bicstation.com/product/${params.unique_id}`

  return {

    title,

    description,

    alternates: {

      canonical,

    },

    openGraph: {

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

  const uniqueId =

    params.unique_id

  const runtime =

    await getProductDetailRuntime(

      uniqueId

    )

  if (!runtime.found) {

    return (

      <ProductEmptyState />

    )

  }

  const product =

    runtime.product

  const semanticRuntime =

    runtime.semanticRuntime

  const compiledRuntime =

    runtime.compiledRuntime

  const related =

    await fetchRelatedPC(

      uniqueId

    )

  const productSchema = {

    '@context':
      'https://schema.org',

    '@type':
      'Product',

    name:
      product.name,

    image:
      product.imageUrl,

    description:

      semanticRuntime?.semanticSummary

      ||

      product.description

      ||

      '',
    brand: {

      '@type':
        'Brand',

      name:

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
          breadcrumbs={
            (product as any)?.breadcrumbs
          }
        />

        {/* ======================================================
        Hero
        ====================================================== */}

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

        {/* ======================================================
        Semantic
        ====================================================== */}

        {/* <ProductSemanticSection

          product={

            product

          }

          semanticRuntime={

            semanticRuntime

          }

        /> */}

        {/* ======================================================
        Specs
        ====================================================== */}

        {/* <ProductSpecSection

          product={

            product

          }

          compiledRuntime={

            compiledRuntime

          }

        /> */}

        {/* ======================================================
        Comparison
        ====================================================== */}

        {/* <ProductComparisonSection

          product={

            product

          }

          compiledRuntime={

            compiledRuntime

          }

        /> */}

        {/* ======================================================
        Related
        ====================================================== */}

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

        {/* ======================================================
        FAQ
        ====================================================== */}

        <ProductFaq

          product={

            product

          }

        />

        {/* ======================================================
        CTA
        ====================================================== */}

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