/* eslint-disable @next/next/no-img-element */

import type {
  Metadata,
  Viewport,
} from 'next'

import {
  Inter,
} from 'next/font/google'

import Script from 'next/script'

import {
  APPLICATION,
  SITE,
  createMetadata,
  createDefaultJsonLd,
} from '@/shared/publishing'

import {
  toNextMetadata,
} from './publishing/next'

import '@shared/styles/globals.css'
import '@shared/styles/markdown.css'

import Header from '@/shared/components/organisms/common/Header'
import Footer from '@/shared/components/organisms/common/Footer'
// import ChatBotLoader from '@/shared/components/organisms/common/ChatBotLoader';

import styles from './layout.module.css'

/**
 * =====================================================================
 * 🌐 Font
 * =====================================================================
 */

const inter = Inter({

  subsets: [
    'latin',
  ],

  display:
    'swap',

})

/**
 * =====================================================================
 * 🛰️ Publishing
 * =====================================================================
 */

const publishingMetadata =
  createMetadata({

    canonical:
      SITE.URL,

  })

/**
 * ============================================================================
 * JSON-LD
 * ============================================================================
 */

const jsonLd =
  createDefaultJsonLd()

/**
 * =====================================================================
 * 🛰️ Metadata
 * =====================================================================
 */

export const metadata: Metadata = {

  ...toNextMetadata(

    publishingMetadata,

  ),

  metadataBase:

    new URL(

      SITE.URL,

    ),

  applicationName:

    APPLICATION.NAME,

  category:

    APPLICATION.CATEGORY,

  other: {

    'google-adsense-account':

      'ca-pub-9068876333048216',

  },

}

/**
 * =====================================================================
 * 📱 Viewport
 * =====================================================================
 */

export const viewport: Viewport = {

  width:
    'device-width',

  initialScale:
    1,

}

/**
 * =====================================================================
 * 🚀 Root Layout
 * =====================================================================
 */

export default function RootLayout({

  children,

}: {

  children:
    React.ReactNode

}) {

  const isAdminPage =
    false

  const isAdult =
    false

  return (

    <html
      lang="ja"
      suppressHydrationWarning
    >

      <head>

        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9068876333048216"
          crossOrigin="anonymous"
        />

      </head>

      <body

        className={`
          ${inter.className}
          ${styles.bodyWrapper}
          ${isAdult ? 'is-adult-theme' : 'is-general-theme'}
        `}

        suppressHydrationWarning

      >

        <Script

          id="jsonld-default"

          type="application/ld+json"

          strategy="beforeInteractive"

          dangerouslySetInnerHTML={{

            __html:

              JSON.stringify(

                jsonLd,

              ),

          }}

        />

        {/* =========================================================
           🔹 Header
        ========================================================= */}

        <Header />

        {/* =========================================================
           🔹 Main
        ========================================================= */}

        <main

          className={
            styles.main
          }

        >

          {children}

        </main>

        {/* =========================================================
           🔹 Affiliate
        ========================================================= */}

        {!isAdminPage && (

          <div

            style={{

              fontSize:
                '11px',

              textAlign:
                'center',

              color:
                '#888',

              marginTop:
                '24px',

            }}

          >

            ※本サイトはアフィリエイト広告を利用しています

          </div>

        )}

        {/* =========================================================
           🔹 Footer
        ========================================================= */}

        {!isAdminPage && (

          <Footer />

        )}

        {/*
        <ChatBotLoader />
        */}

      </body>

    </html>

  )

}