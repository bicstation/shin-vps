// ============================================================================
// FILE:
// /app/discover/[semantic-slug]/components/SemanticAliases.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from '../styles/discover-detail.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  aliases: string[]

}

/* ============================================================================
🔥 Semantic Aliases
============================================================================ */

export default function SemanticAliases({

  aliases,

}: Props) {

  if (

    !aliases ||

    aliases.length === 0

  ) {

    return null

  }

  return (

    <section
      className={
        styles.aliasSection
      }
    >

      <h2
        className={
          styles.aliasTitle
        }
      >

        関連キーワード

      </h2>

      <div
        className={
          styles.aliasList
        }
      >

        {

          aliases.map(

            (alias) => (

              <span

                key={alias}

                className={
                  styles.aliasTag
                }

              >

                {alias}

              </span>

            )

          )

        }

      </div>

    </section>

  )

}