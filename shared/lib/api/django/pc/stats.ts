'use server'

/* =========================================
🔥 Types
========================================= */

export type PcSidebarStatItem = {
  id?: number | string

  name: string

  slug?: string

  count?: number

  value?: string | number

  icon?: string

  semantic_role?: string

  semantic_weight?: number

  attr_type?: string

  type?: string
}

export type PcSidebarStatsResponse = {
  gpu: PcSidebarStatItem[]
  cpu: PcSidebarStatItem[]
  memory: PcSidebarStatItem[]
  storage: PcSidebarStatItem[]
  maker: PcSidebarStatItem[]
}

/* =========================================
🔥 Config
========================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL
  || 'http://localhost:8000/api'

const IS_DEV =
  process.env.NODE_ENV ===
  'development'

/* =========================================
🔥 Logger
========================================= */

function logInfo(
  label: string,
  payload?: unknown
): void {

  if (!IS_DEV) {
    return
  }

  console.log(
    `[${label}]`,
    payload ?? ''
  )
}

function logWarn(
  label: string,
  payload?: unknown
): void {

  if (!IS_DEV) {
    return
  }

  console.warn(
    `[${label}]`,
    payload ?? ''
  )
}

function logError(
  label: string,
  payload?: unknown
): void {

  console.error(
    `[${label}]`,
    payload ?? ''
  )
}

/* =========================================
🔥 Safe JSON Parser
========================================= */

async function parseJsonSafe(
  response: Response
): Promise<any | null> {

  try {

    return await response.json()

  } catch (error) {

    logError(
      'PC_STATS_JSON_PARSE_ERROR',
      error
    )

    return null
  }
}

/* =========================================
🔥 Normalize Array
========================================= */

function normalizeArray(
  value: unknown
): PcSidebarStatItem[] {

  if (!Array.isArray(value)) {

    logWarn(
      'PC_STATS_INVALID_ARRAY',
      value
    )

    return []
  }

  return value
    .filter(Boolean)
    .map((item) => ({

      id:
        item?.id,

      name:
        item?.name || '',

      slug:
        item?.slug,

      count:
        typeof item?.count ===
        'number'
          ? item.count
          : 0,

      value:
        item?.value,

      icon:
        item?.icon,

      semantic_role:
        item?.semantic_role
        || 'supportive',

      semantic_weight:
        typeof item?.semantic_weight ===
        'number'
          ? item.semantic_weight
          : 0,

      attr_type:
        item?.attr_type
        || item?.type
        || 'default',

      type:
        item?.type
        || item?.attr_type
        || 'default',
    }))
}

/* =========================================
🔥 Empty Response
========================================= */

function createEmptyResponse():
PcSidebarStatsResponse {

  return {

    gpu: [],

    cpu: [],

    memory: [],

    storage: [],

    maker: [],
  }
}

/* =========================================
🔥 Fetch PC Sidebar Stats
========================================= */

export async function fetchPcSidebarStats():
Promise<PcSidebarStatsResponse> {

  try {

    const endpoint =
      `${API_BASE}/general/pc-sidebar-stats/`

    logInfo(
      'PC_STATS_FETCH_START',
      endpoint
    )

    const response =
      await fetch(endpoint, {

        method: 'GET',

        headers: {

          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        cache: 'no-store',

        next: {
          revalidate: 0,
        },
      })

    if (!response.ok) {

      logError(
        'PC_STATS_BAD_RESPONSE',
        {

          status:
            response.status,

          statusText:
            response.statusText,
        }
      )

      return createEmptyResponse()
    }

    const raw =
      await parseJsonSafe(response)

    if (!raw) {

      logWarn(
        'PC_STATS_EMPTY_PAYLOAD'
      )

      return createEmptyResponse()
    }

    const normalized:
      PcSidebarStatsResponse = {

      gpu:
        normalizeArray(raw?.gpu),

      cpu:
        normalizeArray(raw?.cpu),

      memory:
        normalizeArray(raw?.memory),

      storage:
        normalizeArray(raw?.storage),

      maker:
        normalizeArray(raw?.maker),
    }

    logInfo(
      'PC_STATS_FETCH_SUCCESS',
      {

        gpu:
          normalized.gpu.length,

        cpu:
          normalized.cpu.length,

        memory:
          normalized.memory.length,

        storage:
          normalized.storage.length,

        maker:
          normalized.maker.length,
      }
    )

    return normalized

  } catch (error) {

    logError(
      'PC_STATS_FATAL_ERROR',
      error
    )

    return createEmptyResponse()
  }
}

/* =========================================
🔥 Default Export
========================================= */

export default fetchPcSidebarStats