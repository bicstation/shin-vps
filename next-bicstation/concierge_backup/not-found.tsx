// /app/concierge/not-found.tsx

'use client'

import React from 'react'
import Link from 'next/link'

export default function ConciergeNotFound() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#ffffff',
        textAlign: 'center',
      }}
    >
      <h1>ページが見つかりません</h1>
      <p>指定されたコンシェルジュ AI ページは存在しません。</p>
      <Link
        href="/"
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#4dabf7',
          borderRadius: '0.25rem',
          color: '#fff',
          textDecoration: 'none',
        }}
      >
        トップページへ戻る
      </Link>
    </main>
  )
}