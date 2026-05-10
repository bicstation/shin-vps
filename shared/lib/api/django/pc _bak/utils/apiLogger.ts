// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/utils/apiLogger.ts

/* =========================================
🔥 Config
========================================= */

const IS_DEV =
  process.env.NODE_ENV ===
  'development'

/* =========================================
🔥 Prefix
========================================= */

const PREFIX =
  '[SHIN-API]'

/* =========================================
🔥 Base Logger
========================================= */

function log(
  level:
    'log'
    | 'warn'
    | 'error',

  label: string,

  payload?: unknown
) {

  if (!IS_DEV) {
    return
  }

  console[level](
    `${PREFIX} ${label}`,
    payload ?? ''
  )
}

/* =========================================
🔥 Request
========================================= */

export function
logRequest(
  endpoint: string,
  payload?: unknown
) {

  log(
    'log',
    `REQUEST → ${endpoint}`,
    payload
  )
}

/* =========================================
🔥 Response
========================================= */

export function
logResponse(
  endpoint: string,
  payload?: unknown
) {

  log(
    'log',
    `RESPONSE ← ${endpoint}`,
    payload
  )
}

/* =========================================
🔥 Normalize
========================================= */

export function
logNormalize(
  label: string,
  payload?: unknown
) {

  log(
    'log',
    `NORMALIZE :: ${label}`,
    payload
  )
}

/* =========================================
🔥 Warning
========================================= */

export function
logWarning(
  label: string,
  payload?: unknown
) {

  log(
    'warn',
    `WARNING :: ${label}`,
    payload
  )
}

/* =========================================
🔥 Error
========================================= */

export function
logError(
  label: string,
  payload?: unknown
) {

  log(
    'error',
    `ERROR :: ${label}`,
    payload
  )
}

