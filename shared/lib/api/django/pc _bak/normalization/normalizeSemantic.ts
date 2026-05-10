// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/normalization/normalizeSemantic.ts

import type {

  SemanticNavigation,

  SemanticGroup,

  SemanticAttribute,

} from '../contracts/semantic.contract'

/* =========================================
🔥 Normalize Attribute
========================================= */

function normalizeAttribute(
  attribute: any
): SemanticAttribute {

  return {

    slug:
      attribute?.slug || '',

    name:
      attribute?.name || '',

    attr_type:

      attribute?.attr_type

      || attribute?.type

      || 'unknown',

    semantic_role:

      attribute?.semantic_role

      || 'supportive',

    semantic_weight:

      typeof
      attribute?.semantic_weight
      === 'number'

        ? Math.max(
            0,
            Math.min(
              1,
              attribute.semantic_weight
            )
          )

        : 0,

    icon:
      attribute?.icon || '',

    color:
      attribute?.color || '',
  }
}

/* =========================================
🔥 Normalize Group
========================================= */

function normalizeGroup(
  group: any
): SemanticGroup {

  return {

    key:
      group?.key || '',

    label:
      group?.label || '',

    description:
      group?.description || '',

    attributes:

      Array.isArray(
        group?.attributes
      )

        ? group.attributes.map(
            normalizeAttribute
          )

        : [],
  }
}

/* =========================================
🔥 Normalize Semantic Navigation
========================================= */

export function
normalizeSemanticNavigation(
  payload: any
): SemanticNavigation {

  return {

    semantic_schema_version:

      payload?.semantic_schema_version
      || 'unknown',

    groups:

      Array.isArray(
        payload?.groups
      )

        ? payload.groups.map(
            normalizeGroup
          )

        : [],
  }
}

