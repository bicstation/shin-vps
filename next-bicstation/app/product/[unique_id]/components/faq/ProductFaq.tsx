// ============================================================================
// FILE:
// app/product/[unique_id]/components/faq/ProductFaq.tsx
//
// SHIN CORE LINX
// Product Detail FAQ Experience
//
// RESPONSIBILITY
//
// Projected Product
//        ↓
// ProductFaq
//        ↓
// Product-specific FAQ Experience
//
// ProductFaq = Product Reality FAQ Presentation
//
// ✓ Product-specific questions
// ✓ Product-specific answers
// ✓ Uses projected product information
// ✓ Handles missing specifications
// ✓ Stable FAQ interaction
//
// ✗ Semantic generation
// ✗ Workflow inference
// ✗ Recommendation generation
// ✗ Usage suitability inference
// ✗ AI generation
// ✗ Runtime generation
//
// IMPORTANT
//
// FAQ answers must be grounded in fields already available
// in ProjectedProduct.
//
// Do not infer:
//
//   ✓ gaming suitability
//   ✓ AI suitability
//   ✓ creator suitability
//   ✓ performance level
//
// from CPU / GPU names alone.
//
// ============================================================================

'use client'

import {
  useState,
} from 'react'

import styles
  from './faq.module.css'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {
  ProjectedProduct,
} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Types
============================================================================ */

type FAQItem = {

  question:
    string

  answer:
    string

}


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

}


/* ============================================================================
🔥 Helpers
============================================================================ */

/**
 * Normalize display value.
 *
 * FAQ should never render empty / meaningless values.
 */

function getStringValue(
  value: unknown,
): string {

  if (
    value === undefined
    || value === null
  ) {

    return ''

  }

  const text =
    String(value)
      .trim()

  return text

}


/* ============================================================================
🔥 Product Name
============================================================================ */

function getProductName(
  product: ProjectedProduct,
): string {

  return (

    getStringValue(
      product?.name
    )

    ||

    'このPC'

  )

}


/* ============================================================================
🔥 CPU
============================================================================ */

function getCpu(
  product: ProjectedProduct,
): string {

  return (

    getStringValue(
      product?.cpuModel
    )

    ||

    getStringValue(
      (product as any)?.cpu_model
    )

  )

}


/* ============================================================================
🔥 GPU
============================================================================ */

function getGpu(
  product: ProjectedProduct,
): string {

  return (

    getStringValue(
      product?.gpuModel
    )

    ||

    getStringValue(
      (product as any)?.gpu_model
    )

  )

}


/* ============================================================================
🔥 Memory
============================================================================ */

function getMemory(
  product: ProjectedProduct,
): string {

  const memory =

    product?.memoryGb

    ??

    (product as any)?.memory_gb

  if (
    memory === undefined
    || memory === null
    || memory === ''
  ) {

    return ''

  }

  return `${memory}GB`

}


/* ============================================================================
🔥 Storage
============================================================================ */

function getStorage(
  product: ProjectedProduct,
): string {

  const storage =

    product?.storageGb

    ??

    (product as any)?.storage_gb

  if (
    storage === undefined
    || storage === null
    || storage === ''
  ) {

    return ''

  }

  return `${storage}GB`

}


/* ============================================================================
🔥 Display
============================================================================ */

function getDisplay(
  product: ProjectedProduct,
): string {

  return (

    getStringValue(
      product?.displayInfo
    )

    ||

    getStringValue(
      (product as any)?.display_info
    )

  )

}


/* ============================================================================
🔥 FAQ Builder
============================================================================ */

/**
 * Build FAQ items only from information that actually exists.
 *
 * No usage inference.
 * No performance inference.
 * No semantic generation.
 */

function buildFaqs(

  product:
    ProjectedProduct

): FAQItem[] {

  const faqs:
    FAQItem[] = []

  const productName =
    getProductName(
      product
    )

  const cpu =
    getCpu(
      product
    )

  const gpu =
    getGpu(
      product
    )

  const memory =
    getMemory(
      product
    )

  const storage =
    getStorage(
      product
    )

  const display =
    getDisplay(
      product
    )


  /* ========================================================================
  PRODUCT OVERVIEW
  ======================================================================== */

  if (
    productName
  ) {

    faqs.push({

      question:
        `${productName}はどんなPCですか？`,

      answer:
        `${productName}の製品情報と主要スペックを、このページで確認できます。`,

    })

  }


  /* ========================================================================
  CPU
  ======================================================================== */

  if (
    cpu
  ) {

    faqs.push({

      question:
        `${productName}のCPUは何ですか？`,

      answer:
        `CPUには${cpu}を搭載しています。`,

    })

  }


  /* ========================================================================
  GPU
  ======================================================================== */

  if (
    gpu
  ) {

    faqs.push({

      question:
        `${productName}のGPUは何ですか？`,

      answer:
        `GPUには${gpu}を搭載しています。`,

    })

  }


  /* ========================================================================
  MEMORY
  ======================================================================== */

  if (
    memory
  ) {

    faqs.push({

      question:
        `${productName}のメモリー容量はどのくらいですか？`,

      answer:
        `メモリー容量は${memory}です。`,

    })

  }


  /* ========================================================================
  STORAGE
  ======================================================================== */

  if (
    storage
  ) {

    faqs.push({

      question:
        `${productName}のストレージ容量はどのくらいですか？`,

      answer:
        `ストレージ容量は${storage}です。`,

    })

  }


  /* ========================================================================
  DISPLAY
  ======================================================================== */

  if (
    display
  ) {

    faqs.push({

      question:
        `${productName}のディスプレイ仕様は？`,

      answer:
        `ディスプレイは${display}です。`,

    })

  }


  return faqs

}


/* ============================================================================
🔥 COMPONENT
============================================================================ */

export default function ProductFaq({

  product,

}: Props) {


  /* ==========================================================================
  Guard
  ========================================================================== */

  if (
    !product
  ) {

    return null

  }


  /* ==========================================================================
  FAQ
  ========================================================================== */

  const faqs =
    buildFaqs(
      product
    )


  /* ==========================================================================
  Empty
  ========================================================================== */

  if (
    faqs.length === 0
  ) {

    return null

  }


  /* ==========================================================================
  State
  ========================================================================== */

  const [

    openIndex,

    setOpenIndex,

  ] = useState<number | null>(0)


  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <section

      className={
        styles.faqSection
      }

      aria-labelledby="product-faq-title"

    >

      {/* ======================================================================
      HEADER
      ====================================================================== */}

      <div
        className={
          styles.faqHeader
        }
      >

        <div
          className={
            styles.faqLabel
          }
        >

          FAQ

        </div>


        <h2

          id="product-faq-title"

          className={
            styles.faqTitle
          }

        >

          {getProductName(product)}
          のよくある質問

        </h2>


        <p
          className={
            styles.faqDescription
          }
        >

          {getProductName(product)}
          の製品情報や主要スペックについて、
          よく確認されるポイントを整理しています。

        </p>

      </div>


      {/* ======================================================================
      FAQ LIST
      ====================================================================== */}

      <div
        className={
          styles.faqList
        }
      >

        {

          faqs.map(

            (
              faq,
              index,
            ) => {

              const isOpen =
                openIndex === index


              return (

                <div

                  key={
                    `${faq.question}-${index}`
                  }

                  className={
                    styles.faqItem
                  }

                >

                  {/* ============================================================
                  QUESTION
                  ============================================================ */}

                  <button

                    type="button"

                    aria-expanded={
                      isOpen
                    }

                    onClick={() =>

                      setOpenIndex(

                        isOpen

                          ? null

                          : index

                      )

                    }

                    className={
                      styles.faqQuestion
                    }

                  >

                    <span>

                      {
                        faq.question
                      }

                    </span>


                    <span
                      className={
                        styles.faqIcon
                      }
                      aria-hidden="true"
                    >

                      {

                        isOpen

                          ? '−'

                          : '+'

                      }

                    </span>

                  </button>


                  {/* ==========================================================
                  ANSWER
                  ========================================================== */}

                  {

                    isOpen && (

                      <div
                        className={
                          styles.faqAnswer
                        }
                      >

                        {
                          faq.answer
                        }

                      </div>

                    )

                  }

                </div>

              )

            }

          )

        }

      </div>

    </section>

  )

}