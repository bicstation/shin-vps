// /app/ranking/[type]/components/RankingStickyCTA.tsx

'use client'

import Link
  from 'next/link'

import styles
  from '../page.module.css'

type Props = {
  type: string
}

export default function RankingStickyCTA({
  type,
}: Props) {

  // =====================================
  // Context CTA
  // =====================================

  const contextualCopy: Record<
    string,
    {
      primary: string
      secondary: string
    }
  > = {

    'usage-gaming': {

      primary:
        '🎮 gaming構成を比較',

      secondary:
        '🎯 FPS向けPC診断',

    },

    'usage-ai': {

      primary:
        '⚡ AI向け構成を比較',

      secondary:
        '🧠 AI用途PC診断',

    },

    'usage-creator': {

      primary:
        '🎬 編集向け構成を比較',

      secondary:
        '🎯 creator向け診断',

    },

  }

  const copy =

    contextualCopy[type]
    || {

      primary:
        '🔥 他のランキングも比較',

      secondary:
        '🎯 自分に合うPCを探す',

    }

  return (

    <div
      className={
        styles.stickyCTA
      }
    >

      {/* ================================
      PRIMARY
      semantic continuation
      ================================ */}

      <Link
        href="/ranking"

        className={
          styles.stickyPrimary
        }
      >
        {copy.primary}
      </Link>

      {/* ================================
      SECONDARY
      decision support
      ================================ */}

      <Link
        href="/pc-finder"

        className={
          styles.stickySecondary
        }
      >
        {copy.secondary}
      </Link>

    </div>

  )
}