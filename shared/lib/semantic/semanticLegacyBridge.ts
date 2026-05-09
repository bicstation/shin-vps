// /home/maya/shin-dev/shin-vps/shared/lib/semantic/semanticLegacyBridge.ts

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
🔥 Guess Semantic Type
========================================= */

function guessSemanticType(
  key: string
) {

  // --------------------------------------
  // gpu
  // --------------------------------------

  if (
    key.includes('gpu')
  ) {
    return 'gpu'
  }

  // --------------------------------------
  // cpu
  // --------------------------------------

  if (
    key.includes('cpu')
  ) {
    return 'cpu'
  }

  // --------------------------------------
  // maker
  // --------------------------------------

  if (
    key.includes('maker')
    || key.includes('brand')
  ) {
    return 'maker'
  }

  // --------------------------------------
  // usage
  // --------------------------------------

  if (
    key.includes('usage')
    || key.includes('purpose')
  ) {
    return 'usage'
  }

  // --------------------------------------
  // device
  // --------------------------------------

  if (
    key.includes('device')
  ) {
    return 'device'
  }

  // --------------------------------------
  // default
  // --------------------------------------

  return 'default'
}

/* =========================================
🔥 Normalize Legacy Attribute
========================================= */

function normalizeLegacyAttribute(
  attribute: unknown,
  type: string
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

        : typeof safe.name === 'string'

          ? safe.name
              .toLowerCase()
              .replaceAll(
                ' ',
                '-'
              )

          : '',

    name:

      typeof safe.name === 'string'

        ? safe.name

        : 'Unknown',

    // -----------------------------------
    // semantic
    // -----------------------------------

    type,

    semantic_role:
      'supportive',

    semantic_weight:
      0.5,

    // -----------------------------------
    // visual
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
🔥 Build Grouped Attributes
========================================= */

function buildGroupedAttributes(
  payload: UnknownRecord
) {

  const grouped:
    Record<
      string,
      any[]
    > = {}

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
      || key === 'message'

    ) {
      return
    }

    // -----------------------------------
    // array only
    // -----------------------------------

    if (
      !Array.isArray(value)
    ) {
      return
    }

    // -----------------------------------
    // semantic type
    // -----------------------------------

    const type =
      guessSemanticType(
        key
      )

    // -----------------------------------
    // normalize
    // -----------------------------------

    grouped[key] =

      safeArray(
        value
      ).map(
        item =>

          normalizeLegacyAttribute(
            item,
            type
          )
      )
  })

  return grouped
}

/* =========================================
🔥 Flatten Attributes
========================================= */

function flattenAttributes(
  grouped:
    Record<
      string,
      any[]
    >
) {

  return Object.values(
    grouped
  ).flat()
}

/* =========================================
🔥 Build Navigation Groups
========================================= */

function buildNavigationGroups(
  grouped:
    Record<
      string,
      any[]
    >
) {

  return Object.entries(
    grouped
  ).map(([

    key,
    attributes,

  ]) => ({

    key,

    title:
      key
        .replaceAll(
          '_',
          ' '
        )
        .replace(
          /\b\w/g,
          char => (
            char.toUpperCase()
          )
        ),

    attributes,
  }))
}

/* =========================================
🔥 Semantic Legacy Bridge
========================================= */

export function
semanticLegacyBridge(
  payload: unknown
) {

  const safe =
    safeObject(payload)

  // ======================================
  // already semantic
  // ======================================

  if (
    safe.semantic_schema_version
  ) {

    return safe
  }

  // ======================================
  // grouped
  // ======================================

  const grouped_attributes =

    buildGroupedAttributes(
      safe
    )

  // ======================================
  // flatten
  // ======================================

  const attributes =

    flattenAttributes(
      grouped_attributes
    )

  // ======================================
  // navigation
  // ======================================

  const navigation_groups =

    buildNavigationGroups(
      grouped_attributes
    )

  // ======================================
  // return semantic payload
  // ======================================

  return {

    // -----------------------------------
    // semantic schema
    // -----------------------------------

    semantic_schema_version:
      DEFAULT_SCHEMA_VERSION,

    // -----------------------------------
    // semantic
    // -----------------------------------

    attributes,

    grouped_attributes,

    navigation_groups,

    // -----------------------------------
    // compatibility
    // -----------------------------------

    legacy_bridge:
      true,

    // -----------------------------------
    // passthrough
    // -----------------------------------

    ...safe,
  }
}
