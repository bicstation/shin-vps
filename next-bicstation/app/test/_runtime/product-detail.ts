import {

  fetchProductDetail,

} from "@/shared/lib/api/django/pc/product-detail";

export async function executeProductDetail(

  uniqueId: string

) {

  const startedAt =

    Date.now();

  const runtime =

    await fetchProductDetail(
      uniqueId
    );

  const executionTime =

    Date.now() -
    startedAt;

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