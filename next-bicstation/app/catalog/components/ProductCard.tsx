// ============================================================================
// FILE:
// /app/catalog/components/ProductCard.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import ProductImage from '@/app/experience/components/product/ProductImage'
import ProductTitle from '@/app/experience/components/product/ProductTitle'
import ProductMaker from '@/app/experience/components/product/ProductMaker'
import ProductPrice from '@/app/experience/components/product/ProductPrice'

import type { PCProductItem } from '@/shared/lib/api/django/pc/products/contracts'

import styles from '../styles/catalog.module.css'

type Props = {

    product: PCProductItem

}

export default function ProductCard({

    product,

}: Props) {

    const {

        unique_id,
        image_url,
        name,
        maker,
        price,

    } = product

    return (

        <Link

            href={`/product/${unique_id}`}

            className={styles.productCard}

        >

            <ProductImage

                src={image_url}

                alt={name}

                className={styles.productImage}

            />

            <div className={styles.productContent}>

                <ProductTitle

                    title={name}

                    className={styles.productName}

                />

                <ProductMaker

                    maker={maker}

                    className={styles.productMaker}

                />

                <ProductPrice

                    price={price}

                    className={styles.productPrice}

                />

            </div>

        </Link>

    )

}