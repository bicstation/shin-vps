// app/sitemap.ts

import type {
MetadataRoute,
} from 'next'

import {
fetchProducts,
} from '@/shared/lib/api/django/pc/products'

import {
fetchNavigationRuntime,
} from '@/shared/lib/api/django/pc/navigation'

const BASE_URL =
'https://bicstation.com'

const INCLUDE_RANKING =
false

export default async function sitemap():
Promise<MetadataRoute.Sitemap> {

const now = new Date()

const urls: MetadataRoute.Sitemap = [


{
  url:
    `${BASE_URL}`,

  lastModified:
    now,

  changeFrequency:
    'daily',

  priority:
    1.0,
},

{
  url:
    `${BASE_URL}/discover`,

  lastModified:
    now,

  changeFrequency:
    'daily',

  priority:
    0.9,
},

{
  url:
    `${BASE_URL}/finder`,

  lastModified:
    now,

  changeFrequency:
    'daily',

  priority:
    0.9,
},

{
  url:
    `${BASE_URL}/ranking`,

  lastModified:
    now,

  changeFrequency:
    'daily',

  priority:
    0.9,
},


]

/* =========================================================

* Navigation Runtime
* ======================================================= */

try {


const navigationRuntime =
  await fetchNavigationRuntime()

const navigationItems =
  navigationRuntime?.navigation
  ?? []

urls.push(

  ...navigationItems

    .filter(
      item =>
        Boolean(
          item?.slug
        )
    )

    .map(
      item => ({

        url:
          `${BASE_URL}/discover/${item.slug}`,

        lastModified:
          now,

        changeFrequency:
          'daily' as const,

        priority:
          0.8,

      })
    )

)

if (
  INCLUDE_RANKING
) {

  urls.push(

    ...navigationItems

      .filter(
        item =>
          Boolean(
            item?.slug
          )
      )

      .map(
        item => ({

          url:
            `${BASE_URL}/ranking/${item.slug}`,

          lastModified:
            now,

          changeFrequency:
            'daily' as const,

          priority:
            0.8,

        })
      )

  )

}

console.log(
  '🔥 SITEMAP NAVIGATION',
  {
    count:
      navigationItems.length,
  }
)


}

catch (error) {


console.error(
  'SITEMAP NAVIGATION ERROR',
  error
)


}

/* =========================================================

* Product Runtime
* ======================================================= */

try {


const runtime =
  await fetchProducts()

const products =

  runtime?.products
  ?? []

urls.push(

  ...products

    .filter(
      product =>
        Boolean(
          product?.unique_id
        )
    )

    .map(
      product => ({

        url:
          `${BASE_URL}/product/${product.unique_id}`,

        lastModified:
          now,

        changeFrequency:
          'weekly' as const,

        priority:
          0.7,

      })
    )

)

console.log(
  '🔥 SITEMAP PRODUCTS',
  {
    count:
      products.length,
  }
)


}

catch (error) {


console.error(
  'SITEMAP PRODUCT ERROR',
  error
)


}

/* =========================================================

* DEDUP
* ======================================================= */

return Array.from(


new Map(

  urls.map(
    item => [
      item.url,
      item,
    ]
  )

).values()


)

}
