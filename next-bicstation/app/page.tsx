/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import HeroRankingCard from '@/shared/components/organisms/cards/HeroRankingCard';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats';
import { transformProducts } from '@/shared/lib/domain/product/transform';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';

/**
 * 🛡 安全fetch
 */
async function safeFetch(fetcher: any, args: any[], fallback: any) {
  try {
    const data = await fetcher(...args);
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export default async function HomePageMain() {

  const host = "bicstation.com";

  // 🔥 API取得
  const data = await safeFetch(fetchPCProductRanking, ['score', host], []);

  const rawProducts = Array.isArray(data) ? data : (data?.results || []);

  // 🔥 ここが最重要（全てここを通す）
  const products = transformProducts(rawProducts);

  if (!products.length) return null;

  const top1 = products[0];
  const others = products.slice(1, 3);

  return (
    <div className={styles.mainWrapper}>

      {/* 🔥 HERO（即決ゾーン） */}
      <section style={{ textAlign: 'center', marginBottom: '24px' }}>

        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          迷ってる時間が一番ムダ
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#94a3b8'
        }}>
          これ選べば失敗しない
        </p>

        <div style={{ marginTop: '16px' }}>
          <HeroRankingCard product={top1} />
        </div>

      </section>

      {/* 🔥 CTA（最重要） */}
      {top1.url && (
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a
            href={top1.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#f97316',
              color: '#fff',
              padding: '16px 24px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            👉 今すぐ確認（在庫あり）
          </a>

          <div style={{
            fontSize: '12px',
            color: '#94a3b8',
            marginTop: '6px'
          }}>
            今一番売れている構成
          </div>
        </div>
      )}

      {/* 📊 比較（最小） */}
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '13px',
          color: '#94a3b8',
          marginBottom: '12px'
        }}>
          他の候補も見る
        </h3>

        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {others.map((p: any, i: number) => (
            <ProductCard key={p.id || i} product={p} />
          ))}
        </div>
      </section>

      {/* 🔥 CTA再提示（効く） */}
      {top1.url && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a
            href={top1.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#f97316',
              color: '#fff',
              padding: '14px 20px',
              borderRadius: '10px',
              fontWeight: 'bold',
            }}
          >
            👉 迷ったらこれでOK
          </a>
        </div>
      )}

    </div>
  );
}