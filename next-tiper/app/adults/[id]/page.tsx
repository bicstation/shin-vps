/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getAdultProductById, getAdultProductsByMaker } from '../../../lib/api';
import { constructMetadata } from '../../../lib/metadata'; // SEO用ユーティリティ
import ProductGallery from '../../components/ProductGallery';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_TIPER || '';

/**
 * 💡 SEO対策: 動的メタデータの生成
 * ページごとに異なるタイトル、ディスクリプション、OGP画像を生成します
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getAdultProductById(params.id);
  
  if (!product) {
    return constructMetadata("商品未検出", "お探しの商品は見つかりませんでした。");
  }

  return constructMetadata(
    product.title,
    `${product.maker?.name || '人気メーカー'}の作品: ${product.title}。詳細・価格情報はこちら。`,
    product.image_url_list?.[0]
  );
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getAdultProductById(params.id);

  if (!product) {
    return (
      <div style={{ backgroundColor: '#111122', minHeight: '80vh', color: 'white', padding: '50px', textAlign: 'center' }}>
        <h1 style={{ color: '#e94560' }}>商品が見つかりませんでした</h1>
        <Link href="/" style={{ color: '#00d1b2', textDecoration: 'none', marginTop: '20px', display: 'inline-block' }}>
          ← トップページへ戻る
        </Link>
      </div>
    );
  }

  // 同じメーカーの関連商品を取得
  const relatedProducts = product.maker ? await getAdultProductsByMaker(product.maker.id, 4) : [];
  const imageList = product.image_url_list || [];

  return (
    <div style={{ backgroundColor: '#111122', minHeight: '100vh', color: 'white' }}>
      
      {/* ページ内ナビゲーション（LayoutのHeaderとは別） */}
      <nav style={{ padding: '15px 5%', borderBottom: '1px solid #3d3d66', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8em' }}>
        <Link href="/" style={{ color: '#00d1b2', textDecoration: 'none' }}>
          ← 商品一覧へ戻る
        </Link>
        <span style={{ color: '#555' }}>PRODUCT ID: {params.id}</span>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', alignItems: 'start' }}>
          
          {/* 左側：画像ギャラリーコンポーネント */}
          <ProductGallery images={imageList} title={product.title} />

          {/* 右側：詳細情報・スペック */}
          <section>
            <div style={{ marginBottom: '15px' }}>
              <span style={{ backgroundColor: '#e94560', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '0.7em', fontWeight: 'bold' }}>
                {product.api_source}
              </span>
            </div>
            
            <h1 style={{ fontSize: '1.8em', marginBottom: '20px', lineHeight: '1.4', fontWeight: 'bold', color: '#fff' }}>
              {product.title}
            </h1>
            
            <div style={{ fontSize: '2.2em', color: '#00d1b2', fontWeight: 'bold', marginBottom: '30px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              ¥{product.price?.toLocaleString() || '---'}
              <span style={{ fontSize: '0.4em', color: '#aaa', fontWeight: 'normal' }}>税込</span>
            </div>

            {/* スペックテーブル */}
            <div style={{ backgroundColor: '#1f1f3a', padding: '25px', borderRadius: '12px', border: '1px solid #3d3d66', marginBottom: '35px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '15px 0', color: '#99e0ff' }}>メーカー</td>
                    <td style={{ textAlign: 'right', padding: '15px 0' }}>{product.maker?.name || '---'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '15px 0', color: '#99e0ff' }}>シリーズ</td>
                    <td style={{ textAlign: 'right', padding: '15px 0' }}>{product.series?.name || '---'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '15px 0', color: '#99e0ff' }}>配信開始</td>
                    <td style={{ textAlign: 'right', padding: '15px 0' }}>{product.release_date || '---'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ジャンルタグリスト */}
            {product.genres && product.genres.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '15px', borderLeft: '3px solid #e94560', paddingLeft: '10px' }}>関連ジャンル</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {product.genres.map((genre) => (
                    <Link 
                      key={genre.id} 
                      href={`/adults/genre/${genre.id}`}
                      style={{ padding: '6px 14px', backgroundColor: '#252545', border: '1px solid #3d3d66', color: '#00d1b2', borderRadius: '6px', fontSize: '0.85em', textDecoration: 'none', transition: '0.2s' }}
                    >
                      #{genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 外部アフィリエイトリンク */}
            <a href={product.affiliate_url} target="_blank" rel="nofollow noopener noreferrer"
              style={{ display: 'block', marginTop: '45px', padding: '20px', backgroundColor: '#e94560', color: 'white', textAlign: 'center', borderRadius: '10px', fontSize: '1.2em', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 5px 20px rgba(233, 69, 96, 0.4)' }}
            >
              販売サイトで詳細を見る
            </a>
          </section>
        </div>

        {/* 💡 おすすめセクション (同一メーカー作品) */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '100px', borderTop: '2px solid #3d3d66', paddingTop: '50px' }}>
            <h2 style={{ fontSize: '1.5em', marginBottom: '35px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#e94560', fontSize: '1.2em' }}>◆</span> このメーカーの注目作品
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/adults/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ backgroundColor: '#1f1f3a', borderRadius: '12px', overflow: 'hidden', border: '1px solid #3d3d66', transition: 'transform 0.2s' }}>
                    <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                      <img src={p.image_url_list?.[0] || '/no-image.png'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '15px' }}>
                      <p style={{ fontSize: '0.75em', color: '#00d1b2', marginBottom: '8px', fontWeight: 'bold' }}>{p.maker?.name}</p>
                      <p style={{ fontSize: '0.9em', lineHeight: '1.5', height: '3em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {p.title}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}