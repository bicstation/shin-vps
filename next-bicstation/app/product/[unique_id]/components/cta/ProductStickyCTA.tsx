// next-bicstation/app/product/[unique_id]/components/cta/ProductStickyCTA.tsx

'use client'

import Link
  from 'next/link'

import styles
  from './cta.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildCTAUrl(
  product: any
) {

  return (
    product?.affiliate_url
    || product?.url
    || '#'
  )

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductStickyCTA({
  product,
}: Props) {

  const href =
    buildCTAUrl(
      product
    )

  return (

    <div
      className={
        styles.stickyCTA
      }
    >

      {/* ==================================
      PRIMARY CTA
      ================================== */}

      <Link
        href={href}

        target="_blank"

        className={
          styles.stickyPrimary
        }
      >
        🔥 最新価格を見る
      </Link>

      {/* ==================================
      SECONDARY CTA
      ================================== */}

      <Link
        href="/discover"

        className={
          styles.stickySecondary
        }
      >
        ⚡ 他の構成も比較
      </Link>

    </div>

  )
}