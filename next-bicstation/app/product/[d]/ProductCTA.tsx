'use client';

import React from 'react';
import styles from './ProductCTA.module.css';

interface Props {
  url: string;
}

export default function ProductCTA({ url }: Props) {

  return (
    <section className={styles.ctaWrapper}>
      <div className={styles.ctaCard}>

        {/* 🔥 コピー */}
        <div className={styles.content}>
          <h3 className={styles.title}>
            迷っているならこれでOK
          </h3>
          <p className={styles.description}>
            初心者でも失敗しない構成です
          </p>
        </div>

        {/* 🚀 CTA */}
        <div className={styles.action}>
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.consultButton}
          >
            👉 今すぐ確認（在庫あり）
          </a>
        </div>

      </div>
    </section>
  );
}