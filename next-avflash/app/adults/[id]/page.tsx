/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import { notFound } from 'next/navigation';

import {
  getAdultProductDetail,
} from '@shared/lib/api/django/adult';

import {
  ProductHero,
  ProductGallery,
  ProductSpecs,
  ProductDescription,
} from './_components';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdultDetailPage({
  params,
}: PageProps) {

  const { id } = await params;

  const product =
    await getAdultProductDetail(id);

  if (
    !product ||
    product._error ||
    !product.title
  ) {
    notFound();
  }

  const images =
    product.sample_image_urls?.length
      ? product.sample_image_urls
      : [product.image_url];

  return (
    <div className={styles.page}>

      <ProductHero
        title={product.title}
        releaseDate={product.release_date}
        makerName={product.maker?.name}
      />

      <ProductGallery
        images={images}
        title={product.title}
        apiSource={product.api_source}
        sampleMovieData={
          product.sample_movie_url
            ? {
                url:
                  product.sample_movie_url,
                preview_image:
                  product.image_url,
              }
            : null
        }
      />

      <ProductSpecs
        maker={product.maker}
        label={product.label}
        series={product.series}
        actresses={
          product.actresses
        }
      />

      <ProductDescription
        description={
          product.product_description
        }
      />

    </div>
  );
}