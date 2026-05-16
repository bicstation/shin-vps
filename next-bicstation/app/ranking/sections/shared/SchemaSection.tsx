// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/sections/shared/SchemaSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Types
========================================= */

type Props = {

  schemas?: {

    itemList?: any

    breadcrumbList?: any

    faqPage?: any

    collectionPage?: any
  }
}

/* =========================================
🔥 Utils
========================================= */

function buildSchemaList(
  schemas?: Props['schemas']
) {

  if (!schemas) {
    return []
  }

  return [

    schemas?.itemList,

    schemas?.breadcrumbList,

    schemas?.faqPage,

    schemas?.collectionPage,

  ].filter(Boolean)
}

/* =========================================
🔥 Section
========================================= */

export default function
SchemaSection({

  schemas,

}: Props) {

  /* ======================================
  🔥 Schema List
  ====================================== */

  const schemaList =

    buildSchemaList(
      schemas
    )

  /* ======================================
  🔥 Empty
  ====================================== */

  if (!schemaList.length) {
    return null
  }

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <>
      {schemaList.map(
        (
          schema,
          index
        ) => (

          <script
            key={index}

            type="application/ld+json"

            dangerouslySetInnerHTML={{
              __html:
                JSON.stringify(
                  schema
                ),
            }}
          />

        )
      )}
    </>

  )
}