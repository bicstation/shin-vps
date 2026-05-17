// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RuntimeSEO.tsx
// ============================================================================

import type {
  Metadata,
} from 'next'

/* ============================================================================
🔥 JSON-LD Runtime Schema
============================================================================ */

type JsonLdSchema =

  Record<
    string,
    unknown
  >

/* ============================================================================
🔥 Runtime SEO
============================================================================ */

type RuntimeSEO = {

  title?: string

  description?: string

  keywords?: string[]

  canonical?: string

  openGraph?: {

    title?: string

    description?: string

    images?: Array<{
      url: string
    }>
  }

  twitter?: {

    title?: string

    description?: string

    images?: string[]
  }
}

/* ============================================================================
🔥 Runtime Schemas
============================================================================ */

type RuntimeSchemas = {

  breadcrumbSchema?: JsonLdSchema

  collectionSchema?: JsonLdSchema

  itemSchema?: JsonLdSchema

  faqSchema?: JsonLdSchema
}

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  seo?: RuntimeSEO

  schemas?: RuntimeSchemas
}

/* ============================================================================
🔥 Build Runtime Metadata
============================================================================ */

export function buildRuntimeMetadata({
  seo,
}: Props): Metadata {

  /* ==========================================================================
  🔥 Runtime Values
  ========================================================================== */

  const title =
    seo?.title
    ||
    'SHIN CORE LINX'

  const description =
    seo?.description
    ||
    'semantic discovery runtime'

  const canonical =
    seo?.canonical

  /* ==========================================================================
  🔥 Open Graph
  ========================================================================== */

  const openGraph =
    seo?.openGraph || {}

  const openGraphImages =

    Array.isArray(
      openGraph?.images
    )

      ? openGraph.images

      : []

  /* ==========================================================================
  🔥 Twitter
  ========================================================================== */

  const twitter =
    seo?.twitter || {}

  const twitterImages =

    Array.isArray(
      twitter?.images
    )

      ? twitter.images

      : []

  /* ==========================================================================
  🔥 Keywords
  ========================================================================== */

  const keywords =

    Array.isArray(
      seo?.keywords
    )

      ? seo.keywords

      : []

  /* ==========================================================================
  🔥 Metadata
  ========================================================================== */

  return {

    title,

    description,

    keywords,

    alternates:

      canonical

        ? {
            canonical,
          }

        : undefined,

    openGraph: {

      title:
        openGraph?.title
        || title,

      description:
        openGraph?.description
        || description,

      url:
        canonical,

      images:
        openGraphImages,

      type:
        'website',

      siteName:
        'SHIN CORE LINX',

      locale:
        'ja_JP',
    },

    twitter: {

      card:
        'summary_large_image',

      title:
        twitter?.title
        || title,

      description:
        twitter?.description
        || description,

      images:
        twitterImages,
    },
  }
}

/* ============================================================================
🔥 Runtime Schema Injection
============================================================================ */

export function RuntimeSchema({
  schemas,
}: {
  schemas?: RuntimeSchemas
}) {

  /* ==========================================================================
  🔥 Schema Runtime List
  ========================================================================== */

  const schemaList = [

    /* ================================================================
    Structure
    ================================================================ */

    schemas?.breadcrumbSchema,

    schemas?.collectionSchema,

    /* ================================================================
    Entity
    ================================================================ */

    schemas?.itemSchema,

    /* ================================================================
    Supplemental
    ================================================================ */

    schemas?.faqSchema,

  ].filter(Boolean) as JsonLdSchema[]

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (
    schemaList.length === 0
  ) {

    return null
  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <>

      {schemaList.map(
        (
          schema,
          index
        ) => (

          <script
            key={
              `runtime-schema-${index}`
            }
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html:
                JSON.stringify(
                  schema
                ),
            }}
          />

        )
      )}

    </>

  )
}