'use client';

import React from 'react';
import StaticPageLayout from '@shared/components/templates/StaticPageLayout';
import styles from './Disclaimer.module.css';

export default function DisclaimerContent() {
  return (
    <StaticPageLayout 
      title="免責事項" 
      subtitle="DISCLAIMER"
    >
      <section className={styles.section}>
        <h2 className={styles.title}>1. 情報の正確性について</h2>
        <p>
          当サイト（BICSTATION）で提供される製品スペック、価格、スコア等のデータは、AIによる自動解析および外部APIからの取得に基づいています。情報の正確性には細心の注意を払っておりますが、データの遅延や技術的な誤りにより、最新の市場状況と異なる場合があります。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.title}>2. 損害賠償の制限</h2>
        <p>
          ユーザー様が当サイトの情報を用いて行う一切の行為について、当サイトおよび管理者は何ら責任を負うものではありません。当サイトの利用により発生した直接的・間接的な損害についても、理由の如何を問わず一切の賠償責任を負わないものとします。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.title}>3. 外部リンクについて</h2>
        <p>
          当サイトからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.title}>4. 規定の変更</h2>
        <p>
          当サイトは、本規定の内容を予告なく変更することがあります。最新の内容は本ページに掲載された時点から効力を生じるものとし、ユーザー様は継続して利用することで、変更後の規定に同意したものとみなされます。
        </p>
      </section>
      
      {/* ✅ 閉じタグを StaticPageLayout に合わせる */}
    </StaticPageLayout>
  );
}