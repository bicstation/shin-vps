// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/selectors/shared/selectSchemas.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectSchemas(

  runtime?: any

) {

  /* ======================================
  🔥 Runtime Schemas
  ====================================== */

  const runtimeSchemas =

    runtime?.schemas
    || {}

  /* ======================================
  🔥 Normalize
  ====================================== */

  return {

    itemList:

      runtimeSchemas?.itemList
      || runtimeSchemas?.item_list
      || null,

    breadcrumbList:

      runtimeSchemas?.breadcrumbList
      || runtimeSchemas?.breadcrumb_list
      || null,

    faqPage:

      runtimeSchemas?.faqPage
      || runtimeSchemas?.faq_page
      || null,

    collectionPage:

      runtimeSchemas?.collectionPage
      || runtimeSchemas?.collection_page
      || null,

  }
}