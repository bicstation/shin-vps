// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/sidebar/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  SidebarAttribute,

  SidebarPayload,

} from './contracts'

/* =========================================
🔥 Safe Array
========================================= */

function safeArray<T>(
  value?: T[]
): T[] {

  return Array.isArray(
    value
  )

    ? value

    : []
}

/* =========================================
🔥 Normalize Attributes
========================================= */

function normalizeAttributes(

  items?: any[]

): SidebarAttribute[] {

  return safeArray(
    items
  ).map(item => ({

    id:
      item?.id,

    name:
      item?.name || '',

    slug:
      item?.slug || '',

    count:
      item?.count || 0,

    icon:
      item?.icon || '',

    color:
      item?.color || '',

    semantic_role:
      item?.semantic_role
      || 'primary',

    semantic_weight:
      item?.semantic_weight
      || 0,
  }))
}

/* =========================================
🔥 Resolve Grouped Items
========================================= */

function resolveGroupedItems(

  groupedAttributes: any,

  key: string,

): any[] {

  return (

    groupedAttributes?.[key]?.items

    ||

    []
  )
}

/* =========================================
🔥 Normalize Sidebar
========================================= */

export function
normalizeSidebar(

  payload?: any

): SidebarPayload {

  // ======================================
  // Safe Payload
  // ======================================

  const safePayload =

    payload || {}

  // ======================================
  // Canonical Sidebar
  // ======================================

  const sidebar =

    safePayload?.sidebar
    ||

    safePayload

    ||

    {}

  // ======================================
  // Grouped Attributes
  // ======================================

  const groupedAttributes =

    safePayload?.grouped_attributes

    ||

    sidebar?.grouped_attributes

    ||

    {}

  // ======================================
  // Runtime Debug
  // ======================================

  console.log(

    '📦 NORMALIZE SIDEBAR',

    {

      hasSidebar:
        !!sidebar,

      hasGroupedAttributes:

        !!groupedAttributes,

      groupedAttributeKeys:

        Object.keys(
          groupedAttributes
        ),

      payloadKeys:

        Object.keys(
          safePayload
        ),
    }
  )

  // ======================================
  // Empty
  // ======================================

  if (

    !sidebar

    &&

    !groupedAttributes

  ) {

    return {

      cpu: [],

      device: [],

      gpu: [],

      maker: [],

      memory: [],

      storage: [],

      usage: [],
    }
  }

  // ======================================
  // Normalize
  // ======================================

  return {

    cpu:

      normalizeAttributes(

        sidebar?.cpu

        ||

        resolveGroupedItems(
          groupedAttributes,
          'cpu',
        )
      ),

    device:

      normalizeAttributes(

        sidebar?.device

        ||

        resolveGroupedItems(
          groupedAttributes,
          'device',
        )
      ),

    gpu:

      normalizeAttributes(

        sidebar?.gpu

        ||

        resolveGroupedItems(
          groupedAttributes,
          'gpu',
        )
      ),

    maker:

      normalizeAttributes(

        sidebar?.maker

        ||

        sidebar?.maker_counts

        ||

        resolveGroupedItems(
          groupedAttributes,
          'maker',
        )
      ),

    memory:

      normalizeAttributes(

        sidebar?.memory

        ||

        resolveGroupedItems(
          groupedAttributes,
          'memory',
        )
      ),

    storage:

      normalizeAttributes(

        sidebar?.storage

        ||

        resolveGroupedItems(
          groupedAttributes,
          'storage',
        )
      ),

    usage:

      normalizeAttributes(

        sidebar?.usage

        ||

        resolveGroupedItems(
          groupedAttributes,
          'usage',
        )
      ),
  }
}