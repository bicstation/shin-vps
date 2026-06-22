// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/page.tsx
// ============================================================================

/* ============================================================================
🔥 API
============================================================================ */


import {  fetchProductDetail,} from '@/shared/lib/api/django/pc/product-detail'
import {  fetchRelatedPC,} from '@/shared/lib/api/django/pc/related/related'

/* ============================================================================
🔥 Next
============================================================================ */

import type { Metadata, } from 'next'

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

// type Props = {
//   semanticRuntime: any
//   params: {
//   unique_id: string
//   }
// }

type Props = {
  product: any
  semanticRuntime: any
}

/* ============================================================================
🔥 Metadata
============================================================================ */

export async function generateMetadata({
params,
}: Props): Promise<Metadata> {

// ==========================================================================
// Unique ID
// ==========================================================================

const uniqueId =
params.unique_id

// ==========================================================================
// Product
// ==========================================================================

const runtime =
await fetchProductDetail(
  uniqueId
)

console.log(
  '🔥 PRODUCT DETAIL RUNTIME',
  runtime
)

const product =
runtime?.product


console.log(
  '🔥 semantic runtime',
  runtime?.product_semantic_runtime
)

// ==========================================================================
// Empty
// ==========================================================================

if (!product) {


return {

  title:
    'PCが見つかりません',

  description:
    'SHIN CORE LINX',
}


}

// ==========================================================================
// SEO
// ==========================================================================

const title =


`${product.name} | SHIN CORE LINX`


const description =


product.ai_summary
|| `${product.name} の詳細スペック・用途・関連PCを掲載しています。`


// ==========================================================================
// Return
// ==========================================================================

return {


title,

description,

openGraph: {

  title,

  description,

  images: product.image_url
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

// ==========================================================================
// Unique ID
// ==========================================================================

const uniqueId =
params.unique_id

// ==========================================================================
// Product Runtime
// ==========================================================================

const runtime =
await fetchProductDetail(
  uniqueId
)

console.log(
  '🔥 PRODUCT DETAIL RUNTIME',
  runtime
)

const product =
runtime?.product


// ==========================================================================
// Related Runtime
// ==========================================================================

const related =
await fetchRelatedPC(
uniqueId
)

// ==========================================================================
// Empty
// ==========================================================================

if (!product) {


return (

  <ProductEmptyState />

)


}

// ==========================================================================
// JSON-LD
// ==========================================================================

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
  product.ai_summary,

brand: {

  '@type':
    'Brand',

  name:
    product.maker_name
    || product.maker,
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

/* ==========================================================================
🔥 Render
========================================================================== */

return (


<>

  {/* ================================================================
  JSON-LD
  ================================================================ */}

  <script
    type="application/ld+json"

    dangerouslySetInnerHTML={{
      __html:
        JSON.stringify(
          productSchema
        ),
    }}
  />

  {/* ================================================================
  MAIN
  ================================================================ */}

  <main>

    {/* ============================================================
    BREADCRUMB
    ============================================================ */}

    <ProductBreadcrumb
      product={product}
    />

    {/* ============================================================
    HERO
    ============================================================ */}

    <ProductHeroSection
      product={product}
      semanticRuntime={
        runtime?.product_semantic_runtime
      }
    />
    
    {/* ============================================================
    SEMANTIC
    ============================================================ */}

      <ProductSemanticSection
        product={product}
        semanticRuntime={
          runtime?.product_semantic_runtime
        }
      />
    {/* ============================================================
    SPEC
    ============================================================ */}

    <ProductSpecSection
      product={product}
    />

    {/* ============================================================
    COMPARISON
    ============================================================ */}

    <ProductComparisonSection
      product={product}
    />

    {/* ============================================================
    RELATED
    ============================================================ */}

    <ProductRelatedSection
      product={product}
      related={related}
    />

    {/* ============================================================
    FAQ
    ============================================================ */}

    <ProductFaq
      product={product}
    />

    {/* ============================================================
    CTA
    ============================================================ */}

    <ProductCTASection
      product={product}
    />

  </main>

</>


)
}
