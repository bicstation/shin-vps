// app/test/_runtime/finder.ts

import { fetchFinder } from '@/shared/lib/api/django/pc/finder'

export async function executeFinder(
  usage: string,
  maxPrice?: number,
) {

  const endpoint =
    `http://localhost:8083/api/pc/finder/`

  const request = {

    attributes:
      usage ? [usage] : [],

    max_price:
      maxPrice ?? undefined,

  }

  const curl =
    `curl -X POST "${endpoint}" \
     -H "Content-Type: application/json" \
     -d '${JSON.stringify(request)}'`

  const startedAt =
    Date.now()

  const runtime =
    await fetchFinder(request)

  const executionTime =
    Date.now() - startedAt

  return {

    endpoint,
    curl,          // 🔥 追加
    method: "POST",

    request,

    executionTime,

    runtimeStatus:
      runtime?.runtime_status || "success",

    runtime,

  }
}