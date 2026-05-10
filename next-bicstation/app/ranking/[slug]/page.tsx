// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/page.tsx

// @ts-nocheck

import Link
  from 'next/link'

/* =========================================
🔥 Dynamic
========================================= */

export const dynamic =
  'force-dynamic'

/* =========================================
🔥 Page
========================================= */

export default async function
RankingPage({

  params,

}: {
  params: Promise<{
    slug: string
  }>
}) {

  // ======================================
  // Params
  // ======================================

  const {
    slug,
  } = await params

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    `${process.env.INTERNAL_API_URL}/general/pc-products/ranking/${slug}/`

  // ======================================
  // Fetch
  // ======================================

  let status = 0

  let json = null

  let errorMessage = ''

  try {

    const response =

      await fetch(
        endpoint,
        {
          cache:
            'no-store',
        }
      )

    status =
      response.status

    json =
      await response.json()

  } catch (error) {

    errorMessage =
      String(error)
  }

  // ======================================
  // Results Normalize
  // ======================================

  const results =

    Array.isArray(
      json?.results
    )

      ? json.results

      : Array.isArray(
          json?.products
        )

          ? json.products

          : Array.isArray(
              json?.items
            )

              ? json.items

              : []

  // ======================================
  // Count
  // ======================================

  const count =

    json?.count

    ||

    results.length

    ||

    0

  // ======================================
  // Render
  // ======================================

  return (

    <main
      style={{
        padding:
          '40px',

        color:
          '#fff',

        maxWidth:
          '1200px',

        margin:
          '0 auto',
      }}
    >

      {/* ================================= */}
      {/* Title */}
      {/* ================================= */}

      <h1
        style={{
          fontSize:
            '42px',

          fontWeight:
            900,
        }}
      >

        Semantic Ranking Debug

      </h1>

      {/* ================================= */}
      {/* Info */}
      {/* ================================= */}

      <section
        style={{
          marginTop:
            '40px',

          display:
            'grid',

          gap:
            '20px',

          gridTemplateColumns:
            'repeat(auto-fit,minmax(260px,1fr))',
        }}
      >

        {/* ============================= */}
        {/* Slug */}
        {/* ============================= */}

        <div style={cardStyle}>

          <div style={labelStyle}>
            SLUG
          </div>

          <div style={valueStyle}>
            {slug}
          </div>

        </div>

        {/* ============================= */}
        {/* Status */}
        {/* ============================= */}

        <div style={cardStyle}>

          <div style={labelStyle}>
            STATUS
          </div>

          <div style={valueStyle}>
            {status}
          </div>

        </div>

        {/* ============================= */}
        {/* Count */}
        {/* ============================= */}

        <div style={cardStyle}>

          <div style={labelStyle}>
            RESULT COUNT
          </div>

          <div style={valueStyle}>
            {count}
          </div>

        </div>

      </section>

      {/* ================================= */}
      {/* Endpoint */}
      {/* ================================= */}

      <section
        style={{
          marginTop:
            '40px',
        }}
      >

        <h2>
          Request URL
        </h2>

        <pre style={preStyle}>

          {endpoint}

        </pre>

      </section>

      {/* ================================= */}
      {/* Error */}
      {/* ================================= */}

      {!!errorMessage && (

        <section
          style={{
            marginTop:
              '40px',
          }}
        >

          <h2>
            Error
          </h2>

          <pre style={preStyle}>

            {errorMessage}

          </pre>

        </section>

      )}

      {/* ================================= */}
      {/* Product Links */}
      {/* ================================= */}

      <section
        style={{
          marginTop:
            '60px',
        }}
      >

        <h2>
          Products
        </h2>

        {!results.length && (

          <div
            style={{
              marginTop:
                '20px',

              opacity:
                0.7,
            }}
          >

            データがありません

          </div>

        )}

        <ul
          style={{
            marginTop:
              '24px',

            display:
              'grid',

            gap:
              '16px',

            padding:
              0,

            listStyle:
              'none',
          }}
        >

          {results.map(
            (
              product,
              index
            ) => {

              // =========================
              // Normalize
              // =========================

              const uniqueId =

                product?.unique_id

                ||

                `unknown-${index}`

              const name =

                product?.name

                ||

                product?.title

                ||

                'No Name'

              const maker =

                product?.maker

                ||

                ''

              const price =

                product?.price
                || 0

              // =========================
              // Render
              // =========================

              return (

                <li
                  key={uniqueId}
                >

                  <Link
                    href={
                      `/product/${uniqueId}`
                    }

                    style={{
                      display:
                        'block',

                      padding:
                        '20px',

                      borderRadius:
                        '18px',

                      background:
                        'rgba(255,255,255,0.04)',

                      border:
                        '1px solid rgba(255,255,255,0.08)',

                      color:
                        '#fff',

                      textDecoration:
                        'none',
                    }}
                  >

                    {/* ================= */}
                    {/* Name */}
                    {/* ================= */}

                    <div
                      style={{
                        fontSize:
                          '18px',

                        fontWeight:
                          800,

                        lineHeight:
                          1.6,
                      }}
                    >

                      {name}

                    </div>

                    {/* ================= */}
                    {/* Meta */}
                    {/* ================= */}

                    <div
                      style={{
                        marginTop:
                          '10px',

                        opacity:
                          0.7,

                        fontSize:
                          '14px',
                      }}
                    >

                      {maker}

                    </div>

                    {/* ================= */}
                    {/* Price */}
                    {/* ================= */}

                    <div
                      style={{
                        marginTop:
                          '12px',

                        fontSize:
                          '20px',

                        fontWeight:
                          800,
                      }}
                    >

                      ¥{
                        Number(
                          price
                        ).toLocaleString()
                      }

                    </div>

                    {/* ================= */}
                    {/* Unique ID */}
                    {/* ================= */}

                    <div
                      style={{
                        marginTop:
                          '12px',

                        opacity:
                          0.5,

                        fontSize:
                          '12px',
                      }}
                    >

                      {uniqueId}

                    </div>

                  </Link>

                </li>
              )
            }
          )}

        </ul>

      </section>

      {/* ================================= */}
      {/* Raw JSON */}
      {/* ================================= */}

      <section
        style={{
          marginTop:
            '80px',

          paddingBottom:
            '120px',
        }}
      >

        <h2>
          Raw JSON
        </h2>

        <pre style={preStyle}>

          {JSON.stringify(
            json,
            null,
            2
          )}

        </pre>

      </section>

    </main>
  )
}

/* =========================================
🔥 Styles
========================================= */

const cardStyle = {

  padding:
    '24px',

  borderRadius:
    '20px',

  background:
    'rgba(255,255,255,0.04)',

  border:
    '1px solid rgba(255,255,255,0.08)',
}

const labelStyle = {

  fontSize:
    '12px',

  opacity:
    0.6,

  fontWeight:
    700,
}

const valueStyle = {

  marginTop:
    '12px',

  fontSize:
    '20px',

  fontWeight:
    800,

  lineHeight:
    1.5,
}

const preStyle = {

  marginTop:
    '20px',

  padding:
    '24px',

  borderRadius:
    '20px',

  background:
    '#111',

  overflowX:
    'auto',

  whiteSpace:
    'pre-wrap',

  fontSize:
    '12px',

  lineHeight:
    1.7,
}