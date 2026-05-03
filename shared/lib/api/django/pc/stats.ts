// /shared/lib/api/django/pc/stats.ts

import { getApiBase } from '@/shared/lib/config/api'

/**
 * =========================================
 * 🔥 共通レスポンスチェック（強化版）
 * =========================================
 */
async function safeJson(res: Response, url: string) {
  const text = await res.text()

  // HTML検出（APIミス検知）
  if (text.startsWith('<')) {
    console.error('[INVALID JSON]', url, text.slice(0, 200))
    return null
  }

  try {
    return JSON.parse(text)
  } catch (e) {
    console.error('[JSON PARSE ERROR]', url, e)
    return null
  }
}

/**
 * =========================================
 * 🔥 ランキング取得（完全版）
 * =========================================
 */
export async function fetchPCProductRanking(
  use: string = 'score',
  sort: string = 'score'
) {
  try {
    const API_BASE = getApiBase()

    // -------------------------
    // 🔥 パラメータ安全化
    // -------------------------
    const safeUse = use || 'score'
    const safeSort = ['score', 'price_asc', 'price_desc'].includes(sort)
      ? sort
      : 'score'

    // -------------------------
    // 🔥 URL構築
    // -------------------------
    const url = `${API_BASE}/general/pc-products/ranking/?use=${safeUse}&sort=${safeSort}`

    console.log('[FETCH RANKING]', {
      use: safeUse,
      sort: safeSort,
      url,
    })

    // -------------------------
    // 🔥 fetch
    // -------------------------
    const res = await fetch(url, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[API ERROR]', res.status, url)
      return []
    }

    // -------------------------
    // 🔥 JSON安全取得
    // -------------------------
    const data = await safeJson(res, url)

    if (!data) return []

    // -------------------------
    // 🔥 正規化
    // -------------------------
    const result = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
      ? data.results
      : []

    console.log('[FETCH RESULT]', result.length)

    return result
  } catch (error) {
    console.error('[fetchPCProductRanking ERROR]', error)
    return []
  }
}

/**
 * =========================================
 * 🔥 商品詳細（PCProduct統一版）
 * =========================================
 */
export async function fetchPCProductDetail(unique_id: string) {
  try {
    const API_BASE = getApiBase()

    // 🔥 正しいURL（ここが今回の本質修正）
    const url = `${API_BASE}/general/pc-products/${unique_id}/`

    console.log('[FETCH DETAIL]', url)

    const res = await fetch(url, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[DETAIL ERROR]', res.status, url)
      return null
    }

    return await safeJson(res, url)
  } catch (error) {
    console.error('[fetchPCProductDetail ERROR]', error)
    return null
  }
}