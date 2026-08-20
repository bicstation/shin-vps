// ============================================================================
// FILE:
// /app/catalog/components/ProductCard.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import ProductImage
    from '@/app/experience/components/product/ProductImage'

import ProductTitle
    from '@/app/experience/components/product/ProductTitle'

import ProductPrice
    from '@/app/experience/components/product/ProductPrice'

import type {
    PCProductItem,
} from '@/shared/lib/api/django/pc/products/contracts'

import styles
    from '../styles/catalog.module.css'


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    product:
        PCProductItem

}


/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductCard({

    product,

}: Props) {


    /* ==========================================================================
    Product Reality
    ========================================================================== */

    const {

        unique_id,

        image_url,

        name,

        maker,

        brand,

        series,

        cpu_model,

        gpu_model,

        memory_gb,

        storage_gb,

        price,

    } = product


    /* ==========================================================================
    Debug
    ========================================================================== */

    console.log(
        '━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 PRODUCT CARD'
    )

    console.log(
        'unique_id =',
        unique_id
    )

    console.log(
        'href =',
        `/product/${unique_id}`
    )

    console.log(
        'identity =',
        {
            maker,
            brand,
            series,
        }
    )

    console.log(
        'specifications =',
        {
            cpu_model,
            gpu_model,
            memory_gb,
            storage_gb,
        }
    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━'
    )


    /* ==========================================================================
    Render
    ========================================================================== */

    return (

        <Link

            href={
                `/product/${unique_id}`
            }

            className={
                styles.productCard
            }

        >

            {/* ==================================================================
            IMAGE
            ================================================================== */}

            <ProductImage

                src={
                    image_url
                }

                alt={
                    name
                }

                className={
                    styles.productImage
                }

            />


            <div
                className={
                    styles.productContent
                }
            >

                {/* ==============================================================
                IDENTITY
                ============================================================== */}

                <div
                    className={
                        styles.productIdentity
                    }
                >

                    {
                        maker && (

                            <span
                                className={
                                    styles.productProvider
                                }
                            >

                                {
                                    maker
                                }

                            </span>

                        )
                    }


                    {
                        brand && (

                            <span
                                className={
                                    styles.productBrand
                                }
                            >

                                {
                                    brand
                                }

                            </span>

                        )
                    }


                    {
                        series && (

                            <span
                                className={
                                    styles.productSeries
                                }
                            >

                                {
                                    series
                                }

                            </span>

                        )
                    }

                </div>


                {/* ==============================================================
                PRODUCT NAME
                ============================================================== */}

                <ProductTitle

                    title={
                        name
                    }

                    className={
                        styles.productName
                    }

                />


                {/* ==============================================================
                SPECIFICATIONS
                ============================================================== */}

                <div
                    className={
                        styles.productSpecifications
                    }
                >

                    {
                        cpu_model && (

                            <div
                                className={
                                    styles.productSpecification
                                }
                            >

                                <span
                                    className={
                                        styles.productSpecificationLabel
                                    }
                                >

                                    CPU

                                </span>

                                <span
                                    className={
                                        styles.productSpecificationValue
                                    }
                                >

                                    {
                                        cpu_model
                                    }

                                </span>

                            </div>

                        )
                    }


                    {
                        gpu_model && (

                            <div
                                className={
                                    styles.productSpecification
                                }
                            >

                                <span
                                    className={
                                        styles.productSpecificationLabel
                                    }
                                >

                                    GPU

                                </span>

                                <span
                                    className={
                                        styles.productSpecificationValue
                                    }
                                >

                                    {
                                        gpu_model
                                    }

                                </span>

                            </div>

                        )
                    }


                    {
                        typeof memory_gb === 'number' &&
                        memory_gb > 0 && (

                            <div
                                className={
                                    styles.productSpecification
                                }
                            >

                                <span
                                    className={
                                        styles.productSpecificationLabel
                                    }
                                >

                                    メモリ

                                </span>

                                <span
                                    className={
                                        styles.productSpecificationValue
                                    }
                                >

                                    {
                                        memory_gb
                                    }

                                    {' GB'}

                                </span>

                            </div>

                        )
                    }


                    {
                        typeof storage_gb === 'number' &&
                        storage_gb > 0 && (

                            <div
                                className={
                                    styles.productSpecification
                                }
                            >

                                <span
                                    className={
                                        styles.productSpecificationLabel
                                    }
                                >

                                    ストレージ

                                </span>

                                <span
                                    className={
                                        styles.productSpecificationValue
                                    }
                                >

                                    {
                                        storage_gb
                                    }

                                    {' GB'}

                                </span>

                            </div>

                        )
                    }

                </div>


                {/* ==============================================================
                PRICE
                ============================================================== */}

                <ProductPrice

                    price={
                        price
                    }

                    className={
                        styles.productPrice
                    }

                />

            </div>

        </Link>

    )

}