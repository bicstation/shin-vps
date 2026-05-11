// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/page.tsx

// @ts-nocheck

/* eslint-disable @next/next/no-img-element */

import Link
  from 'next/link'

/* =========================================
🔥 API
========================================= */

import {

  fetchPCDetail,

  fetchRelatedPC,

} from '@/shared/lib/api/django/pc'

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
  // Fetch
  // ======================================

  let product = null

  let related = []

  let errorMessage = ''

  try {

    // ====================================
    // Product
    // ====================================

    product =
      await fetchPCDetail(
        unique_id
      )

    // ====================================
    // Related
    // ====================================

    related =
      await fetchRelatedPC(
        unique_id
      )

  } catch (error) {

    errorMessage =
      String(error)
  }

  // ======================================
  // Empty Guard
  // ======================================

  if (!product) {

    return (

      <main style={pageStyle}>

        <h1>
          Product Not Found
        </h1>

        {!!errorMessage && (

          <pre style={preStyle}>
            {errorMessage}
          </pre>

        )}

      </main>

    )
  }

  // ======================================
  // Basic
  // ======================================

  const name =

    product?.name
    || 'No Name'

  const maker =

    product?.maker
    || '-'

  const price =

    Number(
      product?.price || 0
    ).toLocaleString()

  const image =

    product?.image_url
    || '/no-image.webp'

  // ======================================
  // Semantic
  // ======================================

  const attributes =

    Array.isArray(
      product?.attributes
    )

      ? product.attributes

      : []

  const groupedAttributes =

    product?.grouped_attributes
    || {}

  // ======================================
  // Render
  // ======================================

  return (

    <main style={pageStyle}>

      {/* ================================= */}
      {/* Back */}
      {/* ================================= */}

      <div
        style={{
          marginBottom:
            '40px',
        }}
      >

        <Link
          href="/ranking"

          style={{
            color:
              '#999',

            textDecoration:
              'none',
          }}
        >

          ← Ranking

        </Link>

      </div>

      {/* ================================= */}
      {/* Hero */}
      {/* ================================= */}

      <section
        style={{
          display:
            'grid',

          gridTemplateColumns:
            '420px 1fr',

          gap:
            '40px',

          alignItems:
            'start',
        }}
      >

        {/* ============================= */}
        {/* Image */}
        {/* ============================= */}

        <div style={cardStyle}>

          <img
            src={image}

            alt={name}

            style={{
              width:
                '100%',

              borderRadius:
                '20px',

              objectFit:
                'cover',
            }}
          />

        </div>

        {/* ============================= */}
        {/* Content */}
        {/* ============================= */}

        <div>

          <div style={labelStyle}>
            SEMANTIC PRODUCT DEBUG
          </div>

          <h1
            style={{
              fontSize:
                '48px',

              lineHeight:
                1.2,

              fontWeight:
                900,

              marginTop:
                '16px',
            }}
          >

            {name}

          </h1>

          <div
            style={{
              marginTop:
                '20px',

              display:
                'flex',

              gap:
                '12px',

              flexWrap:
                'wrap',
            }}
          >

            <div style={chipStyle}>
              {maker}
            </div>

            <div style={chipStyle}>
              ¥{price}
            </div>

            <div style={chipStyle}>
              schema v
              {
                product
                  ?.semantic_schema_version
              }
            </div>

          </div>

          {/* =========================== */}
          {/* Description */}
          {/* =========================== */}

          <p
            style={{
              marginTop:
                '28px',

              fontSize:
                '16px',

              lineHeight:
                1.8,

              opacity:
                0.85,
            }}
          >

            {
              product?.description
              || 'No Description'
            }

          </p>

        </div>

      </section>

      {/* ================================= */}
      {/* Specs */}
      {/* ================================= */}

      <section
        style={{
          marginTop:
            '60px',
        }}
      >

        <h2>
          Specs
        </h2>

        <div
          style={{
            marginTop:
              '24px',

            display:
              'grid',

            gridTemplateColumns:
              'repeat(auto-fit,minmax(220px,1fr))',

            gap:
              '20px',
          }}
        >

          <SpecCard
            label="CPU"
            value={
              product?.cpu_model
            }
          />

          <SpecCard
            label="GPU"
            value={
              product?.gpu_model
            }
          />

          <SpecCard
            label="Memory"
            value={
              `${product?.memory_gb}GB`
            }
          />

          <SpecCard
            label="Storage"
            value={
              `${product?.storage_gb}GB`
            }
          />

        </div>

      </section>

      {/* ================================= */}
      {/* Scores */}
      {/* ================================= */}

      <section
        style={{
          marginTop:
            '60px',
        }}
      >

        <h2>
          Semantic Scores
        </h2>

        <div
          style={{
            marginTop:
              '24px',

            display:
              'grid',

            gridTemplateColumns:
              'repeat(auto-fit,minmax(220px,1fr))',

            gap:
              '20px',
          }}
        >

          <SpecCard
            label="SPEC"
            value={
              product?.spec_score
            }
          />

          <SpecCard
            label="GPU"
            value={
              product?.score_gpu
            }
          />

          <SpecCard
            label="AI"
            value={
              product?.score_ai
            }
          />

          <SpecCard
            label="COST"
            value={
              product?.score_cost
            }
          />

        </div>

      </section>

      {/* ================================= */}
      {/* Attributes */}
      {/* ================================= */}

      <section
        style={{
          marginTop:
            '60px',
        }}
      >

        <h2>
          Attributes
        </h2>

        <div
          style={{
            marginTop:
              '24px',

            display:
              'flex',

            flexWrap:
              'wrap',

            gap:
              '12px',
          }}
        >

          {attributes.map(
            (
              item: any,
              index: number
            ) => (

              <div
                key={
                  item?.slug
                  || index
                }

                style={chipStyle}
              >

                {item?.name}

              </div>

            )
          )}

        </div>

      </section>

      {/* ================================= */}
      {/* Grouped Attributes */}
      {/* ================================= */}

      <section
        style={{
          marginTop:
            '60px',
        }}
      >

        <h2>
          Grouped Attributes
        </h2>

        <pre style={preStyle}>

          {JSON.stringify(
            groupedAttributes,
            null,
            2
          )}

        </pre>

      </section>

      {/* ================================= */}
      {/* Related */}
      {/* ================================= */}

      <section
        style={{
          marginTop:
            '60px',
        }}
      >

        <h2>
          Related Products
        </h2>

        <pre style={preStyle}>

          {JSON.stringify(
            related,
            null,
            2
          )}

        </pre>

      </section>

      {/* ================================= */}
      {/* Raw */}
      {/* ================================= */}

      <section
        style={{
          marginTop:
            '60px',

          paddingBottom:
            '120px',
        }}
      >

        <h2>
          Normalized Product JSON
        </h2>

        <pre style={preStyle}>

          {JSON.stringify(
            product,
            null,
            2
          )}

        </pre>

      </section>

    </main>
  )
}

/* =========================================
🔥 Spec Card
========================================= */

function SpecCard({
  label,
  value,
}: {
  label: string
  value: any
}) {

  return (

    <div style={cardStyle}>

      <div style={labelStyle}>
        {label}
      </div>

      <div style={valueStyle}>
        {value || '-'}
      </div>

    </div>

  )
}

/* =========================================
🔥 Styles
========================================= */

const pageStyle = {

  padding:
    '48px',

  color:
    '#fff',

  maxWidth:
    '1400px',

  margin:
    '0 auto',
}

const cardStyle = {

  padding:
    '24px',

  borderRadius:
    '24px',

  background:
    'rgba(255,255,255,0.04)',

  border:
    '1px solid rgba(255,255,255,0.08)',
}

const labelStyle = {

  fontSize:
    '12px',

  fontWeight:
    800,

  opacity:
    0.55,

  letterSpacing:
    '0.08em',
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

const chipStyle = {

  padding:
    '10px 14px',

  borderRadius:
    '999px',

  background:
    'rgba(255,255,255,0.08)',

  border:
    '1px solid rgba(255,255,255,0.08)',

  fontSize:
    '13px',

  fontWeight:
    700,
}

const preStyle = {

  marginTop:
    '24px',

  padding:
    '24px',

  borderRadius:
    '24px',

  background:
    '#111827',

  overflowX:
    'auto',

  whiteSpace:
    'pre-wrap',

  fontSize:
    '12px',

  lineHeight:
    1.7,
}