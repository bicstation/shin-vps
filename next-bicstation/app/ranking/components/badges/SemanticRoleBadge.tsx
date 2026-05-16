// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/badges/SemanticRoleBadge.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Utils
========================================= */

import {
  getSemanticRoleLabel,
  getSemanticRoleTone,
} from '../../utils/semantic-ui'

/* =========================================
🔥 Types
========================================= */

type Props = {

  role?: string
}

/* =========================================
🔥 Component
========================================= */

export default function
SemanticRoleBadge({

  role = 'semantic',

}: Props) {

  /* ======================================
  🔥 Tone
  ====================================== */

  const tone =

    getSemanticRoleTone(
      role
    )

  /* ======================================
  🔥 Label
  ====================================== */

  const label =

    getSemanticRoleLabel(
      role
    )

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <div
      style={{
        display: 'inline-flex',

        alignItems: 'center',

        gap: '10px',

        minHeight: '36px',

        padding:
          '0 14px',

        borderRadius:
          '999px',

        background:
          tone.background,

        border:
          tone.border,

        color:
          tone.color,

        fontSize: '12px',

        fontWeight: 800,

        letterSpacing:
          '0.04em',
      }}
    >

      {/* ==================================
      DOT
      ================================== */}

      <div
        style={{
          width: '8px',

          height: '8px',

          borderRadius: '999px',

          background:
            tone.color,
        }}
      />

      {/* ==================================
      LABEL
      ================================== */}

      <span>
        {label}
      </span>

    </div>

  )
}