// ============================================================================
// FILE:
// /app/discover/[semantic-slug]/components/Breadcrumb.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import type {
  DiscoverDetailRuntime,
} from '@/shared/lib/api/django/pc/discover-detail'

import styles
  from '../styles/discover-detail.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  runtime:
    DiscoverDetailRuntime

}

/* ============================================================================
🔥 Breadcrumb
============================================================================ */

export default function Breadcrumb({

  runtime,

}: Props) {

  return (

    <nav
      className={
        styles.breadcrumb
      }
    >

      <Link href="/">
        HOME
      </Link>

      <span>›</span>

      <Link href="/discover">
        DISCOVER
      </Link>

      {

        runtime.group_name && (

          <>

            <span>›</span>

            <span>

              {

                runtime.group_name

              }

            </span>

          </>

        )

      }

    </nav>

  )

}