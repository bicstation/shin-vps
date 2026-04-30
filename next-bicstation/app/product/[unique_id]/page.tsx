/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

import styles from './ProductDetail.module.css';

import ProductCTA from './ProductCTA';
import FinalCta from './FinalCta';

import { transformProduct, transformProducts } from '@/shared/lib/domain/product/transform';

interface PageProps {
  params: { unique_id: string };
}

const API =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://django-v3:8000';

/** metadata */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const host = "bicstation.com";

  try {
    const res = await fetch(
      `${API}/api/products/${params.unique_id}/`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return { title: "製品が見つかりません" };
    }

    const raw = await res.json();
    const product = transformProduct(raw);

    return {
      title: product.title,
      description: `${product.title}の詳細・価格・スペック`,
      alternates: {
        canonical: `https://${host}/product/${params.unique_id}`,
      },
    };
  } catch {
    return { title: "製品詳細 | BICSTATION" };
  }
}

/** 本体 */
export default async function ProductDetailPage({ params }: PageProps) {

  // 🔥 並列＋安全化
  const productRes = await fetch(
    `${API}/api/products/${params.unique_id}/`,
    { cache: "no-store" }
  );

  const relatedRes = await fetch(
    `${API}/api/products/related/${params.unique_id}/`,
    { cache: "no-store" }
  ).catch(() => null);

  if (!productRes.ok) {
    notFound();
  }

  const raw = await productRes.json();
  const product = transformProduct(raw);

  let related: any[] = [];

  if (relatedRes && relatedRes.ok) {
    const rawRelated = await relatedRes.json();
    related = transformProducts(rawRelated).slice(0, 3);
  }

  return (
    <div className={styles.wrapper}>
      <main className={styles.mainContainer}>

        {/* 🔥 HERO（具体化） */}
        <section className={styles.hero}>
          <h1 className={styles.title}>
            迷ったらこれ。{product.mainTag || '高性能構成'}で長く使える
          </h1>

          <p className={styles.sub}>
            性能・価格・用途のバランスが最もいい1台
          </p>

          {/* 🚀 CTA強化 */}
          <ProductCTA url={product.url} />

          <img
            src={product.image}
            alt={product.title}
            className={styles.image}
          />

          <div className={styles.price}>
            ¥{product.price.toLocaleString()}
          </div>

          <div className={styles.priceNote}>
            この性能でこの価格はかなりお得
          </div>
        </section>

        {/* 🔥 メリット */}
        {product?.ai_content && (
          <section className={styles.content}>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {product.ai_content}
            </ReactMarkdown>
          </section>
        )}

        {/* 🔗 タグ */}
        {product.tags?.length > 0 && (
          <section className={styles.related}>
            <h3>特徴</h3>
            <div className={styles.relatedList}>
              {product.tags.map((tag: string) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </section>
        )}

        {/* 🔥 関連商品（改善版） */}
        {related.length > 0 && (
          <section className={styles.relatedProducts}>
            <h3 className={styles.relatedTitle}>
              この価格帯で迷うならこの3つ
            </h3>

            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <Link
                  key={p.unique_id}
                  href={`/product/${p.unique_id}`}
                  className={styles.relatedCard}
                >
                  <img src={p.image} alt={p.title} />

                  {/* 🔥 タグ追加（重要） */}
                  {p.mainTag && (
                    <div className={styles.relatedTag}>
                      {p.mainTag}
                    </div>
                  )}

                  <div className={styles.relatedName}>
                    {p.shortTitle}
                  </div>

                  <div className={styles.relatedPrice}>
                    ¥{p.price.toLocaleString()}
                  </div>

                  <div className={styles.compareNote}>
                    比較されやすいモデル
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 🔥 最終CTA */}
        <FinalCta
          product={{
            maker: product.maker || '',
            name: product.title,
            image_url: product.image,
          }}
          finalUrl={product.url}
          isSoftware={false}
        />

      </main>
    </div>
  );
}