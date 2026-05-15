// /app/concierge/error.tsx

'use client'

import React from 'react'

export default function ConciergeErrorPage({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#ff4d6d',
        textAlign: 'center',
      }}
    >
      <h1>コンシェルジュ AI エラー</h1>
      <p>{error.message}</p>
      <button
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          borderRadius: '0.25rem',
          backgroundColor: '#4dabf7',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={() => reset()}
      >
        リセット
      </button>
    </main>
  )
}