// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/normalization/normalizeSidebar.ts

import type {

  SemanticNavigation,

  SemanticGroup,

  SemanticAttribute,

} from '../contracts/semantic.contract'

/* =========================================
🔥 Safe Attribute
========================================= */

function createAttribute(
  slug: string,
  name: string,
  type: string
): SemanticAttribute {

  return {

    slug:
      slug || '',

    name:
      name || '',

    attr_type:
      type || 'unknown',

    semantic_role:
      'supportive',

    semantic_weight:
      0,
  }
}

/* =========================================
🔥 Normalize Group
========================================= */

function normalizeGroup(
  key: string,
  label: string,
  items: any[],
  type: string
): SemanticGroup {

  return {

    key:
      key || '',

    label:
      label || '',

    description:
      '',

    attributes:

      Array.isArray(items)

        ? items.map(
            (
              item
            ) => createAttribute(

              item?.slug
              || '',

              item?.name
              || '',

              type
            )
          )

        : [],
  }
}

/* =========================================
🔥 Normalize Sidebar
========================================= */

export function
normalizeSidebar(
  payload: any
): SemanticNavigation {

  const groups:
    SemanticGroup[] = []

  // ======================================
  // GPU
  // ======================================

  if (
    Array.isArray(
      payload?.gpu_ranking
    )
  ) {

    groups.push(

      normalizeGroup(

        'gpu',

        'GPU',

        payload.gpu_ranking,

        'gpu'
      )
    )
  }

  // ======================================
  // Usage
  // ======================================

  if (
    Array.isArray(
      payload?.usage_ranking
    )
  ) {

    groups.push(

      normalizeGroup(

        'usage',

        '用途',

        payload.usage_ranking,

        'usage'
      )
    )
  }

  // ======================================
  // Maker
  // ======================================

  if (
    Array.isArray(
      payload?.maker_ranking
    )
  ) {

    groups.push(

      normalizeGroup(

        'maker',

        'ブランド',

        payload.maker_ranking,

        'maker'
      )
    )
  }

  return {

    semantic_schema_version:
      'legacy-sidebar-adapter',

    groups,
  }
}

