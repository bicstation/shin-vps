// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RuntimeSEO.tsx
// ============================================================================

import type {
  Metadata,
} from 'next'

type RuntimeSEO = {

  title?: string

  description?: string

  keywords?: string[]

  canonical?: string

  openGraph?: {

    title?: string

    description?: string

    images?: {
      url: string
    }[]
  }

  twitter?: {

    title?: string

    description?: string

    images?: string[]
  }
}

type RuntimeSchemas = {

  itemSchema?: any

  breadcrumbSchema?: any

  faqSchema?: any

  collectionSchema?: any
}

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
  🔥 Runtime SEO
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

  /* ==========================================================================
  🔥 Twitter
  ========================================================================== */

  const twitter =
    seo?.twitter || {}

  /* ==========================================================================
  🔥 Metadata
  ========================================================================== */

  return {

    title,

    description,

    keywords:

      Array.isArray(
        seo?.keywords
      )

        ? seo?.keywords

        : [],

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

        Array.isArray(
          openGraph?.images
        )

          ? openGraph.images

          : [],

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

        Array.isArray(
          twitter?.images
        )

          ? twitter.images

          : [],
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
  🔥 Schema List
  ========================================================================== */

  const schemaList = [

    schemas?.breadcrumbSchema,

    schemas?.faqSchema,

    schemas?.collectionSchema,

    schemas?.itemSchema,

  ].filter(Boolean)

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
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html:
                JSON.stringify(schema),
            }}
          />

        )
      )}

    </>

  )
}