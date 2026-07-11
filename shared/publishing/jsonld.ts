// ============================================================================
// FILE:
// /shared/publishing/jsonld.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Publishing
 * JSON-LD Builders
 * ============================================================================
 *
 * PURPOSE
 *
 * Build Schema.org JSON-LD objects.
 *
 * This module is framework independent.
 *
 * ============================================================================
 */

import {
  DEFAULT_IMAGES,
  DEFAULT_METADATA,
  ORGANIZATION,
  SITE,
} from './constants'

/* ============================================================================
🔥 Types
============================================================================ */

export interface BreadcrumbItem {

  name: string

  path: string

}

/* ============================================================================
🔥 Organization
============================================================================ */

export function createOrganizationJsonLd() {

  return {

    '@context': 'https://schema.org',

    '@type': 'Organization',

    name: ORGANIZATION.NAME,

    url: ORGANIZATION.URL,

    logo: `${SITE.URL}${DEFAULT_IMAGES.LOGO}`,

  }

}

/* ============================================================================
🔥 Website
============================================================================ */

export function createWebsiteJsonLd() {


  return {

    '@context': 'https://schema.org',

    '@type': 'WebSite',

    name: SITE.NAME,

    url: SITE.URL,

    description: DEFAULT_METADATA.DESCRIPTION,

    inLanguage: SITE.LANGUAGE,

    publisher: {

      '@type': 'Organization',

      name: ORGANIZATION.NAME,

      url: ORGANIZATION.URL,

    },

    potentialAction: {

      '@type': 'SearchAction',

      target:
        `${SITE.URL}/search?q={search_term_string}`,

      'query-input':
        'required name=search_term_string',

    },

  }

}

/* ============================================================================
🔥 Breadcrumb
============================================================================ */

export function createBreadcrumbJsonLd(

  items: BreadcrumbItem[]

) {

  return {

    '@context': 'https://schema.org',

    '@type': 'BreadcrumbList',

    itemListElement:

      items.map(

        (
          item,
          index,
        ) => ({

          '@type': 'ListItem',

          position:
            index + 1,

          name:
            item.name,

          item:
            `${SITE.URL}${item.path}`,

        })

      ),

  }

}

/* ============================================================================
🔥 Product
============================================================================ */
export interface ProductJsonLdOptions {

  name: string

  description?: string

  image?: string

  sku?: string

  brand?: string

  url?: string

  price?: number

  currency?: string

  availability?: string

}

export function createProductJsonLd(

  product: ProductJsonLdOptions,

) {

  return {

    '@context': 'https://schema.org',

    '@type': 'Product',

    name:
      product.name,

    description:
      product.description,

    image:
      product.image,

    sku:
      product.sku,

    brand:

      product.brand

        ? {

            '@type': 'Brand',

            name:
              product.brand,

          }

        : undefined,

    offers:

      product.price !== undefined

        ? {

            '@type': 'Offer',

            price:
              product.price,

            priceCurrency:
              product.currency ?? 'JPY',

            availability:

              product.availability
              ?? 'https://schema.org/InStock',

            url:
              product.url,

          }

        : undefined,

  }

}

/* ============================================================================
🔥 JSON-LD Graph
============================================================================ */

export type JsonLdNode =
  Record<string, any>


/* ============================================================================
🔥 JSON-LD Graph
============================================================================ */

export interface JsonLdGraphOptions {

  organization?: boolean

  website?: boolean

  breadcrumb?: BreadcrumbItem[]

  product?: ProductJsonLdOptions

}

export function createJsonLdGraph(

  options: JsonLdGraphOptions = {},

) {

  const graph: JsonLdNode[] = []

  if (options.organization) {

    graph.push(

      createOrganizationJsonLd(),

    )

  }

  if (options.website) {

    graph.push(

      createWebsiteJsonLd(),

    )

  }

  if (

    options.breadcrumb &&
    options.breadcrumb.length > 0

  ) {

    graph.push(

      createBreadcrumbJsonLd(

        options.breadcrumb,

      ),

    )

  }

  if (

    options.product

  ) {

    graph.push(

      createProductJsonLd(

        options.product,

      ),

    )

  }

  return {

    '@context':
      'https://schema.org',

    '@graph':
      graph,

  }

}

/* ============================================================================
🔥 Default Graph
============================================================================ */

export function createDefaultJsonLd() {

  return {

    '@context': 'https://schema.org',

    '@graph': [

      createOrganizationJsonLd(),

      createWebsiteJsonLd(),

    ],

  }

}