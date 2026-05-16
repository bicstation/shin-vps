// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/utils/runtime.ts

/* =========================================
🔥 Types
========================================= */

import type {
  SemanticOntologyRuntime,
  SemanticRankingRuntime,
} from '../types/runtime'

/* =========================================
🔥 Utils
========================================= */

import {
  isArray,
  isObject,
} from './guards'

/* =========================================
🔥 Normalize Ontology Runtime
========================================= */

export function
normalizeOntologyRuntime(

  runtime?: any

): SemanticOntologyRuntime {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (!isObject(runtime)) {
    return {}
  }

  /* ======================================
  🔥 Normalize
  ====================================== */

  const normalized: any = {}

  Object.entries(runtime)

    .forEach(
      (
        [
          key,
          value,
        ]
      ) => {

        if (
          isArray(value)
        ) {

          normalized[key] =
            value

        }

      }
    )

  /* ======================================
  🔥 Return
  ====================================== */

  return normalized
}

/* =========================================
🔥 Normalize Ranking Runtime
========================================= */

export function
normalizeRankingRuntime(

  runtime?: any

): SemanticRankingRuntime {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (!isObject(runtime)) {

    return {

      success:
        false,

      products: [],

      semantic: {},

      seo: {},

      faq: [],

      breadcrumbs: [],

      schemas: {},

      related_rankings: [],

      ui: {},
    }

  }

  /* ======================================
  🔥 Normalize
  ====================================== */

  return {

    success:

      runtime?.success
      === true,

    products:

      isArray(
        runtime?.products
      )

        ? runtime.products

        : [],

    semantic:

      isObject(
        runtime?.semantic
      )

        ? runtime.semantic

        : {},

    seo:

      isObject(
        runtime?.seo
      )

        ? runtime.seo

        : {},

    faq:

      isArray(
        runtime?.faq
      )

        ? runtime.faq

        : [],

    breadcrumbs:

      isArray(
        runtime?.breadcrumbs
      )

        ? runtime.breadcrumbs

        : [],

    schemas:

      isObject(
        runtime?.schemas
      )

        ? runtime.schemas

        : {},

    related_rankings:

      isArray(
        runtime?.related_rankings
      )

        ? runtime.related_rankings

        : [],

    ui:

      isObject(
        runtime?.ui
      )

        ? runtime.ui

        : {},
  }
}

/* =========================================
🔥 Get Runtime Product Count
========================================= */

export function
getRuntimeProductCount(

  runtime?: any

) {

  return isArray(
    runtime?.products
  )

    ? runtime.products.length

    : 0
}

/* =========================================
🔥 Get Runtime Attribute Count
========================================= */

export function
getRuntimeAttributeCount(

  runtime?: any

) {

  if (!isObject(runtime)) {
    return 0
  }

  return Object.values(runtime)

    .reduce(
      (
        total,
        value
      ) => (

        total
        + (
          isArray(value)
            ? value.length
            : 0
        )

      ),

      0
    )
}

/* =========================================
🔥 Get Runtime Group Count
========================================= */

export function
getRuntimeGroupCount(

  runtime?: any

) {

  if (!isObject(runtime)) {
    return 0
  }

  return Object.values(runtime)

    .filter(
      (
        value
      ) => (

        isArray(value)
        && value.length > 0

      )
    )

    .length
}