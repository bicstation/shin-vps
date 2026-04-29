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

interface PageProps {
  params: { unique_id: string };
}

/** metadata */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const host = "bicstation.com";

  try {
    const res = await fetch(
      `http://localhost:8083/api/products/${params.unique_id}/`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return { title: "製品が見つかりません" };
    }

    const product = await res.json();

    return {
      title: `${product.title}`,
      description: `${product.title}の詳細・価格・スペック`,
      alternates: { canonical: `https://${host}/product/${params.unique_id}` },
    };
  } catch {
    return { title: "製品詳細 | BICSTATION" };
  }
}

/** 本体 */
export default async function ProductDetailPage({ params }: PageProps) {

  const API = process.env.API_INTERNAL_URL;

   const res = await fetch(
    `${API}/api/products/${params.unique_id}/`,
    { cache: "no-store" }
    );
 
  if (!res.ok) {
    notFound();
  }

  const product = await res.json();

  return (
    <div className={styles.wrapper}>
      <main className={styles.mainContainer}>

        {/* 🔥 HERO */}
        <section className={styles.hero}>
          <h1 className={styles.title}>
            迷ったらこれでOK
          </h1>

          <p className={styles.sub}>
            長く使える安定構成
          </p>

          {/* 🚀 CTA */}
          <ProductCTA url={product.url} />

          <img
            src={product.image}
            alt={product.title}
            className={styles.image}
          />

          <div className={styles.price}>
            ¥{Number(product.price).toLocaleString()}
          </div>
        </section>

        {/* 🔥 メリット（AI） */}
        {product.ai_content && (
          <section className={styles.content}>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {product.ai_content}
            </ReactMarkdown>
          </section>
        )}

        {/* 🔗 関連（簡易） */}
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

        {/* 🔥 最終CTA */}
        <FinalCta
          product={{
            maker: product.maker || '',
            name: product.title,
            image_url: product.image
          }}
          finalUrl={product.url}
          isSoftware={false}
        />

      </main>
    </div>
  );
}