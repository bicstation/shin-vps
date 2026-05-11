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
🔥 Normalize Sidebar
========================================= */

export function
normalizeSidebar(

  payload?: any

): SidebarPayload {

  // ======================================
  // Safe Sidebar
  // ======================================

  const sidebar =

    payload?.sidebar
    || payload
    || {}

  // ======================================
  // Empty
  // ======================================

  if (!sidebar) {

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
      ),

    device:

      normalizeAttributes(
        sidebar?.device
      ),

    gpu:

      normalizeAttributes(
        sidebar?.gpu
      ),

    maker:

      normalizeAttributes(

        sidebar?.maker
        || sidebar?.maker_counts
      ),

    memory:

      normalizeAttributes(
        sidebar?.memory
      ),

    storage:

      normalizeAttributes(
        sidebar?.storage
      ),

    usage:

      normalizeAttributes(
        sidebar?.usage
      ),
  }
}