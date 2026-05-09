// /shared/lib/api/django/pc/utils/buildEndpoint.ts

/* =========================================
🔥 Server Detection
========================================= */

const IS_SERVER =
  typeof window ===
  'undefined'

/* =========================================
🔥 API Base
========================================= */

const API_BASE =

  IS_SERVER

    ? (
        process.env.INTERNAL_API_URL
        || 'http://django-v3:8000/api'
      )

    : (
        process.env.NEXT_PUBLIC_API_URL
        || 'http://localhost:8083/api'
      )

/* =========================================
🔥 Build Query
========================================= */

function buildQuery(
  query?: Record<
    string,
    unknown
  >
) {

  if (!query) {
    return ''
  }

  const params =
    new URLSearchParams()

  Object.entries(
    query
  ).forEach(([

    key,
    value,

  ]) => {

    if (

      value === undefined
      || value === null
      || value === ''

    ) {
      return
    }

    if (
      Array.isArray(value)
    ) {

      value.forEach(
        item => {

          params.append(
            key,
            String(item)
          )
        }
      )

      return
    }

    params.append(
      key,
      String(value)
    )
  })

  const queryString =
    params.toString()

  return queryString
    ? `?${queryString}`
    : ''
}

/* =========================================
🔥 Build Endpoint
========================================= */

export function
buildEndpoint(

  path: string,

  query?: Record<
    string,
    unknown
  >
) {

  const normalizedPath =

    path.startsWith('/')

      ? path

      : `/${path}`

  return (
    `${API_BASE}${normalizedPath}`
    + buildQuery(query)
  )
}
