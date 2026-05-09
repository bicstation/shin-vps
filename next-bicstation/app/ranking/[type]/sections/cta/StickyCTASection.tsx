// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/sections/cta/StickyCTASection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import RankingStickyCTA
  from '../../components/RankingStickyCTA'

/* =========================================
🔥 Types
========================================= */

type Props = {

  type: string
}

/* =========================================
🔥 Sticky CTA Section
========================================= */

export default function
StickyCTASection({
  type,
}: Props) {

  return (

    <>
      {/* ==================================
      Mobile Conversion Layer
      sticky conversion orchestration
      ================================== */}

      <RankingStickyCTA
        type={type}
      />

    </>

  )
}
