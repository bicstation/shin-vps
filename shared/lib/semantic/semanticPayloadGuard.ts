// /home/maya/shin-dev/shin-vps/shared/lib/semantic/semanticPayloadGuard.ts

/* =========================================
🔥 Types
========================================= */

type UnknownRecord =
  Record<string, any>

/* =========================================
🔥 Constants
========================================= */

const DEFAULT_SCHEMA_VERSION =
  1

/* =========================================
🔥 Safe Array
========================================= */

function safeArray<T = any>(
  value: unknown
): T[] {

  return Array.isArray(value)
    ? value
    : []
}

/* =========================================
🔥 Safe Object
========================================= */

function safeObject<T = UnknownRecord>(
  value: unknown
): T {

  if (
    value
    && typeof value === 'object'
    && !Array.isArray(value)
  ) {

    return value as T
  }

  return {} as T
}

/* =========================================
🔥 Semantic Attribute
========================================= */

export function
normalizeSemanticAttribute(
  attribute: unknown
) {

  const safe =
    safeObject(attribute)

  return {

    // -----------------------------------
    // identity
    // -----------------------------------

    slug:
      typeof safe.slug === 'string'
        ? safe.slug
        : '',

    name:
      typeof safe.name === 'string'
        ? safe.name
        : 'Unknown',

    // -----------------------------------
    // type
    // backend canonical:
    // attr_type
    // -----------------------------------

    type:

      typeof safe.type === 'string'
        ? safe.type

        : typeof safe.attr_type === 'string'
          ? safe.attr_type

          : 'default',

    // -----------------------------------
    // semantic
    // -----------------------------------

    semantic_role:

      typeof safe.semantic_role === 'string'
        ? safe.semantic_role
        : 'supportive',

    semantic_weight:

      typeof safe.semantic_weight
        === 'number'

          ? Math.max(
              0,
              Math.min(
                1,
                safe.semantic_weight
              )
            )

          : 0,

    // -----------------------------------
    // metadata
    // -----------------------------------

    icon:
      typeof safe.icon === 'string'
        ? safe.icon
        : '',

    color:
      typeof safe.color === 'string'
        ? safe.color
        : '',

    // -----------------------------------
    // passthrough
    // -----------------------------------

    ...safe,
  }
}

/* =========================================
🔥 Normalize Attributes
========================================= */

export function
normalizeSemanticAttributes(
  attributes: unknown
) {

  return safeArray(
    attributes
  ).map(
    normalizeSemanticAttribute
  )
}

/* =========================================
🔥 Normalize Grouped Attributes
========================================= */

export function
normalizeGroupedAttributes(
  grouped: unknown
) {

  const safe =
    safeObject(grouped)

  const normalized:
    Record<string, any[]> = {}

  Object.entries(
    safe
  ).forEach(([

    key,
    value,

  ]) => {

    normalized[key] =
      normalizeSemanticAttributes(
        value
      )
  })

  return normalized
}

/* =========================================
🔥 Legacy Sidebar Bridge
========================================= */

function buildLegacyGroups(
  payload: UnknownRecord
) {

  const groups:
    Record<string, any[]> = {}

  Object.entries(
    payload
  ).forEach(([

    key,
    value,

  ]) => {

    // -----------------------------------
    // skip metadata
    // -----------------------------------

    if (
      key === 'success'
      || key === 'count'
      || key === 'total'
    ) {
      return
    }

    // -----------------------------------
    // only arrays
    // -----------------------------------

    if (
      Array.isArray(value)
    ) {

      groups[key] =
        normalizeSemanticAttributes(
          value
        )
    }
  })

  return groups
}

/* =========================================
🔥 Semantic Payload Guard
========================================= */

export function
semanticPayloadGuard(
  payload: unknown
) {

  const safe =
    safeObject(payload)

  // ======================================
  // schema version
  // ======================================

  const semantic_schema_version =

    typeof safe.semantic_schema_version
      === 'number'

        ? safe.semantic_schema_version

        : DEFAULT_SCHEMA_VERSION

  // ======================================
  // attributes
  // ======================================

  const attributes =

    normalizeSemanticAttributes(

      safe.attributes
    )

  // ======================================
  // grouped attributes
  // ======================================

  let grouped_attributes =

    normalizeGroupedAttributes(
      safe.grouped_attributes
    )

  // ======================================
  // legacy bridge
  // ======================================

  if (
    !Object.keys(
      grouped_attributes
    ).length
  ) {

    grouped_attributes =
      buildLegacyGroups(
        safe
      )
  }

  // ======================================
  // navigation groups
  // ======================================

  const navigation_groups =

    safeArray(
      safe.navigation_groups
    )

  // ======================================
  // return
  // ======================================

  return {

    // -----------------------------------
    // schema
    // -----------------------------------

    semantic_schema_version,

    // -----------------------------------
    // semantic
    // -----------------------------------

    attributes,

    grouped_attributes,

    navigation_groups,

    // -----------------------------------
    // passthrough
    // -----------------------------------

    ...safe,
  }
}

