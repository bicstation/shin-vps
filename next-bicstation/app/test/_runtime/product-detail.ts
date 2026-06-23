// ============================================================================
// FILE:
// /app/test/_runtime/product-detail.ts
// ============================================================================

import {

  fetchProductDetail,

} from "@/shared/lib/api/django/pc/product-detail";

export async function executeProductDetail(

  uniqueId: string

) {

  const startedAt =

    Date.now();

  console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  );

  console.log(
    "🔥 PRODUCT DETAIL WORKBENCH EXECUTE"
  );

  console.log({

    uniqueId,

    endpoint:
      `/pc/products/${uniqueId}/`,

  });

  console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  );

  const runtime =

    await fetchProductDetail(
      uniqueId
    );

  const executionTime =

    Date.now() -
    startedAt;

  console.log(
    "🔥 PRODUCT DETAIL WORKBENCH RESPONSE",
    {
      uniqueId,

      executionTime,

      product:
        runtime?.product?.unique_id,

      semantic_summary:
        !!runtime
          ?.product_semantic_runtime
          ?.semantic_summary,

      semantic_reasons:
        runtime
          ?.product_semantic_runtime
          ?.semantic_reasons
          ?.length,

      workflow_tags:
        runtime
          ?.product_semantic_runtime
          ?.workflow_tags
          ?.length,

      related_intents:
        runtime
          ?.product_semantic_runtime
          ?.related_intents
          ?.length,

      grouped_attributes:
        Object.keys(
          runtime
            ?.product_semantic_runtime
            ?.grouped_attributes
            || {}
        ).length,

    }
  );

  return {

    endpoint:
      `/pc/products/${uniqueId}/`,

    method:
      "GET",

    curl:
      `curl http://localhost:8000/api/pc/products/${uniqueId}/`,

    request: {

      unique_id:
        uniqueId,

    },

    executionTime,

    runtimeStatus:

      runtime
        ? "success"
        : "failed",

    runtime,

  };

}

export default executeProductDetail;