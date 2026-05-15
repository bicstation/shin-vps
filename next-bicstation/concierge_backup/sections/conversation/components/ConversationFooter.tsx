// /app/concierge/sections/conversation/components/ConversationFooter.tsx

'use client'

/* =========================================
🔥 Props
========================================= */

type Props = {

  onSend?: (content: string) => void

  placeholder?: string
}

/* =========================================
🔥 Conversation Footer
========================================= */

export default function
ConversationFooter({
  onSend,
  placeholder = 'メッセージを入力…',
}: Props) {

  return (

    <footer className="conversation-footer">

      <input
        type="text"
        placeholder={placeholder}
        className="conversation-input"
        onKeyDown={e => {
          if (e.key === 'Enter') {
            onSend?.(e.currentTarget.value)
            e.currentTarget.value = ''
          }
        }}
      />

      <button
        className="conversation-send"
        onClick={e => {
          const input = (
            e.currentTarget
              .previousElementSibling as HTMLInputElement
          )
          if (input?.value) {
            onSend?.(input.value)
            input.value = ''
          }
        }}
      >
        送信
      </button>

    </footer>
  )
}