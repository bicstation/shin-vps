// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/orchestration/RankingLayout.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './RankingLayout.module.css'

/* =========================================
🔥 Types
========================================= */

type Props = {

  children:
    React.ReactNode
}

/* =========================================
🔥 Layout
========================================= */

export default function
RankingLayout({
  children,
}: Props) {

  return (

    <main
      className={
        styles.page
      }
    >

      <div
        className={
          styles.container
        }
      >

        {children}

      </div>

    </main>

  )
}