// ============================================================================
// FILE:
// /app/discover/components/tabs/UniverseTabs.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

  Universe,

} from '../../types/discover'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from '../../styles/discover.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  universes:
    Universe[]

  activeUniverse:
    string

  onChange:
    (
      universeSlug: string
    ) => void

}

/* ============================================================================
🔥 Universe Tabs
============================================================================ */

export default function UniverseTabs({

  universes,

  activeUniverse,

  onChange,

}: Props) {

  return (

    <div
      className={
        styles.universeTabs
      }
    >

      {universes.map(

        (
          universe
        ) => {

          const isActive =

            activeUniverse ===
            universe.universe_slug

          return (

            <button

              key={
                universe.universe_slug
              }

              type="button"

              onClick={() =>

                onChange(
                  universe.universe_slug
                )

              }

              className={

                isActive

                  ? styles.universeTabActive

                  : styles.universeTab

              }

            >

              {
                universe.universe_title
              }

            </button>

          )

        }

      )}

    </div>

  )

}