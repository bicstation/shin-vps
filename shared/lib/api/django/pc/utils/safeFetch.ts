// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/utils/safeFetch.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Types
========================================= */

type SafeFetchOptions =

RequestInit & {


timeout?: number


}

/* =========================================
🔥 Safe Fetch
========================================= */

export async function
safeFetch<T = any>(

endpoint: string,

options?: SafeFetchOptions

): Promise<T | null> {

// ======================================
// Runtime
// ======================================

const runtime =


typeof window === 'undefined'
  ? 'SSR'
  : 'CSR'


// ======================================
// Timeout
// ======================================

const timeout =


typeof options?.timeout
  === 'number'

  ? options.timeout

  : 15000


// ======================================
// Abort Controller
// ======================================

const controller =


new AbortController()


// ======================================
// Timeout Timer
// ======================================

const timeoutId =


setTimeout(
  () => {

    controller.abort()

  },
  timeout
)


try {


// ====================================
// Request Debug
// ====================================

console.log(

  '🔥 SAFE FETCH REQUEST',

  {

    runtime,

    endpoint,

    timeout,

    method:
      options?.method || 'GET',
  }
)

// ====================================
// Fetch
// ====================================

const response =

  await fetch(
    endpoint,
    {
      ...options,

      signal:
        controller.signal,

      headers: {

        'Content-Type':
          'application/json',

        ...(options?.headers || {}),
      },

      cache:
        'no-store',
    }
  )

// ====================================
// Clear Timeout
// ====================================

clearTimeout(
  timeoutId
)

// ====================================
// Response Debug
// ====================================

console.log(

  '🔥 SAFE FETCH RESPONSE',

  {

    runtime,

    endpoint,

    status:
      response.status,

    statusText:
      response.statusText,

    ok:
      response.ok,
  }
)

// ====================================
// Response Error
// ====================================

if (!response.ok) {

  console.error(

    '🔥 API RESPONSE ERROR',

    {
      runtime,

      endpoint,

      status:
        response.status,

      statusText:
        response.statusText,
    }
  )

  return null
}

// ====================================
// JSON Parse
// ====================================

let data: T

try {

  data =
    await response.json()

} catch (jsonError) {

  console.error(

    '🔥 JSON PARSE ERROR',

    {
      runtime,

      endpoint,

      jsonError,
    }
  )

  return null
}

// ====================================
// Raw Payload Debug
// ====================================

console.log(

  '🔥 RAW API RESPONSE',

  {

    runtime,

    endpoint,

    semantic_schema_version:

      (data as any)
        ?.semantic_schema_version,

    has_semantic_runtime:

      !!(data as any)
        ?.semantic_runtime,

    has_adaptive_runtime:

      !!(data as any)
        ?.adaptive_runtime,

    has_semantic_related:

      !!(data as any)
        ?.semantic_related,

    payload:
      data,
  }
)

// ====================================
// Success
// ====================================

return data


} catch (error: any) {


// ====================================
// Clear Timeout
// ====================================

clearTimeout(
  timeoutId
)

// ====================================
// Abort Error
// ====================================

if (
  error?.name ===
  'AbortError'
) {

  console.error(

    '🔥 FETCH TIMEOUT',

    {
      runtime,

      endpoint,

      timeout,
    }
  )

  return null
}

// ====================================
// Network Error
// ====================================

console.error(

  '🔥 SAFE FETCH ERROR',

  {
    runtime,

    endpoint,

    error,
  }
)

return null


}
}
