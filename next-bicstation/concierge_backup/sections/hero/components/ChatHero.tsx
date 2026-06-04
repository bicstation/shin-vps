// /app/concierge/sections/hero/components/ChatHero.tsx

'use client'

/* =========================================
🔥 Props
========================================= */

type Props = {

  title?: string

  description?: string
}

/* =========================================
🔥 Chat Hero
========================================= */

export default function ChatHero({
  title = 'SHIN CORE LINX Concierge',
  description = 'Semantic AI recommendation and reasoning runtime',
}: Props) {

  return (

    <section className="chat-hero">

      <div className="chat-hero-badge">
        Concierge AI
      </div>

      <h1 className="chat-hero-title">
        {title}
      </h1>

      <p className="chat-hero-description">
        {description}
      </p>

    </section>
  )
}