// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/page.tsx

// @ts-nocheck

/* eslint-disable @next/next/no-img-element */

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
ProductDetailPage({

  params,

}: {
  params: Promise<{
    unique_id: string
  }>
}) {

  // ======================================
  // Params
  // ======================================

  const {
    unique_id,
  } = await params

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    `${process.env.INTERNAL_API_URL}/general/pc-products/${unique_id}/`

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
  // Normalize
  // ======================================

  const product =

    json?.product

    ||

    json?.result

    ||

    json

    ||

    {}

  // ======================================
  // Basic Fields
  // ======================================

  const name =

    product?.name

    ||

    product?.title

    ||

    'No Name'

  const maker =

    product?.maker
    || ''

  const price =

    product?.price
    || 0

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
      {/* Back */}
      {/* ================================= */}

      <div
        style={{
          marginBottom:
            '30px',
        }}
      >

        <Link
          href="/ranking"

          style={{
            color:
              '#aaa',

            textDecoration:
              'none',
          }}
        >

          ← Ranking

        </Link>

      </div>

      {/* ================================= */}
      {/* Title */}
      {/* ================================= */}

      <h1
        style={{
          fontSize:
            '42px',

          fontWeight:
            900,

          lineHeight:
            1.4,
        }}
      >

        Product Detail Debug

      </h1>

      {/* ================================= */}
      {/* Summary */}
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
        {/* Unique ID */}
        {/* ============================= */}

        <div style={cardStyle}>

          <div style={labelStyle}>
            UNIQUE ID
          </div>

          <div style={valueStyle}>
            {unique_id}
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

      </section>

      {/* ================================= */}
      {/* Request URL */}
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
      {/* Product Info */}
      {/* ================================= */}

      <section
        style={{
          marginTop:
            '60px',
        }}
      >

        <h2>
          Product Info
        </h2>

        <div
          style={{
            marginTop:
              '24px',

            display:
              'grid',

            gap:
              '20px',
          }}
        >

          {/* =========================== */}
          {/* Name */}
          {/* =========================== */}

          <div style={cardStyle}>

            <div style={labelStyle}>
              NAME
            </div>

            <div style={valueStyle}>
              {name}
            </div>

          </div>

          {/* =========================== */}
          {/* Maker */}
          {/* =========================== */}

          <div style={cardStyle}>

            <div style={labelStyle}>
              MAKER
            </div>

            <div style={valueStyle}>
              {maker}
            </div>

          </div>

          {/* =========================== */}
          {/* Price */}
          {/* =========================== */}

          <div style={cardStyle}>

            <div style={labelStyle}>
              PRICE
            </div>

            <div style={valueStyle}>
              ¥{
                Number(
                  price
                ).toLocaleString()
              }
            </div>

          </div>

        </div>

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