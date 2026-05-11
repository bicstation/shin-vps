// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/utils/buildEndpoint.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Resolve Base URL
========================================= */

function resolveBaseUrl() {

  // ======================================
  // Server
  // ======================================

  if (
    typeof window ===
    'undefined'
  ) {

    return (

      process.env
        .INTERNAL_API_URL

      ||

      process.env
        .NEXT_PUBLIC_API_URL

      ||

      ''
    )
  }

  // ======================================
  // Client
  // ======================================

  return (

    process.env
      .NEXT_PUBLIC_API_URL

    ||

    ''
  )
}

/* =========================================
🔥 Normalize Base URL
========================================= */

function normalizeBaseUrl(
  url: string
) {

  return url.replace(
    /\/$/,
    ''
  )
}

/* =========================================
🔥 Normalize Path
========================================= */

function normalizePath(
  path: string
) {

  return path.startsWith(
    '/'
  )

    ? path

    : `/${path}`
}

/* =========================================
🔥 Build Endpoint
========================================= */

export function
buildEndpoint(

  path: string

): string {

  // ======================================
  // Base URL
  // ======================================

  const baseUrl =

    normalizeBaseUrl(

      resolveBaseUrl()
    )

  // ======================================
  // Path
  // ======================================

  const normalizedPath =

    normalizePath(
      path
    )

  // ======================================
  // Build
  // ======================================

  const endpoint =

    `${baseUrl}${normalizedPath}`

  // ======================================
  // Development Debug
  // ======================================

  if (
    process.env.NODE_ENV ===
    'development'
  ) {

    console.log(

      '🔥 BUILD ENDPOINT:',

      endpoint
    )
  }

  // ======================================
  // Return
  // ======================================

  return endpoint
}