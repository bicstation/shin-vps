// /shared/lib/api/django/pc/stats.ts

import { getApiBase } from '@/shared/lib/config/api'

/**
 * =========================================
 * 🔥 共通レスポンスチェック
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
 * 🔥 ランキング取得（パスベース完全版）
 * =========================================
 */
export async function fetchPCProductRanking(
  slug: string = 'score'
) {
  try {
    const API_BASE = getApiBase()

    if (!API_BASE) {
      console.error('[ERROR] API BASE MISSING')
      return []
    }

    // -------------------------
    // 🔥 URL構築（完全パス方式）
    // -------------------------
    const url =
      slug === 'score'
        ? `${API_BASE}/general/pc-products/ranking/`
        : `${API_BASE}/general/pc-products/ranking/${slug}/`

    console.log('[FETCH RANKING]', {
      slug,
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
 * 🔥 商品詳細（安定版）
 * =========================================
 */
export async function fetchPCProductDetail(unique_id: string) {
  try {
    const API_BASE = getApiBase()

    if (!API_BASE) {
      console.error('[ERROR] API BASE MISSING')
      return null
    }

    if (!unique_id) {
      console.error('[ERROR] INVALID UNIQUE_ID')
      return null
    }

    const url = `${API_BASE}/general/pc-products/${unique_id}/`

    console.log('[FETCH DETAIL]', {
      unique_id,
      url,
    })

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