// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RuntimeDebug.tsx
// ============================================================================

'use client'

import styles from '../RankingSlugPage.module.css'

type Props = {
  runtime: any
}

/* ============================================================================
🔥 Runtime Debug
============================================================================ */

export default function RuntimeDebug({
  runtime,
}: Props) {

  /* ==========================================================================
  🔥 Runtime Overview
  ========================================================================== */

  const runtimeOverview = {

    success:
      runtime?.success,

    semantic:
      runtime?.semantic,

    seo:
      runtime?.seo,

    faq:
      runtime?.faq,

    breadcrumbs:
      runtime?.breadcrumbs,

    schemas:
      runtime?.schemas,

    ui:
      runtime?.ui,

    productCount:

      Array.isArray(
        runtime?.products
      )

        ? runtime.products.length

        : 0,
  }

  return (

    <section className={styles.runtimeDebugSection}>

      {/* ================================================================
      Header
      ================================================================ */}

      <div className={styles.runtimeDebugHeader}>

        <div>

          <div className={styles.runtimeDebugEyebrow}>

            DEBUG RUNTIME

          </div>

          <h2 className={styles.runtimeDebugTitle}>

            Semantic Runtime Observation

          </h2>

        </div>

      </div>

      {/* ================================================================
      Runtime Overview
      ================================================================ */}

      <div className={styles.runtimeDebugBlock}>

        <div className={styles.runtimeDebugLabel}>

          Runtime Overview

        </div>

        <pre className={styles.runtimeDebugJson}>

          {JSON.stringify(
            runtimeOverview,
            null,
            2
          )}

        </pre>

      </div>

      {/* ================================================================
      Products Preview
      ================================================================ */}

      <div className={styles.runtimeDebugBlock}>

        <div className={styles.runtimeDebugLabel}>

          First Product Preview

        </div>

        <pre className={styles.runtimeDebugJson}>

          {JSON.stringify(
            runtime?.products?.[0] || {},
            null,
            2
          )}

        </pre>

      </div>

      {/* ================================================================
      Full Runtime
      ================================================================ */}

      <div className={styles.runtimeDebugBlock}>

        <div className={styles.runtimeDebugLabel}>

          Full Runtime JSON

        </div>

        <pre className={styles.runtimeDebugJson}>

          {JSON.stringify(
            runtime,
            null,
            2
          )}

        </pre>

      </div>

    </section>

  )
}