// /home/maya/shin-dev/shin-vps/shared/lib/semantic/semanticNormalizer.ts

/* =========================================
🔥 Legacy Bridge
========================================= */

import {
  semanticLegacyBridge,
} from './semanticLegacyBridge'

/* =========================================
🔥 Guard
========================================= */

import {
  semanticPayloadGuard,
} from './semanticPayloadGuard'

/* =========================================
🔥 Types
========================================= */

type UnknownRecord =
  Record<string, any>

/* =========================================
🔥 Navigation Group
========================================= */

export type SemanticNavigationGroup = {

  key: string

  title: string

  attributes: any[]
}

/* =========================================
🔥 Normalized Semantic Payload
========================================= */

export type NormalizedSemanticPayload = {

  semantic_schema_version: number

  attributes: any[]

  grouped_attributes:
    Record<
      string,
      any[]
    >

  navigation_groups:
    SemanticNavigationGroup[]

  has_groups: boolean

  has_attributes: boolean

  is_semantic_payload: boolean

  legacy_bridge?: boolean
}

/* =========================================
🔥 Safe Object
========================================= */

function safeObject<T = UnknownRecord>(
  value: unknown
): T {

  if (

    value
    && typeof value ===
      'object'
    && !Array.isArray(
      value
    )

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

  return Array.isArray(
    value
  )

    ? value

    : []
}

/* =========================================
🔥 Build Navigation Title
========================================= */

function buildNavigationTitle(
  key: string
) {

  return key

    .replaceAll(
      '-',
      ' '
    )

    .replaceAll(
      '_',
      ' '
    )

    .replace(
      /\b\w/g,
      char => (
        char.toUpperCase()
      )
    )
}

/* =========================================
🔥 Normalize Navigation Group
========================================= */

function normalizeNavigationGroup(
  group: unknown
): SemanticNavigationGroup {

  const safe =
    safeObject(group)

  return {

    key:

      typeof safe.key
        === 'string'

          ? safe.key

          : '',

    title:

      typeof safe.title
        === 'string'

          ? safe.title

          : buildNavigationTitle(
              String(
                safe.key || ''
              )
            ),

    attributes:
      safeArray(
        safe.attributes
      ),
  }
}

/* =========================================
🔥 Build Navigation Groups
========================================= */

function buildNavigationGroups(
  grouped_attributes:
    Record<
      string,
      any[]
    >
): SemanticNavigationGroup[] {

  return Object.entries(
    grouped_attributes
  ).map(([

    key,
    attributes,

  ]) => ({

    key,

    title:
      buildNavigationTitle(
        key
      ),

    attributes:
      safeArray(
        attributes
      ),
  }))
}

/* =========================================
🔥 Normalize Semantic Payload
========================================= */

export function
normalizeSemanticPayload(
  payload: unknown
): NormalizedSemanticPayload {

  // ======================================
  // legacy bridge
  // ======================================

  const bridged =
    semanticLegacyBridge(
      payload
    )

  // ======================================
  // guard
  // ======================================

  const guarded =
    semanticPayloadGuard(
      bridged
    )

  // ======================================
  // safe
  // ======================================

  const safe =
    safeObject(
      guarded
    )

  // ======================================
  // grouped attributes
  // ======================================

  const grouped_attributes =

    safeObject<
      Record<
        string,
        any[]
      >
    >(
      safe.grouped_attributes
    )

  // ======================================
  // navigation groups
  // ======================================

  const navigation_groups =

    Array.isArray(
      safe.navigation_groups
    )

      ? safe.navigation_groups.map(
          normalizeNavigationGroup
        )

      : buildNavigationGroups(
          grouped_attributes
        )

  // ======================================
  // semantic schema version
  // ======================================

  const semantic_schema_version =

    typeof safe
      .semantic_schema_version
        === 'number'

          ? safe
              .semantic_schema_version

          : 1

  // ======================================
  // flattened attributes
  // ======================================

  const attributes =

    Array.isArray(
      safe.attributes
    )

      ? safe.attributes

      : Object.values(
          grouped_attributes
        ).flatMap(
          value =>

            safeArray(
              value
            )
        )

  // ======================================
  // safe flags
  // ======================================

  const has_groups =

    Object.keys(
      grouped_attributes
    ).length > 0

  const has_attributes =
    attributes.length > 0

  // ======================================
  // semantic payload state
  // ======================================

  const is_semantic_payload =

    (
      has_groups
      || has_attributes
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
    // state
    // -----------------------------------

    has_groups,

    has_attributes,

    is_semantic_payload,

    // -----------------------------------
    // compatibility
    // -----------------------------------

    legacy_bridge:
      Boolean(
        safe.legacy_bridge
      ),
  }
}

