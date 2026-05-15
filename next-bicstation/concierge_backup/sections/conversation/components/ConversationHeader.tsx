// /app/concierge/sections/conversation/components/ConversationHeader.tsx

'use client'

/* =========================================
🔥 Props
========================================= */

type Props = {

  title?: string

  subtitle?: string
}

/* =========================================
🔥 Conversation Header
========================================= */

export default function
ConversationHeader({
  title = 'SHIN CORE LINX Concierge',
  subtitle = 'Semantic AI Recommendation Runtime',
}: Props) {

  return (

    <header
      className="
        flex
        flex-col
        gap-1
        border-b
        border-white/10
        pb-4
      "
    >

      {/* ==================================
      Title
      ================================== */}

      <h1
        className="
          text-2xl
          font-bold
          text-white
        "
      >

        {title}

      </h1>

      {/* ==================================
      Subtitle
      ================================== */}

      <p
        className="
          text-sm
          text-white/60
        "
      >

        {subtitle}

      </p>

    </header>
  )
}