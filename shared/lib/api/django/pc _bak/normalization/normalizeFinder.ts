// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/normalization/normalizeFinder.ts

import type {

  FinderResponse,

  FinderProduct,

  FinderSemanticAttribute,

} from '../contracts/finder.contract'

/* =========================================
🔥 Normalize Attribute
========================================= */

function normalizeAttribute(
  attribute: any
): FinderSemanticAttribute {

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
  }
}

/* =========================================
🔥 Normalize Product
========================================= */

function normalizeProduct(
  product: any
): FinderProduct {

  return {

    unique_id:
      product?.unique_id || '',

    name:
      product?.name || '',

    maker:
      product?.maker || '',

    image_url:
      product?.image_url || '',

    price:

      typeof product?.price
      === 'number'

        ? product.price

        : 0,

    score:

      typeof product?.score
      === 'number'

        ? product.score

        : 0,

    semantic_score:

      typeof
      product?.semantic_score
      === 'number'

        ? product.semantic_score

        : 0,

    matched_attributes:

      Array.isArray(
        product?.matched_attributes
      )

        ? product.matched_attributes

        : [],

    grouped_attributes:

      product?.grouped_attributes
      || {},
  }
}

/* =========================================
🔥 Normalize Finder Response
========================================= */

export function
normalizeFinder(
  payload: any
): FinderResponse {

  return {

    success:
      !!payload?.success,

    count:

      typeof payload?.count
      === 'number'

        ? payload.count

        : 0,

    semantic_schema_version:

      payload?.semantic_schema_version
      || 'unknown',

    products:

      Array.isArray(
        payload?.products
      )

        ? payload.products.map(
            normalizeProduct
          )

        : [],
  }
}

