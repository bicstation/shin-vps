/* eslint-disable @next/next/no-img-element */

import React from "react"
import Link from "next/link"

// -------------------------
// 安全fetch
// -------------------------
async function testFetch() {
  try {
    const res = await fetch(
      "http://localhost:8000/api/general/pc-sidebar-stats/",
      { cache: "no-store" }
    )

    if (!res.ok) {
      console.error("API ERROR", res.status)
      return null
    }

    return await res.json()
  } catch (e) {
    console.error("FETCH ERROR", e)
    return null
  }
}

// -------------------------
// 安全slug生成（超重要）
// -------------------------
function safeSlug(g: any, i: number) {
  if (typeof g?.slug === "string" && g.slug.length > 0) {
    return g.slug
  }

  if (typeof g?.name === "string") {
    return `gpu-${g.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}`
  }

  return `gpu-${i}`
}

// -------------------------
// ページ本体（完成版）
// -------------------------
export default async function Page() {
  const data = await testFetch()

  console.log("DATA:", data)

  const gpu = Array.isArray(data?.gpu) ? data.gpu : []

  return (
    <main style={{ padding: 20 }}>
      <h1>OK PAGE（最終版）</h1>

      <div style={{ display: "grid", gap: "10px", marginTop: 20 }}>
        {gpu.slice(0, 5).map((g: any, i: number) => {
          if (!g) return null

          const slug = safeSlug(g, i)

          return (
            <Link
              key={slug}
              href={`/ranking/${slug}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                border: "1px solid #333",
                borderRadius: "6px",
              }}
            >
              <span>{g?.name ?? "UNKNOWN"}</span>
              <span>({g?.count ?? 0})</span>
            </Link>
          )
        })}
      </div>
    </main>
  )
}