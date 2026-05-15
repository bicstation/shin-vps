// /app/concierge/sections/input/InputSection.tsx

'use client'

/* =========================================
🔥 Props
========================================= */

type Props = {

  value?: string

  onChange?: (value: string) => void

  onSend?: (value: string) => void

  placeholder?: string

  disabled?: boolean

  hint?: string
}

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './InputSection.module.css'

/* =========================================
🔥 Input Section
========================================= */

export default function InputSection({
  value = '',
  onChange,
  onSend,
  placeholder = 'メッセージを入力…',
  disabled = false,
  hint,
}: Props) {

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {

    if (e.key === 'Enter' && !e.shiftKey) {

      e.preventDefault()
      if (value.trim() && !disabled) {
        onSend?.(value.trim())
      }
    }
  }

  return (

    <section
      className={styles.inputSection}
    >

      <div
        className={styles.inputWrapper}
      >

        <textarea
          className={styles.inputTextarea}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={e =>
            onChange?.(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />

        <button
          className={styles.sendButton}
          disabled={disabled || !value.trim()}
          onClick={() =>
            value.trim() &&
            onSend?.(value.trim())
          }
        >
          送信
        </button>

      </div>

      {hint && (
        <div className={styles.inputHint}>
          {hint}
        </div>
      )}

    </section>
  )
}