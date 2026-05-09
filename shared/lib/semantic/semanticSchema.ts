// /home/maya/shin-dev/shin-vps/shared/lib/semantic/semanticSchema.ts

/* =========================================
🔥 Semantic Schema
========================================= */

export const SEMANTIC_SCHEMA = {

  // ======================================
  // version
  // ======================================

  version: 1,

  // ======================================
  // required attribute fields
  // ======================================

  required_attribute_fields: [

    'slug',
    'name',
    'type',

  ],

  // ======================================
  // recommended semantic fields
  // ======================================

  recommended_semantic_fields: [

    'semantic_role',
    'semantic_weight',
    'icon',
    'color',

  ],

  // ======================================
  // grouped semantic axes
  // ======================================

  supported_groups: [

    'gpu',
    'cpu',
    'maker',
    'usage',
    'device',
    'memory',
    'storage',
    'feature',

  ],

  // ======================================
  // semantic roles
  // ======================================

  semantic_roles: [

    'primary',
    'secondary',
    'supportive',
    'contextual',

  ],

  // ======================================
  // semantic weight
  // ======================================

  semantic_weight: {

    min: 0,
    max: 1,
  },

} as const

/* =========================================
🔥 Schema Version
========================================= */

export const
SEMANTIC_SCHEMA_VERSION =

  SEMANTIC_SCHEMA
    .version

/* =========================================
🔥 Type Guards
========================================= */

export function
isSupportedSemanticGroup(
  value: unknown
) {

  return (
    typeof value === 'string'
    &&

    SEMANTIC_SCHEMA
      .supported_groups
      .includes(
        value as any
      )
  )
}

/* =========================================
🔥 Semantic Role Guard
========================================= */

export function
isSemanticRole(
  value: unknown
) {

  return (
    typeof value === 'string'
    &&

    SEMANTIC_SCHEMA
      .semantic_roles
      .includes(
        value as any
      )
  )
}

/* =========================================
🔥 Weight Guard
========================================= */

export function
normalizeSemanticWeight(
  value: unknown
) {

  if (
    typeof value !==
    'number'
  ) {

    return 0
  }

  return Math.max(

    SEMANTIC_SCHEMA
      .semantic_weight
      .min,

    Math.min(

      SEMANTIC_SCHEMA
        .semantic_weight
        .max,

      value
    )
  )
}

/* =========================================
🔥 Semantic Attribute Validator
========================================= */

export function
isValidSemanticAttribute(
  attribute: unknown
) {

  if (
    !attribute
    || typeof attribute
      !== 'object'
  ) {

    return false
  }

  const safe =
    attribute as Record<
      string,
      unknown
    >

  return (

    typeof safe.slug
      === 'string'

    &&

    typeof safe.name
      === 'string'

    &&

    typeof safe.type
      === 'string'
  )
}

/* =========================================
🔥 Semantic Payload Validator
========================================= */

export function
isSemanticPayload(
  payload: unknown
) {

  if (
    !payload
    || typeof payload
      !== 'object'
  ) {

    return false
  }

  const safe =
    payload as Record<
      string,
      unknown
    >

  // ======================================
  // grouped attributes
  // ======================================

  const grouped_attributes =

    safe.grouped_attributes

  if (
    !grouped_attributes
    || typeof grouped_attributes
      !== 'object'
  ) {

    return false
  }

  // ======================================
  // schema version
  // ======================================

  const version =

    safe.semantic_schema_version

  return (
    typeof version
      === 'number'
  )
}

