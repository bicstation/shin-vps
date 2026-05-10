// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/sidebar/normalize.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

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
🔥 Normalize Sidebar
========================================= */

export function
normalizeSidebar(

  payload?: any
) {

  // ======================================
  // Empty
  // ======================================

  if (!payload) {

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
      safeArray(
        payload?.cpu
      ),

    device:
      safeArray(
        payload?.device
      ),

    gpu:
      safeArray(
        payload?.gpu
      ),

    maker:

      safeArray(

        payload?.maker
        || payload?.maker_counts
      ),

    memory:
      safeArray(
        payload?.memory
      ),

    storage:
      safeArray(
        payload?.storage
      ),

    usage:
      safeArray(
        payload?.usage
      ),
  }
}