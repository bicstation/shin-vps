/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// --- 型定義 ---
interface PCProduct {
    unique_id: string;
    maker: string;
    name: string;
    price: number;
    url: string;
    image_url: string;
    description: string;
    stock_status: string;
    unified_genre: string;
}

const SITE_COLOR = '#007bff';

// --- データ取得関数 ---
async function fetchProductDetail(unique_id: string): Promise<PCProduct | null> {
    // Docker内からDjangoコンテナを叩くパス
    const API_URL = `http://django-v2:8000/api/pc-products/${unique_id}/`;
    try {
        const res = await fetch(API_URL, { 
            next: { revalidate: 3600 }, 
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

/**
 * 💡 SEO対策: 動的メタデータの生成
 */
export async function generateMetadata({ params }: { params: Promise<{ unique_id: string }> }): Promise<Metadata> {
    const { unique_id } = await params; // awaitが必要
    const product = await fetchProductDetail(unique_id);
    
    if (!product) return { title: "製品が見つかりません" };

    return {
        title: product.name,
        description: `${product.maker}のPC「${product.name}」のスペック詳細と最新価格情報。`,
        openGraph: {
            title: `${product.name} | BICSTATION`,
            images: [{ url: product.image_url }],
        },
    };
}

/**
 * 商品個別詳細ページ コンポーネント
 */
export default async function ProductDetailPage({ params }: { params: Promise<{ unique_id: string }> }) {
    // 💡 重要: paramsはPromiseなので必ずawaitする
    const { unique_id } = await params;
    const product = await fetchProductDetail(unique_id);

    // データが取れなかった場合はNext.jsの404ページを表示
    if (!product) notFound();

    return (
        <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh', paddingBottom: '60px' }}>
            
            {/* ナビゲーション（パン屑リスト風） */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
                <nav style={{ fontSize: '0.9em', color: '#666' }}>
                    {/* Link先を環境に合わせて調整 (bicstation.com直下なら / ) */}
                    <Link href="/" style={{ color: SITE_COLOR, textDecoration: 'none' }}>カタログトップ</Link>
                    <span style={{ margin: '0 10px' }}>&gt;</span>
                    <span style={{ color: '#999' }}>{product.name}</span>
                </nav>
            </div>

            <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* メインセクション：製品画像と価格 */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                    gap: '40px', 
                    background: '#fff', 
                    padding: '40px', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)' 
                }}>
                    
                    {/* 左側：商品画像 */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f9f9f9', borderRadius: '12px', padding: '20px' }}>
                        <img 
                            src={product.image_url || 'https://via.placeholder.com/500x400?text=No+Image'} 
                            alt={product.name}
                            style={{ width: '100%', maxWidth: '400px', height: 'auto', objectFit: 'contain' }}
                        />
                    </div>

                    {/* 右側：基本情報 */}
                    <div>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <span style={{ background: '#333', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>
                                {product.maker.toUpperCase()}
                            </span>
                            <span style={{ border: `1px solid ${SITE_COLOR}`, color: SITE_COLOR, padding: '3px 10px', borderRadius: '4px', fontSize: '0.75em' }}>
                                {product.unified_genre}
                            </span>
                        </div>

                        <h1 style={{ fontSize: '1.8em', color: '#222', marginBottom: '20px', fontWeight: 'bold' }}>
                            {product.name}
                        </h1>

                        <div style={{ marginBottom: '30px', padding: '25px', background: '#fff5f5', borderRadius: '12px', border: '1px solid #ffe3e3' }}>
                            <div style={{ fontSize: '0.9em', color: '#d9534f', fontWeight: 'bold' }}>参考価格 (税込)</div>
                            <div style={{ fontSize: '2.8em', fontWeight: '900', color: '#d9534f' }}>
                                {product.price > 0 ? `¥${product.price.toLocaleString()}` : '価格情報なし'}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#666', marginTop: '10px' }}>
                                在庫状況: <span style={{ color: '#28a745', fontWeight: 'bold' }}>{product.stock_status}</span>
                            </div>
                        </div>

                        <a 
                            href={product.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                display: 'block', 
                                textAlign: 'center',
                                background: SITE_COLOR, 
                                color: 'white', 
                                padding: '18px', 
                                borderRadius: '8px', 
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                fontSize: '1.1em',
                                boxShadow: '0 4px 15px rgba(0,123,255,0.3)'
                            }}
                        >
                            公式サイトで最新価格を確認
                        </a>
                    </div>
                </div>

                {/* スペック詳細セクション */}
                <div style={{ marginTop: '40px', background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1.4em', borderLeft: `6px solid ${SITE_COLOR}`, paddingLeft: '20px', marginBottom: '30px', color: '#333', fontWeight: 'bold' }}>
                        スペック詳細・構成内容
                    </h2>
                    
                    <div style={{ display: 'grid', gap: '1px', background: '#eee', border: '1px solid #eee' }}>
                        {product.description ? (
                            product.description.split('/').map((spec, i) => (
                                <div key={i} style={{ 
                                    padding: '15px 20px', 
                                    backgroundColor: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '1em'
                                }}>
                                    <span style={{ color: SITE_COLOR, marginRight: '15px', fontWeight: 'bold' }}>✓</span>
                                    <span style={{ color: '#444' }}>{spec.trim()}</span>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#999', textAlign: 'center', padding: '40px', background: '#fff' }}>詳細スペック情報の配信はありません。</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}